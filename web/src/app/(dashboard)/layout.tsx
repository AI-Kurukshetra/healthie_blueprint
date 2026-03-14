import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { UserRole } from "@/config/nav";
import { createServerClient } from "@/lib/supabase/server";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface DashboardProfile {
  avatar_url: string | null;
  email: string;
  full_name: string | null;
  role: UserRole | null;
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

  return (
    <div className="min-h-screen md:pl-64">
      <Sidebar avatarUrl={profile.avatar_url} role={profile.role} userEmail={profile.email} userName={userName} />
      <div className="flex min-h-screen flex-col">
        <Header avatarUrl={profile.avatar_url} role={profile.role} userEmail={profile.email} userName={userName} />
        <main className="flex-1 bg-muted/20 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
