import { describe, expect, it } from "vitest";
import { getCountdown } from "./countdown";

describe("getCountdown", () => {
  const base = new Date("2026-11-08T10:00:00.000Z");

  it("marks as answered on time when repliedAt <= dueAt", () => {
    const dueAt = new Date("2026-11-08T14:00:00.000Z");
    const repliedAt = new Date("2026-11-08T13:30:00.000Z");
    const res = getCountdown({ now: base, dueAt, repliedAt });
    expect(res.state).toBe("ANSWERED");
    expect(res.answeredOnTime).toBe(true);
    expect(res.msLeft).toBe(30 * 60 * 1000);
  });

  it("marks as answered late when repliedAt > dueAt", () => {
    const dueAt = new Date("2026-11-08T14:00:00.000Z");
    const repliedAt = new Date("2026-11-08T14:15:00.000Z");
    const res = getCountdown({ now: base, dueAt, repliedAt });
    expect(res.state).toBe("ANSWERED");
    expect(res.answeredOnTime).toBe(false);
    expect(res.msLeft).toBe(-15 * 60 * 1000);
  });

  it("identifies overdue state when now is past dueAt", () => {
    const dueAt = new Date("2026-11-08T09:30:00.000Z");
    const res = getCountdown({ now: base, dueAt, repliedAt: null });
    expect(res.state).toBe("OVERDUE");
    expect(res.msLeft).toBe(-30 * 60 * 1000);
    expect(res.answeredOnTime).toBeNull();
  });

  it("handles boundary at exactly -1 ms as overdue", () => {
    const dueAt = new Date(base.getTime() - 1);
    const res = getCountdown({ now: base, dueAt, repliedAt: null });
    expect(res.state).toBe("OVERDUE");
    expect(res.msLeft).toBe(-1);
  });

  it("handles boundary at exactly 0 ms as due soon", () => {
    const dueAt = base;
    const res = getCountdown({ now: base, dueAt, repliedAt: null });
    expect(res.state).toBe("DUE_SOON");
    expect(res.msLeft).toBe(0);
  });

  it("identifies due soon when within 2 hours", () => {
    const dueAt = new Date(base.getTime() + 90 * 60 * 1000); // 1h 30m
    const res = getCountdown({ now: base, dueAt, repliedAt: null });
    expect(res.state).toBe("DUE_SOON");
    expect(res.msLeft).toBe(90 * 60 * 1000);
  });

  it("identifies on track when more than 2 hours left", () => {
    const dueAt = new Date(base.getTime() + 3 * 60 * 60 * 1000); // 3h
    const res = getCountdown({ now: base, dueAt, repliedAt: null });
    expect(res.state).toBe("ON_TRACK");
    expect(res.msLeft).toBe(3 * 60 * 60 * 1000);
  });
});
