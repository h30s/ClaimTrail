import type { Document, DocumentType, User } from "@/generated/prisma/client";
import type { DocumentAlternativeDto, DocumentDto } from "../types";

export type DocumentWithRelations = Document & {
  documentType?: Pick<DocumentType, "id" | "key" | "label"> | null;
  uploadedBy: Pick<User, "id" | "name">;
};

export function toDocumentDto(doc: DocumentWithRelations): DocumentDto {
  const alts = Array.isArray(doc.aiAlternatives) ? (doc.aiAlternatives as DocumentAlternativeDto[]) : null;

  return {
    id: doc.id,
    claimId: doc.claimId,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    pageCount: doc.pageCount,
    storageKey: doc.storageKey,
    documentTypeId: doc.documentTypeId,
    documentTypeKey: doc.documentType?.key ?? null,
    documentTypeLabel: doc.documentType?.label ?? null,
    status: doc.status,
    sortedBy: doc.sortedBy,
    ai: {
      typeKey: doc.aiDocumentTypeKey,
      confidence: doc.aiConfidence,
      reason: doc.aiReason,
      alternatives: alts,
      failed: doc.aiFailed,
    },
    patientNameOnDoc: doc.patientNameOnDoc,
    identityCheck: doc.identityCheck,
    documentDate: doc.documentDate ? doc.documentDate.toISOString().slice(0, 10) : null,
    uploadedAt: doc.uploadedAt.toISOString(),
    uploadedBy: {
      id: doc.uploadedBy.id,
      name: doc.uploadedBy.name,
    },
  };
}
