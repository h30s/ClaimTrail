import { describe, expect, it } from "vitest";
import type { ClaimStatus, Stage } from "@/lib/enums";
import {
  applyClaimEvent,
  availableEvents,
  canApply,
  InvalidTransitionError,
  type ClaimEventName,
  type ClaimState,
} from "./status-machine";

describe("status-machine", () => {
  const stages: Stage[] = ["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"];
  const statuses: ClaimStatus[] = ["DRAFT", "SENT", "QUERY", "APPROVED", "REJECTED", "SETTLED"];

  const expectedEventsFor = (stage: Stage, status: ClaimStatus): ClaimEventName[] => {
    if (status === "DRAFT") return ["SUBMIT"];
    if (status === "SENT") return ["RAISE_QUERY", "APPROVE", "REJECT"];
    if (status === "QUERY") return ["ANSWER_QUERY"];
    if (status === "APPROVED") {
      if (stage === "DISCHARGE") return ["SETTLE"];
      return ["START_ENHANCEMENT", "START_DISCHARGE"];
    }
    return [];
  };

  it("permits exactly the expected events across all 18 stage x status combinations", () => {
    for (const stage of stages) {
      for (const status of statuses) {
        const state: ClaimState = { stage, status };
        const allowed = availableEvents(state);
        const expected = expectedEventsFor(stage, status);
        expect(allowed.sort()).toEqual(expected.sort());
      }
    }
  });

  it("applies forward transitions correctly", () => {
    const draft: ClaimState = { stage: "PRE_AUTH", status: "DRAFT" };
    const sent = applyClaimEvent(draft, "SUBMIT");
    expect(sent.state).toEqual({ stage: "PRE_AUTH", status: "SENT" });
    expect(sent.recordAs).toBe("SUBMITTED");

    const query = applyClaimEvent(sent.state, "RAISE_QUERY");
    expect(query.state).toEqual({ stage: "PRE_AUTH", status: "QUERY" });
    expect(query.recordAs).toBe("QUERY_RAISED");

    const sentAgain = applyClaimEvent(query.state, "ANSWER_QUERY");
    expect(sentAgain.state).toEqual({ stage: "PRE_AUTH", status: "SENT" });
    expect(sentAgain.recordAs).toBe("QUERY_ANSWERED");

    const approved = applyClaimEvent(sentAgain.state, "APPROVE");
    expect(approved.state).toEqual({ stage: "PRE_AUTH", status: "APPROVED" });
    expect(approved.recordAs).toBe("APPROVED");

    const enh = applyClaimEvent(approved.state, "START_ENHANCEMENT");
    expect(enh.state).toEqual({ stage: "ENHANCEMENT", status: "DRAFT" });
    expect(enh.recordAs).toBe("STAGE_STARTED");
  });

  it("prevents enhancement and discharge transition rules from being violated", () => {
    const dischargeApproved: ClaimState = { stage: "DISCHARGE", status: "APPROVED" };
    expect(canApply(dischargeApproved, "START_ENHANCEMENT")).toBe(false);
    expect(canApply(dischargeApproved, "START_DISCHARGE")).toBe(false);
    expect(canApply(dischargeApproved, "SETTLE")).toBe(true);

    const settled = applyClaimEvent(dischargeApproved, "SETTLE");
    expect(settled.state).toEqual({ stage: "DISCHARGE", status: "SETTLED" });
    expect(settled.recordAs).toBe("SETTLED");
  });

  it("throws InvalidTransitionError on illegal events", () => {
    const draft: ClaimState = { stage: "PRE_AUTH", status: "DRAFT" };
    expect(() => applyClaimEvent(draft, "APPROVE")).toThrow(InvalidTransitionError);
  });
});
