import { describe, expect, it } from "vitest";
import type { DocumentStatus, IdentityCheck } from "@/lib/enums";
import { computeGaps, type AskInput, type GapDocument } from "./compute-gaps";
import type { ChecklistItem } from "./resolve-checklist";

const stageStartedAt = new Date("2026-11-07T10:00:00.000Z");
const docBefore = new Date("2026-11-07T09:00:00.000Z");
const docAfter = new Date("2026-11-07T11:00:00.000Z");

const reqItem: ChecklistItem = {
  documentTypeId: "form",
  requirement: "REQUIRED",
  needsFreshCopy: false,
  source: { ruleId: "r1", scope: "ALL" },
};

function doc(
  id: string,
  type: string | null,
  opt: { status?: DocumentStatus; check?: IdentityCheck; at?: Date } = {},
): GapDocument {
  return {
    id,
    documentTypeId: type,
    status: opt.status ?? "SORTED",
    identityCheck: opt.check ?? "MATCH",
    uploadedAt: opt.at ?? docAfter,
  };
}

describe("computeGaps", () => {
  it("marks slot MISSING when no document exists", () => {
    const report = computeGaps({ items: [reqItem], documents: [], stageStartedAt, openAsks: [] });
    expect(report.slots[0]?.state).toBe("MISSING");
    expect(report.missingRequired).toBe(1);
    expect(report.isReady).toBe(false);
  });

  it("marks slot SATISFIED when a sorted matching document exists", () => {
    const report = computeGaps({
      items: [reqItem],
      documents: [doc("d1", "form", { at: docBefore })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("SATISFIED");
    expect(report.isReady).toBe(true);
  });

  it("allows isReady to be true when an OPTIONAL document is missing", () => {
    const optItem: ChecklistItem = { ...reqItem, documentTypeId: "cbc", requirement: "OPTIONAL" };
    const report = computeGaps({ items: [optItem], documents: [], stageStartedAt, openAsks: [] });
    expect(report.slots[0]?.state).toBe("MISSING");
    expect(report.missingRequired).toBe(0);
    expect(report.isReady).toBe(true);
  });

  it("marks slot STALE when fresh-copy is required but document is older (CLM-3385)", () => {
    const freshItem: ChecklistItem = { ...reqItem, documentTypeId: "cbc", needsFreshCopy: true };
    const report = computeGaps({
      items: [freshItem],
      documents: [doc("d1", "cbc", { at: docBefore })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("STALE");
    expect(report.staleRequired).toBe(1);
    expect(report.isReady).toBe(false);
  });

  it("marks fresh-copy slot SATISFIED when document is uploaded after stage start", () => {
    const freshItem: ChecklistItem = { ...reqItem, documentTypeId: "cbc", needsFreshCopy: true };
    const report = computeGaps({
      items: [freshItem],
      documents: [doc("d1", "cbc", { at: docAfter })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("SATISFIED");
    expect(report.staleRequired).toBe(0);
    expect(report.isReady).toBe(true);
  });

  it("marks slot NEEDS_CHECK when only a MISMATCH document is present", () => {
    const report = computeGaps({
      items: [reqItem],
      documents: [doc("d1", "form", { check: "MISMATCH" })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("NEEDS_CHECK");
    expect(report.needsCheck).toBe(1);
    expect(report.isReady).toBe(false);
  });

  it("treats CONFIRMED identity check document as usable", () => {
    const report = computeGaps({
      items: [reqItem],
      documents: [doc("d1", "form", { check: "CONFIRMED" })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("SATISFIED");
    expect(report.isReady).toBe(true);
  });

  it("counts PROCESSING / NEEDS_REVIEW documents as unsorted and does not satisfy slot", () => {
    const report = computeGaps({
      items: [reqItem],
      documents: [doc("d1", "form", { status: "PROCESSING" })],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.slots[0]?.state).toBe("MISSING");
    expect(report.unsortedCount).toBe(1);
    expect(report.isReady).toBe(false);
  });

  it("satisfies a query ask only with a document uploaded after receivedAt", () => {
    const ask: AskInput = {
      id: "a1",
      queryId: "q1",
      text: "X-ray",
      documentTypeId: "xray",
      receivedAt: new Date("2026-11-07T10:30:00.000Z"),
    };
    const oldReport = computeGaps({
      items: [],
      documents: [doc("d1", "xray", { at: docBefore })],
      stageStartedAt,
      openAsks: [ask],
    });
    expect(oldReport.asks[0]?.state).toBe("MISSING");
    expect(oldReport.isReady).toBe(false);

    const freshReport = computeGaps({
      items: [],
      documents: [doc("d2", "xray", { at: docAfter })],
      stageStartedAt,
      openAsks: [ask],
    });
    expect(freshReport.asks[0]?.state).toBe("SATISFIED");
    expect(freshReport.isReady).toBe(true);
  });

  it("marks unmapped query ask as ANSWER_IN_REPLY without blocking isReady", () => {
    const ask: AskInput = {
      id: "a2",
      queryId: "q2",
      text: "Reason",
      documentTypeId: null,
      receivedAt: docBefore,
    };
    const report = computeGaps({ items: [], documents: [], stageStartedAt, openAsks: [ask] });
    expect(report.asks[0]?.state).toBe("ANSWER_IN_REPLY");
    expect(report.isReady).toBe(true);
  });

  it("places sorted documents outside checklist into otherDocuments", () => {
    const report = computeGaps({
      items: [reqItem],
      documents: [doc("d-other", "extra")],
      stageStartedAt,
      openAsks: [],
    });
    expect(report.otherDocuments).toHaveLength(1);
  });
});
