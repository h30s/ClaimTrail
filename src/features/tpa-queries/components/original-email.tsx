import { formatDateTime } from "@/lib/format";

export function OriginalEmail({
  fromAddress,
  subject,
  body,
  receivedAt,
}: {
  fromAddress: string;
  subject: string;
  body: string;
  receivedAt: Date;
}) {
  return (
    <div className="bg-surface space-y-3 rounded-lg border p-4 text-xs">
      <div className="border-b pb-2">
        <h3 className="text-foreground text-sm font-semibold tracking-tight">Original email</h3>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <span>
            From: <strong className="text-foreground font-mono">{fromAddress}</strong>
          </span>
          <span>·</span>
          <span>Received: {formatDateTime(receivedAt)}</span>
        </div>
        <p className="text-foreground mt-1 text-xs font-medium">Subject: {subject}</p>
      </div>

      <div className="text-foreground font-sans text-xs leading-relaxed whitespace-pre-wrap select-text">
        {body}
      </div>
    </div>
  );
}
