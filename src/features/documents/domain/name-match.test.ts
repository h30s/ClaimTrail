import { describe, expect, it } from "vitest";
import { compareNames } from "./name-match";

describe("compareNames", () => {
  const patient = "Rajendra Pawar";

  it("matches exact names", () => {
    expect(compareNames(patient, "Rajendra Pawar")).toBe("MATCH");
  });

  it("ignores honorific titles", () => {
    expect(compareNames(patient, "Mr. Rajendra Pawar")).toBe("MATCH");
    expect(compareNames(patient, "Shri Rajendra Pawar")).toBe("MATCH");
  });

  it("matches initial and surname", () => {
    expect(compareNames(patient, "R. Pawar")).toBe("MATCH");
  });

  it("matches surname-first with middle initial", () => {
    expect(compareNames("Rajendra Shankar Pawar", "PAWAR RAJENDRA S.")).toBe("MATCH");
  });

  it("matches name with middle name added", () => {
    expect(compareNames(patient, "Rajendra Shankar Pawar")).toBe("MATCH");
  });

  it("flags different first name as MISMATCH", () => {
    expect(compareNames(patient, "Rajesh Pawar")).toBe("MISMATCH");
  });

  it("flags completely different patient as MISMATCH", () => {
    expect(compareNames(patient, "Sunita Deshmukh")).toBe("MISMATCH");
  });

  it("flags initials only as MISMATCH because no full word is present", () => {
    expect(compareNames("Rajendra Shankar Pawar", "R. S.")).toBe("MISMATCH");
  });

  it("returns UNCHECKED for non-Latin / Devanagari script", () => {
    expect(compareNames(patient, "राजेन्द्र पवार")).toBe("UNCHECKED");
  });

  it("returns UNCHECKED for null found name", () => {
    expect(compareNames(patient, null)).toBe("UNCHECKED");
  });
});
