import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { AUDIT_ACTION_LABEL } from "../domain/audit-actions";
import { describeAudit } from "../domain/describe-audit";
import type { AuditRowDto } from "../server/queries";

export function AuditTable({
  rows,
  nextCursor,
  baseSearchParams = {},
}: {
  rows: AuditRowDto[];
  nextCursor: string | null;
  baseSearchParams?: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-surface rounded-lg border p-12 text-center shadow-2xs">
        <p className="text-foreground text-sm font-semibold">No audit events found</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Try loosening your filter criteria or searching a different claim code.
        </p>
      </div>
    );
  }

  const nextParams = new URLSearchParams();
  for (const [k, v] of Object.entries(baseSearchParams)) {
    if (v) nextParams.set(k, v);
  }
  if (nextCursor) {
    nextParams.set("cursor", nextCursor);
  }

  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-1 shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-border/80 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
              <th className="py-2.5 pr-2 pl-3">Time (IST)</th>
              <th className="px-2 py-2.5">Person</th>
              <th className="px-2 py-2.5">Action</th>
              <th className="px-2 py-2.5">Claim</th>
              <th className="py-2.5 pr-3 pl-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-border/50 divide-y">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="text-muted-foreground py-2.5 pr-2 pl-3 font-mono text-[11px] whitespace-nowrap">
                  {formatDateTime(row.at)}
                </td>
                <td className="text-foreground px-2 py-2.5 font-medium whitespace-nowrap">{row.actorName}</td>
                <td className="px-2 py-2.5 whitespace-nowrap">
                  <span className="border-border bg-muted/40 text-foreground inline-block rounded px-1.5 py-0.5 text-[11px] font-medium">
                    {AUDIT_ACTION_LABEL[row.action] ?? row.action}
                  </span>
                </td>
                <td className="px-2 py-2.5 whitespace-nowrap">
                  {row.claimCode ? (
                    <Link
                      href={`/claims/${row.claimCode}`}
                      className="text-primary font-mono text-xs font-semibold hover:underline"
                    >
                      {row.claimCode}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="text-muted-foreground max-w-md truncate py-2.5 pr-3 pl-2 text-xs">
                  {describeAudit(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="border-border/60 flex items-center justify-center border-t py-2">
          <Link
            href={`/audit?${nextParams.toString()}`}
            className="text-primary hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <span>Next page</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
