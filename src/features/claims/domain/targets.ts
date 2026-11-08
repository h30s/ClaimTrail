// targets.ts — time targets the brief names or implies.
const MIN = 60_000;
const HOUR = 60 * MIN;

/** IRDAI: cashless decisions in 1 h, discharge in 3 h (A14). */
export const PAYER_DECISION_TARGET_MS = {
  PRE_AUTH: HOUR,
  ENHANCEMENT: HOUR,
  DISCHARGE: 3 * HOUR,
} as const;

/** Hospital's own preparation targets so the total can beat 2.5 h (A15). */
export const HOSPITAL_PREP_TARGET_MS = {
  PRE_AUTH: HOUR,
  ENHANCEMENT: HOUR,
  DISCHARGE: HOUR,
} as const;

/** Brief success metric: discharge approval wait under 2.5 h. */
export const DISCHARGE_TOTAL_TARGET_MS = 2.5 * HOUR;

/** Query countdown turns amber this long before the deadline. */
export const QUERY_DUE_SOON_MS = 2 * HOUR;
