"use client";

import { useState } from "react";
import { Check, Copy, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { createDoctorSignoff } from "../server/actions";

export function RequestDoctorSignoffDialog({
  claimCode,
  doctorName = "the treating doctor",
}: {
  claimCode: string;
  doctorName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const { run, pending } = useAction(createDoctorSignoff, {
    onSuccess: (data) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setLinkUrl(`${origin}${data.path}`);
    },
  });

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && !linkUrl) {
      run({ claimCode });
    }
  };

  const copyToClipboard = async () => {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Stethoscope className="size-3.5" />
            <span>Request doctor sign-off</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Doctor Approval Link</DialogTitle>
          <DialogDescription className="text-xs">
            Generate a phone-friendly sign-off link valid for 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {pending ? (
            <p className="border-border text-muted-foreground rounded-md border border-dashed py-6 text-center text-xs">
              Generating secure approval link…
            </p>
          ) : linkUrl ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input readOnly value={linkUrl} className="font-mono text-xs" />
                <Button type="button" size="sm" onClick={copyToClipboard} className="shrink-0 gap-1">
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </Button>
              </div>

              <div className="border-border bg-muted/40 text-muted-foreground rounded-md border p-3 text-xs leading-relaxed">
                Share this link with <strong className="text-foreground">{doctorName}</strong> on WhatsApp.
                Messages are not sent automatically from ClaimTrail. The doctor can review notes and approve
                directly from their phone.
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Button size="sm" onClick={() => run({ claimCode })}>
                Generate Link
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
