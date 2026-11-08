import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createTestClaim, createTestUser } from "../../../../test/factories";
import { ingestQuery } from "./ingest-query";
import { linkQuery } from "./link-query";
import { recordReply } from "./record-reply";
import { listInbox } from "./queries";

async function createOpenQuery(claimId: string | null = null) {
  return db.tpaQuery.create({
    data: {
      claimId,
      fromAddress: "queries@company-b.example",
      subject: "Test query",
      body: "Test body",
      receivedAt: new Date(),
      deadlineAt: new Date(Date.now() + 86400000),
      deadlineSource: "DEFAULT",
      aiState: "OK",
      status: "OPEN",
    },
  });
}

describe("TPA Query Workflow Integration", { timeout: 60000 }, () => {
  it("ingests email matching a SENT claim, moves claim to QUERY, and audits", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);
    const payer = await db.payer.findFirstOrThrow({
      where: { emailDomain: "company-b.example" },
    });

    await db.claim.update({
      where: { id: claim.id },
      data: { payerId: payer.id, status: "SENT" },
    });

    const query = await ingestQuery(exec.id, {
      fromAddress: "queries@company-b.example",
      subject: `Claim ${claim.code} - Urgent requirement for USG`,
      body: `Ref: ${claim.code}. Please send USG report within 6 hours.`,
    });

    expect(query.claimId).toBe(claim.id);
    expect(query.status).toBe("OPEN");

    const updatedClaim = await db.claim.findUniqueOrThrow({ where: { id: claim.id } });
    expect(updatedClaim.status).toBe("QUERY");

    const event = await db.claimEvent.findFirst({
      where: { claimId: claim.id, type: "QUERY_RAISED" },
    });
    expect(event).not.toBeNull();

    const audit = await db.auditEvent.findFirst({
      where: { entityType: "TpaQuery", entityId: query.id, action: "QUERY_INGESTED" },
    });
    expect(audit).not.toBeNull();
  });

  it("ingests email with patient name, suggesting claim without auto-linking", async () => {
    const patientName = "Arvind Bhosale";
    await db.tpaQuery.deleteMany({ where: { body: { contains: patientName } } });
    await db.claim.deleteMany({ where: { patient: { name: patientName } } });
    await db.patient.deleteMany({ where: { name: patientName } });

    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);
    const payer = await db.payer.findFirstOrThrow({
      where: { emailDomain: "company-b.example" },
    });
    const current = await db.claim.findUniqueOrThrow({ where: { id: claim.id } });
    await db.patient.update({
      where: { id: current.patientId },
      data: { name: patientName },
    });

    await db.claim.update({
      where: { id: claim.id },
      data: { payerId: payer.id, status: "SENT" },
    });

    const query = await ingestQuery(exec.id, {
      fromAddress: "queries@company-b.example",
      subject: "Clarification request",
      body: `Please furnish indoor papers for patient ${patientName}.`,
    });

    expect(query.claimId).toBeNull();
    expect(query.suggestedClaimId).toBe(claim.id);
    expect(query.deadlineSource).toBe("DEFAULT");
    expect(query.status).toBe("OPEN");

    const claimState = await db.claim.findUniqueOrThrow({ where: { id: claim.id } });
    expect(claimState.status).toBe("SENT");
  });

  it("links unmatched query to a SENT claim and transitions claim to QUERY", async () => {
    const head = await createTestUser("DESK_HEAD");
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    await db.claim.update({
      where: { id: claim.id },
      data: { status: "SENT" },
    });

    const query = await createOpenQuery(null);

    await linkQuery(head, {
      queryId: query.id,
      claimId: claim.id,
    });

    const updatedQuery = await db.tpaQuery.findUniqueOrThrow({ where: { id: query.id } });
    expect(updatedQuery.claimId).toBe(claim.id);

    const updatedClaim = await db.claim.findUniqueOrThrow({ where: { id: claim.id } });
    expect(updatedClaim.status).toBe("QUERY");

    const audit = await db.auditEvent.findFirst({
      where: { entityType: "TpaQuery", entityId: query.id, action: "QUERY_LINKED" },
    });
    expect(audit).not.toBeNull();
  });

  it("recording a reply marks query answered and returns claim to SENT", async () => {
    const exec = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(exec.id);

    await db.claim.update({
      where: { id: claim.id },
      data: { status: "QUERY" },
    });

    const query = await createOpenQuery(claim.id);

    await recordReply(exec, {
      queryId: query.id,
      replyBody: "Dear TPA, please find attached the requested details.",
      documentIds: [],
    });

    const answeredQuery = await db.tpaQuery.findUniqueOrThrow({ where: { id: query.id } });
    expect(answeredQuery.status).toBe("ANSWERED");
    expect(answeredQuery.repliedAt).not.toBeNull();
    expect(answeredQuery.repliedById).toBe(exec.id);

    const restoredClaim = await db.claim.findUniqueOrThrow({ where: { id: claim.id } });
    expect(restoredClaim.status).toBe("SENT");

    const event = await db.claimEvent.findFirst({
      where: { claimId: claim.id, type: "QUERY_ANSWERED" },
    });
    expect(event).not.toBeNull();
  });

  it("scopes queries: executive sees assigned and unmatched; desk head sees all", async () => {
    const head = await createTestUser("DESK_HEAD");
    const exec1 = await createTestUser("DESK_EXECUTIVE");
    const exec2 = await createTestUser("DESK_EXECUTIVE");

    const claim1 = await createTestClaim(exec1.id);
    const claim2 = await createTestClaim(exec2.id);

    const q1 = await createOpenQuery(claim1.id);
    const q2 = await createOpenQuery(claim2.id);
    const qUnmatched = await createOpenQuery(null);

    const exec1Inbox = await listInbox(exec1, "open");
    const exec1QueryIds = exec1Inbox.rows.map((q) => q.id);
    expect(exec1QueryIds).toContain(q1.id);
    expect(exec1QueryIds).toContain(qUnmatched.id);
    expect(exec1QueryIds).not.toContain(q2.id);

    const headInbox = await listInbox(head, "open");
    const headQueryIds = headInbox.rows.map((q) => q.id);
    expect(headQueryIds).toContain(q1.id);
    expect(headQueryIds).toContain(q2.id);
    expect(headQueryIds).toContain(qUnmatched.id);
  });
});
