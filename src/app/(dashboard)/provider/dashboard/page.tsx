import Link from "next/link";
import { endOfDay, endOfWeek, format, getDay, startOfDay, startOfWeek } from "date-fns";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { WeeklyAppointmentsChart } from "@/components/provider/WeeklyAppointmentsChart";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import type { AppointmentType } from "@/lib/validations/appointment";

interface AppointmentItem {
  date_time: string;
  id: string;
  patient: {
    full_name: string | null;
  } | null;
  patient_id: string;
  type: AppointmentType;
}

interface NoteItem {
  created_at: string;
  id: string;
  patient: {
    full_name: string | null;
  } | null;
  subjective: string;
}

interface WeeklyAppointmentRow {
  date_time: string;
}

export default async function ProviderDashboardPage() {
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
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [{ data: patientRefs }, { count: todayCount }, { count: weekCount }, { data: completedAppointments }, { data: upcomingAppointments }, { data: recentNotes }, { data: weeklyAppointments }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("patient_id")
        .eq("provider_id", user.id),
      supabase
        .from("appointments")
        .select("id", { head: true, count: "exact" })
        .eq("provider_id", user.id)
        .gte("date_time", dayStart)
        .lte("date_time", dayEnd),
      supabase
        .from("appointments")
        .select("id", { head: true, count: "exact" })
        .eq("provider_id", user.id)
        .gte("date_time", weekStart)
        .lte("date_time", weekEnd),
      supabase
        .from("appointments")
        .select("id")
        .eq("provider_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("appointments")
        .select("id, patient_id, date_time, type, patient:profiles!appointments_patient_id_fkey(full_name)")
        .eq("provider_id", user.id)
        .gte("date_time", now.toISOString())
        .order("date_time", { ascending: true })
        .limit(5)
        .returns<AppointmentItem[]>(),
      supabase
        .from("clinical_notes")
        .select("id, subjective, created_at, patient:profiles!clinical_notes_patient_id_fkey(full_name)")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<NoteItem[]>(),
      supabase
        .from("appointments")
        .select("date_time")
        .eq("provider_id", user.id)
        .gte("date_time", weekStart)
        .lte("date_time", weekEnd)
        .returns<WeeklyAppointmentRow[]>(),
    ]);

  const distinctPatients = new Set((patientRefs ?? []).map((row) => row.patient_id));

  const completedIds = (completedAppointments ?? []).map((item) => item.id);
  let pendingNotes = 0;
  if (completedIds.length > 0) {
    const { data: completedNotes } = await supabase
      .from("clinical_notes")
      .select("appointment_id")
      .in("appointment_id", completedIds);

    const noteSet = new Set((completedNotes ?? []).map((item) => item.appointment_id));
    pendingNotes = completedIds.filter((id) => !noteSet.has(id)).length;
  }

  const weekChartTemplate = [
    { day: "Mon", count: 0 },
    { day: "Tue", count: 0 },
    { day: "Wed", count: 0 },
    { day: "Thu", count: 0 },
    { day: "Fri", count: 0 },
    { day: "Sat", count: 0 },
    { day: "Sun", count: 0 },
  ];
  const chartIndexByDay: Record<number, number> = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    0: 6,
  };
  for (const appointment of weeklyAppointments ?? []) {
    const weekday = getDay(new Date(appointment.date_time));
    const index = chartIndexByDay[weekday];
    if (index !== undefined) {
      weekChartTemplate[index].count += 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Provider Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your patient panel, schedule, and documentation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard description="Distinct patients from your appointments" icon={Users} title="Total Patients" value={distinctPatients.size} />
        <StatCard description="Scheduled for today" icon={Calendar} title="Today's Appointments" value={todayCount ?? 0} />
        <StatCard description="Appointments this week" icon={Calendar} title="This Week" value={weekCount ?? 0} />
        <StatCard description="Completed visits missing SOAP notes" icon={FileText} title="Pending Notes" value={pendingNotes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments This Week (Mon-Sun)</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyAppointmentsChart data={weekChartTemplate} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/provider/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!upcomingAppointments?.length ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.patient?.full_name || "Unknown Patient"}</TableCell>
                        <TableCell>{format(new Date(appointment.date_time), "MMM d, h:mm a")}</TableCell>
                        <TableCell>
                          <StatusBadge value={appointment.type} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clinical Notes</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/provider/notes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentNotes?.length ? (
              <p className="text-sm text-muted-foreground">No recent clinical notes.</p>
            ) : (
              recentNotes.map((note) => (
                <div className="rounded-xl bg-muted/35 p-3" key={note.id}>
                  <p className="text-sm font-medium">{note.patient?.full_name || "Unknown Patient"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(note.created_at), "MMM d, yyyy")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.subjective.length > 120 ? `${note.subjective.slice(0, 120)}...` : note.subjective}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/provider/appointments">View Today&apos;s Schedule</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/provider/patients">Search Patients</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/provider/notes">
              <ClipboardList className="mr-2 h-4 w-4" />
              Review Notes
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
