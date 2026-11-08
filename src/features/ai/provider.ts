import type { DocumentAnalysis, QuerySummary } from "./schemas";

export type DocumentTypeHint = {
  key: string;
  label: string;
  description: string;
};

export type AiMeta = {
  model: string;
  promptVersion: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
};

export type AiFailure = "REFUSED" | "INVALID_OUTPUT" | "ERROR";

export type AiResult<T> =
  { ok: true; data: T; meta: AiMeta } | { ok: false; reason: AiFailure; message: string; meta: AiMeta };

export type AnalyseDocumentInput = {
  bytes: Uint8Array;
  mimeType: string;
  fileName: string;
  documentTypes: DocumentTypeHint[];
};

export type SummariseQueryInput = {
  subject: string;
  body: string;
  receivedAt: Date;
  documentTypes: DocumentTypeHint[];
};

export type AiProvider = {
  analyseDocument(input: AnalyseDocumentInput): Promise<AiResult<DocumentAnalysis>>;
  summariseQuery(input: SummariseQueryInput): Promise<AiResult<QuerySummary>>;
};
