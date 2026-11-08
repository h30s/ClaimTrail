import type { ClaimSeed } from "./claims-types";

export const SEED_BRIEF_CLAIMS: readonly ClaimSeed[] = [
  // 1. CLM-3381
  {
    code: "CLM-3381",
    patient: { name: "Rajendra Pawar", gender: "MALE", age: 54, uhid: "NSK-204501" },
    payerName: "Company B",
    procedureName: "Gall bladder removal",
    policyNumber: "DEMO-B-104921",
    treatingDoctor: "Dr. Anand Kale",
    estimatedAmount: 85000,
    assigneeEmail: "arjun.patil@claimtrail.example",
    story: [
      { event: "CREATED", minutesAgo: 250 },
      { event: "SUBMIT", minutesAgo: 210, note: "Patient in pain, USG booked for this afternoon" },
      { event: "RAISE_QUERY", minutesAgo: 140 },
    ],
  },
  // 2. CLM-3382
  {
    code: "CLM-3382",
    patient: { name: "Sunita Deshmukh", gender: "FEMALE", age: 66, uhid: "NSK-204502" },
    payerName: "Company C",
    procedureName: "Total knee replacement",
    policyNumber: "DEMO-C-229104",
    treatingDoctor: "Dr. Sameer Inamdar",
    estimatedAmount: 240000,
    assigneeEmail: "arjun.patil@claimtrail.example",
    story: [
      { event: "CREATED", minutesAgo: 120 },
      { event: "SUBMIT", minutesAgo: 40 },
    ],
  },
  // 3. CLM-3385
  {
    code: "CLM-3385",
    patient: { name: "Imran Shaikh", gender: "MALE", age: 29, uhid: "NSK-204505" },
    payerName: "Company D",
    procedureName: "Dengue with low platelets",
    policyNumber: "DEMO-D-401928",
    treatingDoctor: "Dr. Rekha Wani",
    estimatedAmount: 70000,
    approvedAmount: 45000,
    assigneeEmail: "sneha.joshi@claimtrail.example",
    story: [
      { event: "CREATED", minutesAgo: 2880 },
      { event: "SUBMIT", minutesAgo: 2800 },
      { event: "APPROVE", minutesAgo: 2750, note: "Approved ₹45,000" },
      { event: "START_ENHANCEMENT", minutesAgo: 180 },
    ],
  },
];
