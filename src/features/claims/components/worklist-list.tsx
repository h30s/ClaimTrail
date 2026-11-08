import Link from "next/link";
import { CheckCircle2, SearchX } from "lucide-react";
import type { WorklistRowDto, WorklistTab } from "../types";
import { ClaimRow } from "./claim-row";

export function WorklistList({
  rows,
  tab,
  hasQuery,
}: {
  rows: WorklistRowDto[];
  tab: WorklistTab;
  hasQuery: boolean;
}) {
  if (rows.length === 0) {
    if (hasQuery) {
      return (
        <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <SearchX className="text-muted-foreground/60 mb-2 size-8" />
          <p className="text-foreground text-sm font-medium">No claims match your search</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Try adjusting your search query or removing filters.
          </p>
          <Link href="/claims" className="text-primary mt-4 text-xs font-medium hover:underline">
            Clear all filters
          </Link>
        </div>
      );
    }

    if (tab === "action") {
      return (
        <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <CheckCircle2 className="text-success mb-2 size-8" />
          <p className="text-foreground text-sm font-medium">Nothing needs action</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Every open claim is complete or waiting on the insurer.
          </p>
          <Link href="/claims?tab=open" className="text-primary mt-4 text-xs font-medium hover:underline">
            See all open claims →
          </Link>
        </div>
      );
    }

    const messages: Record<WorklistTab, string> = {
      action: "No claims need action",
      open: "No open claims at this desk",
      sent: "No claims currently waiting on insurer decisions",
      settled: "No settled or closed claims yet",
    };

    return (
      <div className="border-border rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground text-xs">{messages[tab]}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <ClaimRow key={row.id} row={row} />
      ))}
    </div>
  );
}
