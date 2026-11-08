// urgency.ts — one number per claim so the worklist can sort "most urgent first".
export type AttentionKind =
  | "QUERY_OVERDUE"
  | "IDENTITY_CHECK"
  | "QUERY_DUE_SOON"
  | "HOSPITAL_CLOCK"
  | "MISSING_DOC"
  | "STALE_DOC"
  | "UNSORTED"
  | "FIELDS_TO_CONFIRM"
  | "PAYER_CLOCK"
  | "QUERY_OPEN"
  | "DOCTOR_SIGNOFF_PENDING"
  | "CHANGES_REQUESTED";

export type Severity = "critical" | "warning" | "info";

export type AttentionItem = {
  kind: AttentionKind;
  severity: Severity;
  label: string;
  count: number;
  anchor: string;
};

const WEIGHT: Record<AttentionKind, number> = {
  QUERY_OVERDUE: 1000,
  IDENTITY_CHECK: 400,
  QUERY_DUE_SOON: 300,
  CHANGES_REQUESTED: 350,
  HOSPITAL_CLOCK: 250,
  MISSING_DOC: 100,
  STALE_DOC: 100,
  UNSORTED: 60,
  PAYER_CLOCK: 50,
  FIELDS_TO_CONFIRM: 40,
  DOCTOR_SIGNOFF_PENDING: 30,
  QUERY_OPEN: 20,
};

export function urgencyScore(items: AttentionItem[]): number {
  return items.reduce((sum, item) => sum + WEIGHT[item.kind] * Math.max(1, item.count), 0);
}
