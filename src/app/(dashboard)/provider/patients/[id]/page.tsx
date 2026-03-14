import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { MedicalRecordStatus, MedicalRecordType } from "@/lib/validations/medical-record";

const patientIdSchema = z.string().uuid();

interface PatientDetails {
  blood_type: string | null;
  emergency_contact: string | null;
  insurance_id: string | null;
  insurance_provider: string | null;
}

interface PatientProfile {
  date_of_birth: string | null;
  email: string;
  full_name: string | null;
  id: string;
  patient_details: PatientDetails | PatientDetails[] | null;
  phone: string | null;
}

interface PatientAppointment {
  date_time: string;
  id: string;
  status: AppointmentStatus;
  type: AppointmentType;
}

interface PatientNote {
  appointment_id: string;
  created_at: string;
  id: string;
  subjective: string;
}

interface PatientMedicalRecord {
  details: string | null;
  end_date: string | null;
  id: string;
  name: string;
  start_date: string | null;
  status: MedicalRecordStatus;
  type: MedicalRecordType;
}

interface ProviderPatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProviderPatientDetailPage({ params: paramsPromise }: ProviderPatientDetailPageProps) {
  const params = await paramsPromise;
  const parsedId = patientIdSchema.safeParse(params.id);
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, date_of_birth, patient_details(blood_type, emergency_contact, insurance_provider, insurance_id)")
    .eq("id", parsedId.data)
    .single<PatientProfile>();

  if (profileError || !profile) {
    notFound();
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, date_time, status, type")
    .eq("provider_id", user.id)
    .eq("patient_id", parsedId.data)
    .order("date_time", { ascending: false })
    .returns<PatientAppointment[]>();

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const { data: notes, error: notesError } = await supabase
    .from("clinical_notes")
    .select("id, appointment_id, subjective, created_at")
    .eq("provider_id", user.id)
    .eq("patient_id", parsedId.data)
    .order("created_at", { ascending: false })
    .returns<PatientNote[]>();

  if (notesError) {
    throw new Error(notesError.message);
  }

  const { data: records, error: recordsError } = await supabase
    .from("medical_records")
    .select("id, type, name, details, status, start_date, end_date")
    .eq("patient_id", parsedId.data)
    .order("created_at", { ascending: false })
    .returns<PatientMedicalRecord[]>();

  if (recordsError) {
    throw new Error(recordsError.message);
  }

  const details = Array.isArray(profile.patient_details) ? profile.patient_details[0] : profile.patient_details;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{profile.full_name || "Patient"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <p className="text-sm text-muted-foreground">Email: <span className="text-foreground">{profile.email}</span></p>
          <p className="text-sm text-muted-foreground">Phone: <span className="text-foreground">{profile.phone || "-"}</span></p>
          <p className="text-sm text-muted-foreground">DOB: <span className="text-foreground">{profile.date_of_birth || "-"}</span></p>
          <p className="text-sm text-muted-foreground">Insurance: <span className="text-foreground">{details?.insurance_provider || "-"}</span></p>
          <p className="text-sm text-muted-foreground">Insurance ID: <span className="text-foreground">{details?.insurance_id || "-"}</span></p>
          <p className="text-sm text-muted-foreground">Emergency Contact: <span className="text-foreground">{details?.emergency_contact || "-"}</span></p>
        </CardContent>
      </Card>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="pt-6">
            {!appointments?.length ? (
              <p className="text-sm text-muted-foreground">No appointments yet.</p>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{format(new Date(appointment.date_time), "MMM d, yyyy h:mm a")}</TableCell>
                          <TableCell>
                            <StatusBadge value={appointment.type} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge value={appointment.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              {!notes?.length ? (
                <p className="text-sm text-muted-foreground">No clinical notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-muted/35 p-3">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(note.created_at), "MMM d, yyyy")} - Appointment {note.appointment_id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-sm">{note.subjective}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardContent className="pt-6">
            {!records?.length ? (
              <p className="text-sm text-muted-foreground">No medical records yet.</p>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="capitalize">{record.type}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>
                            <StatusBadge value={record.status} />
                          </TableCell>
                          <TableCell>{record.details || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
