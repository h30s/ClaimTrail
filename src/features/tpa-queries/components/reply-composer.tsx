"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Send } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { recordReplyAction } from "../server/actions";
import type { QueryAskDto } from "./ask-list";
import { RecordedReplyView } from "./recorded-reply-view";

export type ClaimDocDto = {
  id: string;
  fileName: string;
  documentTypeId: string | null;
  uploadedAt: Date;
};

export function ReplyComposer({
  queryId,
  status,
  replyBody,
  repliedAt,
  repliedByName,
  replyDocumentIds,
  claim,
  asks,
  currentUserName,
}: {
  queryId: string;
  status: "OPEN" | "ANSWERED";
  replyBody: string | null;
  repliedAt: Date | null;
  repliedByName?: string | null;
  replyDocumentIds: string[];
  claim?: {
    id: string;
    code: string;
    patient: { name: string };
    documents: ClaimDocDto[];
  } | null;
  asks: QueryAskDto[];
  currentUserName: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const satisfiedTypeIds = useMemo(
    () => new Set(asks.filter((a) => a.state === "SATISFIED" && a.documentType).map((a) => a.documentType)),
    [asks],
  );

  const initialDocIds = useMemo(() => {
    if (!claim) return [];
    return claim.documents
      .filter(
        (d) => d.documentTypeId && satisfiedTypeIds.has(d.documentTypeId as unknown as { label: string }),
      )
      .map((d) => d.id);
  }, [claim, satisfiedTypeIds]);

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(initialDocIds);

  const initialText = useMemo(() => {
    if (!claim) return "";
    const satisfied = asks.filter((a) => a.state === "SATISFIED");
    const docs = satisfied.map((a) => `- ${a.documentType?.label ?? a.text}`).join("\n");
    return `Dear Team,\n\nRegarding claim ${claim.code} (Patient: ${claim.patient.name}):\n\n${docs ? `Please find attached the requested documents:\n${docs}\n\n` : ""}Kindly review and provide approval at the earliest.\n\nRegards,\n${currentUserName}\nCompany A Multispeciality Hospital, Nashik`;
  }, [claim, asks, currentUserName]);

  const [text, setText] = useState(initialText);

  const { run: runRecord, pending: recording } = useAction(recordReplyAction, {
    success: "Reply marked as sent",
    onSuccess: () => setConfirmOpen(false),
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Reply template copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  if (status === "ANSWERED") {
    return (
      <RecordedReplyView
        replyBody={replyBody}
        repliedAt={repliedAt}
        repliedByName={repliedByName}
        replyDocumentIds={replyDocumentIds}
      />
    );
  }

  if (!claim) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
        Link this query to an open claim above to compose a reply.
      </div>
    );
  }

  return (
    <div className="bg-surface space-y-3 rounded-lg border p-4 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold tracking-tight">Reply</h3>
        <span className="text-muted-foreground text-[11px]">
          Prepare your email text and attached documents
        </span>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="font-sans text-xs"
        placeholder="Type or customize your reply message…"
      />

      {claim.documents.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-foreground text-[11px] font-medium">Select attachments:</span>
          <div className="grid max-h-36 grid-cols-1 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
            {claim.documents.map((doc) => (
              <label
                key={doc.id}
                className="text-foreground hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded p-1 text-[11px]"
              >
                <Checkbox
                  checked={selectedDocIds.includes(doc.id)}
                  onCheckedChange={() => toggleDoc(doc.id)}
                />
                <span className="truncate">{doc.fileName}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? <Check className="text-success size-3.5" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy reply"}</span>
          </Button>

          <a
            href={`/api/claims/${claim.code}/packet`}
            download
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 gap-1.5 text-xs")}
          >
            <Download className="size-3.5" />
            <span>Download attachments</span>
          </a>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={recording || text.trim().length === 0}
          onClick={() => setConfirmOpen(true)}
          className="h-8 gap-1.5 text-xs"
        >
          <Send className="size-3.5" />
          <span>Mark reply as sent</span>
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark reply as sent?</DialogTitle>
            <DialogDescription>
              Record that you sent this reply email to the insurer. The claim will be updated and the query
              closed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={recording}
              onClick={() => runRecord({ queryId, replyBody: text.trim(), documentIds: selectedDocIds })}
            >
              {recording ? "Recording…" : "Confirm sent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
