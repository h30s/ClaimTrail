import { describe, expect, it } from "vitest";
import { normaliseSuggestion, valueSchemaFor } from "./field-value";

describe("valueSchemaFor", () => {
  it("validates text within 120 chars", () => {
    const schema = valueSchemaFor("text");
    expect(schema.safeParse("Rajendra Pawar").success).toBe(true);
    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("a".repeat(121)).success).toBe(false);
  });

  it("validates longText up to 600 chars", () => {
    const schema = valueSchemaFor("longText");
    expect(schema.safeParse("Severe pain for 3 days").success).toBe(true);
    expect(schema.safeParse("a".repeat(601)).success).toBe(false);
  });

  it("validates integer numbers", () => {
    const schema = valueSchemaFor("integer");
    expect(schema.safeParse("54").success).toBe(true);
    expect(schema.safeParse("0").success).toBe(true);
    expect(schema.safeParse("-5").success).toBe(false);
    expect(schema.safeParse("54.5").success).toBe(false);
    expect(schema.safeParse("1000").success).toBe(false); // max 3 digits
  });

  it("validates rupees digits", () => {
    const schema = valueSchemaFor("rupees");
    expect(schema.safeParse("85000").success).toBe(true);
    expect(schema.safeParse("0").success).toBe(true);
    expect(schema.safeParse("85,000").success).toBe(false); // must be normalised first
    expect(schema.safeParse("Rs 85000").success).toBe(false);
  });

  it("validates ISO dates", () => {
    const schema = valueSchemaFor("date");
    expect(schema.safeParse("2026-11-08").success).toBe(true);
    expect(schema.safeParse("08/11/2026").success).toBe(false); // must be normalised first
  });

  it("validates gender enums", () => {
    const schema = valueSchemaFor("gender");
    expect(schema.safeParse("MALE").success).toBe(true);
    expect(schema.safeParse("FEMALE").success).toBe(true);
    expect(schema.safeParse("OTHER").success).toBe(true);
    expect(schema.safeParse("Male").success).toBe(false); // must be normalised first
  });
});

describe("normaliseSuggestion", () => {
  it("normalises rupees with symbols, commas and decimals", () => {
    expect(normaliseSuggestion("rupees", "₹ 85,000")).toBe("85000");
    expect(normaliseSuggestion("rupees", "Rs. 2,40,000.00")).toBe("240000");
    expect(normaliseSuggestion("rupees", "INR 70000")).toBe("70000");
  });

  it("normalises integers with suffixes", () => {
    expect(normaliseSuggestion("integer", "54 yrs")).toBe("54");
    expect(normaliseSuggestion("integer", "34 years")).toBe("34");
    expect(normaliseSuggestion("integer", "2 days")).toBe("2");
  });

  it("normalises gender strings to uppercase enums", () => {
    expect(normaliseSuggestion("gender", "male")).toBe("MALE");
    expect(normaliseSuggestion("gender", "Female")).toBe("FEMALE");
    expect(normaliseSuggestion("gender", "M")).toBe("MALE");
    expect(normaliseSuggestion("gender", "F")).toBe("FEMALE");
  });

  it("normalises Indian DD/MM/YYYY dates to ISO YYYY-MM-DD", () => {
    expect(normaliseSuggestion("date", "08/11/2026")).toBe("2026-11-08");
    expect(normaliseSuggestion("date", "8-11-2026")).toBe("2026-11-08");
    expect(normaliseSuggestion("date", "2026-11-08T12:00:00Z")).toBe("2026-11-08");
  });

  it("normalises text whitespace", () => {
    expect(normaliseSuggestion("text", "  Dr.   Anand   Kale  ")).toBe("Dr. Anand Kale");
  });
});
