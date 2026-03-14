"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { createAppointmentSchema, type AppointmentType } from "@/lib/validations/appointment";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

interface BookAppointmentData {
  id: string;
}

function toIsoDateTime(date: string, time: string) {
  const appointmentDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  return appointmentDate.toISOString();
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function bookAppointment(formData: FormData): Promise<ActionResult<BookAppointmentData>> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to book an appointment." };
    }

    const providerId = getFormValue(formData, "provider_id");
    const appointmentDate = getFormValue(formData, "appointment_date");
    const appointmentTime = getFormValue(formData, "appointment_time");
    const type = getFormValue(formData, "type");
    const notes = getFormValue(formData, "notes");
    const durationMinutesRaw = getFormValue(formData, "duration_minutes");
    const dateTimeIso = toIsoDateTime(appointmentDate, appointmentTime);
    const durationMinutes = Number.parseInt(durationMinutesRaw, 10);

    if (!dateTimeIso) {
      return { success: false, error: "Select a valid date and time." };
    }

    const parsed = createAppointmentSchema.safeParse({
      date_time: dateTimeIso,
      duration_minutes: Number.isNaN(durationMinutes) ? 30 : durationMinutes,
      notes: notes || undefined,
      provider_id: providerId,
      type: type as AppointmentType,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid appointment details." };
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        date_time: parsed.data.date_time,
        duration_minutes: parsed.data.duration_minutes,
        notes: parsed.data.notes ?? null,
        patient_id: user.id,
        provider_id: parsed.data.provider_id,
        status: "scheduled",
        type: parsed.data.type,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Unable to book appointment." };
    }

    revalidatePath("/patient/appointments");

    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong while booking your appointment.",
    };
  }
}

export async function cancelPatientAppointment(appointmentId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("id", appointmentId)
      .eq("patient_id", user.id)
      .single<{ id: string; status: string }>();

    if (appointmentError || !appointment) {
      return { success: false, error: appointmentError?.message ?? "Appointment not found." };
    }

    if (appointment.status !== "scheduled") {
      return { success: false, error: "Only scheduled appointments can be cancelled." };
    }

    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointment.id)
      .eq("patient_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${appointment.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel appointment.",
    };
  }
}
