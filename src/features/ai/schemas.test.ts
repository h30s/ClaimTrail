import { describe, expect, it } from "vitest";
import { documentAnalysisSchema, querySummarySchema } from "./schemas";

describe("documentAnalysisSchema", () => {
  const schema = documentAnalysisSchema(["AADHAAR", "PAN_CARD", "USG_REPORT"]);

  it("validates a complete, valid document analysis payload", () => {
    const valid = {
      documentType: "AADHAAR",
      confidence: 0.95,
      alternatives: [{ documentType: "PAN_CARD", confidence: 0.2 }],
      reason: "Clear Aadhaar card with photo and 12-digit number",
      isLegible: true,
      patientName: "Rajendra Pawar",
      documentDate: "2026-03-15",
      fields: [
        {
          key: "patientName",
          value: "Rajendra Pawar",
          sourceSnippet: "Name: Rajendra Pawar",
          confidence: 0.95,
        },
      ],
    };

    const parsed = schema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.documentType).toBe("AADHAAR");
      expect(parsed.data.confidence).toBe(0.95);
      expect(parsed.data.fields).toHaveLength(1);
    }
  });

  it("permits UNKNOWN documentType", () => {
    const input = {
      documentType: "UNKNOWN",
      confidence: 0.3,
      alternatives: [],
      reason: "Could not identify document type",
      isLegible: false,
      patientName: null,
      documentDate: null,
      fields: [],
    };
    const parsed = schema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid documentType not in enum", () => {
    const invalid = {
      documentType: "NON_EXISTENT_DOC",
      confidence: 0.8,
      alternatives: [],
      reason: "Something",
      isLegible: true,
      patientName: null,
      documentDate: null,
      fields: [],
    };
    const parsed = schema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects confidence out of range", () => {
    const invalid = {
      documentType: "AADHAAR",
      confidence: 1.5,
      alternatives: [],
      reason: "Confidence above 1",
      isLegible: true,
      patientName: null,
      documentDate: null,
      fields: [],
    };
    const parsed = schema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

describe("querySummarySchema", () => {
  const schema = querySummarySchema(["USG_REPORT", "DISCHARGE_SUMMARY"]);

  it("validates valid query summary with asks", () => {
    const valid = {
      summary: "Payer requests fresh USG report and discharge summary",
      asks: [
        {
          position: 1,
          text: "Please provide latest USG report",
          documentType: "USG_REPORT",
          sourceSnippet: "Provide latest USG report",
        },
      ],
      claimReference: "TPA-99823",
      patientName: "Rajendra Pawar",
      deadline: {
        iso: "2026-11-10T12:00:00.000Z",
        sourceSnippet: "within 24 hours",
      },
    };

    const parsed = schema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.asks).toHaveLength(1);
      expect(parsed.data.claimReference).toBe("TPA-99823");
    }
  });
});
