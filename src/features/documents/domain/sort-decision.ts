export const AUTO_FILE_MIN_CONFIDENCE = 0.8;

export type ReviewReason = "LOW_CONFIDENCE" | "UNKNOWN_TYPE" | "ILLEGIBLE" | "AI_FAILED";
export type SortDecision =
  { kind: "FILE"; documentTypeKey: string } | { kind: "REVIEW"; reason: ReviewReason };

export type SortAnalysisInput = {
  documentType: string;
  confidence: number;
  isLegible: boolean;
};

export function decideSort(
  analysis: SortAnalysisInput | null,
  activeKeys: ReadonlySet<string>,
): SortDecision {
  if (!analysis) return { kind: "REVIEW", reason: "AI_FAILED" };
  if (!analysis.isLegible) return { kind: "REVIEW", reason: "ILLEGIBLE" };
  if (analysis.documentType === "UNKNOWN" || !activeKeys.has(analysis.documentType)) {
    return { kind: "REVIEW", reason: "UNKNOWN_TYPE" };
  }
  if (analysis.confidence < AUTO_FILE_MIN_CONFIDENCE) {
    return { kind: "REVIEW", reason: "LOW_CONFIDENCE" };
  }
  return { kind: "FILE", documentTypeKey: analysis.documentType };
}
