import { describe, expect, it } from "vitest";
import { findClaimCode, matchQueryToClaim, type MatchCandidate } from "./match-claim";

describe("findClaimCode", () => {
  it("extracts codes in various formats", () => {
    expect(findClaimCode("Re: Claim CLM-3381 update")).toBe("CLM-3381");
    expect(findClaimCode("Re: Claim CLM 3381 - documents")).toBe("CLM-3381");
    expect(findClaimCode("Query regarding CLM3381")).toBe("CLM-3381");
    expect(findClaimCode("clm-9942 status")).toBe("CLM-9942");
  });

  it("returns null when no valid claim code is found", () => {
    expect(findClaimCode("Re: Hospital cashless request")).toBeNull();
    expect(findClaimCode("CLM-12")).toBeNull(); // Less than 4 digits
  });
});

describe("matchQueryToClaim", () => {
  const candidates: MatchCandidate[] = [
    {
      id: "claim-1",
      code: "CLM-3381",
      payerReference: "STAR-REF-991",
      patientName: "Rajendra Pawar",
      payerId: "payer-1",
    },
    {
      id: "claim-2",
      code: "CLM-3382",
      payerReference: "HDFC-REF-100",
      patientName: "Vikas More",
      payerId: "payer-2",
    },
    {
      id: "claim-3",
      code: "CLM-3383",
      payerReference: null,
      patientName: "Vikas More",
      payerId: "payer-3",
    },
  ];

  it("matches exactly by claim code regardless of formatting", () => {
    const res = matchQueryToClaim(
      { claimRef: "clm 3381", patientName: null, payerId: "payer-1" },
      candidates,
    );
    expect(res).toEqual({ kind: "EXACT", claimId: "claim-1", via: "CLAIM_CODE" });
  });

  it("matches exactly by payer reference", () => {
    const res = matchQueryToClaim(
      { claimRef: "STAR-REF-991", patientName: null, payerId: "payer-1" },
      candidates,
    );
    expect(res).toEqual({ kind: "EXACT", claimId: "claim-1", via: "PAYER_REFERENCE" });
  });

  it("suggests a claim when a single candidate matches the patient name for that payer", () => {
    const res = matchQueryToClaim(
      { claimRef: null, patientName: "Rajendra Pawar", payerId: "payer-1" },
      candidates,
    );
    expect(res).toEqual({ kind: "SUGGESTED", claimId: "claim-1" });
  });

  it("returns NONE when patient name matches multiple candidates in the same pool", () => {
    const multiPool: MatchCandidate[] = [
      { id: "c1", code: "CLM-1001", payerReference: null, patientName: "Anil Patil", payerId: "p1" },
      { id: "c2", code: "CLM-1002", payerReference: null, patientName: "Anil Patil", payerId: "p1" },
    ];

    const res = matchQueryToClaim({ claimRef: null, patientName: "Anil Patil", payerId: "p1" }, multiPool);
    expect(res).toEqual({ kind: "NONE" });
  });

  it("returns NONE when patient name matches but under a different payer", () => {
    const res = matchQueryToClaim(
      { claimRef: null, patientName: "Rajendra Pawar", payerId: "payer-2" },
      candidates,
    );
    expect(res).toEqual({ kind: "NONE" });
  });

  it("returns NONE when neither reference nor name match", () => {
    const res = matchQueryToClaim(
      { claimRef: null, patientName: "Unknown Person", payerId: "payer-1" },
      candidates,
    );
    expect(res).toEqual({ kind: "NONE" });
  });
});
