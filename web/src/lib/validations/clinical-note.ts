import { z } from "zod";

export const createClinicalNoteSchema = z.object({
  appointment_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  subjective: z.string().min(1, "Subjective is required").max(5000),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
});

export type CreateClinicalNoteInput = z.infer<typeof createClinicalNoteSchema>;
