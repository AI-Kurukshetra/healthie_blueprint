import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

interface ProviderLayoutProps {
  children: ReactNode;
}

export default async function ProviderLayout({ children }: ProviderLayoutProps) {
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

  if (profile?.role !== "provider") {
    if (profile?.role === "patient") {
      redirect("/patient/dashboard");
    }

    if (profile?.role === "admin") {
      redirect("/admin/dashboard");
    }

    redirect("/onboarding");
  }

  return children;
}
