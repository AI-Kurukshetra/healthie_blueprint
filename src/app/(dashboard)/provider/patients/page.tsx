import Link from "next/link";
import { format } from "date-fns";
import { Download, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { ProviderPatientFilters } from "@/components/provider/ProviderPatientFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/validations/appointment";

interface ProviderPatientsPageProps {
  searchParams?: {
    filter?: string;
    search?: string;
  };
}

interface AppointmentWithPatient {
  date_time: string;
  patient: {
    email: string;
    full_name: string | null;
    id: string;
    phone: string | null;
  } | null;
  patient_id: string;
  status: AppointmentStatus;
}

interface PatientRow {
  email: string;
  hasUpcomingAppointment: boolean;
  id: string;
  lastAppointment: string;
  name: string;
  phone: string | null;
  status: AppointmentStatus;
}

const FILTER_VALUES = ["all", "active", "inactive"] as const;

export default async function ProviderPatientsPage({ searchParams }: ProviderPatientsPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const search = searchParams?.search?.trim() ?? "";
  const filterParam = searchParams?.filter ?? "all";
  const filter = FILTER_VALUES.includes(filterParam as (typeof FILTER_VALUES)[number])
    ? (filterParam as (typeof FILTER_VALUES)[number])
    : "all";

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("patient_id, date_time, status, patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone)")
    .eq("provider_id", user.id)
    .order("date_time", { ascending: false })
    .returns<AppointmentWithPatient[]>();

  if (error) {
    throw new Error(error.message);
  }

  const nowIso = new Date().toISOString();
  const latestByPatientId = new Map<string, PatientRow>();

  for (const appointment of appointments ?? []) {
    if (!appointment.patient) {
      continue;
    }

    const existing = latestByPatientId.get(appointment.patient_id);
    const isUpcoming = appointment.status === "scheduled" && appointment.date_time >= nowIso;

    if (!existing) {
      latestByPatientId.set(appointment.patient_id, {
        email: appointment.patient.email,
        hasUpcomingAppointment: isUpcoming,
        id: appointment.patient_id,
        lastAppointment: appointment.date_time,
        name: appointment.patient.full_name || "Unknown Patient",
        phone: appointment.patient.phone,
        status: appointment.status,
      });
      continue;
    }

    if (isUpcoming) {
      existing.hasUpcomingAppointment = true;
    }
  }

  const candidatePatients = Array.from(latestByPatientId.values());
  let patients = candidatePatients;

  if (search) {
    const patientIds = candidatePatients.map((patient) => patient.id);
    let matchedIds = new Set<string>();

    if (patientIds.length > 0) {
      const [{ data: fullNameMatches, error: fullNameError }, { data: emailMatches, error: emailError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id")
            .in("id", patientIds)
            .ilike("full_name", `%${search}%`),
          supabase
            .from("profiles")
            .select("id")
            .in("id", patientIds)
            .ilike("email", `%${search}%`),
        ]);

      if (fullNameError) {
        throw new Error(fullNameError.message);
      }

      if (emailError) {
        throw new Error(emailError.message);
      }

      const matchedProfiles = [...(fullNameMatches ?? []), ...(emailMatches ?? [])];

      if (matchedProfiles.length > 0) {
        matchedIds = new Set(matchedProfiles.map((profile) => profile.id));
      } else {
        matchedIds = new Set();
      }
    }

    patients = patients.filter((patient) => matchedIds.has(patient.id));
  }

  if (filter === "active") {
    patients = patients.filter((patient) => patient.hasUpcomingAppointment);
  }

  if (filter === "inactive") {
    patients = patients.filter((patient) => !patient.hasUpcomingAppointment);
  }

  if (!patients.length) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="text-sm text-muted-foreground">Patients assigned through your appointments.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/provider/patients/export">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </div>
        <ProviderPatientFilters filter={filter} search={search} />
        <EmptyState
          description="No patients match the current search and filter settings."
          icon={Users}
          title="No patients found"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">Patients assigned through your appointments.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/provider/patients/export">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      <ProviderPatientFilters filter={filter} search={search} />

      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead>Last Appointment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  <Link className="hover:underline" href={`/provider/patients/${patient.id}`}>
                    {patient.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{patient.email}</TableCell>
                <TableCell className="hidden lg:table-cell">{patient.phone || "-"}</TableCell>
                <TableCell>{format(new Date(patient.lastAppointment), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>
                  <StatusBadge value={patient.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">{patient.hasUpcomingAppointment ? "Active" : "Inactive"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
