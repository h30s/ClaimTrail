import type { IdentityCheck } from "@/lib/enums";
import type { ReviewReason } from "./sort-decision";

export const REVIEW_REASON_LABEL: Record<ReviewReason, string> = {
  LOW_CONFIDENCE: "Not sure — please check",
  UNKNOWN_TYPE: "Doesn't look like any checklist document",
  ILLEGIBLE: "Hard to read — check the scan",
  AI_FAILED: "Couldn't read this file automatically",
};

export const IDENTITY_LABEL: Record<IdentityCheck, string> = {
  UNCHECKED: "Name not found",
  MATCH: "Matches patient",
  MISMATCH: "Name doesn't match patient",
  CONFIRMED: "Confirmed by desk",
};
