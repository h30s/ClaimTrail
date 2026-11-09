import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PayerDto, ProcedureDto } from "@/features/catalog/server/queries";
import type { CreateClaimInput } from "../schemas";
import type { ExecutiveOption } from "./assign-claim-dialog";

export function AdmissionSection({
  procedures,
  procedureId,
  setValue,
  register,
  errors,
}: {
  procedures: ProcedureDto[];
  procedureId?: string;
  setValue: UseFormSetValue<CreateClaimInput>;
  register: UseFormRegister<CreateClaimInput>;
  errors: FieldErrors<CreateClaimInput>;
}) {
  const procedureItems = procedures.map((proc) => ({ value: proc.id, label: proc.name }));

  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
      <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        2. Admission &amp; Treatment
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Procedure</Label>
          <Select
            items={procedureItems}
            value={procedureId || null}
            onValueChange={(val) => {
              if (val) setValue("procedureId", val, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select procedure" />
            </SelectTrigger>
            <SelectContent>
              {procedures.map((proc) => (
                <SelectItem key={proc.id} value={proc.id}>
                  {proc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.procedureId?.message && <p className="text-danger text-xs">{errors.procedureId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Treating Doctor</Label>
          <Input className="h-8 text-xs" {...register("treatingDoctor")} />
          {errors.treatingDoctor?.message && (
            <p className="text-danger text-xs">{errors.treatingDoctor.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Admission Date</Label>
          <Input type="date" className="h-8 text-xs" {...register("admittedAt")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Estimated Amount (₹)</Label>
          <Input
            type="number"
            className="h-8 font-mono text-xs"
            {...register("estimatedAmount", { valueAsNumber: true })}
          />
          {errors.estimatedAmount?.message && (
            <p className="text-danger text-xs">{errors.estimatedAmount.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsuranceSection({
  payers,
  payerId,
  assignees,
  assigneeId,
  isHead,
  setValue,
  register,
  errors,
}: {
  payers: PayerDto[];
  payerId?: string;
  assignees: ExecutiveOption[];
  assigneeId?: string;
  isHead: boolean;
  setValue: UseFormSetValue<CreateClaimInput>;
  register: UseFormRegister<CreateClaimInput>;
  errors: FieldErrors<CreateClaimInput>;
}) {
  const payerItems = payers.map((p) => ({ value: p.id, label: `${p.name} (${p.kind})` }));
  const assigneeItems = assignees.map((e) => ({ value: e.id, label: e.name }));

  return (
    <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
      <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        3. Insurance &amp; Policy
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Payer / TPA</Label>
          <Select
            items={payerItems}
            value={payerId || null}
            onValueChange={(val) => {
              if (val) setValue("payerId", val, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select payer" />
            </SelectTrigger>
            <SelectContent>
              {payers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.kind})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payerId?.message && <p className="text-danger text-xs">{errors.payerId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Policy Number</Label>
          <Input
            className="h-8 font-mono text-xs"
            placeholder="DEMO-B-104921"
            {...register("policyNumber")}
          />
          {errors.policyNumber?.message && (
            <p className="text-danger text-xs">{errors.policyNumber.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Payer Reference (Optional)</Label>
          <Input className="h-8 font-mono text-xs" placeholder="CCN-88912" {...register("payerReference")} />
        </div>

        {isHead ? (
          <div className="space-y-1">
            <Label className="text-xs">Assign Executive</Label>
            <Select
              items={assigneeItems}
              value={assigneeId || null}
              onValueChange={(val) => {
                if (val) setValue("assigneeId", val, { shouldValidate: true });
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">Assignment</Label>
            <p className="text-muted-foreground pt-1.5 text-xs font-medium">Assigned to you</p>
          </div>
        )}
      </div>
    </div>
  );
}
