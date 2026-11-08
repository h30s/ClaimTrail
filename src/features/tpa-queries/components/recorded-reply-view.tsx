import { formatDateTime } from "@/lib/format";

export function RecordedReplyView({
  replyBody,
  repliedAt,
  repliedByName,
  replyDocumentIds,
}: {
  replyBody: string | null;
  repliedAt: Date | null;
  repliedByName?: string | null;
  replyDocumentIds: string[];
}) {
  return (
    <div className="bg-surface space-y-3 rounded-lg border p-4 text-xs">
      <div className="flex items-center justify-between border-b pb-2.5">
        <h3 className="text-foreground text-sm font-semibold tracking-tight">Recorded reply</h3>
        <span className="text-muted-foreground text-[11px]">
          Sent {repliedAt ? formatDateTime(repliedAt) : ""} {repliedByName ? `by ${repliedByName}` : ""}
        </span>
      </div>

      <div className="text-foreground bg-muted/30 rounded-md border p-3 font-sans text-xs leading-relaxed whitespace-pre-wrap">
        {replyBody}
      </div>

      {replyDocumentIds.length > 0 && (
        <div className="text-muted-foreground text-[11px]">
          <span>Attached documents: {replyDocumentIds.length} document(s) included with reply</span>
        </div>
      )}
    </div>
  );
}
