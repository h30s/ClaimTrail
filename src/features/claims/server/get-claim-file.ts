import "server-only";
import { cache } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { loadRules } from "@/features/checklist/server/load-rules";
import { buildClaimInsight } from "../domain/claim-insight";
import { availableEvents } from "../domain/status-machine";
import type { ClaimFileDto } from "../types";
import { claimScopeWhere } from "./claim-scope";

export const getClaimFile = cache(
  async (user: SessionUser, code: string, now: Date): Promise<ClaimFileDto | null> => {
    const scope = claimScopeWhere(user);

    const claim = await db.claim.findFirst({
      where: { code, ...scope },
      include: {
        patient: true,
        payer: true,
        procedure: true,
        assignee: { select: { id: true, name: true } },
        events: {
          include: { actor: { select: { name: true } } },
          orderBy: { at: "desc" },
        },
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            documentTypeId: true,
            status: true,
            identityCheck: true,
            uploadedAt: true,
          },
        },
        deductions: {
          select: {
            id: true,
            reason: true,
            amount: true,
            note: true,
          },
          orderBy: { amount: "desc" },
        },
        fields: { select: { fieldKey: true, confirmedAt: true } },
        queries: {
          where: { status: "OPEN" },
          select: {
            id: true,
            deadlineAt: true,
            receivedAt: true,
            summary: true,
            subject: true,
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
        doctorApprovals: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, status: true, comment: true, doctorName: true, expiresAt: true },
        },
      },
    });

    if (!claim) return null;

    const [rules, docTypes] = await Promise.all([loadRules(), listDocumentTypes()]);
    const docTypeMap = new Map(docTypes.map((dt) => [dt.id, dt.label]));
    const labelFor = (id: string) => docTypeMap.get(id) ?? id;

    const confirmedKeys = claim.fields.filter((f) => f.confirmedAt !== null).map((f) => f.fieldKey);

    const insight = buildClaimInsight({
      claim: {
        stage: claim.stage,
        status: claim.status,
        payerId: claim.payerId,
        procedureId: claim.procedureId,
        stageStartedAt: claim.stageStartedAt,
      },
      rules,
      documents: claim.documents,
      events: claim.events.map((e) => ({
        type: e.type,
        stage: e.stage,
        status: e.status,
        at: e.at,
      })),
      openQueries: claim.queries.map((q) => ({
        id: q.id,
        dueAt: q.deadlineAt,
        asks: q.asks.map((a) => ({
          id: a.id,
          queryId: a.queryId,
          text: a.text,
          documentTypeId: a.documentTypeId,
          receivedAt: q.receivedAt,
        })),
      })),
      confirmedFieldKeys: confirmedKeys,
      labelFor,
      now,
      doctorApproval: claim.doctorApprovals[0] ?? null,
    });

    const legalEvents = availableEvents({
      stage: claim.stage,
      status: claim.status,
    });

    let readyLine = "All required documents present · Ready to send";
    if (!insight.gaps.isReady) {
      if (insight.gaps.missingRequired > 0) {
        readyLine = `${insight.gaps.missingRequired} required document${insight.gaps.missingRequired > 1 ? "s" : ""} missing`;
      } else if (insight.gaps.staleRequired > 0) {
        readyLine = `${insight.gaps.staleRequired} document${insight.gaps.staleRequired > 1 ? "s" : ""} need fresh copies`;
      } else if (insight.gaps.needsCheck > 0) {
        readyLine = "Name on document does not match patient";
      } else {
        readyLine = "Checklist has open gaps";
      }
    }

    return {
      claim: {
        id: claim.id,
        code: claim.code,
        policyNumber: claim.policyNumber,
        payerReference: claim.payerReference,
        treatingDoctor: claim.treatingDoctor,
        admittedAt: claim.admittedAt,
        estimatedAmount: claim.estimatedAmount,
        approvedAmount: claim.approvedAmount,
        billedAmount: claim.billedAmount,
        settledAmount: claim.settledAmount,
        stage: claim.stage,
        status: claim.status,
        stageStartedAt: claim.stageStartedAt,
        statusChangedAt: claim.statusChangedAt,
        createdAt: claim.createdAt,
      },
      patient: claim.patient,
      payer: claim.payer,
      procedure: claim.procedure,
      assignee: claim.assignee,
      deductions: claim.deductions,
      doctorApproval: claim.doctorApprovals[0] ?? null,
      openQueries: claim.queries.map((q) => ({
        id: q.id,
        deadlineAt: q.deadlineAt,
        receivedAt: q.receivedAt,
        summary: q.summary,
        subject: q.subject,
      })),
      insight,
      availableEvents: legalEvents,
      readyLine,
      recentEvents: claim.events.slice(0, 6).map((e) => ({
        id: e.id,
        type: e.type,
        stage: e.stage,
        status: e.status,
        at: e.at,
        actorName: e.actor?.name ?? null,
        note: e.note,
      })),
    };
  },
);
