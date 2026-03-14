"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { profileRoleSchema } from "@/lib/validations/profile";

interface ActionResult {
  error?: string;
  success: boolean;
}

const updateRoleSchema = z.object({
  newRole: profileRoleSchema,
  userId: z.string().uuid(),
});

const deactivateUserSchema = z.object({
  isActive: z.boolean(),
  userId: z.string().uuid(),
});

async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", supabase, user: null };
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error || profile?.role !== "admin") {
    return { error: "Only admins can perform this action.", supabase, user: null };
  }

  return { error: null, supabase, user };
}

export async function updateUserRole(userId: string, newRole: "admin" | "patient" | "provider"): Promise<ActionResult> {
  const parsed = updateRoleSchema.safeParse({ newRole, userId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid role update payload." };
  }

  const { error: adminError, supabase } = await requireAdmin();
  if (adminError) {
    return { success: false, error: adminError };
  }

  const { error } = await supabase.from("profiles").update({ role: parsed.data.newRole }).eq("id", parsed.data.userId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const parsed = deactivateUserSchema.safeParse({ isActive, userId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid user status payload." };
  }

  const { error: adminError, supabase } = await requireAdmin();
  if (adminError) {
    return { success: false, error: adminError };
  }

  const { error } = await supabase.from("profiles").update({ is_active: parsed.data.isActive }).eq("id", parsed.data.userId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
