import Link from "next/link";
import { format } from "date-fns";
import { Activity, Calendar, CheckCircle2, FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import type { AppointmentType } from "@/lib/validations/appointment";

interface ProfileRow {
  full_name: string | null;
  id: string;
}

interface AppointmentRow {
  date_time: string;
  id: string;
  provider_id: string;
  status: string;
  type: string;
}

const APPOINTMENT_TYPES: AppointmentType[] = ["initial", "follow_up", "consultation"];

function toAppointmentType(value: string): AppointmentType {
  return APPOINTMENT_TYPES.includes(value as AppointmentType) ? (value as AppointmentType) : "initial";
}

export default async function PatientDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nowIso = new Date().toISOString();

  const [
    { count: upcomingAppointmentsCount, error: upcomingCountError },
    { count: completedVisitsCount, error: completedCountError },
    { count: activeConditionsCount, error: activeConditionsError },
    { count: currentMedicationsCount, error: medicationsCountError },
    { count: knownAllergiesCount, error: allergiesCountError },
    { data: nextAppointmentRows, error: nextAppointmentError },
    { data: recentCompletedRows, error: recentCompletedError },
    { data: profileData, error: profileError },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "scheduled")
      .gte("date_time", nowIso),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("medical_records")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("type", "condition")
      .eq("status", "active"),
    supabase
      .from("medical_records")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("type", "medication")
      .eq("status", "active"),
    supabase
      .from("medical_records")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("type", "allergy")
      .eq("status", "active"),
    supabase
      .from("appointments")
      .select("id, provider_id, date_time, status, type")
      .eq("patient_id", user.id)
      .eq("status", "scheduled")
      .gte("date_time", nowIso)
      .order("date_time", { ascending: true })
      .limit(1)
      .returns<AppointmentRow[]>(),
    supabase
      .from("appointments")
      .select("id, provider_id, date_time, status, type")
      .eq("patient_id", user.id)
      .eq("status", "completed")
      .order("date_time", { ascending: false })
      .limit(4)
      .returns<AppointmentRow[]>(),
    supabase.from("profiles").select("id, full_name").eq("id", user.id).single<ProfileRow>(),
  ]);

  if (upcomingCountError) {
    throw new Error(upcomingCountError.message);
  }

  if (completedCountError) {
    throw new Error(completedCountError.message);
  }

  if (activeConditionsError) {
    throw new Error(activeConditionsError.message);
  }

  if (medicationsCountError) {
    throw new Error(medicationsCountError.message);
  }

  if (allergiesCountError) {
    throw new Error(allergiesCountError.message);
  }

  if (nextAppointmentError) {
    throw new Error(nextAppointmentError.message);
  }

  if (recentCompletedError) {
    throw new Error(recentCompletedError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  const nextAppointment = nextAppointmentRows?.[0] ?? null;
  const recentCompletedAppointments = recentCompletedRows ?? [];
  const providerIds = Array.from(
    new Set([...(nextAppointment ? [nextAppointment.provider_id] : []), ...recentCompletedAppointments.map((item) => item.provider_id)])
  );

  let providers: ProfileRow[] = [];
  if (providerIds.length > 0) {
    const { data: providerRows, error: providersError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", providerIds)
      .returns<ProfileRow[]>();

    if (providersError) {
      throw new Error(providersError.message);
    }

    providers = providerRows ?? [];
  }

  const providerNameById = new Map(providers.map((provider) => [provider.id, provider.full_name || "Care Provider"]));
  const patientName = profileData.full_name?.trim() || "Patient";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {patientName}</h1>
          <p className="text-sm text-muted-foreground">Here is a quick summary of your visits and health records.</p>
        </div>
        <Button asChild>
          <Link href="/patient/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          description="Scheduled in the future"
          icon={Calendar}
          title="Upcoming Appointments"
          value={upcomingAppointmentsCount ?? 0}
        />
        <StatCard
          description="All-time completed appointments"
          icon={CheckCircle2}
          title="Completed Visits"
          value={completedVisitsCount ?? 0}
        />
        <StatCard
          description="Currently active conditions"
          icon={Activity}
          title="Active Conditions"
          value={activeConditionsCount ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-1">
            <CardTitle>Next Appointment</CardTitle>
            <CardDescription>Your next scheduled visit.</CardDescription>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={toAppointmentType(nextAppointment.type)} />
                  <StatusBadge value="scheduled" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{providerNameById.get(nextAppointment.provider_id) || "Care Provider"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(nextAppointment.date_time), "EEEE, MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/patient/appointments/${nextAppointment.id}`}>View Details</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No upcoming appointments scheduled.</p>
                <Button asChild size="sm">
                  <Link href="/patient/appointments/new">Book Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle>Health Summary</CardTitle>
            <CardDescription>Quick snapshot of your active health profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{activeConditionsCount ?? 0} conditions</Badge>
              <Badge variant="secondary">{currentMedicationsCount ?? 0} medications</Badge>
              <Badge variant="secondary">{knownAllergiesCount ?? 0} allergies</Badge>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/patient/records">
                <FileText className="mr-2 h-4 w-4" />
                View Full Records
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your most recent completed visits.</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/patient/appointments">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentCompletedAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed visits yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCompletedAppointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/35 p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{providerNameById.get(appointment.provider_id) || "Care Provider"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(appointment.date_time), "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusBadge value={toAppointmentType(appointment.type)} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
