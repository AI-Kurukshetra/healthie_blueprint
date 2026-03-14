"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  updatePatientDetailsSchema,
  updateProfileSchema,
  updateProviderDetailsSchema,
} from "@/lib/validations/profile";

interface ActionResult {
  error?: string;
  success: boolean;
}

export async function updateProfileSettings(formData: FormData): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse({
    avatar_url: String(formData.get("avatar_url") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid profile input." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: parsed.data.avatar_url || null,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateProviderSettings(formData: FormData): Promise<ActionResult> {
  const parsed = updateProviderDetailsSchema.safeParse({
    bio: String(formData.get("bio") ?? "").trim(),
    license_number: String(formData.get("license_number") ?? "").trim(),
    specialization: String(formData.get("specialization") ?? "").trim(),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid provider details." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("provider_details").upsert({
    bio: parsed.data.bio || null,
    id: user.id,
    license_number: parsed.data.license_number || null,
    specialization: parsed.data.specialization || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePatientSettings(formData: FormData): Promise<ActionResult> {
  const parsed = updatePatientDetailsSchema.safeParse({
    blood_type: String(formData.get("blood_type") ?? "").trim(),
    emergency_contact: String(formData.get("emergency_contact") ?? "").trim(),
    insurance_id: String(formData.get("insurance_id") ?? "").trim(),
    insurance_provider: String(formData.get("insurance_provider") ?? "").trim(),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid patient details." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("patient_details").upsert({
    blood_type: parsed.data.blood_type || null,
    emergency_contact: parsed.data.emergency_contact || null,
    id: user.id,
    insurance_id: parsed.data.insurance_id || null,
    insurance_provider: parsed.data.insurance_provider || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    confirm_password: String(formData.get("confirm_password") ?? ""),
    new_password: String(formData.get("new_password") ?? ""),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid password." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.new_password });
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
