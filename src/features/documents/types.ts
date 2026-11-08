import type { DocumentStatus, IdentityCheck, SortedBy } from "@/lib/enums";

export type DocumentAlternativeDto = {
  documentType: string;
  confidence: number;
};

export type DocumentAiDto = {
  typeKey: string | null;
  confidence: number | null;
  reason: string | null;
  alternatives: DocumentAlternativeDto[] | null;
  failed: boolean;
};

export type DocumentDto = {
  id: string;
  claimId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number | null;
  storageKey: string;
  documentTypeId: string | null;
  documentTypeKey: string | null;
  documentTypeLabel: string | null;
  status: DocumentStatus;
  sortedBy: SortedBy | null;
  ai: DocumentAiDto;
  patientNameOnDoc: string | null;
  identityCheck: IdentityCheck;
  documentDate: string | null;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
};
