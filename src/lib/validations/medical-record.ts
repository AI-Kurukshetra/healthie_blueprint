import { z } from "zod";

export const medicalRecordTypeSchema = z.enum(["condition", "medication", "allergy"]);
export const medicalRecordStatusSchema = z.enum(["active", "resolved", "discontinued"]);

export const createMedicalRecordSchema = z.object({
  patient_id: z.string().uuid(),
  type: medicalRecordTypeSchema,
  name: z.string().min(1).max(200),
  details: z.string().max(2000).optional(),
  status: medicalRecordStatusSchema.default("active"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type MedicalRecordStatus = z.infer<typeof medicalRecordStatusSchema>;
export type MedicalRecordType = z.infer<typeof medicalRecordTypeSchema>;
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
