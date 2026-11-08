import { describe, expect, it } from "vitest";
import { buildMilestones } from "./milestones";

describe("buildMilestones", () => {
  const t0 = new Date("2026-11-08T08:00:00Z");
  const t1 = new Date("2026-11-08T09:00:00Z");
  const t2 = new Date("2026-11-08T10:00:00Z");
  const t3 = new Date("2026-11-08T11:00:00Z");

  it("handles fresh draft with no events", () => {
    const milestones = buildMilestones([], { stage: "PRE_AUTH", status: "DRAFT" });
    expect(milestones.map((m) => ({ key: m.key, state: m.state }))).toEqual([
      { key: "PRE_AUTH", state: "current" },
      { key: "APPROVED", state: "upcoming" },
      { key: "FINAL_BILL", state: "upcoming" },
      { key: "SETTLED", state: "upcoming" },
    ]);
  });

  it("shows query milestone when query was raised", () => {
    const events = [
      { type: "SUBMITTED" as const, stage: "PRE_AUTH" as const, at: t0 },
      { type: "QUERY_RAISED" as const, stage: "PRE_AUTH" as const, at: t1 },
    ];
    const milestones = buildMilestones(events, { stage: "PRE_AUTH", status: "QUERY" });
    expect(milestones.map((m) => ({ key: m.key, state: m.state }))).toEqual([
      { key: "PRE_AUTH", state: "done" },
      { key: "QUERY", state: "current" },
      { key: "APPROVED", state: "upcoming" },
      { key: "FINAL_BILL", state: "upcoming" },
      { key: "SETTLED", state: "upcoming" },
    ]);
  });

  it("shows enhancement milestone when enhancement stage was entered", () => {
    const events = [
      { type: "SUBMITTED" as const, stage: "PRE_AUTH" as const, at: t0 },
      { type: "APPROVED" as const, stage: "PRE_AUTH" as const, at: t1 },
      { type: "STAGE_STARTED" as const, stage: "ENHANCEMENT" as const, at: t2 },
    ];
    const milestones = buildMilestones(events, { stage: "ENHANCEMENT", status: "DRAFT" });
    expect(milestones.map((m) => ({ key: m.key, state: m.state }))).toEqual([
      { key: "PRE_AUTH", state: "done" },
      { key: "APPROVED", state: "done" },
      { key: "ENHANCEMENT", state: "current" },
      { key: "FINAL_BILL", state: "upcoming" },
      { key: "SETTLED", state: "upcoming" },
    ]);
  });

  it("marks all done for settled claim", () => {
    const events = [
      { type: "SUBMITTED" as const, stage: "PRE_AUTH" as const, at: t0 },
      { type: "APPROVED" as const, stage: "PRE_AUTH" as const, at: t1 },
      { type: "SUBMITTED" as const, stage: "DISCHARGE" as const, at: t2 },
      { type: "SETTLED" as const, stage: "DISCHARGE" as const, at: t3 },
    ];
    const milestones = buildMilestones(events, { stage: "DISCHARGE", status: "SETTLED" });
    expect(milestones.every((m) => m.state === "done")).toBe(true);
  });

  it("marks current step as failed when claim is rejected", () => {
    const events = [{ type: "SUBMITTED" as const, stage: "PRE_AUTH" as const, at: t0 }];
    const milestones = buildMilestones(events, { stage: "PRE_AUTH", status: "REJECTED" });
    const approvedStep = milestones.find((m) => m.key === "APPROVED");
    expect(approvedStep?.state).toBe("failed");
  });
});
