import { describe, expect, it } from "vitest";
import {
  aiSortingRate,
  averageDischargeWait,
  deductionsByReason,
  pendingApprovals,
  sameDayReplyRate,
} from "./metrics";

describe("Dashboard Metrics Domain", () => {
  describe("sameDayReplyRate", () => {
    it("returns zero when no queries have been answered", () => {
      const res = sameDayReplyRate([]);
      expect(res).toEqual({ total: 0, sameDay: 0, rate: 0 });
    });

    it("calculates same-day reply rate according to IST calendar dates", () => {
      // 10:00 IST and 15:00 IST on same date
      const q1 = {
        receivedAt: new Date("2026-11-08T04:30:00Z"),
        repliedAt: new Date("2026-11-08T09:30:00Z"),
      };
      // Next day IST
      const q2 = {
        receivedAt: new Date("2026-11-08T04:30:00Z"),
        repliedAt: new Date("2026-11-09T04:30:00Z"),
      };
      // Not yet replied (ignored from total)
      const q3 = {
        receivedAt: new Date("2026-11-08T04:30:00Z"),
        repliedAt: null,
      };

      const res = sameDayReplyRate([q1, q2, q3]);
      expect(res.total).toBe(2);
      expect(res.sameDay).toBe(1);
      expect(res.rate).toBe(50);
    });
  });

  describe("averageDischargeWait", () => {
    it("returns zeros without NaN on empty input", () => {
      const res = averageDischargeWait([]);
      expect(res).toEqual({ hospitalMs: 0, payerMs: 0, totalMs: 0, count: 0 });
    });

    it("averages hospital and payer durations accurately", () => {
      const clocks = [
        { hospitalMs: 3600000, payerMs: 5400000 }, // 1h hosp, 1.5h payer
        { hospitalMs: 5400000, payerMs: 7200000 }, // 1.5h hosp, 2h payer
      ];
      const res = averageDischargeWait(clocks);
      expect(res.count).toBe(2);
      expect(res.hospitalMs).toBe(4500000); // 1.25h
      expect(res.payerMs).toBe(6300000); // 1.75h
      expect(res.totalMs).toBe(10800000); // 3h
    });
  });

  describe("deductionsByReason", () => {
    it("returns empty array on empty input", () => {
      expect(deductionsByReason([])).toEqual([]);
    });

    it("aggregates deductions, sorts descending, and computes shares", () => {
      const rows = [
        { reason: "MISSING_DOCUMENT" as const, amount: 40000 },
        { reason: "NON_PAYABLE_ITEM" as const, amount: 20000 },
        { reason: "MISSING_DOCUMENT" as const, amount: 20000 },
        { reason: "ROOM_RENT_LIMIT" as const, amount: 20000 },
      ];
      const res = deductionsByReason(rows);
      expect(res[0]?.reason).toBe("MISSING_DOCUMENT");
      expect(res[0]?.amount).toBe(60000);
      expect(res[0]?.share).toBe(60); // 60k of 100k
      expect(res[1]?.amount).toBe(20000);
      expect(res[1]?.share).toBe(20);
    });
  });

  describe("pendingApprovals", () => {
    it("sorts by elapsed time descending and flags IRDAI breaches", () => {
      const items = [
        {
          code: "CLM-1",
          patientName: "P1",
          payerName: "Insurer A",
          stage: "PRE_AUTH" as const,
          sinceMs: 1800000,
        }, // 30m, under 1h
        {
          code: "CLM-2",
          patientName: "P2",
          payerName: "Insurer B",
          stage: "PRE_AUTH" as const,
          sinceMs: 5400000,
        }, // 90m, past 1h
      ];
      const res = pendingApprovals(items);
      expect(res[0]?.code).toBe("CLM-2");
      expect(res[0]?.pastTarget).toBe(true);
      expect(res[0]?.overdueMs).toBe(1800000); // 30m past 1h
      expect(res[1]?.code).toBe("CLM-1");
      expect(res[1]?.pastTarget).toBe(false);
    });
  });

  describe("aiSortingRate", () => {
    it("returns zero when no eligible documents exist", () => {
      expect(aiSortingRate([])).toEqual({ total: 0, aiSorted: 0, rate: 0 });
    });

    it("computes percentage of documents sorted by AI without user movement", () => {
      const docs = [
        { sortedBy: "AI" as const, aiDocumentTypeKey: "FORM" },
        { sortedBy: "AI" as const, aiDocumentTypeKey: "REPORT" },
        { sortedBy: "USER" as const, aiDocumentTypeKey: "BILL" },
        { sortedBy: "USER" as const, aiDocumentTypeKey: null }, // unclassified, excluded
      ];
      const res = aiSortingRate(docs);
      expect(res.total).toBe(3);
      expect(res.aiSorted).toBe(2);
      expect(res.rate).toBe(67);
    });
  });
});
