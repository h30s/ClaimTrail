import "server-only";
import { db } from "@/lib/db";
import { recordAudit } from "@/features/audit/server/record-audit";
import { getAiProvider } from "@/features/ai/get-provider";
import { recordAiRun } from "@/features/ai/server/record-ai-run";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { transitionClaim } from "@/features/claims/server/transition-claim";
import { resolveDeadline } from "../domain/resolve-deadline";
import { findClaimCode, matchQueryToClaim, type MatchCandidate } from "../domain/match-claim";
import { findPayerByEmail } from "./find-payer-by-email";

export type IngestQueryInput = {
  fromAddress: string;
  subject: string;
  body: string;
  receivedAt?: Date;
};

export async function ingestQuery(actorId: string, input: IngestQueryInput) {
  const receivedAt = input.receivedAt ?? new Date();
  const payer = await findPayerByEmail(input.fromAddress);
  const docTypes = await listDocumentTypes();
  const docTypeHints = docTypes.map((dt) => ({
    key: dt.key,
    label: dt.label,
    description: dt.description,
  }));
  const docTypeKeyMap = new Map(docTypes.map((dt) => [dt.key, dt.id]));

  const provider = await getAiProvider();
  const aiResult = await provider.summariseQuery({
    subject: input.subject,
    body: input.body,
    receivedAt,
    documentTypes: docTypeHints,
  });

  const summaryData = aiResult.ok ? aiResult.data : null;
  const deadline = resolveDeadline({
    receivedAt,
    statedIso: summaryData?.deadline?.iso ?? null,
    defaultHours: payer?.queryReplyHours ?? 24,
  });

  const extractedClaimRef = summaryData?.claimReference ?? findClaimCode(`${input.subject} ${input.body}`);
  const extractedPatient = summaryData?.patientName ?? null;

  const candidateClaims = await db.claim.findMany({
    where: {
      status: { in: ["DRAFT", "SENT", "QUERY", "APPROVED"] },
      ...(payer ? { payerId: payer.id } : {}),
    },
    include: { patient: { select: { name: true } } },
  });

  const matchCandidates: MatchCandidate[] = candidateClaims.map((c) => ({
    id: c.id,
    code: c.code,
    payerReference: c.payerReference,
    patientName: c.patient.name,
    payerId: c.payerId,
  }));

  const match = matchQueryToClaim(
    {
      claimRef: extractedClaimRef,
      patientName: extractedPatient,
      payerId: payer?.id ?? null,
    },
    matchCandidates,
  );

  const matchedClaimId = match.kind === "EXACT" ? match.claimId : null;
  const suggestedClaimId = match.kind === "SUGGESTED" ? match.claimId : null;

  return await db.$transaction(async (tx) => {
    const query = await tx.tpaQuery.create({
      data: {
        claimId: matchedClaimId,
        suggestedClaimId,
        payerId: payer?.id ?? null,
        fromAddress: input.fromAddress,
        subject: input.subject,
        body: input.body,
        receivedAt,
        aiState: aiResult.ok ? "OK" : "FAILED",
        summary: summaryData?.summary ?? null,
        extractedClaimRef,
        extractedPatient,
        deadlineAt: deadline.dueAt,
        deadlineSource: deadline.source,
        deadlineSnippet: summaryData?.deadline?.sourceSnippet ?? null,
        status: "OPEN",
      },
    });

    await recordAiRun(tx, {
      task: "SUMMARISE_QUERY",
      result: aiResult,
      queryId: query.id,
    });

    if (summaryData?.asks && summaryData.asks.length > 0) {
      await tx.queryAsk.createMany({
        data: summaryData.asks.map((ask, idx) => ({
          queryId: query.id,
          position: ask.position ?? idx + 1,
          text: ask.text,
          documentTypeId: ask.documentType ? (docTypeKeyMap.get(ask.documentType) ?? null) : null,
          sourceSnippet: ask.sourceSnippet ?? null,
        })),
      });
    }

    if (matchedClaimId) {
      const claim = await tx.claim.findUnique({
        where: { id: matchedClaimId },
        select: { id: true, stage: true, status: true },
      });
      if (claim && claim.status === "SENT") {
        await transitionClaim(tx, claim, "RAISE_QUERY", {
          actorId,
          data: { queryId: query.id },
        });
      }
    }

    await recordAudit(tx, {
      actorId,
      action: "QUERY_INGESTED",
      entityType: "TpaQuery",
      entityId: query.id,
      claimId: query.claimId ?? undefined,
      data: {
        fromAddress: input.fromAddress,
        payerId: payer?.id ?? null,
        matchedClaimId,
        matchKind: match.kind,
      },
    });

    return query;
  });
}
