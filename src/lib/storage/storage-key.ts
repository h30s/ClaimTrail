import { randomUUID } from "node:crypto";

export function newStorageKey(claimId: string, ext: string): string {
  const cleanExt = ext.replace(/^\./, "");
  return `claims/${claimId}/${randomUUID()}.${cleanExt}`;
}
