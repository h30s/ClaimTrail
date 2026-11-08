import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/lib/errors";
import { createTestClaim, createTestUser } from "../../../../test/factories";
import { getClaimFile, listWorklist } from "./queries";
import { recordDecision } from "./record-decision";

describe("Claim Access Control (Integration)", () => {
  it("prevents executive A from viewing a claim assigned to executive B", async () => {
    const execA = await createTestUser("DESK_EXECUTIVE");
    const execB = await createTestUser("DESK_EXECUTIVE");

    const claimB = await createTestClaim(execB.id);

    // Executive A attempts to view B's claim
    const file = await getClaimFile(execA, claimB.code, new Date());
    expect(file).toBeNull();

    // Executive B can view their own claim
    const ownFile = await getClaimFile(execB, claimB.code, new Date());
    expect(ownFile).not.toBeNull();
    expect(ownFile?.claim.code).toBe(claimB.code);
  });

  it("prevents executive A from modifying or deciding a claim assigned to executive B", async () => {
    const execA = await createTestUser("DESK_EXECUTIVE");
    const execB = await createTestUser("DESK_EXECUTIVE");

    const claimB = await createTestClaim(execB.id);

    // Executive A attempts to record a decision on B's claim
    await expect(
      recordDecision(execA, {
        claimId: claimB.id,
        decision: "APPROVE",
        approvedAmount: 50000,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("allows desk head to view and manage claims assigned to any executive", async () => {
    const head = await createTestUser("DESK_HEAD");
    const exec = await createTestUser("DESK_EXECUTIVE");

    const claim = await createTestClaim(exec.id);

    const file = await getClaimFile(head, claim.code, new Date());
    expect(file).not.toBeNull();
    expect(file?.claim.code).toBe(claim.code);
  });

  it("filters worklist for executives to only show their assigned claims", async () => {
    const execA = await createTestUser("DESK_EXECUTIVE");
    const execB = await createTestUser("DESK_EXECUTIVE");

    const claimA = await createTestClaim(execA.id);
    const claimB = await createTestClaim(execB.id);

    const worklistA = await listWorklist(execA, { tab: "open" }, new Date());
    const codesA = worklistA.rows.map((r) => r.code);

    expect(codesA).toContain(claimA.code);
    expect(codesA).not.toContain(claimB.code);
  });
});
