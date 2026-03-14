import Link from "next/link";
import { endOfDay, format, startOfDay } from "date-fns";
import { Activity, Calendar, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerClient } from "@/lib/supabase/server";

interface SignupRow {
  created_at: string;
  email: string;
  full_name: string | null;
  id: string;
  role: "patient" | "provider" | "admin" | null;
}

interface ActivityAppointment {
  created_at: string;
  id: string;
  patient: {
    full_name: string | null;
  } | null;
  provider: {
    full_name: string | null;
  } | null;
}

interface ActivityNote {
  created_at: string;
  id: string;
  patient: {
    full_name: string | null;
  } | null;
  provider: {
    full_name: string | null;
  } | null;
}

interface ActivityItem {
  created_at: string;
  description: string;
  id: string;
  type: "appointment" | "note";
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const dayStart = startOfDay(now).toISOString();
  const dayEnd = endOfDay(now).toISOString();

  const [{ count: totalUsers }, { count: providersCount }, { count: patientsCount }, { count: appointmentsTodayCount }, { data: recentSignups }, { data: recentAppointments }, { data: recentNotes }] =
    await Promise.all([
      supabase.from("profiles").select("id", { head: true, count: "exact" }),
      supabase.from("profiles").select("id", { head: true, count: "exact" }).eq("role", "provider"),
      supabase.from("profiles").select("id", { head: true, count: "exact" }).eq("role", "patient"),
      supabase
        .from("appointments")
        .select("id", { head: true, count: "exact" })
        .gte("date_time", dayStart)
        .lte("date_time", dayEnd),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<SignupRow[]>(),
      supabase
        .from("appointments")
        .select(
          "id, created_at, patient:profiles!appointments_patient_id_fkey(full_name), provider:profiles!appointments_provider_id_fkey(full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<ActivityAppointment[]>(),
      supabase
        .from("clinical_notes")
        .select(
          "id, created_at, patient:profiles!clinical_notes_patient_id_fkey(full_name), provider:profiles!clinical_notes_provider_id_fkey(full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<ActivityNote[]>(),
    ]);

  const activityFeed: ActivityItem[] = [
    ...(recentAppointments ?? []).map((appointment) => ({
      id: appointment.id,
      type: "appointment" as const,
      created_at: appointment.created_at,
      description: `Appointment created: ${appointment.patient?.full_name || "Patient"} with ${appointment.provider?.full_name || "Provider"}`,
    })),
    ...(recentNotes ?? []).map((note) => ({
      id: note.id,
      type: "note" as const,
      created_at: note.created_at,
      description: `Clinical note added for ${note.patient?.full_name || "Patient"} by ${note.provider?.full_name || "Provider"}`,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">System-wide metrics and recent platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard description="All registered profiles" icon={Users} title="Total Users" value={totalUsers ?? 0} />
        <StatCard description="Provider accounts" icon={Stethoscope} title="Providers" value={providersCount ?? 0} />
        <StatCard description="Patient accounts" icon={ShieldCheck} title="Patients" value={patientsCount ?? 0} />
        <StatCard description="Across all providers" icon={Calendar} title="Appointments Today" value={appointmentsTodayCount ?? 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Signups</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/users">View All Users</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentSignups?.length ? (
              <p className="text-sm text-muted-foreground">No signup activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Signup Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSignups.map((signup) => (
                      <TableRow key={signup.id}>
                        <TableCell className="font-medium">{signup.full_name || "CareSync User"}</TableCell>
                        <TableCell>{signup.email}</TableCell>
                        <TableCell className="capitalize">{signup.role || "pending"}</TableCell>
                        <TableCell>{format(new Date(signup.created_at), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!activityFeed.length ? (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              activityFeed.map((item) => (
                <div className="rounded-md border p-3" key={`${item.type}-${item.id}`}>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
