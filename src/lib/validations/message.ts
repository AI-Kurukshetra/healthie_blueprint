import { z } from "zod";

export const sendMessageSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or fewer"),
  receiver_id: z.string().uuid(),
});

export const markThreadReadSchema = z.object({
  partner_id: z.string().uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkThreadReadInput = z.infer<typeof markThreadReadSchema>;
