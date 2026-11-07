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
import { Textarea } from "@/components/ui/textarea";
import { applyFieldErrors } from "@/hooks/apply-field-errors";
import { useAction } from "@/hooks/use-action";
import { UpdateDocumentTypeSchema, type UpdateDocumentTypeInput } from "../schemas";
import { updateDocumentType } from "../server/actions";
import type { DocumentTypeDto } from "../server/queries";

export function EditDocumentTypeDialog({ docType }: { docType: DocumentTypeDto }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction(updateDocumentType, {
    success: "Document type updated",
    onSuccess: () => setOpen(false),
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateDocumentTypeInput>({
    resolver: zodResolver(UpdateDocumentTypeSchema),
    defaultValues: {
      id: docType.id,
      label: docType.label,
      description: docType.description,
      sortOrder: docType.sortOrder,
      active: docType.active,
    },
  });

  const active = useWatch({ control, name: "active" });

  const onSubmit = async (data: UpdateDocumentTypeInput) => {
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
            <DialogTitle className="text-base font-semibold">Edit Document Type</DialogTitle>
            <DialogDescription className="text-xs">
              Key: <span className="font-mono font-medium">{docType.key}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs">
              Display Label
            </Label>
            <Input id="label" className="h-8 text-xs" {...register("label")} />
            {errors.label?.message && <p className="text-danger text-xs">{errors.label.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">
              Description / AI Hint
            </Label>
            <Textarea id="description" rows={3} className="text-xs" {...register("description")} />
            {errors.description?.message && (
              <p className="text-danger text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 space-y-1.5">
              <Label htmlFor="sortOrder" className="text-xs">
                Packet Order
              </Label>
              <Input
                id="sortOrder"
                type="number"
                className="h-8 text-xs"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(checked) => setValue("active", Boolean(checked))}
              />
              <Label htmlFor="active" className="cursor-pointer text-xs select-none">
                Active in desk
              </Label>
            </div>
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
