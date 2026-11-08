import type { Metadata } from "next";
import { listPayers, listProcedures } from "@/features/catalog/server/queries";
import { ChecklistPreview } from "@/features/checklist/components/checklist-preview";
import { RuleTable } from "@/features/checklist/components/rule-table";
import { ScopePicker } from "@/features/checklist/components/scope-picker";
import { StageTabs } from "@/features/checklist/components/stage-tabs";
import { getChecklistPreview, getRuleEditor } from "@/features/checklist/server/queries";
import type { Stage } from "@/lib/enums";

type SearchParams = Promise<{
  payer?: string;
  procedure?: string;
  stage?: string;
  previewPayer?: string;
  previewProcedure?: string;
}>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checklist Rules",
};

export default async function ChecklistRulesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [payers, procedures] = await Promise.all([
    listPayers({ activeOnly: true }),
    listProcedures({ activeOnly: true }),
  ]);

  const payerId = params.payer && params.payer !== "all" ? params.payer : null;
  const procedureId = params.procedure && params.procedure !== "all" ? params.procedure : null;

  const validStages: Stage[] = ["PRE_AUTH", "ENHANCEMENT", "DISCHARGE"];
  const stage: Stage = validStages.includes(params.stage as Stage) ? (params.stage as Stage) : "PRE_AUTH";

  const scope = { payerId, procedureId, stage };
  const isGlobal = payerId === null && procedureId === null;

  const previewPayerId = params.previewPayer ?? payers[0]?.id ?? "";
  const previewProcedureId = params.previewProcedure ?? procedures[0]?.id ?? "";

  const [editorRows, previewStages] = await Promise.all([
    getRuleEditor(scope),
    previewPayerId && previewProcedureId
      ? getChecklistPreview({ payerId: previewPayerId, procedureId: previewProcedureId })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-foreground text-base font-semibold">Rule Matrix</h2>
        <p className="text-muted-foreground text-xs">
          Define mandatory and optional documents per insurance payer and procedure. Specific rules override
          broader ones.
        </p>
      </div>

      <ScopePicker
        payers={payers}
        procedures={procedures}
        currentPayerId={payerId}
        currentProcedureId={procedureId}
      />

      <StageTabs currentStage={stage} searchParams={params} />

      <RuleTable rows={editorRows} scope={scope} isGlobal={isGlobal} />

      {previewPayerId && previewProcedureId && (
        <ChecklistPreview
          payers={payers}
          procedures={procedures}
          previewPayerId={previewPayerId}
          previewProcedureId={previewProcedureId}
          previewStages={previewStages}
        />
      )}
    </div>
  );
}
