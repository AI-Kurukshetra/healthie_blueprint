import { z } from "zod";

export const profileRoleSchema = z.enum(["patient", "provider", "admin"]);

export const updateProfileSchema = z.object({
  avatar_url: z
    .union([z.literal(""), z.string().url("Enter a valid URL")])
    .optional(),
  full_name: z.string().trim().min(1, "Full name is required").max(100, "Full name must be 100 characters or fewer"),
  phone: z.string().trim().max(20, "Phone must be 20 characters or fewer").optional(),
});

export const updateProviderDetailsSchema = z.object({
  bio: z.string().trim().max(1000, "Bio must be 1000 characters or fewer").optional(),
  license_number: z.string().trim().max(50, "License number must be 50 characters or fewer").optional(),
  specialization: z.string().trim().max(100, "Specialization must be 100 characters or fewer").optional(),
});

export const updatePatientDetailsSchema = z.object({
  blood_type: z.string().trim().max(5, "Blood type must be 5 characters or fewer").optional(),
  emergency_contact: z.string().trim().max(200, "Emergency contact must be 200 characters or fewer").optional(),
  insurance_id: z.string().trim().max(50, "Insurance ID must be 50 characters or fewer").optional(),
  insurance_provider: z.string().trim().max(100, "Insurance provider must be 100 characters or fewer").optional(),
});

export const changePasswordSchema = z
  .object({
    confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ProfileRole = z.infer<typeof profileRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProviderDetailsInput = z.infer<typeof updateProviderDetailsSchema>;
export type UpdatePatientDetailsInput = z.infer<typeof updatePatientDetailsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
