// Claim lifecycle as stage × status (A5). This file is the only place that decides
// which moves are legal; services call applyClaimEvent and never set status directly (I1).
import type { ClaimEventType, ClaimStatus, Stage } from "@/lib/enums";

export type ClaimState = { stage: Stage; status: ClaimStatus };
export type ClaimEventName =
  | "SUBMIT"
  | "RAISE_QUERY"
  | "ANSWER_QUERY"
  | "APPROVE"
  | "REJECT"
  | "START_ENHANCEMENT"
  | "START_DISCHARGE"
  | "SETTLE";

type Transition = {
  allowed: (s: ClaimState) => boolean;
  next: (s: ClaimState) => ClaimState;
  recordAs: ClaimEventType;
};

const whenStatus = (status: ClaimStatus) => (s: ClaimState) => s.status === status;
const approvedBeforeDischarge = (s: ClaimState) => s.status === "APPROVED" && s.stage !== "DISCHARGE";

const TRANSITIONS: Record<ClaimEventName, Transition> = {
  SUBMIT: {
    allowed: whenStatus("DRAFT"),
    next: (s) => ({ ...s, status: "SENT" }),
    recordAs: "SUBMITTED",
  },
  RAISE_QUERY: {
    allowed: whenStatus("SENT"),
    next: (s) => ({ ...s, status: "QUERY" }),
    recordAs: "QUERY_RAISED",
  },
  ANSWER_QUERY: {
    allowed: whenStatus("QUERY"),
    next: (s) => ({ ...s, status: "SENT" }),
    recordAs: "QUERY_ANSWERED",
  },
  APPROVE: {
    allowed: whenStatus("SENT"),
    next: (s) => ({ ...s, status: "APPROVED" }),
    recordAs: "APPROVED",
  },
  REJECT: {
    allowed: whenStatus("SENT"),
    next: (s) => ({ ...s, status: "REJECTED" }),
    recordAs: "REJECTED",
  },
  START_ENHANCEMENT: {
    allowed: approvedBeforeDischarge,
    next: () => ({ stage: "ENHANCEMENT", status: "DRAFT" }),
    recordAs: "STAGE_STARTED",
  },
  START_DISCHARGE: {
    allowed: approvedBeforeDischarge,
    next: () => ({ stage: "DISCHARGE", status: "DRAFT" }),
    recordAs: "STAGE_STARTED",
  },
  SETTLE: {
    allowed: (s) => s.status === "APPROVED" && s.stage === "DISCHARGE",
    next: (s) => ({ ...s, status: "SETTLED" }),
    recordAs: "SETTLED",
  },
};

export class InvalidTransitionError extends Error {
  constructor(state: ClaimState, event: ClaimEventName) {
    super(`Cannot ${event} a claim that is ${state.stage} · ${state.status}`);
    this.name = "InvalidTransitionError";
  }
}

export function canApply(state: ClaimState, event: ClaimEventName): boolean {
  return TRANSITIONS[event].allowed(state);
}

export function applyClaimEvent(
  state: ClaimState,
  event: ClaimEventName,
): { state: ClaimState; recordAs: ClaimEventType } {
  const t = TRANSITIONS[event];
  if (!t.allowed(state)) throw new InvalidTransitionError(state, event);
  return { state: t.next(state), recordAs: t.recordAs };
}

export function availableEvents(state: ClaimState): ClaimEventName[] {
  return (Object.keys(TRANSITIONS) as ClaimEventName[]).filter((e) => canApply(state, e));
}
