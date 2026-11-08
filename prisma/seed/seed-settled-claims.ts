import type { PrismaClient } from "../../src/generated/prisma/client";
import { storage } from "../../src/lib/storage";
import { SEED_PAYERS } from "./data/payers";
import { SEED_PROCEDURES } from "./data/procedures";
import { generateSettledClaims } from "./data/settled-claims";
import { renderSamplePdf } from "./render-sample-pdf";

export async function seedSettledClaims(
  db: PrismaClient,
  ctx: {
    userMap: Map<string, string>;
    payerMap: Map<string, string>;
    procedureMap: Map<string, string>;
    docTypeMap: Map<string, string>;
  },
) {
  const payers = SEED_PAYERS.map((p) => p.name);
  const procedures = SEED_PROCEDURES;
  const items = generateSettledClaims(payers, procedures);

  const executives = [
    ctx.userMap.get("arjun.patil@claimtrail.example")!,
    ctx.userMap.get("sneha.joshi@claimtrail.example")!,
    ctx.userMap.get("farhan.sayyed@claimtrail.example")!,
  ];

  const docTypeKeys = Array.from(ctx.docTypeMap.keys());
  const now = Date.now();

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const assigneeId = executives[i % executives.length]!;
    const payerId = ctx.payerMap.get(item.payerName)!;
    const procedureId = ctx.procedureMap.get(item.procedureName)!;

    const patient = await db.patient.create({
      data: {
        name: item.patientName,
        uhid: item.uhid,
        gender: item.patientGender,
        dateOfBirth: new Date(item.patientDob),
      },
    });

    const settledAt = new Date(now - item.settledDaysAgo * 86400000);
    const admittedAt = new Date(now - item.admittedDaysAgo * 86400000);
    const preauthSubmittedAt = new Date(admittedAt.getTime() + 2 * 3600000);
    const preauthApprovedAt = new Date(preauthSubmittedAt.getTime() + 3 * 3600000);

    const dischargeStartAt = new Date(
      settledAt.getTime() - (item.prepMinutes + item.payerMinutes + 20) * 60000,
    );
    const dischargeSubmittedAt = new Date(dischargeStartAt.getTime() + item.prepMinutes * 60000);
    const dischargeApprovedAt = new Date(dischargeSubmittedAt.getTime() + item.payerMinutes * 60000);

    const claim = await db.claim.create({
      data: {
        code: item.code,
        patientId: patient.id,
        payerId,
        procedureId,
        policyNumber: item.policyNumber,
        treatingDoctor: item.treatingDoctor,
        admittedAt,
        stage: "DISCHARGE",
        status: "SETTLED",
        stageStartedAt: dischargeStartAt,
        statusChangedAt: settledAt,
        estimatedAmount: item.estimatedAmount,
        approvedAmount: item.approvedAmount,
        billedAmount: item.billedAmount,
        settledAmount: item.settledAmount,
        assigneeId,
      },
    });

    // Timeline events
    await db.claimEvent.createMany({
      data: [
        {
          claimId: claim.id,
          type: "CREATED",
          stage: "PRE_AUTH",
          status: "DRAFT",
          at: admittedAt,
          actorId: assigneeId,
        },
        {
          claimId: claim.id,
          type: "SUBMITTED",
          stage: "PRE_AUTH",
          status: "SENT",
          at: preauthSubmittedAt,
          actorId: assigneeId,
        },
        {
          claimId: claim.id,
          type: "APPROVED",
          stage: "PRE_AUTH",
          status: "APPROVED",
          at: preauthApprovedAt,
          actorId: null,
        },
        {
          claimId: claim.id,
          type: "STAGE_STARTED",
          stage: "DISCHARGE",
          status: "DRAFT",
          at: dischargeStartAt,
          actorId: assigneeId,
        },
        {
          claimId: claim.id,
          type: "SUBMITTED",
          stage: "DISCHARGE",
          status: "SENT",
          at: dischargeSubmittedAt,
          actorId: assigneeId,
        },
        {
          claimId: claim.id,
          type: "APPROVED",
          stage: "DISCHARGE",
          status: "APPROVED",
          at: dischargeApprovedAt,
          actorId: null,
        },
        {
          claimId: claim.id,
          type: "SETTLED",
          stage: "DISCHARGE",
          status: "SETTLED",
          at: settledAt,
          actorId: assigneeId,
        },
      ],
    });

    // Deductions
    if (item.deductions.length > 0) {
      await db.deduction.createMany({
        data: item.deductions.map((d) => ({
          claimId: claim.id,
          reason: d.reason,
          amount: d.amount,
          note: d.note ?? null,
        })),
      });
    }

    // Historical query
    if (item.historicalQuery) {
      const q = item.historicalQuery;
      const repliedAt = new Date(preauthApprovedAt.getTime() - 3600000);
      const receivedAt = new Date(repliedAt.getTime() - q.receivedHoursBeforeReply * 3600000);

      await db.tpaQuery.create({
        data: {
          claim: { connect: { id: claim.id } },
          payer: { connect: { id: payerId } },
          fromAddress: `claims@${item.payerName.toLowerCase().replace(/[^a-z0-9]/g, "")}.example`,
          subject: q.subject,
          body: q.body,
          receivedAt,
          deadlineAt: new Date(receivedAt.getTime() + 24 * 3600000),
          deadlineSource: "DEFAULT",
          status: "ANSWERED",
          aiState: "OK",
          summary: "Itemized pharmacy breakdown and summary requested for billing.",
          repliedAt,
          repliedBy: { connect: { id: assigneeId } },
          replyBody: q.replyText,
        },
      });
    }

    // Documents (2 per claim for AI stats)
    for (let d = 0; d < 2; d++) {
      const key = docTypeKeys[(i + d) % docTypeKeys.length]!;
      const docTypeId = ctx.docTypeMap.get(key)!;
      // ~91% AI sorted, ~9% moved by user
      const isMoved = (i + d) % 11 === 0;
      const storageKey = `claims/${claim.code}/hist-${d + 1}.pdf`;

      const bytes = await renderSamplePdf({
        title: key.replace(/-/g, " ").toUpperCase(),
        patientName: item.patientName,
        date: admittedAt.toISOString().slice(0, 10),
        lines: [
          `Claim Reference: ${claim.code}`,
          `Payer: ${item.payerName}`,
          `Procedure: ${item.procedureName}`,
          `Status: Settled claim archive record.`,
        ],
      });

      await storage.put(storageKey, bytes, "application/pdf");

      await db.document.create({
        data: {
          claimId: claim.id,
          documentTypeId: docTypeId,
          storageKey,
          fileName: `document-${d + 1}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: bytes.byteLength,
          pageCount: 1,
          status: "SORTED",
          sortedBy: isMoved ? "USER" : "AI",
          aiDocumentTypeKey: key,
          aiConfidence: 0.94,
          aiReason: "Identified by document header and clinical content",
          uploadedById: assigneeId,
          uploadedAt: admittedAt,
        },
      });
    }
  }

  console.log(`✓ Seeded ${items.length} historical settled claims with deductions and queries.`);
}
