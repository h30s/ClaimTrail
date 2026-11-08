import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ClaimStatus, Gender, Stage } from "@/lib/enums";
import { claimScopeWhere } from "@/features/claims/server/claim-scope";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { loadRules } from "@/features/checklist/server/load-rules";
import { resolveChecklist } from "@/features/checklist/domain/resolve-checklist";
import { PREAUTH_FIELDS, type PreauthFieldKey } from "@/features/preauth/domain/preauth-fields";

export type PacketSlotDocument = {
  id: string;
  label: string;
  documentTypeKey: string;
  fileName: string;
  mimeType: string;
  storageKey: string;
  uploadedAt: Date;
  pageCount: number | null;
};

export type PacketConfirmedField = {
  key: PreauthFieldKey;
  label: string;
  value: string;
};

export type PacketContents = {
  claim: {
    id: string;
    code: string;
    stage: Stage;
    status: ClaimStatus;
    policyNumber: string;
    payerReference: string | null;
    treatingDoctor: string;
    admittedAt: Date;
    estimatedAmount: number;
  };
  patient: {
    name: string;
    gender: Gender;
    dateOfBirth: Date;
    uhid: string;
  };
  payer: {
    name: string;
    kind: string;
  };
  procedure: {
    name: string;
  };
  user: {
    name: string;
  };
  stage: Stage;
  documents: PacketSlotDocument[];
  confirmedFields: PacketConfirmedField[];
  missingSlots: string[];
};

export async function getPacketContents(
  user: SessionUser,
  claimCode: string,
  stage?: Stage,
): Promise<PacketContents> {
  const claim = await db.claim.findFirst({
    where: { code: claimCode, ...claimScopeWhere(user) },
    include: {
      patient: true,
      payer: true,
      procedure: true,
      documents: {
        where: { deletedAt: null },
        include: { documentType: true },
      },
      fields: {
        select: { fieldKey: true, value: true },
      },
    },
  });

  if (!claim) throw new NotFoundError("Claim not found");

  const effectiveStage = stage ?? claim.stage;
  const [rules, docTypes] = await Promise.all([loadRules(), listDocumentTypes()]);
  const docTypeMap = new Map(docTypes.map((dt) => [dt.id, dt]));
  const sortMap = new Map(docTypes.map((dt) => [dt.id, dt.sortOrder]));

  const checklist = resolveChecklist(rules, {
    payerId: claim.payerId,
    procedureId: claim.procedureId,
    stage: effectiveStage,
  });

  const sortedChecklist = [...checklist].sort(
    (a, b) => (sortMap.get(a.documentTypeId) ?? 999) - (sortMap.get(b.documentTypeId) ?? 999),
  );

  const documents: PacketSlotDocument[] = [];
  const missingSlots: string[] = [];
  const seenDocIds = new Set<string>();

  for (const item of sortedChecklist) {
    const dt = docTypeMap.get(item.documentTypeId);
    const label = dt?.label ?? item.documentTypeId;

    const usableDocs = claim.documents
      .filter((d) => {
        if (d.documentTypeId !== item.documentTypeId) return false;
        if (d.status !== "SORTED" || d.identityCheck === "MISMATCH") return false;
        if (item.needsFreshCopy && d.uploadedAt < claim.stageStartedAt) return false;
        return true;
      })
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    const chosen = usableDocs[0];
    if (chosen) {
      if (!seenDocIds.has(chosen.id)) {
        seenDocIds.add(chosen.id);
        documents.push({
          id: chosen.id,
          label,
          documentTypeKey: dt?.key ?? "OTHER",
          fileName: chosen.fileName,
          mimeType: chosen.mimeType,
          storageKey: chosen.storageKey,
          uploadedAt: chosen.uploadedAt,
          pageCount: chosen.pageCount,
        });
      }
    } else if (item.requirement === "REQUIRED") {
      missingSlots.push(label);
    }
  }

  const confirmedFields: PacketConfirmedField[] = [];
  if (effectiveStage === "PRE_AUTH") {
    const fieldRecordMap = new Map(claim.fields.map((f) => [f.fieldKey, f.value]));
    for (const def of PREAUTH_FIELDS) {
      const val = fieldRecordMap.get(def.key);
      if (val !== undefined) {
        confirmedFields.push({
          key: def.key,
          label: def.label,
          value: val,
        });
      }
    }
  }

  return {
    claim: {
      id: claim.id,
      code: claim.code,
      stage: claim.stage,
      status: claim.status,
      policyNumber: claim.policyNumber,
      payerReference: claim.payerReference,
      treatingDoctor: claim.treatingDoctor,
      admittedAt: claim.admittedAt,
      estimatedAmount: claim.estimatedAmount,
    },
    patient: {
      name: claim.patient.name,
      gender: claim.patient.gender,
      dateOfBirth: claim.patient.dateOfBirth,
      uhid: claim.patient.uhid,
    },
    payer: {
      name: claim.payer.name,
      kind: claim.payer.kind,
    },
    procedure: {
      name: claim.procedure.name,
    },
    user: {
      name: user.name,
    },
    stage: effectiveStage,
    documents,
    confirmedFields,
    missingSlots,
  };
}
