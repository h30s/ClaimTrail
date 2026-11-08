import { describe, expect, it } from "vitest";
import type { GapDocument } from "@/features/checklist/domain/compute-gaps";
import type { RuleInput } from "@/features/checklist/domain/resolve-checklist";
import { PREAUTH_FIELD_KEYS } from "@/features/preauth/domain/preauth-fields";
import { buildClaimInsight } from "./claim-insight";

describe("buildClaimInsight", () => {
  const now = new Date("2026-11-08T14:00:00Z");
  const stageStartedAt = new Date("2026-11-08T09:50:00Z"); // 4h 10m ago
  const submittedAt = new Date("2026-11-08T10:30:00Z"); // 3h 30m ago
  const queryAt = new Date("2026-11-08T11:40:00Z"); // 2h 20m ago
  const queryDueAt = new Date("2026-11-08T17:40:00Z"); // +6h from queryAt -> ~3h 40m left

  const rules: RuleInput[] = [
    {
      id: "r1",
      payerId: null,
      procedureId: null,
      stage: "PRE_AUTH",
      documentTypeId: "form",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r2",
      payerId: null,
      procedureId: null,
      stage: "PRE_AUTH",
      documentTypeId: "card",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r3",
      payerId: null,
      procedureId: null,
      stage: "PRE_AUTH",
      documentTypeId: "id",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r4",
      payerId: null,
      procedureId: null,
      stage: "PRE_AUTH",
      documentTypeId: "notes",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r5",
      payerId: null,
      procedureId: null,
      stage: "PRE_AUTH",
      documentTypeId: "estimate",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r6",
      payerId: null,
      procedureId: "proc_gb",
      stage: "PRE_AUTH",
      documentTypeId: "usg",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
    {
      id: "r7",
      payerId: "payer_b",
      procedureId: "proc_gb",
      stage: "PRE_AUTH",
      documentTypeId: "cbc",
      requirement: "REQUIRED",
      needsFreshCopy: false,
    },
  ];

  const documents: GapDocument[] = [
    {
      id: "d1",
      documentTypeId: "form",
      status: "SORTED",
      identityCheck: "MATCH",
      uploadedAt: stageStartedAt,
    },
    {
      id: "d2",
      documentTypeId: "card",
      status: "SORTED",
      identityCheck: "MATCH",
      uploadedAt: stageStartedAt,
    },
    { id: "d3", documentTypeId: "id", status: "SORTED", identityCheck: "MATCH", uploadedAt: stageStartedAt },
    {
      id: "d4",
      documentTypeId: "notes",
      status: "SORTED",
      identityCheck: "MATCH",
      uploadedAt: stageStartedAt,
    },
    {
      id: "d5",
      documentTypeId: "estimate",
      status: "SORTED",
      identityCheck: "MATCH",
      uploadedAt: stageStartedAt,
    },
    { id: "d6", documentTypeId: "cbc", status: "SORTED", identityCheck: "MATCH", uploadedAt: stageStartedAt },
    // usg is missing!
  ];

  const events = [
    { type: "CREATED" as const, stage: "PRE_AUTH" as const, status: "DRAFT" as const, at: stageStartedAt },
    { type: "SUBMITTED" as const, stage: "PRE_AUTH" as const, status: "SENT" as const, at: submittedAt },
    { type: "QUERY_RAISED" as const, stage: "PRE_AUTH" as const, status: "QUERY" as const, at: queryAt },
  ];

  const openQueries = [
    {
      id: "q1",
      dueAt: queryDueAt,
      asks: [
        { id: "a1", queryId: "q1", text: "USG abdomen report", documentTypeId: "usg", receivedAt: queryAt },
        { id: "a2", queryId: "q1", text: "Confirm duration", documentTypeId: null, receivedAt: queryAt },
      ],
    },
  ];

  const labelFor = (id: string) => {
    const map: Record<string, string> = {
      form: "Pre-auth request form",
      card: "Insurance card",
      id: "Photo ID",
      notes: "Doctor's notes",
      estimate: "Cost estimate",
      usg: "Ultrasound report",
      cbc: "CBC report",
    };
    return map[id] ?? id;
  };

  it("builds correct insight for CLM-3381 scenario", () => {
    const insight = buildClaimInsight({
      claim: {
        stage: "PRE_AUTH",
        status: "QUERY",
        payerId: "payer_b",
        procedureId: "proc_gb",
        stageStartedAt,
      },
      rules,
      documents,
      events,
      openQueries,
      confirmedFieldKeys: [...PREAUTH_FIELD_KEYS],
      labelFor,
      now,
    });

    expect(insight.checklist).toHaveLength(7);
    expect(insight.gaps.missingRequired).toBe(1);
    expect(insight.gaps.slots.find((s) => s.item.documentTypeId === "usg")?.state).toBe("MISSING");

    expect(insight.milestones.find((m) => m.key === "PRE_AUTH")?.state).toBe("done");
    expect(insight.milestones.find((m) => m.key === "QUERY")?.state).toBe("current");

    const missingDoc = insight.attention.find((a) => a.kind === "MISSING_DOC");
    expect(missingDoc?.label).toBe("Ultrasound report missing");

    const queryOpen = insight.attention.find((a) => a.kind === "QUERY_OPEN");
    expect(queryOpen).toBeDefined();

    expect(insight.urgency).toBeGreaterThan(0);
  });
});
