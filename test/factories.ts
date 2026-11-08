import type { Role } from "@/lib/enums";
import type { SessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function createTestUser(role: Role = "DESK_EXECUTIVE"): Promise<SessionUser> {
  const id = crypto.randomUUID();
  const user = await db.user.create({
    data: {
      id,
      name: `Test User ${id.slice(0, 6)}`,
      email: `test-${id.slice(0, 8)}@claimtrail.example`,
      role,
      emailVerified: true,
      active: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createTestClaim(
  assigneeId: string | null,
  overrideCode?: string,
): Promise<{
  id: string;
  code: string;
}> {
  const code = overrideCode ?? `CLM-${Math.floor(10000 + Math.random() * 89999)}`;
  const patient = await db.patient.create({
    data: {
      name: "Test Patient",
      gender: "MALE",
      uhid: `NSK-TEST-${crypto.randomUUID().slice(0, 6)}`,
      dateOfBirth: new Date("1980-01-01"),
    },
  });

  const payer = await db.payer.findFirst();
  const procedure = await db.procedure.findFirst();

  if (!payer || !procedure) {
    throw new Error("Payer or Procedure not found in database for test claim");
  }

  const claim = await db.claim.create({
    data: {
      code,
      patientId: patient.id,
      payerId: payer.id,
      procedureId: procedure.id,
      policyNumber: "POL-TEST-12345",
      treatingDoctor: "Dr. Test Doctor",
      admittedAt: new Date(),
      estimatedAmount: 50000,
      stage: "PRE_AUTH",
      status: "DRAFT",
      stageStartedAt: new Date(),
      statusChangedAt: new Date(),
      assigneeId,
    },
  });

  return { id: claim.id, code: claim.code };
}
