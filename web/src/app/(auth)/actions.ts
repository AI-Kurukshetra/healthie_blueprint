"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations/auth";

interface AuthActionResult {
  error?: string;
  redirectTo?: string;
  success: boolean;
}

export async function signIn(values: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid login input" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, redirectTo: "/" };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  if (role === "provider") {
    return { success: true, redirectTo: "/provider/dashboard" };
  }

  if (role === "patient") {
    return { success: true, redirectTo: "/patient/dashboard" };
  }

  if (role === "admin") {
    return { success: true, redirectTo: "/admin/dashboard" };
  }

  return { success: true, redirectTo: "/onboarding" };
}

export async function signUp(values: SignupInput): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid signup input" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, redirectTo: "/onboarding" };
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
