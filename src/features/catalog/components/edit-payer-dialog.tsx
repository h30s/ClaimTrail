"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { applyFieldErrors } from "@/hooks/apply-field-errors";
import { useAction } from "@/hooks/use-action";
import { UpdatePayerSchema, type UpdatePayerInput } from "../schemas";
import { updatePayer } from "../server/actions";
import type { PayerDto } from "../server/queries";

export function EditPayerDialog({ payer }: { payer: PayerDto }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction(updatePayer, {
    success: "Payer updated",
    onSuccess: () => setOpen(false),
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdatePayerInput>({
    resolver: zodResolver(UpdatePayerSchema),
    defaultValues: {
      id: payer.id,
      emailDomain: payer.emailDomain,
      queryReplyHours: payer.queryReplyHours,
      active: payer.active,
    },
  });

  const active = useWatch({ control, name: "active" });

  const onSubmit = async (data: UpdatePayerInput) => {
    const result = await run(data);
    if (!result.ok && result.fieldErrors) {
      applyFieldErrors(setError, result.fieldErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="xs">
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Payer</DialogTitle>
            <DialogDescription className="text-xs">
              {payer.name} ({payer.kind})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="emailDomain" className="text-xs">
              Email Domain
            </Label>
            <Input id="emailDomain" className="h-8 font-mono text-xs" {...register("emailDomain")} />
            {errors.emailDomain?.message && (
              <p className="text-danger text-xs">{errors.emailDomain.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="queryReplyHours" className="text-xs">
              Default Reply Window (Hours)
            </Label>
            <Input
              id="queryReplyHours"
              type="number"
              className="h-8 text-xs"
              {...register("queryReplyHours", { valueAsNumber: true })}
            />
            {errors.queryReplyHours?.message && (
              <p className="text-danger text-xs">{errors.queryReplyHours.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="payer-active"
              checked={active}
              onCheckedChange={(checked) => setValue("active", Boolean(checked))}
            />
            <Label htmlFor="payer-active" className="cursor-pointer text-xs select-none">
              Active in desk
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
