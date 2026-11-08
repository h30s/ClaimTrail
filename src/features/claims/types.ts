import type {
  ApprovalStatus,
  ClaimEventType,
  ClaimStatus,
  DeductionReason,
  Gender,
  PayerKind,
  Stage,
} from "@/lib/enums";
import type { ClaimInsight } from "./domain/claim-insight";
import type { ClockReport } from "./domain/clocks";
import type { ClaimEventName } from "./domain/status-machine";
import type { AttentionItem } from "./domain/urgency";

export type WorklistTab = "action" | "open" | "sent" | "settled";

export type WorklistFilters = {
  tab: WorklistTab;
  q?: string;
  payerId?: string;
  assigneeId?: string;
};

export type WorklistRowDto = {
  id: string;
  code: string;
  patientName: string;
  uhid: string;
  payerName: string;
  payerKind: PayerKind;
  procedureName: string;
  stage: Stage;
  status: ClaimStatus;
  assigneeName: string | null;
  attention: AttentionItem[];
  urgency: number;
  currentClock: ClockReport["current"];
  nextDueAt: Date | null;
  statusChangedAt: Date;
};

export type ClaimTimelineEventDto = {
  id: string;
  type: ClaimEventType;
  stage: Stage;
  status: ClaimStatus;
  at: Date;
  actorName: string | null;
  note: string | null;
  overrideReason?: string | null;
};

export type ClaimFileDto = {
  claim: {
    id: string;
    code: string;
    policyNumber: string;
    payerReference: string | null;
    treatingDoctor: string;
    admittedAt: Date;
    estimatedAmount: number;
    approvedAmount: number | null;
    billedAmount: number | null;
    settledAmount: number | null;
    stage: Stage;
    status: ClaimStatus;
    stageStartedAt: Date;
    statusChangedAt: Date;
    createdAt: Date;
  };
  patient: {
    id: string;
    name: string;
    uhid: string;
    gender: Gender;
    dateOfBirth: Date;
  };
  payer: {
    id: string;
    name: string;
    kind: PayerKind;
    emailDomain: string;
    queryReplyHours: number;
  };
  procedure: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
  } | null;
  deductions?: Array<{
    id: string;
    reason: DeductionReason;
    amount: number;
    note: string | null;
  }>;
  doctorApproval?: {
    id: string;
    status: ApprovalStatus;
    comment: string | null;
    doctorName: string;
    expiresAt: Date;
  } | null;
  openQueries?: Array<{
    id: string;
    deadlineAt: Date;
    receivedAt: Date;
    summary: string | null;
    subject: string;
  }>;
  insight: ClaimInsight;
  availableEvents: ClaimEventName[];
  readyLine: string;
  recentEvents: ClaimTimelineEventDto[];
};
