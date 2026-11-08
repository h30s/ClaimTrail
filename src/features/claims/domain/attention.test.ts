import { describe, expect, it } from "vitest";
import type { GapReport } from "@/features/checklist/domain/compute-gaps";
import { collectAttention } from "./attention";
import type { ClockReport } from "./clocks";
import { urgencyScore } from "./urgency";

describe("attention & urgency", () => {
  const now = new Date("2026-11-08T12:00:00.000Z");

  const baseGaps: GapReport = {
    slots: [],
    asks: [],
    otherDocuments: [],
    unsortedCount: 0,
    missingRequired: 0,
    staleRequired: 0,
    needsCheck: 0,
    isReady: true,
  };

  const baseClocks: ClockReport = {
    byStage: {},
    current: null,
  };

  const labelFor = (id: string) => (id === "usg" ? "Ultrasound report" : "CBC report");

  it("identifies QUERY_OVERDUE with critical severity", () => {
    const dueAt = new Date("2026-11-08T11:25:00.000Z"); // 35m overdue
    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "QUERY" },
      gaps: baseGaps,
      clocks: baseClocks,
      openQueries: [{ id: "q1", dueAt }],
      unconfirmedRequiredFields: 0,
      labelFor,
      now,
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.kind).toBe("QUERY_OVERDUE");
    expect(items[0]?.severity).toBe("critical");
    expect(items[0]?.label).toBe("Query overdue by 35m");
    expect(urgencyScore(items)).toBe(1000);
  });

  it("identifies IDENTITY_CHECK with critical severity", () => {
    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "DRAFT" },
      gaps: { ...baseGaps, needsCheck: 1 },
      clocks: baseClocks,
      openQueries: [],
      unconfirmedRequiredFields: 0,
      labelFor,
      now,
    });

    expect(items[0]?.kind).toBe("IDENTITY_CHECK");
    expect(items[0]?.severity).toBe("critical");
  });

  it("identifies HOSPITAL_CLOCK when hospital time exceeds prep target", () => {
    const clocks: ClockReport = {
      byStage: {},
      current: {
        holder: "HOSPITAL",
        stage: "PRE_AUTH",
        sinceMs: 85 * 60 * 1000, // 1h 25m vs 1h target
      },
    };
    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "DRAFT" },
      gaps: baseGaps,
      clocks,
      openQueries: [],
      unconfirmedRequiredFields: 0,
      labelFor,
      now,
    });

    const item = items.find((i) => i.kind === "HOSPITAL_CLOCK");
    expect(item).toBeDefined();
    expect(item?.severity).toBe("warning");
    expect(item?.label).toBe("With us 1h 25m (target 1h)");
  });

  it("identifies PAYER_CLOCK when payer time exceeds IRDAI target", () => {
    const clocks: ClockReport = {
      byStage: {},
      current: {
        holder: "PAYER",
        stage: "PRE_AUTH",
        sinceMs: 100 * 60 * 1000, // 1h 40m vs 1h target
      },
    };
    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "SENT" },
      gaps: baseGaps,
      clocks,
      openQueries: [],
      unconfirmedRequiredFields: 0,
      labelFor,
      now,
    });

    const item = items.find((i) => i.kind === "PAYER_CLOCK");
    expect(item).toBeDefined();
    expect(item?.severity).toBe("warning");
    expect(item?.label).toBe("With insurer 1h 40m · past IRDAI 1h");
  });

  it("formats single missing document with its label", () => {
    const gaps: GapReport = {
      ...baseGaps,
      missingRequired: 1,
      slots: [
        {
          item: {
            documentTypeId: "usg",
            requirement: "REQUIRED",
            needsFreshCopy: false,
            source: { ruleId: "r1", scope: "PROCEDURE" },
          },
          state: "MISSING",
          documents: [],
        },
      ],
    };

    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "DRAFT" },
      gaps,
      clocks: baseClocks,
      openQueries: [],
      unconfirmedRequiredFields: 0,
      labelFor,
      now,
    });

    const item = items.find((i) => i.kind === "MISSING_DOC");
    expect(item?.label).toBe("Ultrasound report missing");
  });

  it("sorts critical items before warnings and info items", () => {
    const dueAt = new Date("2026-11-08T11:25:00.000Z"); // overdue
    const items = collectAttention({
      claim: { stage: "PRE_AUTH", status: "DRAFT" },
      gaps: { ...baseGaps, unsortedCount: 2, needsCheck: 1 },
      clocks: baseClocks,
      openQueries: [{ id: "q1", dueAt }],
      unconfirmedRequiredFields: 3,
      labelFor,
      now,
    });

    expect(items[0]?.severity).toBe("critical");
    expect(items[1]?.severity).toBe("critical");
    expect(items[2]?.severity).toBe("warning");
    expect(items[3]?.severity).toBe("info");
  });
});
