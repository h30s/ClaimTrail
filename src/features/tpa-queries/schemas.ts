import { z } from "zod";

export const SimulateEmailSchema = z.object({
  fromAddress: z.string().email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  body: z.string().trim().min(10, "Email body must be at least 10 characters").max(20000),
  receivedAt: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        return !isNaN(d.getTime()) && d.getTime() <= Date.now() + 60_000;
      },
      { message: "Received date cannot be in the future" },
    ),
});
export type SimulateEmailInput = z.infer<typeof SimulateEmailSchema>;

export const LinkQuerySchema = z.object({
  queryId: z.string().min(1),
  claimId: z.string().min(1),
});
export type LinkQueryInput = z.infer<typeof LinkQuerySchema>;

export const RecordReplySchema = z.object({
  queryId: z.string().min(1),
  replyBody: z.string().trim().min(1, "Reply text is required").max(5000),
  documentIds: z.array(z.string()).default([]),
});
export type RecordReplyInput = z.infer<typeof RecordReplySchema>;
