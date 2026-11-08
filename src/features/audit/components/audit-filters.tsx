"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AUDIT_ACTION_LABEL } from "../domain/audit-actions";

export function AuditFilters({
  actors,
  currentActorId,
  currentAction,
  currentClaimCode,
}: {
  actors: Array<{ id: string; name: string }>;
  currentActorId?: string;
  currentAction?: string;
  currentClaimCode?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cursor"); // Reset pagination on filter change
    if (val && val.trim().length > 0) {
      params.set(key, val.trim());
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = Boolean(currentActorId || currentAction || currentClaimCode);

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="border-border bg-surface flex flex-wrap items-center gap-2.5 rounded-lg border p-3 text-xs shadow-2xs">
      <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          placeholder="Filter by claim code (e.g. CLM-3381)"
          defaultValue={currentClaimCode ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("claimCode", e.currentTarget.value);
            }
          }}
          onBlur={(e) => updateParam("claimCode", e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <select
          value={currentActorId ?? ""}
          onChange={(e) => updateParam("actorId", e.target.value || null)}
          aria-label="Filter by person"
          className="border-input bg-surface text-foreground focus:ring-ring h-8 rounded-md border px-2 py-1 text-xs shadow-2xs focus:ring-2 focus:outline-none"
        >
          <option value="">All users</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <select
          value={currentAction ?? ""}
          onChange={(e) => updateParam("action", e.target.value || null)}
          aria-label="Filter by action"
          className="border-input bg-surface text-foreground focus:ring-ring h-8 max-w-[200px] truncate rounded-md border px-2 py-1 text-xs shadow-2xs focus:ring-2 focus:outline-none"
        >
          <option value="">All actions</option>
          {Object.entries(AUDIT_ACTION_LABEL).map(([act, label]) => (
            <option key={act} value={act}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1.5 py-1 text-xs transition-colors"
        >
          <X className="size-3" />
          <span>Clear filters</span>
        </button>
      )}
    </div>
  );
}
