"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { onboardingRoleSchema, type OnboardingRole } from "@/lib/validations/auth";

export async function setUserRole(role: OnboardingRole) {
  const parsedRole = onboardingRoleSchema.safeParse(role);
  if (!parsedRole.success) {
    redirect("/onboarding");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("profiles").update({ role: parsedRole.data }).eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (parsedRole.data === "provider") {
    redirect("/provider/dashboard");
  }

  if (parsedRole.data === "patient") {
    redirect("/patient/dashboard");
  }

  redirect("/admin/dashboard");
}
