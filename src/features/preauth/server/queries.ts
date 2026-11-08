import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { buildFieldViews, fieldProgress, type FieldView } from "../domain/field-states";

export async function getPreauthForm(
  user: SessionUser,
  claimCode: string,
): Promise<{
  claim: {
    id: string;
    code: string;
    stage: string;
    status: string;
    patient: { id: string; name: string; uhid: string; gender: string; dateOfBirth: Date };
    payer: { id: string; name: string };
    procedure: { id: string; name: string };
    policyNumber: string;
    treatingDoctor: string;
    admittedAt: Date;
    estimatedAmount: number;
  };
  views: FieldView[];
  progress: { confirmed: number; total: number };
}> {
  const claim = await db.claim.findFirst({
    where: { code: claimCode, ...claimScopeWhere(user) },
    select: {
      id: true,
      code: true,
      stage: true,
      status: true,
      patient: {
        select: { id: true, name: true, uhid: true, gender: true, dateOfBirth: true },
      },
      payer: { select: { id: true, name: true } },
      procedure: { select: { id: true, name: true } },
      policyNumber: true,
      treatingDoctor: true,
      admittedAt: true,
      estimatedAmount: true,
    },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found.");
  }

  const [confirmed, suggestions] = await Promise.all([
    db.claimField.findMany({
      where: { claimId: claim.id },
      include: {
        confirmedBy: { select: { name: true } },
      },
    }),
    db.fieldSuggestion.findMany({
      where: {
        claimId: claim.id,
        dismissedAt: null,
        document: { deletedAt: null },
      },
      include: {
        document: {
          select: {
            fileName: true,
            documentType: { select: { label: true } },
          },
        },
      },
      orderBy: { confidence: "desc" },
    }),
  ]);

  const views = buildFieldViews(confirmed, suggestions);
  const progress = fieldProgress(views);

  return { claim, views, progress };
}
