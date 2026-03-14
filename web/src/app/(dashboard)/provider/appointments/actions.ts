"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import {
  appointmentStatusSchema,
  updateAppointmentStatusSchema,
} from "@/lib/validations/appointment";
import { createClinicalNoteSchema } from "@/lib/validations/clinical-note";

interface ActionResult {
  error?: string;
  success: boolean;
}

const noteIdSchema = z.string().uuid();

function getNotePayload(formData: FormData) {
  return {
    appointment_id: String(formData.get("appointment_id") ?? ""),
    patient_id: String(formData.get("patient_id") ?? ""),
    subjective: String(formData.get("subjective") ?? ""),
    objective: String(formData.get("objective") ?? ""),
    assessment: String(formData.get("assessment") ?? ""),
    plan: String(formData.get("plan") ?? ""),
  };
}

export async function updateAppointmentStatus(
  id: string,
  status: z.infer<typeof appointmentStatusSchema>
): Promise<ActionResult> {
  const parsed = updateAppointmentStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid appointment status" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("provider_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/provider/appointments");
  revalidatePath(`/provider/appointments/${parsed.data.id}`);
  revalidatePath("/provider/patients");

  return { success: true };
}

export async function createClinicalNote(formData: FormData): Promise<ActionResult> {
  const parsed = createClinicalNoteSchema.safeParse(getNotePayload(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid clinical note input" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("clinical_notes").insert({
    ...parsed.data,
    provider_id: user.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/provider/appointments/${parsed.data.appointment_id}`);
  revalidatePath("/provider/notes");

  return { success: true };
}

export async function updateClinicalNote(noteId: string, formData: FormData): Promise<ActionResult> {
  const parsedNoteId = noteIdSchema.safeParse(noteId);
  if (!parsedNoteId.success) {
    return { success: false, error: "Invalid note id" };
  }

  const parsed = createClinicalNoteSchema.safeParse(getNotePayload(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid clinical note input" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("clinical_notes")
    .update({
      subjective: parsed.data.subjective,
      objective: parsed.data.objective,
      assessment: parsed.data.assessment,
      plan: parsed.data.plan,
    })
    .eq("id", parsedNoteId.data)
    .eq("provider_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/provider/appointments/${parsed.data.appointment_id}`);
  revalidatePath("/provider/notes");

  return { success: true };
}
