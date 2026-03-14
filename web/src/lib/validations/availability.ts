import { z } from "zod";

export const availabilityEntrySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must use HH:MM format"),
  is_active: z.boolean(),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must use HH:MM format"),
});

export const availabilityScheduleSchema = z
  .array(availabilityEntrySchema)
  .min(1, "At least one availability row is required")
  .max(7, "At most seven availability rows are allowed")
  .refine((entries) => {
    return entries.every((entry) => entry.start_time < entry.end_time);
  }, "Start time must be earlier than end time");

export type AvailabilityEntryInput = z.infer<typeof availabilityEntrySchema>;
export type AvailabilityScheduleInput = z.infer<typeof availabilityScheduleSchema>;
