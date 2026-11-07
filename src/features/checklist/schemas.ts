import { z } from "zod";

export const RuleScopeSchema = z.object({
  payerId: z.string().min(1).nullable(),
  procedureId: z.string().min(1).nullable(),
  stage: z.enum(["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"]),
});

export const SetRuleSchema = RuleScopeSchema.extend({
  documentTypeId: z.string().min(1),
  requirement: z.enum(["INHERIT", "REQUIRED", "OPTIONAL", "NOT_NEEDED"]),
  needsFreshCopy: z.boolean(),
});

export type RuleScopeInput = z.infer<typeof RuleScopeSchema>;
export type SetRuleInput = z.infer<typeof SetRuleSchema>;
