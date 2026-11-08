import { describe, expect, it } from "vitest";
import { decideSort } from "./sort-decision";

describe("decideSort", () => {
  const activeKeys = new Set(["PREAUTH_FORM", "POLICY_CARD", "ULTRASOUND_REPORT"]);

  it("sends failed analysis to REVIEW with AI_FAILED", () => {
    expect(decideSort(null, activeKeys)).toEqual({
      kind: "REVIEW",
      reason: "AI_FAILED",
    });
  });

  it("sends illegible document to REVIEW with ILLEGIBLE", () => {
    const res = decideSort(
      { documentType: "ULTRASOUND_REPORT", confidence: 0.95, isLegible: false },
      activeKeys,
    );
    expect(res).toEqual({ kind: "REVIEW", reason: "ILLEGIBLE" });
  });

  it("sends UNKNOWN type to REVIEW with UNKNOWN_TYPE", () => {
    const res = decideSort({ documentType: "UNKNOWN", confidence: 0.9, isLegible: true }, activeKeys);
    expect(res).toEqual({ kind: "REVIEW", reason: "UNKNOWN_TYPE" });
  });

  it("sends inactive type to REVIEW with UNKNOWN_TYPE", () => {
    const res = decideSort({ documentType: "OLD_DOC_TYPE", confidence: 0.9, isLegible: true }, activeKeys);
    expect(res).toEqual({ kind: "REVIEW", reason: "UNKNOWN_TYPE" });
  });

  it("sends confidence below 0.8 (e.g. 0.79) to REVIEW with LOW_CONFIDENCE", () => {
    const res = decideSort(
      { documentType: "ULTRASOUND_REPORT", confidence: 0.79, isLegible: true },
      activeKeys,
    );
    expect(res).toEqual({ kind: "REVIEW", reason: "LOW_CONFIDENCE" });
  });

  it("files automatically when confidence is at or above 0.8 (0.80)", () => {
    const res = decideSort(
      { documentType: "ULTRASOUND_REPORT", confidence: 0.8, isLegible: true },
      activeKeys,
    );
    expect(res).toEqual({ kind: "FILE", documentTypeKey: "ULTRASOUND_REPORT" });
  });
});
