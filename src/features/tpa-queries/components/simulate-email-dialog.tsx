"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { simulateIncomingEmail } from "../server/actions";

const QUICK_PAYERS = [
  { name: "Star Health", email: "cashless@starhealth.example" },
  { name: "HDFC ERGO", email: "claims@hdfcergo.example" },
  { name: "ICICI Lombard", email: "preauth@icicilombard.example" },
  { name: "Care Health", email: "queries@careinsurance.example" },
];

const SAMPLE_BODY = `Dear Hospital Desk,

We have received the cashless pre-authorization request for claim CLM-3382 (Patient: Vikas More).
Before processing approval, our medical team requires:
1. Complete indoor case papers (ICP) with initial clinical notes
2. Latest ultrasound abdomen report and films
3. Treating doctor justification for emergency admission

Please provide these documents within 6 hours of this email to avoid query denial.

Regards,
Medical Query Desk
HDFC ERGO General Insurance`;

export function SimulateEmailDialog() {
  const [open, setOpen] = useState(false);
  const [fromAddress, setFromAddress] = useState(QUICK_PAYERS[0]!.email);
  const [subject, setSubject] = useState("Query on Pre-Auth Claim CLM-3382 - Additional Documents Required");
  const [body, setBody] = useState(SAMPLE_BODY);

  const router = useRouter();

  const { run: runSimulate, pending } = useAction(simulateIncomingEmail, {
    success: "Incoming query email ingested and processed with AI",
    onSuccess: (data) => {
      setOpen(false);
      router.push(`/inbox/${data.id}`);
    },
  });

  const handleFillSample = () => {
    setFromAddress("claims@hdfcergo.example");
    setSubject("Query on Pre-Auth Claim CLM-3382 - Additional Documents Required");
    setBody(SAMPLE_BODY);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Mail className="size-3.5" />
            <span>Simulate incoming email</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <Sparkles className="text-primary size-4" />
            <span>Simulate incoming query email</span>
          </DialogTitle>
          <DialogDescription>
            Simulate a TPA query email. Gemini AI will analyze the email, extract structured asks, and
            calculate the deadline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs">
          <div>
            <Label className="text-muted-foreground mb-1 block text-[11px]">Quick pick payer:</Label>
            <div className="flex flex-wrap gap-1">
              {QUICK_PAYERS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => setFromAddress(p.email)}
                  className={`rounded border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    fromAddress === p.email
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "bg-surface hover:bg-muted"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">From Address</Label>
            <Input
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="e.g. cashless@payer.example"
              className="h-8 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line…"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Email Body</Label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-primary text-[10px] hover:underline"
              >
                Reset sample
              </button>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="font-sans text-xs"
              placeholder="Paste email text here…"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={pending || !fromAddress || !subject || !body}
            onClick={() =>
              runSimulate({
                fromAddress: fromAddress.trim(),
                subject: subject.trim(),
                body: body.trim(),
              })
            }
          >
            {pending ? "Reading email with AI…" : "Ingest email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
