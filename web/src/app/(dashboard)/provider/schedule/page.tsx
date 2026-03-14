import { Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { ProviderScheduleForm } from "@/components/provider/ProviderScheduleForm";
import { createServerClient } from "@/lib/supabase/server";
import type { AvailabilityEntryInput } from "@/lib/validations/availability";

interface AvailabilityRow {
  day_of_week: number;
  end_time: string;
  is_active: boolean;
  start_time: string;
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5] as const;

const DEFAULT_WEEK_SCHEDULE: AvailabilityEntryInput[] = [
  { day_of_week: 1, end_time: "17:00", is_active: true, start_time: "09:00" },
  { day_of_week: 2, end_time: "17:00", is_active: true, start_time: "09:00" },
  { day_of_week: 3, end_time: "17:00", is_active: true, start_time: "09:00" },
  { day_of_week: 4, end_time: "17:00", is_active: true, start_time: "09:00" },
  { day_of_week: 5, end_time: "17:00", is_active: true, start_time: "09:00" },
];

function toTimeValue(timeValue: string) {
  return timeValue.slice(0, 5);
}

export default async function ProviderSchedulePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: availabilityRows, error } = await supabase
    .from("availability")
    .select("day_of_week, start_time, end_time, is_active")
    .eq("provider_id", user.id)
    .order("day_of_week", { ascending: true })
    .returns<AvailabilityRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const rowByDay = new Map((availabilityRows ?? []).map((row) => [row.day_of_week, row]));
  const entries = WEEKDAY_ORDER.map((dayOfWeek, index) => {
    const row = rowByDay.get(dayOfWeek);
    if (!row) {
      return DEFAULT_WEEK_SCHEDULE[index];
    }

    return {
      day_of_week: dayOfWeek,
      end_time: toTimeValue(row.end_time),
      is_active: row.is_active,
      start_time: toTimeValue(row.start_time),
    };
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Schedule Availability</h1>
        <p className="text-sm text-muted-foreground">
          Set your weekly hours so patients can book appointments during your available slots.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground shadow-sm">
        <Clock className="h-4 w-4" />
        Patient booking uses these hours as available time windows.
      </div>

      <ProviderScheduleForm initialEntries={entries} />
    </div>
  );
}
