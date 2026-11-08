import { Badge } from "@/components/ui/badge";
import type { DocumentDto } from "../types";
import { IDENTITY_LABEL } from "../domain/labels";

export function AiDetails({ doc }: { doc: DocumentDto }) {
  const confPct = doc.ai.confidence !== null ? Math.round(doc.ai.confidence * 100) : null;

  return (
    <div className="border-border bg-surface-subtle/50 space-y-3 rounded-lg border p-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium">Filing source</span>
        <Badge variant={doc.sortedBy === "AI" ? "secondary" : "outline"} className="text-[11px]">
          {doc.sortedBy === "AI" ? "Sorted by AI" : "Moved by desk"}
        </Badge>
      </div>

      {confPct !== null && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Confidence</span>
          <span className="text-foreground font-mono font-medium">{confPct}%</span>
        </div>
      )}

      {doc.ai.reason && (
        <div className="space-y-1">
          <span className="text-muted-foreground">Reasoning</span>
          <p className="text-foreground/90 bg-surface rounded border p-2 text-[11px] leading-relaxed">
            {doc.ai.reason}
          </p>
        </div>
      )}

      {doc.ai.alternatives && doc.ai.alternatives.length > 0 && (
        <div className="space-y-1">
          <span className="text-muted-foreground">Alternative guesses</span>
          <div className="flex flex-wrap gap-1">
            {doc.ai.alternatives.map((alt) => (
              <Badge key={alt.documentType} variant="outline" className="text-[10px]">
                {alt.documentType} ({Math.round(alt.confidence * 100)}%)
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="border-border/60 text-muted-foreground space-y-1 border-t pt-2 text-[11px]">
        <div className="flex justify-between">
          <span>Identity check</span>
          <span className="text-foreground font-medium">{IDENTITY_LABEL[doc.identityCheck]}</span>
        </div>
        {doc.patientNameOnDoc && (
          <div className="flex justify-between">
            <span>Name on doc</span>
            <span className="text-foreground font-medium">{doc.patientNameOnDoc}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Uploaded by</span>
          <span className="text-foreground">{doc.uploadedBy.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Uploaded at</span>
          <span className="text-foreground font-mono">{new Date(doc.uploadedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
