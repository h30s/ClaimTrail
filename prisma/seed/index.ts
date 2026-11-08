import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { SEED_USERS } from "./data/users";
import { SEED_PAYERS } from "./data/payers";
import { SEED_PROCEDURES } from "./data/procedures";
import { SEED_DOCUMENT_TYPES } from "./data/document-types";
import { SEED_CHECKLIST_RULES } from "./data/checklist-rules";
import { seedClaims } from "./seed-claims";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "ClaimTrail2026!";

async function main() {
  console.log("Seeding catalog, rules, claims, and demo users...");

  // Delete in reverse dependency order (wipe)
  await db.account.deleteMany();
  await db.session.deleteMany();
  await db.verification.deleteMany();
  await db.rateLimit.deleteMany();
  await db.checklistRule.deleteMany();
  await db.document.deleteMany();
  await db.queryAsk.deleteMany();
  await db.tpaQuery.deleteMany();
  await db.claimField.deleteMany();
  await db.fieldSuggestion.deleteMany();
  await db.claimEvent.deleteMany();
  await db.submission.deleteMany();
  await db.deduction.deleteMany();
  await db.doctorApproval.deleteMany();
  await db.claim.deleteMany();
  await db.patient.deleteMany();
  await db.auditEvent.deleteMany();
  await db.user.deleteMany();
  await db.payer.deleteMany();
  await db.procedure.deleteMany();
  await db.documentType.deleteMany();

  // 1. Users
  const hashedPassword = await hashPassword(DEMO_PASSWORD);
  let meeraId = "";
  const userMap = new Map<string, string>();
  for (const u of SEED_USERS) {
    const id = crypto.randomUUID();
    if (u.role === "DESK_HEAD") meeraId = id;
    userMap.set(u.email, id);
    await db.user.create({
      data: {
        id,
        name: u.name,
        email: u.email,
        role: u.role,
        emailVerified: true,
        active: true,
      },
    });
    await db.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: hashedPassword,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_USERS.length} users with demo credentials.`);

  // 2. Payers
  const payerMap = new Map<string, string>();
  for (const p of SEED_PAYERS) {
    const created = await db.payer.create({
      data: {
        name: p.name,
        kind: p.kind,
        emailDomain: p.emailDomain,
        queryReplyHours: p.queryReplyHours,
      },
    });
    payerMap.set(p.name, created.id);
  }
  console.log(`✓ Seeded ${SEED_PAYERS.length} payers.`);

  // 3. Procedures
  const procedureMap = new Map<string, string>();
  for (const name of SEED_PROCEDURES) {
    const created = await db.procedure.create({
      data: { name },
    });
    procedureMap.set(name, created.id);
  }
  console.log(`✓ Seeded ${SEED_PROCEDURES.length} procedures.`);

  // 4. Document Types
  const docTypeMap = new Map<string, string>();
  for (const dt of SEED_DOCUMENT_TYPES) {
    const created = await db.documentType.create({
      data: {
        key: dt.key,
        label: dt.label,
        description: dt.description,
        sortOrder: dt.sortOrder,
      },
    });
    docTypeMap.set(dt.key, created.id);
  }
  console.log(`✓ Seeded ${SEED_DOCUMENT_TYPES.length} document types.`);

  // 5. Checklist Rules
  for (const rule of SEED_CHECKLIST_RULES) {
    const documentTypeId = docTypeMap.get(rule.documentTypeKey);
    if (!documentTypeId) {
      throw new Error(`Unknown document type key: ${rule.documentTypeKey}`);
    }
    const payerId = rule.payerName ? (payerMap.get(rule.payerName) ?? null) : null;
    const procedureId = rule.procedureName ? (procedureMap.get(rule.procedureName) ?? null) : null;

    await db.checklistRule.create({
      data: {
        payerId,
        procedureId,
        stage: rule.stage,
        documentTypeId,
        requirement: rule.requirement,
        needsFreshCopy: rule.needsFreshCopy ?? false,
        note: rule.note ?? null,
        updatedById: meeraId,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_CHECKLIST_RULES.length} checklist rules.`);

  // 6. Claims
  await seedClaims(db, { userMap, payerMap, procedureMap });

  console.log("Database seeded successfully.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
