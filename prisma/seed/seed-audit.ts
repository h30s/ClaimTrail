import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedAuditEvents(
  db: PrismaClient,
  maps: {
    userMap: Map<string, string>;
  },
) {
  const { userMap } = maps;
  const meeraId = userMap.get("meera.kulkarni@claimtrail.example")!;
  const arjunId = userMap.get("arjun.patil@claimtrail.example")!;
  const farhanId = userMap.get("farhan.sayyed@claimtrail.example")!;
  const now = Date.now();

  const clm3381 = await db.claim.findFirst({ where: { code: "CLM-3381" } });
  const clm3382 = await db.claim.findFirst({ where: { code: "CLM-3382" } });
  const clm3383 = await db.claim.findFirst({ where: { code: "CLM-3383" } });
  const clm3389 = await db.claim.findFirst({ where: { code: "CLM-3389" } });
  const clm3390 = await db.claim.findFirst({ where: { code: "CLM-3390" } });
  const clm3393 = await db.claim.findFirst({ where: { code: "CLM-3393" } });

  const events = [
    {
      actorId: arjunId,
      action: "CLAIM_CREATED",
      entityType: "CLAIM",
      entityId: clm3381?.id ?? "claim-3381",
      claimId: clm3381?.id ?? null,
      data: { code: "CLM-3381", patient: "Rajendra Pawar" },
      at: new Date(now - 250 * 60000),
    },
    {
      actorId: arjunId,
      action: "DOCUMENT_UPLOADED",
      entityType: "DOCUMENT",
      entityId: "doc-notes-3381",
      claimId: clm3381?.id ?? null,
      data: { fileName: "admission-notes-rajendra-pawar.pdf" },
      at: new Date(now - 235 * 60000),
    },
    {
      actorId: arjunId,
      action: "DOCUMENT_SORTED",
      entityType: "DOCUMENT",
      entityId: "doc-notes-3381",
      claimId: clm3381?.id ?? null,
      data: { targetKey: "DOCTOR_NOTES" },
      at: new Date(now - 230 * 60000),
    },
    {
      actorId: arjunId,
      action: "FIELD_CONFIRMED",
      entityType: "PREAUTH_FIELD",
      entityId: "patientName",
      claimId: clm3381?.id ?? null,
      data: { fieldKey: "patientName", value: "Rajendra Pawar" },
      at: new Date(now - 225 * 60000),
    },
    {
      actorId: meeraId,
      action: "CLAIM_SUBMITTED",
      entityType: "CLAIM",
      entityId: clm3389?.id ?? "claim-3389",
      claimId: clm3389?.id ?? null,
      data: {
        overridden: true,
        overrideReason: "Insurer agreed by telephone to receive biopsy report in query stage",
      },
      at: new Date(now - 120 * 60000),
    },
    {
      actorId: arjunId,
      action: "QUERY_REPLIED",
      entityType: "TPA_QUERY",
      entityId: "query-3390",
      claimId: clm3390?.id ?? null,
      data: { to: "claims.desk@company-e.example", attachments: 1 },
      at: new Date(now - 90 * 60000),
    },
    {
      actorId: arjunId,
      action: "CLAIM_SUBMITTED",
      entityType: "CLAIM",
      entityId: clm3382?.id ?? "claim-3382",
      claimId: clm3382?.id ?? null,
      data: { overridden: false },
      at: new Date(now - 40 * 60000),
    },
    {
      actorId: arjunId,
      action: "DOCTOR_LINK_CREATED",
      entityType: "DOCTOR_APPROVAL",
      entityId: "signoff-3383",
      claimId: clm3383?.id ?? null,
      data: { doctorName: "Dr. Priya Deshpande" },
      at: new Date(now - 30 * 60000),
    },
    {
      actorId: null,
      action: "DOCTOR_DECIDED",
      entityType: "DOCTOR_APPROVAL",
      entityId: "signoff-3383",
      claimId: clm3383?.id ?? null,
      data: { decision: "APPROVED" },
      at: new Date(now - 25 * 60000),
    },
    {
      actorId: meeraId,
      action: "RULE_UPDATED",
      entityType: "CHECKLIST_RULE",
      entityId: "rule-photo-id",
      claimId: null,
      data: { requirement: "NOT_NEEDED", payerName: "Company C" },
      at: new Date(now - 20 * 60000),
    },
    {
      actorId: farhanId,
      action: "CLAIM_SETTLED",
      entityType: "CLAIM",
      entityId: clm3393?.id ?? "claim-3393",
      claimId: clm3393?.id ?? null,
      data: { billedAmount: 80000, settledAmount: 68000 },
      at: new Date(now - 10 * 60000),
    },
    {
      actorId: farhanId,
      action: "DEDUCTION_RECORDED",
      entityType: "DEDUCTION",
      entityId: "ded-room-rent",
      claimId: clm3393?.id ?? null,
      data: { reason: "ROOM_RENT_LIMIT", amount: 7000 },
      at: new Date(now - 9 * 60000),
    },
    {
      actorId: farhanId,
      action: "DEDUCTION_RECORDED",
      entityType: "DEDUCTION",
      entityId: "ded-non-payable",
      claimId: clm3393?.id ?? null,
      data: { reason: "NON_PAYABLE_ITEM", amount: 5000 },
      at: new Date(now - 8 * 60000),
    },
  ];

  await db.auditEvent.createMany({
    data: events,
  });

  console.log(`✓ Seeded ${events.length} compliance audit events.`);
}
