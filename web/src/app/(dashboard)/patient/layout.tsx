import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

interface PatientLayoutProps {
  children: ReactNode;
}

export default async function PatientLayout({ children }: PatientLayoutProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error) {
    throw new Error(error.message);
  }

  if (profile?.role !== "patient") {
    if (profile?.role === "provider") {
      redirect("/provider/dashboard");
    }

    if (profile?.role === "admin") {
      redirect("/admin/dashboard");
    }

    redirect("/onboarding");
  }

  return children;
}
