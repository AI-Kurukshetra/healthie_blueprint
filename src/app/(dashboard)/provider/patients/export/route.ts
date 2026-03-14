import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface AppointmentWithPatient {
  date_time: string;
  patient: {
    email: string;
    full_name: string | null;
    id: string;
    phone: string | null;
  } | null;
  patient_id: string;
  status: string;
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("patient_id, date_time, status, patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone)")
    .eq("provider_id", user.id)
    .order("date_time", { ascending: false })
    .returns<AppointmentWithPatient[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const uniqueRows = new Map<string, string[]>();
  for (const appointment of appointments ?? []) {
    if (!appointment.patient || uniqueRows.has(appointment.patient_id)) {
      continue;
    }

    uniqueRows.set(appointment.patient_id, [
      appointment.patient_id,
      appointment.patient.full_name || "Unknown Patient",
      appointment.patient.email,
      appointment.patient.phone || "",
      appointment.date_time,
      appointment.status,
    ]);
  }

  const csvRows = [
    ["patient_id", "name", "email", "phone", "last_appointment", "status"],
    ...Array.from(uniqueRows.values()),
  ];
  const csv = csvRows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=provider-patients.csv",
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
