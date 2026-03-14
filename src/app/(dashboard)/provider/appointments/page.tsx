import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { ProviderAppointmentRowActions } from "@/components/provider/ProviderAppointmentRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus, AppointmentType } from "@/lib/validations/appointment";

interface AppointmentRow {
  date_time: string;
  id: string;
  patient: {
    full_name: string | null;
    id: string;
  } | null;
  status: AppointmentStatus;
  type: AppointmentType;
}

export default async function ProviderAppointmentsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, date_time, status, type, patient:profiles!appointments_patient_id_fkey(id, full_name)")
    .eq("provider_id", user.id)
    .order("date_time", { ascending: true })
    .returns<AppointmentRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  if (!appointments?.length) {
    return <EmptyState description="No appointments scheduled" icon={Calendar} title="No appointments" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">Manage upcoming and past visits.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">{appointment.patient?.full_name || "Unknown Patient"}</TableCell>
                <TableCell>{format(new Date(appointment.date_time), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge value={appointment.type} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={appointment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <ProviderAppointmentRowActions appointmentId={appointment.id} status={appointment.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
