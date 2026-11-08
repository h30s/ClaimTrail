import { CheckCircle2 } from "lucide-react";
import { formatInr } from "@/lib/format";
import { DEDUCTION_REASON_LABEL } from "../domain/labels";
import type { ClaimFileDto } from "../types";

export function SettlementCard({ file }: { file: ClaimFileDto }) {
  const { billedAmount, settledAmount } = file.claim;
  const deductions = file.deductions ?? [];
  const totalDeductions = deductions.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="text-success flex items-center gap-1.5 text-xs font-semibold">
          <CheckCircle2 className="size-4" />
          <span>Claim Settled</span>
        </div>
        <span className="text-foreground font-mono text-xs font-medium">
          {settledAmount !== null ? formatInr(settledAmount) : "—"} settled
        </span>
      </div>

      <div className="bg-muted/30 grid grid-cols-2 gap-2 rounded-md p-2 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Billed</span>
          <span className="text-foreground font-mono font-medium">
            {billedAmount !== null ? formatInr(billedAmount) : "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Total Deductions</span>
          <span className="text-warning font-mono font-medium">
            {totalDeductions > 0 ? formatInr(totalDeductions) : "₹0"}
          </span>
        </div>
      </div>

      {deductions.length > 0 && (
        <div className="border-border space-y-1.5 border-t pt-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Itemized Deductions
          </span>
          <div className="space-y-1">
            {deductions.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-foreground">{DEDUCTION_REASON_LABEL[d.reason]}</span>
                  {d.note && (
                    <span className="text-muted-foreground block truncate text-[11px]">{d.note}</span>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 font-mono">{formatInr(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
