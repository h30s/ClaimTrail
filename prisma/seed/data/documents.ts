import { BRIEF_DOCUMENT_SPECS } from "./documents-brief";
import { SUPPORTING_DOCUMENT_SPECS } from "./documents-supporting";

export type SeedDocDef = {
  claimCode: string;
  typeKey: string | null;
  fileName: string;
  title: string;
  patientNameOnDoc: string;
  identityCheck?: "MATCH" | "MISMATCH" | "CONFIRMED" | "UNCHECKED";
  status?: "SORTED" | "NEEDS_REVIEW";
  sortedBy?: "AI" | "USER";
  confidence?: number;
  reason?: string;
  minutesAgo: number;
  lines: string[];
  alternatives?: Array<{ documentType: string; confidence: number }>;
  failed?: boolean;
};

export const SEED_DOCUMENT_SPECS: SeedDocDef[] = [...BRIEF_DOCUMENT_SPECS, ...SUPPORTING_DOCUMENT_SPECS];
