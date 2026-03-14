import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerClient } from "@/lib/supabase/server";

interface ClinicalNoteRow {
  appointment: {
    date_time: string;
  } | null;
  appointment_id: string;
  created_at: string;
  id: string;
  patient: {
    full_name: string | null;
  } | null;
  subjective: string;
}

export default async function ProviderNotesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notes, error } = await supabase
    .from("clinical_notes")
    .select(
      "id, appointment_id, subjective, created_at, patient:profiles!clinical_notes_patient_id_fkey(full_name), appointment:appointments!clinical_notes_appointment_id_fkey(date_time)"
    )
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ClinicalNoteRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  if (!notes?.length) {
    return (
      <EmptyState
        description="No clinical notes yet - create notes from appointment details"
        icon={ClipboardList}
        title="No clinical notes"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clinical Notes</h1>
        <p className="text-sm text-muted-foreground">SOAP notes written during patient appointments.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Subjective Preview</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.patient?.full_name || "Unknown Patient"}</TableCell>
                <TableCell>{note.appointment?.date_time ? format(new Date(note.appointment.date_time), "MMM d, yyyy") : "-"}</TableCell>
                <TableCell>
                  <Link className="block max-w-[24rem] truncate hover:underline" href={`/provider/appointments/${note.appointment_id}`}>
                    {note.subjective.length > 100 ? `${note.subjective.slice(0, 100)}...` : note.subjective}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{format(new Date(note.created_at), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
