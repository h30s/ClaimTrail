import { z } from "zod";

export const UpdateDocumentTypeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(60),
  description: z.string().min(10).max(300),
  sortOrder: z.number().int(),
  active: z.boolean(),
});

export const UpdatePayerSchema = z.object({
  id: z.string().min(1),
  queryReplyHours: z.number().int().min(1).max(168),
  emailDomain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Enter a valid domain name"),
  active: z.boolean(),
});

export type UpdateDocumentTypeInput = z.infer<typeof UpdateDocumentTypeSchema>;
export type UpdatePayerInput = z.infer<typeof UpdatePayerSchema>;
