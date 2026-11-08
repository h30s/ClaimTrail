import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertClaimAccess } from "@/features/claims/server/claim-scope";
import { recordAudit } from "@/features/audit/server/record-audit";
import { toDocumentDto, type DocumentWithRelations } from "./to-dto";
import type { DocumentDto } from "../types";

export async function confirmIdentity(user: SessionUser, documentId: string): Promise<DocumentDto> {
  const doc = await db.document.findUnique({
    where: { id: documentId, deletedAt: null },
    include: {
      documentType: { select: { id: true, key: true, label: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  if (!doc) {
    throw new NotFoundError("Document not found.");
  }

  await assertClaimAccess(user, doc.claimId);

  const updated = await db.$transaction(async (tx) => {
    const res = await tx.document.update({
      where: { id: doc.id },
      data: { identityCheck: "CONFIRMED" },
      include: {
        documentType: { select: { id: true, key: true, label: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "IDENTITY_CONFIRMED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      claimId: doc.claimId,
      data: { patientNameOnDoc: doc.patientNameOnDoc },
    });

    return res;
  });

  return toDocumentDto(updated as DocumentWithRelations);
}
