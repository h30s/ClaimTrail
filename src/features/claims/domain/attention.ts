// attention.ts — what needs a human now on a claim, most severe first.
import type { ClaimStatus, Stage } from "@/lib/enums";
import { formatDuration } from "@/lib/format";
import type { GapReport } from "@/features/checklist/domain/compute-gaps";
import { getCountdown } from "@/features/tpa-queries/domain/countdown";
import type { ClockReport } from "./clocks";
import { HOSPITAL_PREP_TARGET_MS, PAYER_DECISION_TARGET_MS } from "./targets";
import type { AttentionItem, Severity } from "./urgency";

export type AttentionInput = {
  claim: { stage: Stage; status: ClaimStatus };
  gaps: GapReport;
  clocks: ClockReport;
  openQueries: Array<{ id: string; dueAt: Date }>;
  unconfirmedRequiredFields: number;
  labelFor: (documentTypeId: string) => string;
  now: Date;
  doctorApproval?: {
    status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
    comment?: string | null;
  } | null;
};

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function collectAttention(input: AttentionInput): AttentionItem[] {
  const { claim, gaps, clocks, openQueries, unconfirmedRequiredFields, labelFor, now, doctorApproval } =
    input;
  const items: AttentionItem[] = [];

  // 1, 3, 10: Query countdowns
  for (const q of openQueries) {
    const cd = getCountdown({ now, dueAt: q.dueAt, repliedAt: null });
    if (cd.state === "OVERDUE") {
      items.push({
        kind: "QUERY_OVERDUE",
        severity: "critical",
        label: `Query overdue by ${formatDuration(Math.abs(cd.msLeft))}`,
        count: 1,
        anchor: "#queries",
      });
    } else if (cd.state === "DUE_SOON") {
      items.push({
        kind: "QUERY_DUE_SOON",
        severity: "warning",
        label: `Query due in ${formatDuration(cd.msLeft)}`,
        count: 1,
        anchor: "#queries",
      });
    } else if (cd.state === "ON_TRACK") {
      items.push({
        kind: "QUERY_OPEN",
        severity: "info",
        label: `Query due in ${formatDuration(cd.msLeft)}`,
        count: 1,
        anchor: "#queries",
      });
    }
  }

  // 2. Identity Check
  if (gaps.needsCheck > 0) {
    items.push({
      kind: "IDENTITY_CHECK",
      severity: "critical",
      label: `Name on ${gaps.needsCheck} document${gaps.needsCheck > 1 ? "s" : ""} doesn't match the patient`,
      count: gaps.needsCheck,
      anchor: "#checklist",
    });
  }

  // 4. Hospital Clock
  const current = clocks.current;
  if (current?.holder === "HOSPITAL") {
    const target = HOSPITAL_PREP_TARGET_MS[claim.stage];
    if (current.sinceMs > target) {
      items.push({
        kind: "HOSPITAL_CLOCK",
        severity: "warning",
        label: `With us ${formatDuration(current.sinceMs)} (target ${Math.round(target / 3_600_000)}h)`,
        count: 1,
        anchor: "#timeline",
      });
    }
  }

  // 5. Missing Doc
  if (gaps.missingRequired > 0) {
    const severity: Severity = claim.status === "DRAFT" || claim.status === "QUERY" ? "warning" : "info";
    const missingSlot = gaps.slots.find((s) => s.item.requirement === "REQUIRED" && s.state === "MISSING");
    const label =
      gaps.missingRequired === 1 && missingSlot
        ? `${labelFor(missingSlot.item.documentTypeId)} missing`
        : `${gaps.missingRequired} required documents missing`;
    items.push({
      kind: "MISSING_DOC",
      severity,
      label,
      count: gaps.missingRequired,
      anchor: "#checklist",
    });
  }

  // 6. Stale Doc
  if (gaps.staleRequired > 0) {
    const staleSlot = gaps.slots.find((s) => s.item.requirement === "REQUIRED" && s.state === "STALE");
    const label =
      gaps.staleRequired === 1 && staleSlot
        ? `${labelFor(staleSlot.item.documentTypeId)}: latest copy needed`
        : `${gaps.staleRequired} documents need fresh copies`;
    items.push({
      kind: "STALE_DOC",
      severity: "warning",
      label,
      count: gaps.staleRequired,
      anchor: "#checklist",
    });
  }

  // 7. Unsorted
  if (gaps.unsortedCount > 0) {
    items.push({
      kind: "UNSORTED",
      severity: "warning",
      label: `${gaps.unsortedCount} upload${gaps.unsortedCount > 1 ? "s need" : " needs"} sorting`,
      count: gaps.unsortedCount,
      anchor: "#tray",
    });
  }

  // 8. Fields to confirm
  if (claim.stage === "PRE_AUTH" && claim.status === "DRAFT" && unconfirmedRequiredFields > 0) {
    items.push({
      kind: "FIELDS_TO_CONFIRM",
      severity: "info",
      label: `${unconfirmedRequiredFields} pre-auth fields to confirm`,
      count: unconfirmedRequiredFields,
      anchor: "/preauth",
    });
  }

  // 8b. Doctor sign-off
  if (doctorApproval?.status === "CHANGES_REQUESTED") {
    items.push({
      kind: "CHANGES_REQUESTED",
      severity: "warning",
      label: doctorApproval.comment
        ? `Doctor requested changes: "${doctorApproval.comment}"`
        : "Doctor requested changes to clinical notes",
      count: 1,
      anchor: "/preauth",
    });
  } else if (doctorApproval?.status === "PENDING") {
    items.push({
      kind: "DOCTOR_SIGNOFF_PENDING",
      severity: "info",
      label: "Doctor sign-off pending on WhatsApp link",
      count: 1,
      anchor: "/preauth",
    });
  }

  // 9. Payer Clock
  if (current?.holder === "PAYER") {
    const target = PAYER_DECISION_TARGET_MS[claim.stage];
    if (current.sinceMs > target) {
      items.push({
        kind: "PAYER_CLOCK",
        severity: "warning",
        label: `With insurer ${formatDuration(current.sinceMs)} · past IRDAI ${Math.round(target / 3_600_000)}h`,
        count: 1,
        anchor: "#timeline",
      });
    }
  }

  return items.sort((a, b) => {
    const sDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sDiff !== 0) return sDiff;
    return 0;
  });
}
