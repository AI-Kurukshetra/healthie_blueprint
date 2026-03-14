import { z } from "zod";

export const appointmentTypeSchema = z.enum(["initial", "follow_up", "consultation"]);
export const appointmentStatusSchema = z.enum(["scheduled", "completed", "cancelled", "no_show"]);

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  date_time: z.string().datetime(),
  duration_minutes: z.number().min(15).max(120).default(30),
  type: appointmentTypeSchema,
  notes: z.string().max(500).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: appointmentStatusSchema,
});

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
