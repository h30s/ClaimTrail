import type { Gender } from "@/lib/enums";
import type { ClaimEventName } from "@/features/claims/domain/status-machine";

export type ClaimSeedEvent = {
  event: ClaimEventName | "CREATED";
  minutesAgo: number;
  note?: string;
};

export type ClaimSeed = {
  code: string;
  patient: {
    name: string;
    gender: Gender;
    age: number;
    uhid: string;
  };
  payerName: string;
  procedureName: string;
  policyNumber: string;
  payerReference?: string;
  treatingDoctor: string;
  estimatedAmount: number;
  approvedAmount?: number;
  assigneeEmail?: string;
  story: ClaimSeedEvent[];
};
