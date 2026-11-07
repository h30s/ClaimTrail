-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DESK_HEAD', 'DESK_EXECUTIVE');

-- CreateEnum
CREATE TYPE "PayerKind" AS ENUM ('INSURER', 'TPA');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('PRE_AUTH', 'ENHANCEMENT', 'DISCHARGE');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SENT', 'QUERY', 'APPROVED', 'REJECTED', 'SETTLED');

-- CreateEnum
CREATE TYPE "Requirement" AS ENUM ('REQUIRED', 'OPTIONAL', 'NOT_NEEDED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'SORTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SortedBy" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "IdentityCheck" AS ENUM ('UNCHECKED', 'MATCH', 'MISMATCH', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "ClaimEventType" AS ENUM ('CREATED', 'SUBMITTED', 'QUERY_RAISED', 'QUERY_ANSWERED', 'APPROVED', 'REJECTED', 'STAGE_STARTED', 'SETTLED', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('OPEN', 'ANSWERED');

-- CreateEnum
CREATE TYPE "DeadlineSource" AS ENUM ('STATED', 'DEFAULT');

-- CreateEnum
CREATE TYPE "AiState" AS ENUM ('OK', 'FAILED');

-- CreateEnum
CREATE TYPE "DeductionReason" AS ENUM ('MISSING_DOCUMENT', 'NON_PAYABLE_ITEM', 'ROOM_RENT_LIMIT', 'TARIFF_DIFFERENCE', 'CO_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AiTask" AS ENUM ('ANALYSE_DOCUMENT', 'SUMMARISE_QUERY');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('OK', 'INVALID_OUTPUT', 'REFUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DESK_EXECUTIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "PayerKind" NOT NULL,
    "emailDomain" TEXT NOT NULL,
    "queryReplyHours" INTEGER NOT NULL DEFAULT 24,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_rule" (
    "id" TEXT NOT NULL,
    "payerId" TEXT,
    "procedureId" TEXT,
    "stage" "Stage" NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "requirement" "Requirement" NOT NULL,
    "needsFreshCopy" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient" (
    "id" TEXT NOT NULL,
    "uhid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" DATE NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "payerReference" TEXT,
    "treatingDoctor" TEXT NOT NULL,
    "admittedAt" TIMESTAMP(3) NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'PRE_AUTH',
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "stageStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedAmount" INTEGER NOT NULL,
    "approvedAmount" INTEGER,
    "billedAmount" INTEGER,
    "settledAmount" INTEGER,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_event" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "type" "ClaimEventType" NOT NULL,
    "stage" "Stage" NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "note" TEXT,
    "data" JSONB,

    CONSTRAINT "claim_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "documentTypeId" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "sortedBy" "SortedBy",
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "pageCount" INTEGER,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiDocumentTypeKey" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "aiReason" TEXT,
    "aiAlternatives" JSONB,
    "aiFailed" BOOLEAN NOT NULL DEFAULT false,
    "patientNameOnDoc" TEXT,
    "identityCheck" "IdentityCheck" NOT NULL DEFAULT 'UNCHECKED',
    "documentDate" DATE,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_suggestion" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sourceSnippet" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "field_suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_field" (
    "claimId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "suggestionId" TEXT,
    "confirmedById" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_field_pkey" PRIMARY KEY ("claimId","fieldKey")
);

-- CreateTable
CREATE TABLE "tpa_query" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "payerId" TEXT,
    "fromAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "aiState" "AiState" NOT NULL,
    "summary" TEXT,
    "extractedClaimRef" TEXT,
    "extractedPatient" TEXT,
    "suggestedClaimId" TEXT,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "deadlineSource" "DeadlineSource" NOT NULL,
    "deadlineSnippet" TEXT,
    "status" "QueryStatus" NOT NULL DEFAULT 'OPEN',
    "replyBody" TEXT,
    "replyDocumentIds" TEXT[],
    "repliedAt" TIMESTAMP(3),
    "repliedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tpa_query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_ask" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "documentTypeId" TEXT,
    "sourceSnippet" TEXT,

    CONSTRAINT "query_ask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "stage" "Stage" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT NOT NULL,
    "documentIds" TEXT[],
    "checklistSnapshot" JSONB NOT NULL,
    "overriddenGaps" JSONB,
    "overrideReason" TEXT,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deduction" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "reason" "DeductionReason" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_run" (
    "id" TEXT NOT NULL,
    "task" "AiTask" NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "status" "AiRunStatus" NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "error" TEXT,
    "output" JSONB,
    "documentId" TEXT,
    "queryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "claimId" TEXT,
    "data" JSONB,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_approval" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_key_key" ON "rate_limit"("key");

-- CreateIndex
CREATE UNIQUE INDEX "payer_name_key" ON "payer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payer_emailDomain_key" ON "payer"("emailDomain");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_name_key" ON "procedure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_key_key" ON "document_type"("key");

-- CreateIndex
CREATE INDEX "checklist_rule_payerId_procedureId_idx" ON "checklist_rule"("payerId", "procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_uhid_key" ON "patient"("uhid");

-- CreateIndex
CREATE UNIQUE INDEX "claim_code_key" ON "claim"("code");

-- CreateIndex
CREATE INDEX "claim_assigneeId_status_idx" ON "claim"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "claim_status_stage_idx" ON "claim"("status", "stage");

-- CreateIndex
CREATE INDEX "claim_payerId_idx" ON "claim"("payerId");

-- CreateIndex
CREATE INDEX "claim_event_claimId_at_idx" ON "claim_event"("claimId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "document_storageKey_key" ON "document"("storageKey");

-- CreateIndex
CREATE INDEX "document_claimId_documentTypeId_idx" ON "document"("claimId", "documentTypeId");

-- CreateIndex
CREATE INDEX "field_suggestion_claimId_fieldKey_idx" ON "field_suggestion"("claimId", "fieldKey");

-- CreateIndex
CREATE INDEX "tpa_query_status_deadlineAt_idx" ON "tpa_query"("status", "deadlineAt");

-- CreateIndex
CREATE INDEX "tpa_query_claimId_idx" ON "tpa_query"("claimId");

-- CreateIndex
CREATE INDEX "submission_claimId_idx" ON "submission"("claimId");

-- CreateIndex
CREATE INDEX "deduction_reason_idx" ON "deduction"("reason");

-- CreateIndex
CREATE INDEX "ai_run_task_createdAt_idx" ON "ai_run"("task", "createdAt");

-- CreateIndex
CREATE INDEX "audit_event_claimId_at_idx" ON "audit_event"("claimId", "at");

-- CreateIndex
CREATE INDEX "audit_event_actorId_at_idx" ON "audit_event"("actorId", "at");

-- CreateIndex
CREATE INDEX "audit_event_at_idx" ON "audit_event"("at");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_approval_tokenHash_key" ON "doctor_approval"("tokenHash");

-- CreateIndex
CREATE INDEX "doctor_approval_claimId_idx" ON "doctor_approval"("claimId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_rule" ADD CONSTRAINT "checklist_rule_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_rule" ADD CONSTRAINT "checklist_rule_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_rule" ADD CONSTRAINT "checklist_rule_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_rule" ADD CONSTRAINT "checklist_rule_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_event" ADD CONSTRAINT "claim_event_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_event" ADD CONSTRAINT "claim_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_suggestion" ADD CONSTRAINT "field_suggestion_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_suggestion" ADD CONSTRAINT "field_suggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_field" ADD CONSTRAINT "claim_field_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_field" ADD CONSTRAINT "claim_field_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpa_query" ADD CONSTRAINT "tpa_query_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpa_query" ADD CONSTRAINT "tpa_query_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpa_query" ADD CONSTRAINT "tpa_query_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_ask" ADD CONSTRAINT "query_ask_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "tpa_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_ask" ADD CONSTRAINT "query_ask_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deduction" ADD CONSTRAINT "deduction_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_approval" ADD CONSTRAINT "doctor_approval_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One rule per scope + stage + document type. "All payers"/"all procedures" are NULL,
-- and NULLs must collide here, otherwise duplicates slip in (Postgres 15+).
CREATE UNIQUE INDEX "checklist_rule_scope_key"
  ON "checklist_rule" ("payerId", "procedureId", "stage", "documentTypeId")
  NULLS NOT DISTINCT;
