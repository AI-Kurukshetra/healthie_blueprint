import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import type { MedicalRecordStatus, MedicalRecordType } from "@/lib/validations/medical-record";

interface MedicalRecordRow {
  details: string | null;
  end_date: string | null;
  id: string;
  name: string;
  start_date: string | null;
  status: string;
  type: string;
}

const MEDICAL_RECORD_STATUSES: MedicalRecordStatus[] = ["active", "resolved", "discontinued"];
const MEDICAL_RECORD_TYPES: MedicalRecordType[] = ["condition", "medication", "allergy"];

function toMedicalRecordStatus(value: string): MedicalRecordStatus {
  return MEDICAL_RECORD_STATUSES.includes(value as MedicalRecordStatus) ? (value as MedicalRecordStatus) : "active";
}

function toMedicalRecordType(value: string): MedicalRecordType {
  return MEDICAL_RECORD_TYPES.includes(value as MedicalRecordType) ? (value as MedicalRecordType) : "condition";
}

function formatDateValue(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return format(parsedDate, "MMM d, yyyy");
}

interface RecordSectionProps {
  emptyDescription: string;
  emptyTitle: string;
  records: MedicalRecordRow[];
  title: string;
}

function RecordSection({ emptyDescription, emptyTitle, records, title }: RecordSectionProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        description={emptyDescription}
        icon={AlertCircle}
        title={emptyTitle}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => {
          const startDate = formatDateValue(record.start_date);
          const endDate = formatDateValue(record.end_date);

          return (
            <div key={record.id} className="space-y-2 rounded-xl bg-muted/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{record.name}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge value={toMedicalRecordType(record.type)} />
                  <StatusBadge value={toMedicalRecordStatus(record.status)} />
                </div>
              </div>
              {record.details ? <p className="text-sm text-muted-foreground">{record.details}</p> : null}
              {startDate || endDate ? (
                <p className="text-xs text-muted-foreground">
                  {startDate ? `Started ${startDate}` : null}
                  {startDate && endDate ? " • " : null}
                  {endDate ? `Ended ${endDate}` : null}
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default async function PatientRecordsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: records, error } = await supabase
    .from("medical_records")
    .select("id, type, name, details, status, start_date, end_date")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .returns<MedicalRecordRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const conditions = (records ?? []).filter((record) => toMedicalRecordType(record.type) === "condition");
  const medications = (records ?? []).filter((record) => toMedicalRecordType(record.type) === "medication");
  const allergies = (records ?? []).filter((record) => toMedicalRecordType(record.type) === "allergy");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Health Records</h1>
        <p className="text-sm text-muted-foreground">
          Review your conditions, medications, and allergies shared by your care team.
        </p>
      </div>

      <div className="grid gap-6">
        <RecordSection
          emptyDescription="No conditions have been recorded yet."
          emptyTitle="No conditions recorded"
          records={conditions}
          title="Conditions"
        />
        <RecordSection
          emptyDescription="No medications have been recorded yet."
          emptyTitle="No medications recorded"
          records={medications}
          title="Medications"
        />
        <RecordSection
          emptyDescription="No allergies have been recorded yet."
          emptyTitle="No allergies recorded"
          records={allergies}
          title="Allergies"
        />
      </div>
    </div>
  );
}
