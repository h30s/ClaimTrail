import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "@/lib/errors";
import { db } from "@/lib/db";
import { PREAUTH_FIELD_KEYS } from "@/features/preauth/domain/preauth-fields";
import { createTestClaim, createTestUser } from "../../../../test/factories";
import { submitClaim } from "./submit-claim";

describe("Submit Claim Integration", () => {
  it("blocks executive when required checklist items or pre-auth fields are missing", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    // Executive attempts to submit draft claim with gaps without head permission
    await expect(
      submitClaim(exec, {
        claimCode: claim.code,
      }),
    ).rejects.toThrow(ConflictError);

    // Verify claim remains in DRAFT
    const current = await db.claim.findUnique({ where: { id: claim.id } });
    expect(current?.status).toBe("DRAFT");
  });

  it("requires desk head to provide a valid reason (>= 10 chars) when overriding gaps", async () => {
    const head = await createTestUser("DESK_HEAD");
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    // Desk head attempts to submit without reason
    await expect(
      submitClaim(head, {
        claimCode: claim.code,
      }),
    ).rejects.toThrow(ValidationError);

    // Desk head attempts to submit with too short reason
    await expect(
      submitClaim(head, {
        claimCode: claim.code,
        overrideReason: "Too short",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("allows desk head to submit with gaps when valid override reason is provided", async () => {
    const head = await createTestUser("DESK_HEAD");
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    const overrideReason = "Emergency night admission approved on call by Dr. Deshpande";

    const nextState = await submitClaim(head, {
      claimCode: claim.code,
      overrideReason,
    });

    expect(nextState.status).toBe("SENT");

    // Verify DB claim state
    const updatedClaim = await db.claim.findUnique({ where: { id: claim.id } });
    expect(updatedClaim?.status).toBe("SENT");

    // Verify submission record
    const submission = await db.submission.findFirst({
      where: { claimId: claim.id },
    });
    expect(submission).not.toBeNull();
    expect(submission?.sentById).toBe(head.id);
    expect(submission?.overrideReason).toBe(overrideReason);
    expect(Array.isArray(submission?.overriddenGaps)).toBe(true);

    // Verify timeline event
    const event = await db.claimEvent.findFirst({
      where: { claimId: claim.id, type: "SUBMITTED" },
    });
    expect(event).not.toBeNull();
    expect(event?.actorId).toBe(head.id);
    expect(event?.note).toBe(overrideReason);
  });

  it("prevents re-submitting an already sent claim", async () => {
    const head = await createTestUser("DESK_HEAD");
    const claim = await createTestClaim(head.id);

    await submitClaim(head, {
      claimCode: claim.code,
      overrideReason: "Overriding gaps for initial send",
    });

    // Attempting to submit again
    await expect(
      submitClaim(head, {
        claimCode: claim.code,
        overrideReason: "Attempting duplicate send",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("allows executive to submit without override when all requirements and fields are satisfied", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    // 1. Confirm all 12 pre-auth fields
    for (const key of PREAUTH_FIELD_KEYS) {
      await db.claimField.create({
        data: {
          claimId: claim.id,
          fieldKey: key,
          value: key === "age" ? "45" : key === "gender" ? "MALE" : "Satisfied value",
          confirmedById: exec.id,
        },
      });
    }

    // 2. Query document types to satisfy required slots
    const docTypes = await db.documentType.findMany();
    const docTypeIds = docTypes.map((dt) => dt.id);

    // Satisfy all required slots by creating a sorted document for each
    for (const typeId of docTypeIds) {
      await db.document.create({
        data: {
          claimId: claim.id,
          documentTypeId: typeId,
          status: "SORTED",
          fileName: `doc-${typeId}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: 1024,
          storageKey: `claims/${claim.id}/doc-${typeId}.pdf`,
          uploadedById: exec.id,
          identityCheck: "MATCH",
        },
      });
    }

    // Executive submits without override reason
    const result = await submitClaim(exec, {
      claimCode: claim.code,
    });

    expect(result.status).toBe("SENT");

    const submission = await db.submission.findFirst({
      where: { claimId: claim.id },
    });
    expect(submission).not.toBeNull();
    expect(submission?.sentById).toBe(exec.id);
    expect(submission?.overrideReason).toBeNull();
    expect(submission?.overriddenGaps).toBeNull();
  });
});
