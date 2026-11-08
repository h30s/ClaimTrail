"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/action";
import {
  ConfirmIdentitySchema,
  MoveDocumentSchema,
  RemoveDocumentSchema,
  RerunAnalysisSchema,
} from "../schemas";
import { moveDocument as moveDocumentOp } from "./move-document";
import { removeDocument as removeDocumentOp } from "./remove-document";
import { confirmIdentity as confirmIdentityOp } from "./confirm-identity";
import { analyseAndFile as analyseAndFileOp } from "./analyse-and-file";
import { assertClaimAccess } from "@/features/claims/server/claim-scope";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const moveDocument = defineAction(
  { schema: MoveDocumentSchema, permission: "claim:work" },
  async (input, { user }) => {
    const res = await moveDocumentOp(user, {
      documentId: input.documentId,
      documentTypeKey: input.documentTypeKey,
    });
    revalidatePath(`/claims/${input.claimCode}`);
    return res;
  },
);

export const removeDocument = defineAction(
  { schema: RemoveDocumentSchema, permission: "claim:work" },
  async (input, { user }) => {
    const res = await removeDocumentOp(user, input.documentId);
    revalidatePath(`/claims/${input.claimCode}`);
    return res;
  },
);

export const confirmIdentity = defineAction(
  { schema: ConfirmIdentitySchema, permission: "claim:work" },
  async (input, { user }) => {
    const res = await confirmIdentityOp(user, input.documentId);
    revalidatePath(`/claims/${input.claimCode}`);
    return res;
  },
);

export const rerunAnalysis = defineAction(
  { schema: RerunAnalysisSchema, permission: "claim:work" },
  async (input, { user }) => {
    const doc = await db.document.findUnique({
      where: { id: input.documentId, deletedAt: null },
      select: { claimId: true },
    });
    if (!doc) throw new NotFoundError("Document not found.");

    await assertClaimAccess(user, doc.claimId);
    const res = await analyseAndFileOp(input.documentId, user.id);
    revalidatePath(`/claims/${input.claimCode}`);
    return res;
  },
);
