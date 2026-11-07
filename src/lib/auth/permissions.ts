// What each role may do (A2, A4). Used on the server to enforce and in the UI to hide.
// The UI check is a convenience; the server check is the rule.
import type { Role } from "@/lib/enums";

export type Permission =
  | "claim:work" // upload, sort, confirm fields, reply, record decisions on claims in scope
  | "claim:create"
  | "claim:assign"
  | "claim:view-all"
  | "submission:override" // send with gaps, with a reason
  | "settings:manage" // checklist rules, document types, payers
  | "audit:view";

const GRANTS: Record<Role, readonly Permission[]> = {
  DESK_EXECUTIVE: ["claim:work", "claim:create"],
  DESK_HEAD: [
    "claim:work",
    "claim:create",
    "claim:assign",
    "claim:view-all",
    "submission:override",
    "settings:manage",
    "audit:view",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return GRANTS[role].includes(permission);
}
