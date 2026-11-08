"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/use-action";
import { assignClaim } from "../server/actions";

export type ExecutiveOption = {
  id: string;
  name: string;
};

export function AssignClaimDialog({
  claimId,
  currentAssigneeId,
  executives,
  open,
  onOpenChange,
}: {
  claimId: string;
  currentAssigneeId: string | null;
  executives: ExecutiveOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selected, setSelected] = useState<string>(currentAssigneeId ?? "unassigned");

  const { run, pending } = useAction(assignClaim, {
    success: "Claim assignment updated",
    onSuccess: () => onOpenChange(false),
  });

  const handleSave = async () => {
    const assigneeId = selected === "unassigned" ? null : selected;
    await run({ claimId, assigneeId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Assign Claim</DialogTitle>
            <DialogDescription className="text-xs">
              Assign this claim to a desk executive or head.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label className="text-xs">Assignee</Label>
            <Select value={selected} onValueChange={(val) => val && setSelected(val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {executives.map((exec) => (
                  <SelectItem key={exec.id} value={exec.id}>
                    {exec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save Assignment"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
