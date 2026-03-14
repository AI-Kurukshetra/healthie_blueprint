"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProviderAvailability } from "@/app/(dashboard)/provider/schedule/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AvailabilityEntryInput } from "@/lib/validations/availability";

interface ProviderScheduleFormProps {
  initialEntries: AvailabilityEntryInput[];
}

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function toDisplayTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

export function ProviderScheduleForm({ initialEntries }: ProviderScheduleFormProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<AvailabilityEntryInput[]>(initialEntries);
  const [isPending, startTransition] = useTransition();

  const updateEntry = (day: number, updater: (entry: AvailabilityEntryInput) => AvailabilityEntryInput) => {
    setEntries((previous) => previous.map((entry) => (entry.day_of_week === day ? updater(entry) : entry)));
  };

  const onSave = () => {
    startTransition(async () => {
      const result = await saveProviderAvailability(entries);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save schedule.");
        return;
      }

      toast.success("Availability updated");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.day_of_week}>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-[160px_1fr_1fr_120px] md:items-center">
            <p className="text-sm font-medium">{DAY_LABELS[entry.day_of_week]}</p>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor={`start-${entry.day_of_week}`}>
                Start
              </label>
              <Input
                id={`start-${entry.day_of_week}`}
                onChange={(event) => {
                  updateEntry(entry.day_of_week, (current) => ({
                    ...current,
                    start_time: event.target.value,
                  }));
                }}
                type="time"
                value={toDisplayTime(entry.start_time)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor={`end-${entry.day_of_week}`}>
                End
              </label>
              <Input
                id={`end-${entry.day_of_week}`}
                onChange={(event) => {
                  updateEntry(entry.day_of_week, (current) => ({
                    ...current,
                    end_time: event.target.value,
                  }));
                }}
                type="time"
                value={toDisplayTime(entry.end_time)}
              />
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-end">
              <span className="text-sm text-muted-foreground">Active</span>
              <Switch
                checked={entry.is_active}
                onCheckedChange={(checked) => {
                  updateEntry(entry.day_of_week, (current) => ({
                    ...current,
                    is_active: checked,
                  }));
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button disabled={isPending} onClick={onSave} type="button">
          {isPending ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}
