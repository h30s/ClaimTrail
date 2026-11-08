// Turns the event log into the brief's timeline: Pre-auth → (Query) → Approved →
// (Enhancement) → Final bill → Settled. Optional steps appear only once they happened.
import type { ClaimEventType, Stage } from "@/lib/enums";
import type { ClaimState } from "./status-machine";

export type MilestoneKey = "PRE_AUTH" | "QUERY" | "APPROVED" | "ENHANCEMENT" | "FINAL_BILL" | "SETTLED";

export type Milestone = {
  key: MilestoneKey;
  state: "done" | "current" | "upcoming" | "failed";
  at: Date | null;
};

type EventLike = { type: ClaimEventType; stage: Stage; at: Date };

const first = (events: EventLike[], type: ClaimEventType, stage?: Stage) =>
  events.find((e) => e.type === type && (!stage || e.stage === stage))?.at ?? null;

export function buildMilestones(events: EventLike[], state: ClaimState): Milestone[] {
  const hadQuery = events.some((e) => e.type === "QUERY_RAISED");
  const hadEnhancement = events.some((e) => e.stage === "ENHANCEMENT");

  const steps: Array<{ key: MilestoneKey; doneAt: Date | null; show: boolean }> = [
    { key: "PRE_AUTH", doneAt: first(events, "SUBMITTED", "PRE_AUTH"), show: true },
    { key: "QUERY", doneAt: first(events, "QUERY_ANSWERED"), show: hadQuery },
    { key: "APPROVED", doneAt: first(events, "APPROVED"), show: true },
    {
      key: "ENHANCEMENT",
      doneAt: first(events, "APPROVED", "ENHANCEMENT"),
      show: hadEnhancement,
    },
    { key: "FINAL_BILL", doneAt: first(events, "SUBMITTED", "DISCHARGE"), show: true },
    { key: "SETTLED", doneAt: first(events, "SETTLED"), show: true },
  ];

  let currentAssigned = false;
  return steps
    .filter((s) => s.show)
    .map(({ key, doneAt }): Milestone => {
      if (doneAt) return { key, state: "done", at: doneAt };
      if (currentAssigned) return { key, state: "upcoming", at: null };
      currentAssigned = true;
      return { key, state: state.status === "REJECTED" ? "failed" : "current", at: null };
    });
}
