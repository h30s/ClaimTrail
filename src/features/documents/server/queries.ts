import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertClaimAccess, claimScopeWhere } from "@/features/claims/server/claim-scope";
import { toDocumentDto, type DocumentWithRelations } from "./to-dto";
import type { DocumentDto } from "../types";

export async function getDocumentForViewer(user: SessionUser, id: string) {
  const doc = await db.document.findFirst({
    where: { id, deletedAt: null },
    include: {
      claim: {
        select: {
          id: true,
          code: true,
          assigneeId: true,
          patient: { select: { id: true, name: true, uhid: true } },
        },
      },
      documentType: { select: { id: true, key: true, label: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  if (!doc) {
    throw new NotFoundError("Document not found.");
  }

  await assertClaimAccess(user, doc.claimId);
  return doc;
}

export async function listClaimDocuments(user: SessionUser, claimCode: string): Promise<DocumentDto[]> {
  const claim = await db.claim.findFirst({
    where: { code: claimCode, ...claimScopeWhere(user) },
    select: { id: true },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found.");
  }

  const docs = await db.document.findMany({
    where: { claimId: claim.id, deletedAt: null },
    include: {
      documentType: { select: { id: true, key: true, label: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return docs.map((d) => toDocumentDto(d as DocumentWithRelations));
}
