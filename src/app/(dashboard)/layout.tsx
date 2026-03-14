import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { UserRole } from "@/config/nav";
import { createServerClient } from "@/lib/supabase/server";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface HeaderNotification {
  createdAt: string;
  id: string;
  message: string;
}

interface DashboardProfile {
  avatar_url: string | null;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
}

interface RoleScopedAppointmentRow {
  created_at: string;
  date_time?: string;
  id: string;
  patient?: { full_name: string | null } | null;
  provider?: { full_name: string | null } | null;
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
}

interface RoleScopedNoteRow {
  created_at: string;
  id: string;
  patient: { full_name: string | null } | null;
  provider: { full_name: string | null } | null;
}

function toDoctorName(name: string | null | undefined) {
  const trimmedName = name?.trim() || "Care Provider";
  return trimmedName.startsWith("Dr.") ? trimmedName : `Dr. ${trimmedName}`;
}

function appointmentStatusLabel(status: RoleScopedAppointmentRow["status"] | undefined) {
  if (status === "scheduled") {
    return "confirmed";
  }
  if (status === "completed") {
    return "completed";
  }
  if (status === "cancelled") {
    return "cancelled";
  }
  return "marked no-show";
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, email, avatar_url")
    .eq("id", user.id)
    .single<DashboardProfile>();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile?.role) {
    redirect("/onboarding");
  }

  const userName = profile.full_name?.trim() || "CareSync User";
  const userEmail = profile.email?.trim() || user.email || "no-email@caresync.local";
  let notifications: HeaderNotification[] = [];

  if (profile.role === "patient") {
    const [{ data: appointmentRows }, { data: noteRows }] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, created_at, date_time, status, provider:profiles!appointments_provider_id_fkey(full_name)")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedAppointmentRow[]>(),
      supabase
        .from("clinical_notes")
        .select("id, created_at, provider:profiles!clinical_notes_provider_id_fkey(full_name)")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedNoteRow[]>(),
    ]);

    const appointmentNotifications = (appointmentRows ?? []).map((appointment) => ({
      createdAt: appointment.created_at,
      id: `appointment-${appointment.id}`,
      message: `Your appointment on ${format(new Date(appointment.date_time ?? appointment.created_at), "MMMM d")} has been ${appointmentStatusLabel(appointment.status)}`,
    }));

    const noteNotifications = (noteRows ?? []).map((note) => ({
      createdAt: note.created_at,
      id: `note-${note.id}`,
      message: `${toDoctorName(note.provider?.full_name)} added a clinical note for your visit`,
    }));

    notifications = [...appointmentNotifications, ...noteNotifications];
  }

  if (profile.role === "provider") {
    const [{ data: appointmentRows }, { data: noteRows }] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, created_at, patient:profiles!appointments_patient_id_fkey(full_name)")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedAppointmentRow[]>(),
      supabase
        .from("clinical_notes")
        .select("id, created_at, patient:profiles!clinical_notes_patient_id_fkey(full_name)")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedNoteRow[]>(),
    ]);

    const appointmentNotifications = (appointmentRows ?? []).map((appointment) => ({
      createdAt: appointment.created_at,
      id: `appointment-${appointment.id}`,
      message: `New appointment booked with ${appointment.patient?.full_name || "Patient"}`,
    }));

    const noteNotifications = (noteRows ?? []).map((note) => ({
      createdAt: note.created_at,
      id: `note-${note.id}`,
      message: `Clinical note updated for ${note.patient?.full_name || "Patient"}`,
    }));

    notifications = [...appointmentNotifications, ...noteNotifications];
  }

  if (profile.role === "admin") {
    const [{ data: appointmentRows }, { data: noteRows }] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, created_at, provider:profiles!appointments_provider_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedAppointmentRow[]>(),
      supabase
        .from("clinical_notes")
        .select("id, created_at, provider:profiles!clinical_notes_provider_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<RoleScopedNoteRow[]>(),
    ]);

    const appointmentNotifications = (appointmentRows ?? []).map((appointment) => ({
      createdAt: appointment.created_at,
      id: `appointment-${appointment.id}`,
      message: `New appointment booked with ${toDoctorName(appointment.provider?.full_name)}`,
    }));

    const noteNotifications = (noteRows ?? []).map((note) => ({
      createdAt: note.created_at,
      id: `note-${note.id}`,
      message: `${toDoctorName(note.provider?.full_name)} added a clinical note for a visit`,
    }));

    notifications = [...appointmentNotifications, ...noteNotifications];
  }

  notifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar avatarUrl={profile.avatar_url} role={profile.role} userEmail={userEmail} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <Header
          avatarUrl={profile.avatar_url}
          notifications={notifications}
          role={profile.role}
          userEmail={userEmail}
          userName={userName}
        />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
