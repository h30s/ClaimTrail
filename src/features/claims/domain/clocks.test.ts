import { describe, expect, it } from "vitest";
import { computeClocks, holderOf, type TimelinePoint } from "./clocks";

describe("clocks", () => {
  const t0 = new Date("2026-11-08T10:00:00.000Z");
  const t1 = new Date("2026-11-08T10:30:00.000Z"); // +30m
  const t2 = new Date("2026-11-08T11:00:00.000Z"); // +30m (total 1h)
  const t3 = new Date("2026-11-08T11:45:00.000Z"); // +45m
  const t4 = new Date("2026-11-08T12:00:00.000Z"); // +15m
  const t5 = new Date("2026-11-08T12:30:00.000Z"); // +30m

  it("assigns holder correctly by status", () => {
    expect(holderOf("DRAFT")).toBe("HOSPITAL");
    expect(holderOf("QUERY")).toBe("HOSPITAL");
    expect(holderOf("SENT")).toBe("PAYER");
    expect(holderOf("APPROVED")).toBeNull();
    expect(holderOf("REJECTED")).toBeNull();
    expect(holderOf("SETTLED")).toBeNull();
  });

  it("counts all time for hospital in a draft-only claim", () => {
    const points: TimelinePoint[] = [{ at: t0, stage: "PRE_AUTH", status: "DRAFT" }];
    const report = computeClocks(points, t1);

    expect(report.byStage.PRE_AUTH?.hospitalMs).toBe(30 * 60 * 1000);
    expect(report.byStage.PRE_AUTH?.payerMs).toBe(0);
    expect(report.current).toEqual({
      holder: "HOSPITAL",
      stage: "PRE_AUTH",
      sinceMs: 30 * 60 * 1000,
    });
  });

  it("splits draft -> sent -> query -> sent -> approved correctly", () => {
    const points: TimelinePoint[] = [
      { at: t0, stage: "PRE_AUTH", status: "DRAFT" }, // 30m hospital
      { at: t1, stage: "PRE_AUTH", status: "SENT" }, // 30m payer
      { at: t2, stage: "PRE_AUTH", status: "QUERY" }, // 45m hospital
      { at: t3, stage: "PRE_AUTH", status: "SENT" }, // 15m payer
      { at: t4, stage: "PRE_AUTH", status: "APPROVED" },
    ];
    const report = computeClocks(points, t5);

    // Hospital: 30m (t0-t1) + 45m (t2-t3) = 75m
    expect(report.byStage.PRE_AUTH?.hospitalMs).toBe(75 * 60 * 1000);
    // Payer: 30m (t1-t2) + 15m (t3-t4) = 45m
    expect(report.byStage.PRE_AUTH?.payerMs).toBe(45 * 60 * 1000);
    // Time after APPROVED (t4-t5) counts for nobody
    expect(report.current).toBeNull();
  });

  it("isolates clocks by stage", () => {
    const points: TimelinePoint[] = [
      { at: t0, stage: "PRE_AUTH", status: "DRAFT" },
      { at: t1, stage: "PRE_AUTH", status: "APPROVED" },
      { at: t2, stage: "ENHANCEMENT", status: "DRAFT" },
      { at: t3, stage: "ENHANCEMENT", status: "SENT" },
    ];
    const report = computeClocks(points, t4);

    expect(report.byStage.PRE_AUTH?.hospitalMs).toBe(30 * 60 * 1000);
    expect(report.byStage.ENHANCEMENT?.hospitalMs).toBe(45 * 60 * 1000);
    expect(report.byStage.ENHANCEMENT?.payerMs).toBe(15 * 60 * 1000);
    expect(report.current?.stage).toBe("ENHANCEMENT");
    expect(report.current?.holder).toBe("PAYER");
  });

  it("sorts out-of-order points", () => {
    const points: TimelinePoint[] = [
      { at: t1, stage: "PRE_AUTH", status: "SENT" },
      { at: t0, stage: "PRE_AUTH", status: "DRAFT" },
    ];
    const report = computeClocks(points, t2);

    expect(report.byStage.PRE_AUTH?.hospitalMs).toBe(30 * 60 * 1000);
    expect(report.byStage.PRE_AUTH?.payerMs).toBe(30 * 60 * 1000);
  });
});
