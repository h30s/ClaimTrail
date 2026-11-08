import { FileText } from "lucide-react";

export function SourceQuote({
  documentLabel,
  snippet,
  confidence,
}: {
  documentLabel: string;
  snippet: string;
  confidence?: number;
}) {
  const confPct = confidence !== undefined ? Math.round(confidence * 100) : null;

  return (
    <div className="border-primary/40 bg-surface-subtle/50 text-muted-foreground space-y-1 rounded-r border-l-2 py-1.5 pr-2.5 pl-3 text-xs">
      <div className="text-foreground/80 flex items-center gap-1.5 text-[11px] font-medium">
        <FileText className="text-muted-foreground size-3 shrink-0" />
        <span className="truncate">From {documentLabel}</span>
        {confPct !== null && (
          <span className="text-muted-foreground ml-auto font-mono text-[10px]">{confPct}% confidence</span>
        )}
      </div>

      <p className="text-foreground/90 text-[11px] leading-relaxed italic">&ldquo;{snippet}&rdquo;</p>
    </div>
  );
}
