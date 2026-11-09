import Link from "next/link";
import { CheckCircle2, Circle, PenLine, Upload } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

export type QueryAskDto = {
  id: string;
  text: string;
  state: "SATISFIED" | "MISSING" | "ANSWER_IN_REPLY";
  documentType?: { label: string } | null;
  sourceSnippet?: string | null;
};

export function AskList({
  summary,
  asks,
  claimCode,
}: {
  summary: string | null;
  asks: QueryAskDto[];
  claimCode?: string;
}) {
  return (
    <div className="bg-surface space-y-3 rounded-lg border p-4 text-xs">
      <h3 className="text-foreground text-sm font-semibold tracking-tight">What they&apos;re asking</h3>

      {summary && <p className="text-muted-foreground text-xs leading-relaxed">{summary}</p>}

      {asks.length === 0 ? (
        <p className="text-muted-foreground text-[11px] italic">
          No structured asks extracted. Please review the original email below.
        </p>
      ) : (
        <div className="divide-border divide-y pt-1">
          {asks.map((ask) => {
            const isSatisfied = ask.state === "SATISFIED";
            const isMissing = ask.state === "MISSING";

            return (
              <div
                key={ask.id}
                className="flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isSatisfied ? (
                      <CheckCircle2 className="text-success size-4" />
                    ) : isMissing ? (
                      <Circle className="size-4 text-amber-700" />
                    ) : (
                      <PenLine className="text-muted-foreground size-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-foreground leading-snug font-medium">{ask.text}</p>
                    {ask.documentType && (
                      <p className="text-muted-foreground text-[11px]">
                        Mapped to:{" "}
                        <strong className="text-foreground font-medium">{ask.documentType.label}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
                  {isSatisfied && (
                    <span className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                      Uploaded ✓
                    </span>
                  )}

                  {isMissing && (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                        Not uploaded
                      </span>
                      {claimCode && (
                        <Link
                          href={`/claims/${claimCode}#checklist`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-6 gap-1 px-2 text-[10px]",
                          )}
                        >
                          <Upload className="size-2.5" />
                          <span>Upload</span>
                        </Link>
                      )}
                    </div>
                  )}

                  {ask.state === "ANSWER_IN_REPLY" && (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium">
                      Answer in reply
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
