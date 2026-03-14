"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import {
  availabilityScheduleSchema,
  type AvailabilityEntryInput,
} from "@/lib/validations/availability";

interface ActionResult {
  error?: string;
  success: boolean;
}

export async function saveProviderAvailability(entries: AvailabilityEntryInput[]): Promise<ActionResult> {
  const parsed = availabilityScheduleSchema.safeParse(entries);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid availability payload." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const payload = parsed.data.map((entry) => ({
    day_of_week: entry.day_of_week,
    end_time: entry.end_time,
    is_active: entry.is_active,
    provider_id: user.id,
    start_time: entry.start_time,
  }));

  const { error: deleteError } = await supabase.from("availability").delete().eq("provider_id", user.id);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const { error: insertError } = await supabase.from("availability").insert(payload);
  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/provider/schedule");
  revalidatePath("/patient/appointments/new");

  return { success: true };
}
