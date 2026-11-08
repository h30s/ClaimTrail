import { describe, expect, it } from "vitest";
import { resolveDeadline } from "./resolve-deadline";

describe("resolveDeadline", () => {
  const receivedAt = new Date("2026-11-08T10:00:00.000Z");

  it("uses valid stated ISO deadline within 30-day window", () => {
    const statedIso = "2026-11-08T16:00:00.000Z";
    const res = resolveDeadline({ receivedAt, statedIso, defaultHours: 24 });

    expect(res.source).toBe("STATED");
    expect(res.dueAt.toISOString()).toBe(statedIso);
  });

  it("falls back to default hours when stated deadline is in the past", () => {
    const statedIso = "2026-11-08T09:00:00.000Z"; // 1 hour before receivedAt
    const res = resolveDeadline({ receivedAt, statedIso, defaultHours: 24 });

    expect(res.source).toBe("DEFAULT");
    expect(res.dueAt.getTime()).toBe(receivedAt.getTime() + 24 * 3_600_000);
  });

  it("falls back to default hours when stated deadline is more than 30 days out", () => {
    const statedIso = "2026-12-25T10:00:00.000Z"; // 47 days out
    const res = resolveDeadline({ receivedAt, statedIso, defaultHours: 24 });

    expect(res.source).toBe("DEFAULT");
    expect(res.dueAt.getTime()).toBe(receivedAt.getTime() + 24 * 3_600_000);
  });

  it("falls back to default hours when stated ISO is invalid or unparseable", () => {
    const res = resolveDeadline({ receivedAt, statedIso: "not-a-date", defaultHours: 12 });

    expect(res.source).toBe("DEFAULT");
    expect(res.dueAt.getTime()).toBe(receivedAt.getTime() + 12 * 3_600_000);
  });

  it("falls back to default hours when stated ISO is null", () => {
    const res = resolveDeadline({ receivedAt, statedIso: null, defaultHours: 48 });

    expect(res.source).toBe("DEFAULT");
    expect(res.dueAt.getTime()).toBe(receivedAt.getTime() + 48 * 3_600_000);
  });
});
