import type { DeductionReason } from "@/lib/enums";

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SettledClaimSeed = {
  code: string;
  patientName: string;
  patientGender: "MALE" | "FEMALE" | "OTHER";
  patientDob: string;
  uhid: string;
  policyNumber: string;
  payerName: string;
  procedureName: string;
  treatingDoctor: string;
  admittedDaysAgo: number;
  settledDaysAgo: number;
  estimatedAmount: number;
  approvedAmount: number;
  billedAmount: number;
  settledAmount: number;
  prepMinutes: number;
  payerMinutes: number;
  deductions: Array<{
    reason: DeductionReason;
    amount: number;
    note?: string;
  }>;
  historicalQuery?: {
    receivedHoursBeforeReply: number;
    sameDay: boolean;
    subject: string;
    body: string;
    replyText: string;
  };
};

const DOCTORS = ["Dr. Kale", "Dr. B. Deshmukh", "Dr. S. Patil", "Dr. R. Joshi"];
const FIRST_NAMES_M = [
  "Suresh",
  "Vijay",
  "Manoj",
  "Pradeep",
  "Dattatray",
  "Ganesh",
  "Mahesh",
  "Nitin",
  "Sachin",
];
const FIRST_NAMES_F = [
  "Sunita",
  "Shobha",
  "Mangala",
  "Usha",
  "Surekha",
  "Jyoti",
  "Aparna",
  "Rekha",
  "Vandana",
];
const LAST_NAMES = [
  "Patil",
  "Deshmukh",
  "Kulkarni",
  "Shinde",
  "Jadhav",
  "Gaikwad",
  "Chavan",
  "Pawar",
  "More",
];

const DEDUCTION_POOL: Array<{ reason: DeductionReason; weight: number }> = [
  { reason: "MISSING_DOCUMENT", weight: 38 },
  { reason: "NON_PAYABLE_ITEM", weight: 25 },
  { reason: "ROOM_RENT_LIMIT", weight: 15 },
  { reason: "TARIFF_DIFFERENCE", weight: 10 },
  { reason: "CO_PAYMENT", weight: 7 },
  { reason: "OTHER", weight: 5 },
];

function pickReason(rnd: () => number): DeductionReason {
  const roll = rnd() * 100;
  let cum = 0;
  for (const item of DEDUCTION_POOL) {
    cum += item.weight;
    if (roll <= cum) return item.reason;
  }
  return "OTHER";
}

export function generateSettledClaims(
  payers: readonly string[],
  procedures: readonly string[],
): SettledClaimSeed[] {
  const rnd = mulberry32(42);
  const result: SettledClaimSeed[] = [];

  for (let i = 0; i < 36; i++) {
    const code = `CLM-${3200 + i}`;
    const isFemale = rnd() > 0.5;
    const firstNames = isFemale ? FIRST_NAMES_F : FIRST_NAMES_M;
    const firstName = firstNames[Math.floor(rnd() * firstNames.length)]!;
    const lastName = LAST_NAMES[Math.floor(rnd() * LAST_NAMES.length)]!;
    const patientName = `${firstName} ${lastName}`;
    const patientGender = isFemale ? "FEMALE" : "MALE";
    const age = 28 + Math.floor(rnd() * 45);
    const birthYear = 2026 - age;
    const patientDob = `${birthYear}-0${1 + Math.floor(rnd() * 8)}-15`;
    const uhid = `UHID-${2025000 + i * 17}`;

    const payerName = payers[Math.floor(rnd() * payers.length)]!;
    const procedureName = procedures[Math.floor(rnd() * procedures.length)]!;
    const policyNumber = `DEMO-HIST-${88000 + i}`;
    const treatingDoctor = DOCTORS[Math.floor(rnd() * DOCTORS.length)]!;

    // Spread over last 170 days
    const settledDaysAgo = Math.floor(1 + (i / 36) * 160 + rnd() * 6);
    const stayDays = 2 + Math.floor(rnd() * 4);
    const admittedDaysAgo = settledDaysAgo + stayDays;

    const baseCost = 75000 + Math.floor(rnd() * 110000);
    const estimatedAmount = Math.round(baseCost / 1000) * 1000;
    const billedAmount = Math.round((estimatedAmount * (0.95 + rnd() * 0.25)) / 1000) * 1000;
    const preauthApproved = Math.round((estimatedAmount * 0.9) / 1000) * 1000;

    // Realistic discharge wait: hospital prep 40-120 min, insurer decision 60-200 min
    const prepMinutes = 40 + Math.floor(rnd() * 80);
    const payerMinutes = 60 + Math.floor(rnd() * 140);

    // Deductions on ~70% of claims (about 25 claims)
    const hasDeductions = rnd() < 0.72;
    const deductions: SettledClaimSeed["deductions"] = [];
    let deductionTotal = 0;

    if (hasDeductions) {
      const lineCount = rnd() < 0.65 ? 1 : 2;
      for (let l = 0; l < lineCount; l++) {
        const reason = pickReason(rnd);
        // 1-6% of billed
        const pct = 0.015 + rnd() * 0.045;
        const lineAmount = Math.max(500, Math.round((billedAmount * pct) / 100) * 100);
        deductions.push({
          reason,
          amount: lineAmount,
          note: `Itemized deduction for ${reason.toLowerCase().replace(/_/g, " ")}`,
        });
        deductionTotal += lineAmount;
      }
    }

    const settledAmount = Math.max(0, billedAmount - deductionTotal);

    // ~86% answered on same calendar day
    const hasQuery = i < 30;
    let historicalQuery: SettledClaimSeed["historicalQuery"] = undefined;
    if (hasQuery) {
      const sameDay = rnd() < 0.86;
      const hours = sameDay ? 1 + Math.floor(rnd() * 4) : 18 + Math.floor(rnd() * 14);
      historicalQuery = {
        receivedHoursBeforeReply: hours,
        sameDay,
        subject: `Query regarding ${code} final billing`,
        body: `Please provide itemized pharmacy bill and discharge summary for ${patientName}.`,
        replyText: "Attached requested itemized breakdown and signed summary.",
      };
    }

    result.push({
      code,
      patientName,
      patientGender,
      patientDob,
      uhid,
      policyNumber,
      payerName,
      procedureName,
      treatingDoctor,
      admittedDaysAgo,
      settledDaysAgo,
      estimatedAmount,
      approvedAmount: preauthApproved,
      billedAmount,
      settledAmount,
      prepMinutes,
      payerMinutes,
      deductions,
      historicalQuery,
    });
  }

  return result;
}
