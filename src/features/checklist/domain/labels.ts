import type { Requirement, Stage } from "@/lib/enums";
import type { RuleScope } from "./resolve-checklist";

export const STAGE_LABEL: Record<Stage, string> = {
  PRE_AUTH: "Pre-auth",
  ENHANCEMENT: "Enhancement",
  DISCHARGE: "Final bill",
};

export const REQUIREMENT_LABEL: Record<Requirement, string> = {
  REQUIRED: "Required",
  OPTIONAL: "Optional",
  NOT_NEEDED: "Not needed",
};

export const SCOPE_LABEL: Record<RuleScope, string> = {
  ALL: "All payers · all procedures",
  PROCEDURE: "Procedure",
  PAYER: "Payer",
  PAYER_PROCEDURE: "Payer + procedure",
};
