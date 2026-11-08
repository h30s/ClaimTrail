import type { ClaimEventType, ClaimStatus, Stage } from "@/lib/enums";
import type { MilestoneKey } from "./milestones";

export const STAGE_LABEL: Record<Stage, string> = {
  PRE_AUTH: "Pre-auth",
  ENHANCEMENT: "Enhancement",
  DISCHARGE: "Final bill",
};

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  QUERY: "Query",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SETTLED: "Settled",
};

export const MILESTONE_LABEL: Record<MilestoneKey, string> = {
  PRE_AUTH: "Pre-auth",
  QUERY: "Query",
  APPROVED: "Approved",
  ENHANCEMENT: "Enhancement",
  FINAL_BILL: "Final bill",
  SETTLED: "Settled",
};

export const EVENT_LABEL: Record<ClaimEventType, string> = {
  CREATED: "Claim created",
  SUBMITTED: "Sent to payer",
  QUERY_RAISED: "Query received",
  QUERY_ANSWERED: "Query answered",
  APPROVED: "Approved by payer",
  REJECTED: "Rejected by payer",
  STAGE_STARTED: "Stage started",
  SETTLED: "Claim settled",
  ASSIGNED: "Claim assigned",
};

export function stageStatusLabel(stage: Stage, status: ClaimStatus): string {
  return `${STAGE_LABEL[stage]} · ${STATUS_LABEL[status]}`;
}
