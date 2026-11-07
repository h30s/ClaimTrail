import { Badge } from "@/components/ui/badge";
import type { DocumentTypeDto } from "../server/queries";
import { EditDocumentTypeDialog } from "./edit-document-type-dialog";

export function DocumentTypeTable({ docTypes }: { docTypes: DocumentTypeDto[] }) {
  return (
    <div className="border-border bg-surface overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs uppercase">
            <th className="w-16 px-4 py-2.5 font-semibold">Order</th>
            <th className="px-4 py-2.5 font-semibold">Label &amp; Key</th>
            <th className="px-4 py-2.5 font-semibold">Description / AI Hint</th>
            <th className="w-24 px-4 py-2.5 font-semibold">Status</th>
            <th className="w-20 px-4 py-2.5 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-border/60 divide-y">
          {docTypes.map((dt) => (
            <tr key={dt.id} className="hover:bg-muted/30 transition-colors">
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{dt.sortOrder}</td>
              <td className="px-4 py-3">
                <p className="text-foreground text-sm font-medium">{dt.label}</p>
                <p className="text-muted-foreground font-mono text-xs">{dt.key}</p>
              </td>
              <td className="text-muted-foreground max-w-md px-4 py-3 text-xs">{dt.description}</td>
              <td className="px-4 py-3">
                <Badge variant={dt.active ? "success" : "neutral"} className="text-[10px]">
                  {dt.active ? "Active" : "Disabled"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <EditDocumentTypeDialog docType={dt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
