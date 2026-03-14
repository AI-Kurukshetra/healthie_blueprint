import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface ProfileRow {
  created_at: string;
  email: string | null;
  full_name: string | null;
  id: string;
  is_active: boolean | null;
  role: string | null;
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
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, is_active")
    .order("created_at", { ascending: false })
    .returns<ProfileRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvRows = [
    ["id", "full_name", "email", "role", "created_at", "is_active"],
    ...(users ?? []).map((item) => [
      item.id,
      item.full_name || "",
      item.email || "",
      item.role || "",
      item.created_at,
      String(item.is_active ?? true),
    ]),
  ];
  const csv = csvRows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=admin-users.csv",
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
