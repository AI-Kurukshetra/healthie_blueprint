"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { markThreadReadSchema, sendMessageSchema } from "@/lib/validations/message";
import { profileRoleSchema } from "@/lib/validations/profile";

interface ActionResult {
  error?: string;
  success: boolean;
}

async function canMessageUser(userId: string, receiverId: string, role: "admin" | "patient" | "provider") {
  const supabase = await createServerClient();

  if (role === "admin") {
    return true;
  }

  if (role === "patient") {
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", userId)
      .eq("provider_id", receiverId);

    return (count ?? 0) > 0;
  }

  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", userId)
    .eq("patient_id", receiverId);

  return (count ?? 0) > 0;
}

export async function sendMessage(
  input: {
    appointment_id?: string;
    content: string;
    receiver_id: string;
  }
): Promise<ActionResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid message." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: senderProfile, error: senderProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (senderProfileError) {
    return { success: false, error: senderProfileError.message };
  }

  const parsedRole = profileRoleSchema.safeParse(senderProfile.role);
  if (!parsedRole.success) {
    return { success: false, error: "Invalid sender role." };
  }

  const canMessage = await canMessageUser(user.id, parsed.data.receiver_id, parsedRole.data);
  if (!canMessage) {
    return { success: false, error: "You can only message users with an appointment relationship." };
  }

  const { error: insertError } = await supabase.from("messages").insert({
    appointment_id: parsed.data.appointment_id ?? null,
    content: parsed.data.content,
    receiver_id: parsed.data.receiver_id,
    sender_id: user.id,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/patient/messages");
  revalidatePath("/provider/messages");

  return { success: true };
}

export async function markThreadRead(partnerId: string): Promise<ActionResult> {
  const parsed = markThreadReadSchema.safeParse({ partner_id: partnerId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid thread partner id." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", user.id)
    .eq("sender_id", parsed.data.partner_id)
    .is("read_at", null);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/patient/messages");
  revalidatePath("/provider/messages");

  return { success: true };
}
