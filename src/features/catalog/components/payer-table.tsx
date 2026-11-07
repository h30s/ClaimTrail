import { Badge } from "@/components/ui/badge";
import type { PayerDto } from "../server/queries";
import { EditPayerDialog } from "./edit-payer-dialog";

export function PayerTable({ payers }: { payers: PayerDto[] }) {
  return (
    <div className="border-border bg-surface overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs uppercase">
            <th className="px-4 py-2.5 font-semibold">Payer / Insurer</th>
            <th className="w-32 px-4 py-2.5 font-semibold">Type</th>
            <th className="px-4 py-2.5 font-semibold">Email Domain</th>
            <th className="w-36 px-4 py-2.5 font-semibold">Reply Window</th>
            <th className="w-24 px-4 py-2.5 font-semibold">Status</th>
            <th className="w-20 px-4 py-2.5 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-border/60 divide-y">
          {payers.map((payer) => (
            <tr key={payer.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <p className="text-foreground text-sm font-medium">{payer.name}</p>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={payer.kind === "TPA" ? "neutral" : "outline"}
                  className="font-mono text-[10px] uppercase"
                >
                  {payer.kind}
                </Badge>
              </td>
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{payer.emailDomain}</td>
              <td className="text-foreground px-4 py-3 text-xs">
                <span className="font-medium">{payer.queryReplyHours}</span> hours
              </td>
              <td className="px-4 py-3">
                <Badge variant={payer.active ? "success" : "neutral"} className="text-[10px]">
                  {payer.active ? "Active" : "Disabled"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <EditPayerDialog payer={payer} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
