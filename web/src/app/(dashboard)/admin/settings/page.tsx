import { subHours } from "date-fns";
import { Activity, Calendar, ClipboardList, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const last24HoursIso = subHours(new Date(), 24).toISOString();

  const [
    { count: totalUsers },
    { count: providersCount },
    { count: patientsCount },
    { count: appointmentsCount },
    { count: notesCount },
    { count: newUsers24h },
    { count: appointments24h },
    { count: notes24h },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "provider"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase.from("clinical_notes").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", last24HoursIso),
    supabase.from("appointments").select("id", { count: "exact", head: true }).gte("created_at", last24HoursIso),
    supabase.from("clinical_notes").select("id", { count: "exact", head: true }).gte("created_at", last24HoursIso),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">Platform overview and operational health for CareSync.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-lg font-semibold">CareSync</p>
          <p className="text-sm text-muted-foreground">Modern EHR for virtual-first healthcare teams.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard description="All user profiles" icon={Users} title="Total Users" value={totalUsers ?? 0} />
        <StatCard description="Licensed care providers" icon={Stethoscope} title="Providers" value={providersCount ?? 0} />
        <StatCard description="Registered patients" icon={ShieldCheck} title="Patients" value={patientsCount ?? 0} />
        <StatCard description="All scheduled and historical" icon={Calendar} title="Appointments" value={appointmentsCount ?? 0} />
        <StatCard description="SOAP documentation records" icon={ClipboardList} title="Clinical Notes" value={notesCount ?? 0} />
        <StatCard description="Last 24h activity snapshot" icon={Activity} title="Health Signal" value={`${(newUsers24h ?? 0) + (appointments24h ?? 0) + (notes24h ?? 0)}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">New Users</p>
            <p className="mt-1 text-2xl font-semibold">{newUsers24h ?? 0}</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Appointments Created</p>
            <p className="mt-1 text-2xl font-semibold">{appointments24h ?? 0}</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Clinical Notes Added</p>
            <p className="mt-1 text-2xl font-semibold">{notes24h ?? 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
