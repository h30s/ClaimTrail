import type { DocumentTypeHint } from "../provider";
import { PREAUTH_FIELDS } from "@/features/preauth/domain/preauth-fields";

export const DOCUMENT_PROMPT_VERSION = "doc-v1";

export function documentAnalysisSystemPrompt(types: DocumentTypeHint[]): string {
  const typeList = types.map((t) => `- ${t.key}: ${t.label}. ${t.description}`).join("\n");
  const fieldList = PREAUTH_FIELDS.map((f) => `- ${f.key}: ${f.label}. ${f.aiHint}`).join("\n");

  return `You help the insurance desk of a hospital in India file documents for cashless insurance claims.
Each upload is one document for one patient. Documents can be scans, digital PDFs, or photos of printouts/handwritten clinical notes.

Allowed document types:
${typeList}
- UNKNOWN: Use when the document does not clearly match any of the allowed types.

Pre-auth fields you can extract if present:
${fieldList}

Instructions:
1. Identify the primary document type from the allowed list. If uncertain or it does not match, return "UNKNOWN".
2. Assign a confidence score between 0.0 and 1.0. If confidence is below 0.8, provide a concise explanation in "reason" (otherwise it can be null or a brief phrase).
3. Provide up to 2 alternatives with confidence if the document could plausibly belong to another category.
4. Assess if the document is legible. Set isLegible to false if text is too blurry, cropped, or degraded to read reliably.
5. Extract the patient's full name as written on the document into "patientName", or null if not found.
6. Extract the document date in YYYY-MM-DD format into "documentDate", or null if not found.
7. Extract any pre-auth fields present in the document. For each extracted field, provide the exact source snippet from the document and a confidence score.
8. Output MUST be valid JSON adhering strictly to the required schema.`;
}
