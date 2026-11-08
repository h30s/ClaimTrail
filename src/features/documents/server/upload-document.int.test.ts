import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors";
import { db } from "@/lib/db";
import { createTestClaim, createTestUser } from "../../../../test/factories";
import { renderSamplePdf } from "../../../../prisma/seed/render-sample-pdf";
import { MAX_UPLOAD_BYTES } from "../domain/file-rules";
import { uploadDocument } from "./upload-document";

describe("Document Upload (Integration)", () => {
  it("rejects an HTML file disguised as .pdf with ValidationError", async () => {
    const user = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(user.id);

    const fakeBytes = new TextEncoder().encode(
      "<!DOCTYPE html><html><body><h1>Fake document</h1></body></html>",
    );

    await expect(
      uploadDocument(user, claim.code, {
        name: "disguised-fake.pdf",
        bytes: fakeBytes,
      }),
    ).rejects.toThrow(ValidationError);

    const count = await db.document.count({ where: { claimId: claim.id } });
    expect(count).toBe(0);
  });

  it("rejects an empty file with ValidationError", async () => {
    const user = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(user.id);

    await expect(
      uploadDocument(user, claim.code, {
        name: "empty.pdf",
        bytes: new Uint8Array(0),
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects a file exceeding the 4MB limit", async () => {
    const user = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(user.id);

    // 4MB + 1 byte
    const largeBytes = new Uint8Array(MAX_UPLOAD_BYTES + 1);

    await expect(
      uploadDocument(user, claim.code, {
        name: "oversized.pdf",
        bytes: largeBytes,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("successfully uploads a genuine PDF and processes document record", async () => {
    const user = await createTestUser("DESK_EXECUTIVE");
    const claim = await createTestClaim(user.id);

    const validPdfBytes = await renderSamplePdf({
      title: "Chest Radiography Report",
      patientName: "Test Patient",
      date: "2026-11-08",
      lines: [
        "Digital Radiography PA View",
        "Clinical Indication: Routine Pre-operative Evaluation",
        "Bilateral lung fields clear. Cardiac silhouette normal.",
        "Impression: Normal pre-operative chest radiograph.",
      ],
    });

    const doc = await uploadDocument(user, claim.code, {
      name: "chest-xray-normal.pdf",
      bytes: validPdfBytes,
    });

    expect(doc).toBeDefined();
    expect(doc.claimId).toBe(claim.id);
    expect(doc.mimeType).toBe("application/pdf");
    expect(doc.fileName).toBe("chest-xray-normal.pdf");

    // Verify persisted in DB
    const persisted = await db.document.findUnique({
      where: { id: doc.id },
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBeDefined();

    // Verify audit event written
    const audit = await db.auditEvent.findFirst({
      where: {
        entityId: doc.id,
        action: "DOCUMENT_UPLOADED",
      },
    });
    expect(audit).not.toBeNull();
  }, 30_000);
});
