import type { PayerDto, ProcedureDto } from "@/features/catalog/server/queries";
import { SCOPE_LABEL, STAGE_LABEL } from "../domain/labels";
import type { StagePreviewDto } from "../server/queries";
import { PreviewPicker } from "./preview-picker";
import { RequirementChip } from "./requirement-chip";

export function ChecklistPreview({
  payers,
  procedures,
  previewPayerId,
  previewProcedureId,
  previewStages,
}: {
  payers: PayerDto[];
  procedures: ProcedureDto[];
  previewPayerId: string;
  previewProcedureId: string;
  previewStages: StagePreviewDto[];
}) {
  return (
    <div className="border-border bg-surface space-y-4 rounded-lg border p-5">
      <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-foreground text-sm font-semibold">Effective Checklist Preview</h3>
          <p className="text-muted-foreground text-xs">
            Calculated requirements based on 4-tier precedence: Payer+Procedure &gt; Payer &gt; Procedure &gt;
            Global
          </p>
        </div>
        <PreviewPicker
          payers={payers}
          procedures={procedures}
          previewPayerId={previewPayerId}
          previewProcedureId={previewProcedureId}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {previewStages.map((sp) => (
          <div key={sp.stage} className="border-border/70 space-y-3 rounded-md border p-3">
            <div className="border-border/50 flex items-center justify-between border-b pb-2">
              <span className="text-foreground text-xs font-semibold">{STAGE_LABEL[sp.stage]}</span>
              <span className="text-muted-foreground text-[11px]">
                {sp.items.length} {sp.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {sp.items.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                Nothing required for this combination at this stage.
              </p>
            ) : (
              <ul className="space-y-2">
                {sp.items.map((item) => (
                  <li
                    key={item.documentTypeId}
                    className="border-border/40 flex flex-col gap-0.5 rounded border p-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <RequirementChip requirement={item.requirement} needsFreshCopy={item.needsFreshCopy} />
                    </div>
                    <span className="text-muted-foreground text-[10px]">
                      Source: {SCOPE_LABEL[item.scope]}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {sp.overrides.length > 0 && (
              <div className="border-border/60 border-t border-dashed pt-2">
                <p className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">
                  Rule Overrides
                </p>
                <div className="space-y-1">
                  {sp.overrides.map((ov, idx) => (
                    <p key={idx} className="text-muted-foreground text-[11px]">
                      <span className="text-foreground font-medium">{ov.label}</span>:{" "}
                      {SCOPE_LABEL[ov.winner]} ({ov.winnerRequirement}) overrides {SCOPE_LABEL[ov.loser]} (
                      {ov.loserRequirement})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
