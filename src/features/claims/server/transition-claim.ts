// The only code that changes a claim's stage or status (I1). Applies the state machine,
// writes the timeline event and keeps the timestamp columns in step.
import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ClaimStatus, Stage } from "@/lib/enums";
import { ConflictError } from "@/lib/errors";
import {
  applyClaimEvent,
  InvalidTransitionError,
  type ClaimEventName,
  type ClaimState,
} from "../domain/status-machine";

export async function transitionClaim(
  tx: Prisma.TransactionClient,
  claim: { id: string; stage: Stage; status: ClaimStatus },
  event: ClaimEventName,
  meta: {
    actorId: string | null;
    note?: string;
    data?: Prisma.InputJsonValue;
    at?: Date;
  },
): Promise<ClaimState> {
  let applied;
  try {
    applied = applyClaimEvent(claim, event);
  } catch (e) {
    if (e instanceof InvalidTransitionError) throw new ConflictError(e.message);
    throw e;
  }

  const at = meta.at ?? new Date();

  await tx.claim.update({
    where: { id: claim.id },
    data: {
      stage: applied.state.stage,
      status: applied.state.status,
      statusChangedAt: at,
      ...(applied.state.stage !== claim.stage && { stageStartedAt: at }),
    },
  });

  await tx.claimEvent.create({
    data: {
      claimId: claim.id,
      type: applied.recordAs,
      stage: applied.state.stage,
      status: applied.state.status,
      at,
      actorId: meta.actorId,
      note: meta.note ?? null,
      data: meta.data ?? undefined,
    },
  });

  return applied.state;
}
