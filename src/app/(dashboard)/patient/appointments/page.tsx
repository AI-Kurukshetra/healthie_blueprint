import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus, AppointmentType } from "@/lib/validations/appointment";

interface AppointmentRow {
  date_time: string;
  duration_minutes: number;
  id: string;
  notes: string | null;
  provider_id: string;
  status: string;
  type: string;
}

interface ProviderProfileRow {
  full_name: string | null;
  id: string;
}

interface ProviderDetailsRow {
  id: string;
  specialization: string | null;
}

const APPOINTMENT_STATUSES: AppointmentStatus[] = ["scheduled", "completed", "cancelled", "no_show"];
const APPOINTMENT_TYPES: AppointmentType[] = ["initial", "follow_up", "consultation"];

function toAppointmentStatus(value: string): AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(value as AppointmentStatus) ? (value as AppointmentStatus) : "scheduled";
}

function toAppointmentType(value: string): AppointmentType {
  return APPOINTMENT_TYPES.includes(value as AppointmentType) ? (value as AppointmentType) : "initial";
}

export default async function PatientAppointmentsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, provider_id, date_time, duration_minutes, status, type, notes")
    .eq("patient_id", user.id)
    .order("date_time", { ascending: true })
    .returns<AppointmentRow[]>();

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const providerIds = Array.from(new Set((appointments ?? []).map((appointment) => appointment.provider_id)));

  let providers: ProviderProfileRow[] = [];
  let providerDetails: ProviderDetailsRow[] = [];

  if (providerIds.length > 0) {
    const [{ data: providersData, error: providersError }, { data: detailsData, error: detailsError }] =
      await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", providerIds).returns<ProviderProfileRow[]>(),
        supabase.from("provider_details").select("id, specialization").in("id", providerIds).returns<ProviderDetailsRow[]>(),
      ]);

    if (providersError) {
      throw new Error(providersError.message);
    }

    if (detailsError) {
      throw new Error(detailsError.message);
    }

    providers = providersData ?? [];
    providerDetails = detailsData ?? [];
  }

  const providerNameById = new Map(providers.map((provider) => [provider.id, provider.full_name]));
  const providerSpecializationById = new Map(
    providerDetails.map((providerDetail) => [providerDetail.id, providerDetail.specialization])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Appointments</h1>
          <p className="text-sm text-muted-foreground">Review upcoming visits and recent appointment history.</p>
        </div>
        <Button asChild>
          <Link href="/patient/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      {!appointments || appointments.length === 0 ? (
        <EmptyState
          action={{ href: "/patient/appointments/new", label: "Book Appointment" }}
          description="Schedule your first visit with one of our providers."
          icon={Calendar}
          title="No appointments yet - book your first visit"
        />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => {
            const providerName = providerNameById.get(appointment.provider_id) || "Care Provider";
            const providerSpecialization =
              providerSpecializationById.get(appointment.provider_id) || "General Medicine";
            const appointmentDate = new Date(appointment.date_time);

            return (
              <Card key={appointment.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{providerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{providerSpecialization}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={toAppointmentType(appointment.type)} />
                    <StatusBadge value={toAppointmentStatus(appointment.status)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <p className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(appointmentDate, "EEEE, MMM d, yyyy")}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(appointmentDate, "h:mm a")} ({appointment.duration_minutes} min)
                    </p>
                  </div>

                  {appointment.notes ? <p className="text-sm text-muted-foreground">{appointment.notes}</p> : null}

                  <Button asChild size="sm" variant="outline">
                    <Link href={`/patient/appointments/${appointment.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
