import { SEED_BRIEF_CLAIMS } from "./claims-brief";
import { SEED_SUPPORTING_CLAIMS } from "./claims-supporting";
import type { ClaimSeed } from "./claims-types";

export type { ClaimSeed, ClaimSeedEvent } from "./claims-types";

export const SEED_CLAIMS: readonly ClaimSeed[] = [...SEED_BRIEF_CLAIMS, ...SEED_SUPPORTING_CLAIMS];
