// features/claims/domain/claim-insight.ts
// Everything we derive about one claim, from plain data. Worklist and claim file both use this,
// so a gap shown in one place is always shown in the other.
import type { ClaimEventType, ClaimStatus, Stage } from "@/lib/enums";
import {
  computeGaps,
  type AskInput,
  type GapDocument,
  type GapReport,
} from "@/features/checklist/domain/compute-gaps";
import {
  resolveChecklist,
  type ChecklistItem,
  type RuleInput,
} from "@/features/checklist/domain/resolve-checklist";
import { PREAUTH_FIELD_KEYS } from "@/features/preauth/domain/preauth-fields";
import { collectAttention } from "./attention";
import { computeClocks, type ClockReport } from "./clocks";
import { buildMilestones, type Milestone } from "./milestones";
import { urgencyScore, type AttentionItem } from "./urgency";

export type ClaimInsightInput = {
  claim: {
    stage: Stage;
    status: ClaimStatus;
    payerId: string;
    procedureId: string;
    stageStartedAt: Date;
  };
  rules: RuleInput[];
  documents: GapDocument[];
  events: Array<{ type: ClaimEventType; stage: Stage; status: ClaimStatus; at: Date }>;
  openQueries: Array<{ id: string; dueAt: Date; asks: AskInput[] }>;
  confirmedFieldKeys: string[];
  labelFor: (documentTypeId: string) => string;
  now: Date;
  doctorApproval?: {
    status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
    comment?: string | null;
  } | null;
};

export type ClaimInsight = {
  checklist: ChecklistItem[];
  gaps: GapReport;
  clocks: ClockReport;
  milestones: Milestone[];
  attention: AttentionItem[];
  urgency: number;
};

export function buildClaimInsight(input: ClaimInsightInput): ClaimInsight {
  const { claim, rules, documents, events, openQueries, confirmedFieldKeys, labelFor, now } = input;

  const checklist = resolveChecklist(rules, {
    payerId: claim.payerId,
    procedureId: claim.procedureId,
    stage: claim.stage,
  });

  const openAsks = openQueries.flatMap((q) => q.asks);
  const gaps = computeGaps({
    items: checklist,
    documents,
    stageStartedAt: claim.stageStartedAt,
    openAsks,
  });

  const clocks = computeClocks(events, now);

  const milestones = buildMilestones(events, {
    stage: claim.stage,
    status: claim.status,
  });

  const unconfirmedRequiredFields = PREAUTH_FIELD_KEYS.filter((k) => !confirmedFieldKeys.includes(k)).length;

  const attention = collectAttention({
    claim,
    gaps,
    clocks,
    openQueries,
    unconfirmedRequiredFields,
    labelFor,
    now,
    doctorApproval: input.doctorApproval,
  });

  const urgency = urgencyScore(attention);

  return {
    checklist,
    gaps,
    clocks,
    milestones,
    attention,
    urgency,
  };
}
