import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createTestClaim, createTestUser } from "../../../../test/factories";
import { createDoctorSignoffLink } from "./create-link";
import { decideDoctorSignoff } from "./decide";
import { hashDoctorToken } from "./hash";

describe("Doctor Sign-off Integration", () => {
  it("creates doctor sign-off link for pre-auth draft and audits", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    const link = await createDoctorSignoffLink(exec, claim.code);
    expect(link.token).toBeDefined();
    expect(link.path).toBe(`/d/${link.token}`);

    const hash = hashDoctorToken(link.token);
    const approval = await db.doctorApproval.findUnique({
      where: { tokenHash: hash },
    });
    expect(approval).not.toBeNull();
    expect(approval?.status).toBe("PENDING");
    expect(approval?.claimId).toBe(claim.id);

    const audit = await db.auditEvent.findFirst({
      where: { claimId: claim.id, action: "DOCTOR_LINK_CREATED" },
    });
    expect(audit).not.toBeNull();
  });

  it("records doctor approval decision and audits anonymously", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);
    const link = await createDoctorSignoffLink(exec, claim.code);

    const res = await decideDoctorSignoff({
      token: link.token,
      decision: "APPROVE",
    });

    expect(res.status).toBe("APPROVED");

    const hash = hashDoctorToken(link.token);
    const approval = await db.doctorApproval.findUniqueOrThrow({
      where: { tokenHash: hash },
    });
    expect(approval.status).toBe("APPROVED");
    expect(approval.decidedAt).not.toBeNull();

    const audit = await db.auditEvent.findFirst({
      where: { claimId: claim.id, action: "DOCTOR_DECIDED" },
    });
    expect(audit).not.toBeNull();
    expect(audit?.actorId).toBeNull();
  });

  it("prevents reusing or double-deciding on a single-use token", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);
    const link = await createDoctorSignoffLink(exec, claim.code);

    await decideDoctorSignoff({
      token: link.token,
      decision: "APPROVE",
    });

    await expect(
      decideDoctorSignoff({
        token: link.token,
        decision: "CHANGES_REQUESTED",
        comment: "Need changes",
      }),
    ).rejects.toThrow("already been recorded");
  });

  it("records changes requested with doctor feedback", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);
    const link = await createDoctorSignoffLink(exec, claim.code);

    const res = await decideDoctorSignoff({
      token: link.token,
      decision: "CHANGES_REQUESTED",
      comment: "Please revise diagnosis to acute appendicitis.",
    });

    expect(res.status).toBe("CHANGES_REQUESTED");

    const hash = hashDoctorToken(link.token);
    const approval = await db.doctorApproval.findUniqueOrThrow({
      where: { tokenHash: hash },
    });
    expect(approval.status).toBe("CHANGES_REQUESTED");
    expect(approval.comment).toBe("Please revise diagnosis to acute appendicitis.");
  });
});
