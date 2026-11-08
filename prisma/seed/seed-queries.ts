import type { PrismaClient } from "../../src/generated/prisma/client";
import { SEED_QUERY_SPECS } from "./data/queries";

export async function seedQueries(
  db: PrismaClient,
  maps: {
    userMap: Map<string, string>;
    payerMap: Map<string, string>;
    docTypeMap: Map<string, string>;
  },
) {
  const { userMap, payerMap, docTypeMap } = maps;
  const now = new Date();
  const arjunId = userMap.get("arjun.patil@claimtrail.example");

  for (const spec of SEED_QUERY_SPECS) {
    const payerId = payerMap.get(spec.payerName);
    const claim = spec.claimCode ? await db.claim.findUnique({ where: { code: spec.claimCode } }) : null;
    const suggestedClaim = spec.suggestedClaimCode
      ? await db.claim.findUnique({ where: { code: spec.suggestedClaimCode } })
      : null;

    const receivedAt = new Date(now.getTime() - spec.minutesAgo * 60_000);
    const deadlineAt = new Date(receivedAt.getTime() + spec.deadlineMinutesOffset * 60_000);
    const repliedAt = spec.repliedMinutesAfter
      ? new Date(receivedAt.getTime() + spec.repliedMinutesAfter * 60_000)
      : null;

    await db.tpaQuery.create({
      data: {
        claimId: claim?.id ?? null,
        payerId: payerId ?? null,
        fromAddress: spec.fromAddress,
        subject: spec.subject,
        body: spec.body,
        receivedAt,
        aiState: "OK",
        summary: spec.summary,
        extractedClaimRef: spec.extractedClaimRef,
        extractedPatient: spec.extractedPatient,
        suggestedClaimId: suggestedClaim?.id ?? null,
        deadlineAt,
        deadlineSource: spec.deadlineSource,
        deadlineSnippet: spec.statedSnippet,
        status: spec.status,
        replyBody: spec.replyBody ?? null,
        repliedAt,
        repliedById: spec.status === "ANSWERED" ? (arjunId ?? null) : null,
        replyDocumentIds: [],
        asks: {
          create: spec.asks.map((ask) => ({
            position: ask.position,
            text: ask.text,
            documentTypeId: ask.documentTypeKey ? (docTypeMap.get(ask.documentTypeKey) ?? null) : null,
            sourceSnippet: ask.sourceSnippet,
          })),
        },
      },
    });

    // For CLM-3381 and CLM-3388, query was raised at receivedAt, ensuring the timeline event matches
    if (claim && spec.status === "OPEN") {
      const existingQueryEvent = await db.claimEvent.findFirst({
        where: { claimId: claim.id, type: "QUERY_RAISED" },
      });
      if (existingQueryEvent) {
        await db.claimEvent.update({
          where: { id: existingQueryEvent.id },
          data: { at: receivedAt },
        });
      }
    }
  }

  console.log(`✓ Seeded ${SEED_QUERY_SPECS.length} TPA queries with asks.`);
}
