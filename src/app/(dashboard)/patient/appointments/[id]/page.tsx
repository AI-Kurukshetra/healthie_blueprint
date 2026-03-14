import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, UserRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { cancelPatientAppointment } from "@/app/(dashboard)/patient/appointments/actions";
import { PendingSubmitButton } from "@/components/shared/PendingSubmitButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentStatus, AppointmentType } from "@/lib/validations/appointment";

interface AppointmentDetailsPageProps {
  params: { id: string };
}

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

interface ClinicalNoteRow {
  assessment: string | null;
  objective: string | null;
  plan: string | null;
  subjective: string;
}

const APPOINTMENT_STATUSES: AppointmentStatus[] = ["scheduled", "completed", "cancelled", "no_show"];
const APPOINTMENT_TYPES: AppointmentType[] = ["initial", "follow_up", "consultation"];

function toAppointmentStatus(value: string): AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(value as AppointmentStatus) ? (value as AppointmentStatus) : "scheduled";
}

function toAppointmentType(value: string): AppointmentType {
  return APPOINTMENT_TYPES.includes(value as AppointmentType) ? (value as AppointmentType) : "initial";
}

export default async function PatientAppointmentDetailsPage({ params }: AppointmentDetailsPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, provider_id, date_time, duration_minutes, status, type, notes")
    .eq("id", params.id)
    .eq("patient_id", user.id)
    .single<AppointmentRow>();

  if (appointmentError) {
    if (appointmentError.code === "PGRST116") {
      notFound();
    }

    throw new Error(appointmentError.message);
  }

  const [{ data: providerProfile, error: providerProfileError }, { data: providerDetails, error: providerDetailsError }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("id", appointment.provider_id).single<ProviderProfileRow>(),
      supabase
        .from("provider_details")
        .select("id, specialization")
        .eq("id", appointment.provider_id)
        .single<ProviderDetailsRow>(),
    ]);

  if (providerProfileError && providerProfileError.code !== "PGRST116") {
    throw new Error(providerProfileError.message);
  }

  if (providerDetailsError && providerDetailsError.code !== "PGRST116") {
    throw new Error(providerDetailsError.message);
  }

  let clinicalNote: ClinicalNoteRow | null = null;
  if (appointment.status === "completed") {
    const { data: noteRow, error: clinicalNoteError } = await supabase
      .from("clinical_notes")
      .select("subjective, objective, assessment, plan")
      .eq("appointment_id", appointment.id)
      .eq("patient_id", user.id)
      .maybeSingle<ClinicalNoteRow>();

    if (clinicalNoteError) {
      throw new Error(clinicalNoteError.message);
    }

    clinicalNote = noteRow;
  }

  const appointmentDate = new Date(appointment.date_time);
  const providerName = providerProfile?.full_name || "Care Provider";
  const specialization = providerDetails?.specialization || "General Medicine";

  return (
    <div className="space-y-6">
      <Button asChild className="w-fit" variant="ghost">
        <Link href="/patient/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={toAppointmentType(appointment.type)} />
            <StatusBadge value={toAppointmentStatus(appointment.status)} />
          </div>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {providerName} ({specialization})
            </p>
            <p className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(appointmentDate, "EEEE, MMM d, yyyy")}
            </p>
            <p className="inline-flex items-center gap-2 sm:col-span-2">
              <Clock className="h-4 w-4" />
              {format(appointmentDate, "h:mm a")} ({appointment.duration_minutes} min)
            </p>
          </div>

          {appointment.notes ? (
            <div className="space-y-2 rounded-xl bg-muted/30 p-4">
              <p className="text-sm font-medium">Your Notes</p>
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
            </div>
          ) : null}

          {appointment.status === "scheduled" ? (
            <div className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel Appointment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel this appointment?</DialogTitle>
                    <DialogDescription>
                      This will cancel your appointment slot. You can always book a new one from your appointments page.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <form action={cancelPatientAppointment.bind(null, appointment.id)}>
                      <PendingSubmitButton pendingText="Cancelling..." type="submit" variant="destructive">
                        Confirm Cancel
                      </PendingSubmitButton>
                    </form>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {appointment.status === "completed" && clinicalNote ? (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Subjective</p>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                {clinicalNote.subjective}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Objective</p>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                {clinicalNote.objective || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Assessment</p>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                {clinicalNote.assessment || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                {clinicalNote.plan || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
