import "server-only";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { assertClaimAccess, claimScopeWhere } from "@/features/claims/server/claim-scope";
import { recordAudit } from "@/features/audit/server/record-audit";
import { PREAUTH_FIELDS } from "../domain/preauth-fields";
import { normaliseSuggestion, valueSchemaFor } from "../domain/field-value";
import type { ConfirmPreauthFieldInput } from "../schemas";

export async function confirmField(
  user: SessionUser,
  input: ConfirmPreauthFieldInput,
): Promise<{ success: boolean; fieldKey: string; value: string }> {
  const claim = await db.claim.findFirst({
    where: { code: input.claimCode, ...claimScopeWhere(user) },
    select: { id: true },
  });

  if (!claim) {
    throw new NotFoundError("Claim not found.");
  }

  await assertClaimAccess(user, claim.id);

  const field = PREAUTH_FIELDS.find((f) => f.key === input.fieldKey);
  if (!field) {
    throw new ValidationError("Invalid field key.");
  }

  const normalised = normaliseSuggestion(field.kind, input.value);
  const parsed = valueSchemaFor(field.kind).safeParse(normalised);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? `Invalid value for ${field.label}`);
  }

  await db.$transaction(async (tx) => {
    await tx.claimField.upsert({
      where: {
        claimId_fieldKey: {
          claimId: claim.id,
          fieldKey: field.key,
        },
      },
      create: {
        claimId: claim.id,
        fieldKey: field.key,
        value: normalised,
        suggestionId: input.suggestionId ?? null,
        confirmedById: user.id,
        confirmedAt: new Date(),
      },
      update: {
        value: normalised,
        suggestionId: input.suggestionId ?? null,
        confirmedById: user.id,
        confirmedAt: new Date(),
      },
    });

    await recordAudit(tx, {
      actorId: user.id,
      action: "FIELD_CONFIRMED",
      entityType: "CLAIM_FIELD",
      entityId: `${claim.id}:${field.key}`,
      claimId: claim.id,
      data: {
        fieldKey: field.key,
        value: normalised,
        fromSuggestion: Boolean(input.suggestionId),
      },
    });
  });

  return { success: true, fieldKey: field.key, value: normalised };
}
