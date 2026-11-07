"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PayerDto, ProcedureDto } from "@/features/catalog/server/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ScopePicker({
  payers,
  procedures,
  currentPayerId,
  currentProcedureId,
}: {
  payers: PayerDto[];
  procedures: ProcedureDto[];
  currentPayerId: string | null;
  currentProcedureId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, val: string | null) => {
    if (!val) return;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    router.replace(`/settings/checklists?${params.toString()}`);
  };

  const payerName = payers.find((p) => p.id === currentPayerId)?.name ?? "All payers";
  const procName = procedures.find((p) => p.id === currentProcedureId)?.name ?? "All procedures";

  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Label htmlFor="payer-scope" className="text-muted-foreground text-xs">
            Payer scope
          </Label>
          <Select value={currentPayerId ?? "all"} onValueChange={(val) => updateParam("payer", val)}>
            <SelectTrigger id="payer-scope" className="h-9 w-48 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payers</SelectItem>
              {payers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="proc-scope" className="text-muted-foreground text-xs">
            Procedure scope
          </Label>
          <Select value={currentProcedureId ?? "all"} onValueChange={(val) => updateParam("procedure", val)}>
            <SelectTrigger id="proc-scope" className="h-9 w-60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All procedures</SelectItem>
              {procedures.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted/50 text-muted-foreground rounded-md px-3 py-1.5 text-xs">
        Editing:{" "}
        <span className="text-foreground font-medium">
          {payerName} · {procName}
        </span>
      </div>
    </div>
  );
}
