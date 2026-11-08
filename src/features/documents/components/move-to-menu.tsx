"use client";

import { useTransition } from "react";
import { FolderInput, Inbox } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { moveDocument } from "../server/actions";

export function MoveToMenu({
  documentId,
  claimCode,
  documentTypes,
  currentTypeKey,
  onMoveOptimistic,
  children,
}: {
  documentId: string;
  claimCode: string;
  documentTypes: Array<{ key: string; label: string }>;
  currentTypeKey: string | null;
  onMoveOptimistic?: (targetKey: string | null) => void;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  const handleMove = (targetKey: string | null) => {
    onMoveOptimistic?.(targetKey);
    startTransition(async () => {
      const res = await moveDocument({
        documentId,
        documentTypeKey: targetKey,
        claimCode,
      });
      if (!res.ok) {
        toast.error(res.error || "Could not move document.");
      } else {
        toast.success(targetKey ? "Document moved." : "Document moved to tray.");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={!children}
        render={
          children ? (
            <span tabIndex={0} role="button" className="w-full cursor-pointer">
              {children}
            </span>
          ) : (
            <Button variant="outline" size="xs" disabled={isPending} className="h-7 text-xs">
              <FolderInput className="mr-1 size-3.5" />
              Move to...
            </Button>
          )
        }
      />
      <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-xs">Select checklist slot</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currentTypeKey !== null && (
          <>
            <DropdownMenuItem className="text-muted-foreground text-xs" onClick={() => handleMove(null)}>
              <Inbox className="mr-2 size-3.5" />
              Needs sorting (Tray)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {documentTypes.map((dt) => (
          <DropdownMenuItem
            key={dt.key}
            disabled={dt.key === currentTypeKey}
            className="text-xs"
            onClick={() => handleMove(dt.key)}
          >
            {dt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
