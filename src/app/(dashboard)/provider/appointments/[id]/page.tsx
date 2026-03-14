import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { AppointmentDetailActions } from "@/components/provider/AppointmentDetailActions";
import { ClinicalNoteEditor } from "@/components/provider/ClinicalNoteEditor";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus, AppointmentType } from "@/lib/validations/appointment";

const appointmentIdSchema = z.string().uuid();

interface AppointmentDetail {
  date_time: string;
  duration_minutes: number | null;
  id: string;
  patient: {
    full_name: string | null;
    id: string;
  } | null;
  patient_id: string;
  status: AppointmentStatus;
  type: AppointmentType;
}

interface ClinicalNote {
  assessment: string | null;
  id: string;
  objective: string | null;
  plan: string | null;
  subjective: string;
}

interface ProviderAppointmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProviderAppointmentDetailPage({ params: paramsPromise }: ProviderAppointmentDetailPageProps) {
  const params = await paramsPromise;
  const parsedId = appointmentIdSchema.safeParse(params.id);
  if (!parsedId.success) {
    notFound();
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_id, date_time, duration_minutes, status, type, patient:profiles!appointments_patient_id_fkey(id, full_name)")
    .eq("id", parsedId.data)
    .eq("provider_id", user.id)
    .single<AppointmentDetail>();

  if (appointmentError || !appointment) {
    notFound();
  }

  const { data: note, error: noteError } = await supabase
    .from("clinical_notes")
    .select("id, subjective, objective, assessment, plan")
    .eq("appointment_id", appointment.id)
    .eq("provider_id", user.id)
    .maybeSingle<ClinicalNote>();

  if (noteError) {
    throw new Error(noteError.message);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle>{appointment.patient?.full_name || "Patient"}</CardTitle>
            <p className="text-sm text-muted-foreground">{format(new Date(appointment.date_time), "EEEE, MMM d, yyyy h:mm a")}</p>
            <p className="text-sm text-muted-foreground">Duration: {appointment.duration_minutes ?? 30} minutes</p>
          </div>

          <div className="space-y-2 md:text-right">
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <StatusBadge value={appointment.type} />
              <StatusBadge value={appointment.status} />
            </div>
            <AppointmentDetailActions appointmentId={appointment.id} status={appointment.status} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Notes (SOAP)</CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicalNoteEditor
            appointmentId={appointment.id}
            appointmentType={appointment.type}
            existingNote={note}
            patientId={appointment.patient_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
