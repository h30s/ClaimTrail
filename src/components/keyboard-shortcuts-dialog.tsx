"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHORTCUTS = [
  { key: "g then c", description: "Navigate to Claims worklist" },
  { key: "g then i", description: "Navigate to Query Inbox" },
  { key: "g then d", description: "Navigate to Dashboard" },
  { key: "g then a", description: "Navigate to Audit Log" },
  { key: "?", description: "Open keyboard shortcuts" },
  { key: "Esc", description: "Close dialogs and overlays" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let pendingG = false;
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        pendingG = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          pendingG = false;
        }, 1000);
        return;
      }

      if (pendingG) {
        pendingG = false;
        clearTimeout(timer);
        if (e.key === "c") {
          e.preventDefault();
          router.push("/claims");
        } else if (e.key === "i") {
          e.preventDefault();
          router.push("/inbox");
        } else if (e.key === "d") {
          e.preventDefault();
          router.push("/dashboard");
        } else if (e.key === "a") {
          e.preventDefault();
          router.push("/audit");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          <Keyboard className="size-3.5" />
          <span>Shortcuts</span>
        </span>
        <kbd className="border-border bg-muted/50 text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]">
          ?
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Command className="size-4" />
              <span>Keyboard Shortcuts</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Quick desk navigation keys</DialogDescription>
          </DialogHeader>

          <div className="divide-border/60 divide-y py-2 text-xs">
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">{s.description}</span>
                <kbd className="border-border bg-muted/60 text-foreground rounded border px-2 py-0.5 font-mono text-[11px] font-medium shadow-2xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
