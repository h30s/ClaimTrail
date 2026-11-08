import { describe, expect, it } from "vitest";
import { sanitizePdfText } from "./sanitize-pdf-text";

describe("sanitizePdfText", () => {
  it("replaces rupee symbol with Rs.", () => {
    expect(sanitizePdfText("Estimated cost (₹): ₹ 1,50,000")).toBe("Estimated cost (Rs.): Rs. 1,50,000");
  });

  it("normalizes smart quotes and dashes", () => {
    expect(sanitizePdfText("“Patient” — test")).toBe('"Patient" - test');
  });

  it("handles empty string gracefully", () => {
    expect(sanitizePdfText("")).toBe("");
  });
});
