import { describe, expect, it } from "vitest";
import { describeAudit } from "./describe-audit";

describe("describeAudit", () => {
  it("describes claim transitions", () => {
    expect(
      describeAudit({
        action: "CLAIM_TRANSITIONED",
        data: { decision: "APPROVE", approvedAmount: 50000 },
      }),
    ).toContain("Approved for ₹50,000");

    expect(
      describeAudit({
        action: "CLAIM_TRANSITIONED",
        data: { decision: "REJECT", reason: "Policy lapsed" },
      }),
    ).toContain("Rejected: Policy lapsed");
  });

  it("describes settlements", () => {
    expect(
      describeAudit({
        action: "CLAIM_SETTLED",
        data: { billedAmount: 100000, settledAmount: 85000 },
      }),
    ).toContain("Settled ₹85,000 of ₹1,00,000");
  });

  it("describes document and query actions", () => {
    expect(
      describeAudit({
        action: "DOCUMENT_UPLOADED",
        data: { fileName: "report.pdf" },
      }),
    ).toContain('Uploaded file "report.pdf"');

    expect(
      describeAudit({
        action: "QUERY_INGESTED",
        data: { subject: "Need USG" },
      }),
    ).toContain('Ingested email: "Need USG"');
  });
});
