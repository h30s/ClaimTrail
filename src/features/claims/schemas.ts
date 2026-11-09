import { z } from "zod";

export const ClaimCodeSchema = z.string().regex(/^CLM-\d+$/, "Claim code must be formatted like CLM-1234");

export const WorklistParamsSchema = z.object({
  tab: z.enum(["action", "open", "sent", "settled"]).default("action"),
  q: z.string().optional(),
  payer: z.string().optional(),
  assignee: z.string().optional(),
});
export type WorklistParams = z.infer<typeof WorklistParamsSchema>;

export const CreateClaimSchema = z
  .object({
    patientId: z.string().optional(),
    patientName: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 2, "Name must be at least 2 characters"),
    patientGender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    patientDob: z
      .string()
      .optional()
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Format: YYYY-MM-DD"),
    patientUhid: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 3, "UHID must be at least 3 characters"),

    payerId: z.string().min(1, "Select a payer"),
    procedureId: z.string().min(1, "Select a procedure"),
    policyNumber: z.string().min(3, "Policy number required"),
    payerReference: z.string().optional(),
    treatingDoctor: z.string().min(2, "Doctor name required"),
    admittedAt: z.string().min(1, "Admission date required"),
    estimatedAmount: z.number().int().positive("Estimate must be greater than 0"),
    assigneeId: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.patientId) ||
      Boolean(data.patientName && data.patientGender && data.patientDob && data.patientUhid),
    {
      message: "Patient details are required when creating a new patient",
      path: ["patientName"],
    },
  );
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;

export const RecordDecisionSchema = z
  .object({
    claimId: z.string().min(1),
    decision: z.enum(["APPROVE", "REJECT"]),
    approvedAmount: z.number().int().positive().optional(),
    reason: z.string().min(5, "Reason must be at least 5 characters").max(300).optional(),
  })
  .refine((d) => (d.decision === "APPROVE" ? d.approvedAmount !== undefined && d.approvedAmount > 0 : true), {
    message: "Approved amount is required",
    path: ["approvedAmount"],
  })
  .refine((d) => (d.decision === "REJECT" ? Boolean(d.reason && d.reason.length >= 5) : true), {
    message: "Rejection reason is required (min 5 characters)",
    path: ["reason"],
  });
export type RecordDecisionInput = z.infer<typeof RecordDecisionSchema>;

export const StartStageSchema = z.object({
  claimId: z.string().min(1),
  stage: z.enum(["ENHANCEMENT", "DISCHARGE"]),
});
export type StartStageInput = z.infer<typeof StartStageSchema>;

export const AssignClaimSchema = z.object({
  claimId: z.string().min(1),
  assigneeId: z.string().nullable(),
});
export type AssignClaimInput = z.infer<typeof AssignClaimSchema>;

export const SearchPatientsSchema = z.object({
  q: z.string().min(2, "Enter at least 2 characters to search"),
});

export const SubmitClaimSchema = z.object({
  claimCode: z.string().min(1),
  overrideReason: z.string().trim().max(300).optional(),
});
export type SubmitClaimInput = z.infer<typeof SubmitClaimSchema>;

export const DeductionItemSchema = z.object({
  reason: z.enum([
    "MISSING_DOCUMENT",
    "NON_PAYABLE_ITEM",
    "ROOM_RENT_LIMIT",
    "TARIFF_DIFFERENCE",
    "CO_PAYMENT",
    "OTHER",
  ]),
  amount: z.number().int().positive("Amount must be greater than 0"),
  note: z.string().trim().max(200, "Note must be under 200 characters").optional(),
});
export type DeductionItem = z.infer<typeof DeductionItemSchema>;

export const RecordSettlementSchema = z
  .object({
    claimCode: ClaimCodeSchema,
    billedAmount: z.number().int().positive("Billed amount must be greater than 0"),
    settledAmount: z.number().int().min(0, "Settled amount cannot be negative"),
    deductions: z.array(DeductionItemSchema),
  })
  .refine((data) => data.settledAmount <= data.billedAmount, {
    message: "Settled amount cannot exceed billed amount",
    path: ["settledAmount"],
  })
  .superRefine((data, ctx) => {
    const diff = data.billedAmount - data.settledAmount;
    const sum = data.deductions.reduce((acc, d) => acc + (d.amount || 0), 0);
    if (diff !== sum) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Deductions must add up to ₹${diff.toLocaleString("en-IN")} (billed − settled).`,
        path: ["deductions"],
      });
    }
  });
export type RecordSettlementInput = z.infer<typeof RecordSettlementSchema>;
