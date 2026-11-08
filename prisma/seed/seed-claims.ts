import type { PrismaClient } from "../../src/generated/prisma/client";
import type { ClaimEventName } from "../../src/features/claims/domain/status-machine";
import { transitionClaim } from "../../src/features/claims/server/transition-claim";
import { SEED_CLAIMS } from "./data/claims";

export async function seedClaims(
  db: PrismaClient,
  maps: {
    userMap: Map<string, string>;
    payerMap: Map<string, string>;
    procedureMap: Map<string, string>;
  },
) {
  const { userMap, payerMap, procedureMap } = maps;
  const now = new Date();

  for (const c of SEED_CLAIMS) {
    const payerId = payerMap.get(c.payerName);
    const procedureId = procedureMap.get(c.procedureName);
    const assigneeId = c.assigneeEmail ? (userMap.get(c.assigneeEmail) ?? null) : null;

    if (!payerId || !procedureId) {
      throw new Error(`Missing payer or procedure for claim ${c.code}`);
    }

    const birthYear = now.getFullYear() - c.patient.age;
    const patient = await db.patient.create({
      data: {
        name: c.patient.name,
        gender: c.patient.gender,
        uhid: c.patient.uhid,
        dateOfBirth: new Date(birthYear, 5, 15),
      },
    });

    const createdEvent = c.story[0]!;
    const createdAt = new Date(now.getTime() - createdEvent.minutesAgo * 60_000);

    const claim = await db.claim.create({
      data: {
        code: c.code,
        patientId: patient.id,
        payerId,
        procedureId,
        policyNumber: c.policyNumber,
        payerReference: c.payerReference ?? null,
        treatingDoctor: c.treatingDoctor,
        admittedAt: createdAt,
        estimatedAmount: c.estimatedAmount,
        approvedAmount: c.approvedAmount ?? null,
        stage: "PRE_AUTH",
        status: "DRAFT",
        stageStartedAt: createdAt,
        statusChangedAt: createdAt,
        assigneeId,
        createdAt,
      },
    });

    await db.claimEvent.create({
      data: {
        claimId: claim.id,
        type: "CREATED",
        stage: "PRE_AUTH",
        status: "DRAFT",
        at: createdAt,
        actorId: assigneeId,
      },
    });

    let currentState = { stage: claim.stage, status: claim.status };

    // Replay remaining story
    for (let i = 1; i < c.story.length; i++) {
      const step = c.story[i]!;
      const at = new Date(now.getTime() - step.minutesAgo * 60_000);

      const next = await transitionClaim(
        db,
        { id: claim.id, ...currentState },
        step.event as ClaimEventName,
        {
          actorId: assigneeId,
          note: step.note,
          at,
        },
      );
      currentState = next;
    }
  }

  console.log(`✓ Seeded ${SEED_CLAIMS.length} open claims with full event timelines.`);
}
