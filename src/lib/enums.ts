// Single import point for Prisma enums, so a generator path change is a one-line fix.
export type {
  Role,
  PayerKind,
  Gender,
  Stage,
  ClaimStatus,
  Requirement,
  DocumentStatus,
  SortedBy,
  IdentityCheck,
  ClaimEventType,
  QueryStatus,
  DeadlineSource,
  DeductionReason,
} from "@/generated/prisma/enums";
