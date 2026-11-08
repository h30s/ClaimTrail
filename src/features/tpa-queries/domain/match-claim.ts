// features/tpa-queries/domain/match-claim.ts
// Links a query email to a claim. Claim code or payer reference → exact link.
// Patient name within the same payer → suggestion only; two claims can share a name.
import { compareNames } from "@/features/documents/domain/name-match";

export type MatchCandidate = {
  id: string;
  code: string;
  payerReference: string | null;
  patientName: string;
  payerId: string;
};

export type MatchResult =
  | { kind: "EXACT"; claimId: string; via: "CLAIM_CODE" | "PAYER_REFERENCE" }
  | { kind: "SUGGESTED"; claimId: string }
  | { kind: "NONE" };

const CLAIM_CODE_PATTERN = /\bCLM[-\s]?(\d{4,})\b/i;
const normalise = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Deterministic backup for when the model misses a code that is plainly in the text. */
export function findClaimCode(text: string): string | null {
  const m = CLAIM_CODE_PATTERN.exec(text);
  return m && m[1] ? `CLM-${m[1]}` : null;
}

export function matchQueryToClaim(
  extracted: { claimRef: string | null; patientName: string | null; payerId: string | null },
  candidates: MatchCandidate[],
): MatchResult {
  if (extracted.claimRef) {
    const ref = normalise(extracted.claimRef);
    const byCode = candidates.find((c) => normalise(c.code) === ref);
    if (byCode) return { kind: "EXACT", claimId: byCode.id, via: "CLAIM_CODE" };

    const byRef = candidates.find((c) => c.payerReference && normalise(c.payerReference) === ref);
    if (byRef) return { kind: "EXACT", claimId: byRef.id, via: "PAYER_REFERENCE" };
  }

  if (extracted.patientName) {
    const pool = candidates.filter((c) => !extracted.payerId || c.payerId === extracted.payerId);
    const hits = pool.filter((c) => compareNames(c.patientName, extracted.patientName) === "MATCH");
    if (hits.length === 1 && hits[0]) return { kind: "SUGGESTED", claimId: hits[0].id };
  }

  return { kind: "NONE" };
}
