"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          <SheetTitle className="truncate text-base font-semibold">{doc.fileName}</SheetTitle>
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
            <div className="border-border overflow-hidden rounded-lg border bg-black/5 dark:bg-white/5">
              {isPdf ? (
                <iframe
                  src={`/api/documents/${doc.id}/file`}
                  title={doc.fileName}
                  className="h-[60vh] w-full"
                />
              ) : (
                <div className="flex max-h-[60vh] items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/documents/${doc.id}/file`}
                    alt={doc.fileName}
                    className="max-h-[56vh] max-w-full rounded object-contain"
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
