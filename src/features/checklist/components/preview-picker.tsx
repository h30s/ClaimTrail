"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PayerDto, ProcedureDto } from "@/features/catalog/server/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function PreviewPicker({
  payers,
  procedures,
  previewPayerId,
  previewProcedureId,
}: {
  payers: PayerDto[];
  procedures: ProcedureDto[];
  previewPayerId: string;
  previewProcedureId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, val: string | null) => {
    if (!val) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, val);
    router.replace(`/settings/checklists?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Preview Payer</Label>
        <Select value={previewPayerId} onValueChange={(val) => updateParam("previewPayer", val)}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {payers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Preview Procedure</Label>
        <Select value={previewProcedureId} onValueChange={(val) => updateParam("previewProcedure", val)}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {procedures.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
