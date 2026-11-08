import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { loadRules } from "@/features/checklist/server/load-rules";
import { resolveChecklist } from "@/features/checklist/domain/resolve-checklist";
import { computeGaps, type GapReport } from "@/features/checklist/domain/compute-gaps";
import { PREAUTH_FIELD_KEYS } from "@/features/preauth/domain/preauth-fields";
import type { ClaimStatus, Stage } from "@/lib/enums";
import { claimScopeWhere } from "./claim-scope";

export type SubmissionCheck = {
  claimId: string;
  claimCode: string;
  stage: Stage;
  status: ClaimStatus;
  payerName: string;
  canSubmit: boolean;
  canOverride: boolean;
  gaps: GapReport;
  blockingItems: string[];
  fields: { confirmed: number; total: number } | null;
  packet: {
    documentCount: number;
    pageCount: number;
    documentIds: string[];
  };
};

export async function getSubmissionCheck(user: SessionUser, claimCode: string): Promise<SubmissionCheck> {
  const claim = await db.claim.findFirst({
    where: { code: claimCode, ...claimScopeWhere(user) },
    include: {
      payer: { select: { id: true, name: true } },
      procedure: { select: { id: true, name: true } },
      documents: {
        where: { deletedAt: null },
        select: {
          id: true,
          documentTypeId: true,
          status: true,
          identityCheck: true,
          uploadedAt: true,
          pageCount: true,
        },
      },
      fields: {
        select: { fieldKey: true, confirmedAt: true },
      },
      queries: {
        where: { status: "OPEN" },
        select: {
          id: true,
          deadlineAt: true,
          receivedAt: true,
          asks: {
            select: {
              id: true,
              queryId: true,
              text: true,
              documentTypeId: true,
            },
          },
        },
      },
    },
  });

  if (!claim) throw new NotFoundError("Claim not found");

  const [rules, docTypes] = await Promise.all([loadRules(), listDocumentTypes()]);
  const docTypeMap = new Map(docTypes.map((dt) => [dt.id, dt.label]));
  const sortMap = new Map(docTypes.map((dt) => [dt.id, dt.sortOrder]));
  const labelFor = (id: string) => docTypeMap.get(id) ?? id;

  const checklist = resolveChecklist(rules, {
    payerId: claim.payerId,
    procedureId: claim.procedureId,
    stage: claim.stage,
  });

  const openAsks = claim.queries.flatMap((q) =>
    q.asks.map((a) => ({
      id: a.id,
      queryId: a.queryId,
      text: a.text,
      documentTypeId: a.documentTypeId,
      receivedAt: q.receivedAt,
    })),
  );

  const gaps = computeGaps({
    items: checklist,
    documents: claim.documents,
    stageStartedAt: claim.stageStartedAt,
    openAsks,
  });

  const blockingItems: string[] = [];

  for (const slot of gaps.slots) {
    if (slot.item.requirement !== "REQUIRED") continue;
    const label = labelFor(slot.item.documentTypeId);
    if (slot.state === "MISSING") {
      blockingItems.push(`${label} is missing`);
    } else if (slot.state === "STALE") {
      blockingItems.push(`${label} needs a fresh copy`);
    } else if (slot.state === "NEEDS_CHECK") {
      blockingItems.push(`${label} has a patient name mismatch`);
    }
  }

  if (gaps.unsortedCount > 0) {
    blockingItems.push(`${gaps.unsortedCount} upload(s) still in Needs Sorting tray`);
  }

  let fields: { confirmed: number; total: number } | null = null;
  if (claim.stage === "PRE_AUTH") {
    const confirmedKeys = claim.fields.filter((f) => f.confirmedAt !== null).map((f) => f.fieldKey);
    const unconfirmed = PREAUTH_FIELD_KEYS.filter((k) => !confirmedKeys.includes(k));
    fields = { confirmed: confirmedKeys.length, total: PREAUTH_FIELD_KEYS.length };
    if (unconfirmed.length > 0) {
      blockingItems.push(`${unconfirmed.length} pre-auth field(s) not confirmed`);
    }
  }

  const satisfiedSlots = gaps.slots
    .filter((s) => s.state === "SATISFIED")
    .sort(
      (a, b) => (sortMap.get(a.item.documentTypeId) ?? 999) - (sortMap.get(b.item.documentTypeId) ?? 999),
    );

  const packetDocs: typeof claim.documents = [];
  const seenDocIds = new Set<string>();

  for (const slot of satisfiedSlots) {
    const usableDocs = claim.documents
      .filter((d) => {
        if (d.documentTypeId !== slot.item.documentTypeId) return false;
        if (d.status !== "SORTED" || d.identityCheck === "MISMATCH") return false;
        if (slot.item.needsFreshCopy && d.uploadedAt < claim.stageStartedAt) return false;
        return true;
      })
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    const topDoc = usableDocs[0];
    if (topDoc && !seenDocIds.has(topDoc.id)) {
      seenDocIds.add(topDoc.id);
      packetDocs.push(topDoc);
    }
  }

  const pageCount = 1 + packetDocs.reduce((sum, d) => sum + (d.pageCount ?? 1), 0);
  const canOverride = can(user.role, "submission:override");
  const canSubmit = claim.status === "DRAFT" && (blockingItems.length === 0 || canOverride);

  return {
    claimId: claim.id,
    claimCode: claim.code,
    stage: claim.stage,
    status: claim.status,
    payerName: claim.payer.name,
    canSubmit,
    canOverride,
    gaps,
    blockingItems,
    fields,
    packet: {
      documentCount: packetDocs.length,
      pageCount,
      documentIds: packetDocs.map((d) => d.id),
    },
  };
}
