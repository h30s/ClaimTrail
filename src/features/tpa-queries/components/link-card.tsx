"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { linkQueryAction } from "../server/actions";
import { ClaimSearchCombobox } from "./claim-search-combobox";

export function LinkCard({
  queryId,
  claim,
  suggestedClaim,
}: {
  queryId: string;
  claim?: { id: string; code: string; patient: { name: string } } | null;
  suggestedClaim?: { id: string; code: string; patient: { name: string } } | null;
}) {
  const [showSearch, setShowSearch] = useState(false);

  const { run: runLink, pending: linking } = useAction(linkQueryAction, {
    success: "Query linked to claim",
  });

  if (claim) {
    return (
      <div className="bg-surface flex flex-col gap-2 rounded-lg border p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-success size-4 shrink-0" />
          <span>
            Linked to <strong className="text-foreground font-semibold">{claim.code}</strong> ·{" "}
            {claim.patient.name}
          </span>
        </div>
        <Link href={`/claims/${claim.code}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Open claim
        </Link>
      </div>
    );
  }

  if (suggestedClaim && !showSearch) {
    return (
      <div className="space-y-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <div className="font-semibold">Suggested Claim Match</div>
            <p className="text-[11px] text-amber-800 dark:text-amber-200">
              Looks like <strong className="font-bold">{suggestedClaim.code}</strong> ·{" "}
              {suggestedClaim.patient.name} (patient name match)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            disabled={linking}
            onClick={() => runLink({ queryId, claimId: suggestedClaim.id })}
            className="h-7 gap-1.5 text-xs"
          >
            <Link2 className="size-3" />
            <span>Link to this claim</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={linking}
            onClick={() => setShowSearch(true)}
            className="h-7 text-xs"
          >
            Choose another…
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface space-y-2 rounded-lg border p-3.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="text-foreground flex items-center gap-1.5 font-medium">
          <Link2 className="text-muted-foreground size-3.5" />
          <span>Link to open claim</span>
        </div>
        {suggestedClaim && (
          <button
            type="button"
            onClick={() => setShowSearch(false)}
            className="text-muted-foreground hover:text-foreground text-[11px] underline"
          >
            Back to suggested match
          </button>
        )}
      </div>

      <ClaimSearchCombobox disabled={linking} onSelect={(claimId) => runLink({ queryId, claimId })} />
    </div>
  );
}
