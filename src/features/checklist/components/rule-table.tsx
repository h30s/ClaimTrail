import type { RuleScopeInput } from "../schemas";
import type { RuleEditorRow } from "../server/queries";
import { RuleRow } from "./rule-row";

export function RuleTable({
  rows,
  scope,
  isGlobal,
}: {
  rows: RuleEditorRow[];
  scope: RuleScopeInput;
  isGlobal: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-surface text-muted-foreground rounded-lg border p-8 text-center text-sm">
        No document types found. Add document types in catalog settings first.
      </div>
    );
  }

  return (
    <div className="border-border bg-surface overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs uppercase">
            <th className="px-4 py-2.5 font-semibold">Document Type</th>
            <th className="px-4 py-2.5 font-semibold">Requirement at this scope</th>
            <th className="px-4 py-2.5 font-semibold">Condition</th>
            <th className="px-4 py-2.5 text-right font-semibold">Effective Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RuleRow key={row.documentType.id} row={row} scope={scope} isGlobal={isGlobal} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
