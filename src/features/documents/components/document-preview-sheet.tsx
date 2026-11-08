"use client";

import { Download, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import type { DocumentDto } from "../types";
import { AiDetails } from "./ai-details";

export function DocumentPreviewSheet({
  doc,
  open,
  onOpenChange,
}: {
  doc: DocumentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!doc) return null;

  const sizeKb = Math.round(doc.sizeBytes / 1024);
  const isPdf = doc.mimeType === "application/pdf";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader className="border-border border-b pb-3">
          <div className="flex flex-col gap-1 pr-6 sm:flex-row sm:items-center sm:justify-between">
            <SheetTitle className="truncate text-base font-semibold">{doc.fileName}</SheetTitle>
            <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
              <a
                href={`/api/documents/${doc.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "xs" }), "h-7 gap-1 text-xs")}
              >
                <ExternalLink className="size-3" />
                <span>Open in tab</span>
              </a>
              <a
                href={`/api/documents/${doc.id}/file`}
                download={doc.fileName}
                className={cn(buttonVariants({ variant: "outline", size: "xs" }), "h-7 gap-1 text-xs")}
              >
                <Download className="size-3" />
                <span>Download</span>
              </a>
            </div>
          </div>

          <SheetDescription className="flex items-center gap-2 text-xs">
            <span>{doc.mimeType}</span>
            <span>·</span>
            <span>{sizeKb} KB</span>
            {doc.pageCount && (
              <>
                <span>·</span>
                <span>
                  {doc.pageCount} page{doc.pageCount > 1 ? "s" : ""}
                </span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 py-4">
            <div className="border-border bg-muted/20 overflow-hidden rounded-lg border">
              {isPdf ? (
                <iframe
                  src={`/api/documents/${doc.id}/file#view=FitH`}
                  title={doc.fileName}
                  className="h-[62vh] w-full border-0 bg-white"
                />
              ) : (
                <div className="flex max-h-[62vh] items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/documents/${doc.id}/file`}
                    alt={doc.fileName}
                    className="max-h-[58vh] max-w-full rounded object-contain"
                  />
                </div>
              )}
            </div>

            <AiDetails doc={doc} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
