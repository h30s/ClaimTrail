import { describe, expect, it } from "vitest";
import { formatDateTime, formatDuration, formatInr, formatLakh, istDateKey } from "./format";

describe("format helpers", () => {
  it("formats rupees using Indian grouping", () => {
    expect(formatInr(85000)).toBe("₹85,000");
    expect(formatInr(6357000)).toBe("₹63,57,000");
  });

  it("formats lakh amounts", () => {
    expect(formatLakh(5304000)).toBe("₹53.0 L");
    expect(formatLakh(85000)).toBe("₹0.8 L");
    expect(formatLakh(90000)).toBe("₹0.9 L");
  });

  it("formats IST date-time strings", () => {
    const utcDate = new Date("2026-11-07T12:30:00.000Z");
    const formatted = formatDateTime(utcDate);
    expect(formatted).toContain("7 Nov");
    expect(formatted).toContain("18:00");
  });

  it("computes IST date keys across midnight boundaries", () => {
    const lateUtc = new Date("2026-11-07T20:00:00.000Z");
    expect(istDateKey(lateUtc)).toBe("2026-11-08");
  });

  it("formats durations in days, hours, and minutes", () => {
    expect(formatDuration(25 * 60 * 1000)).toBe("25m");
    expect(formatDuration(90 * 60 * 1000)).toBe("1h 30m");
    expect(formatDuration((24 * 60 + 120) * 60 * 1000)).toBe("1d 2h");
  });
});
