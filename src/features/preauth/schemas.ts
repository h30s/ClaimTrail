import { z } from "zod";
import { PREAUTH_FIELD_KEYS } from "./domain/preauth-fields";

export const ConfirmPreauthFieldSchema = z.object({
  claimCode: z.string().min(1),
  fieldKey: z.enum(PREAUTH_FIELD_KEYS),
  value: z.string().min(1, "Value is required"),
  suggestionId: z.string().optional(),
});

export type ConfirmPreauthFieldInput = z.infer<typeof ConfirmPreauthFieldSchema>;
