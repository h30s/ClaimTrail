import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertClaimAccess } from "@/features/claims/server/claim-scope";
import { recordAudit } from "@/features/audit/server/record-audit";
import { toDocumentDto, type DocumentWithRelations } from "./to-dto";
import type { DocumentDto } from "../types";

export type MoveDocumentInput = {
  documentId: string;
  documentTypeKey: string | null;
};

export async function moveDocument(user: SessionUser, input: MoveDocumentInput): Promise<DocumentDto> {
  const doc = await db.document.findUnique({
    where: { id: input.documentId, deletedAt: null },
    include: {
      documentType: { select: { id: true, key: true, label: true } },
    },
  });

  if (!doc) {
    throw new NotFoundError("Document not found.");
  }

  await assertClaimAccess(user, doc.claimId);

  let targetTypeId: string | null = null;
  let targetTypeKey: string | null = null;

  if (input.documentTypeKey) {
    const docType = await db.documentType.findUnique({
      where: { key: input.documentTypeKey },
      select: { id: true, key: true },
    });
    if (!docType) {
      throw new NotFoundError("Document type not found.");
    }
    targetTypeId = docType.id;
    targetTypeKey = docType.key;
  }

  const fromKey = doc.documentType?.key ?? null;

  const updated = await db.$transaction(async (tx) => {
    const res = await tx.document.update({
      where: { id: doc.id },
      data: {
        documentTypeId: targetTypeId,
        status: targetTypeId ? "SORTED" : "NEEDS_REVIEW",
        sortedBy: "USER",
      },
      include: {
        documentType: { select: { id: true, key: true, label: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "DOCUMENT_MOVED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      claimId: doc.claimId,
      data: { fromKey, toKey: targetTypeKey },
    });

    return res;
  });

  return toDocumentDto(updated as DocumentWithRelations);
}
