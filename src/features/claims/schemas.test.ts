import { describe, expect, it } from "vitest";
import { RecordSettlementSchema } from "./schemas";

describe("RecordSettlementSchema", () => {
  it("accepts settlement with zero deductions when settled equals billed", () => {
    const res = RecordSettlementSchema.safeParse({
      claimCode: "CLM-3393",
      billedAmount: 120000,
      settledAmount: 120000,
      deductions: [],
    });
    expect(res.success).toBe(true);
  });

  it("accepts valid itemized deductions summing exactly to billed minus settled", () => {
    const res = RecordSettlementSchema.safeParse({
      claimCode: "CLM-3393",
      billedAmount: 150000,
      settledAmount: 110000,
      deductions: [
        { reason: "MISSING_DOCUMENT", amount: 25000, note: "Indoor case sheet omitted" },
        { reason: "NON_PAYABLE_ITEM", amount: 15000, note: "Gloves and syringes" },
      ],
    });
    expect(res.success).toBe(true);
  });

  it("fails when deductions do not sum to the difference", () => {
    const res = RecordSettlementSchema.safeParse({
      claimCode: "CLM-3393",
      billedAmount: 150000,
      settledAmount: 110000,
      deductions: [{ reason: "MISSING_DOCUMENT", amount: 20000 }],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const deductionError = res.error.issues.find((i) => i.path.includes("deductions"));
      expect(deductionError?.message).toContain("Deductions must add up to ₹40,000 (billed − settled).");
    }
  });

  it("fails when settled amount exceeds billed amount", () => {
    const res = RecordSettlementSchema.safeParse({
      claimCode: "CLM-3393",
      billedAmount: 100000,
      settledAmount: 120000,
      deductions: [],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path.includes("settledAmount"));
      expect(issue?.message).toBe("Settled amount cannot exceed billed amount");
    }
  });
});
