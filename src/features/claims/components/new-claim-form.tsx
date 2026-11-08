"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import type { PayerDto, ProcedureDto } from "@/features/catalog/server/queries";
import { applyFieldErrors } from "@/hooks/apply-field-errors";
import { useAction } from "@/hooks/use-action";
import { CreateClaimSchema, type CreateClaimInput } from "../schemas";
import { createClaim } from "../server/actions";
import type { SearchedPatientDto } from "../server/search-patients";
import type { ExecutiveOption } from "./assign-claim-dialog";
import { AdmissionSection, InsuranceSection } from "./new-claim-form-sections";
import { PatientPicker } from "./patient-picker";

export function NewClaimForm({
  payers,
  procedures,
  executives,
  isHead,
}: {
  payers: PayerDto[];
  procedures: ProcedureDto[];
  executives: ExecutiveOption[];
  isHead: boolean;
}) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<SearchedPatientDto | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);

  const { run, pending } = useAction(createClaim, {
    success: "Claim created",
    onSuccess: (data) => {
      router.push(`/claims/${data.code}`);
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<CreateClaimInput>({
    resolver: zodResolver(CreateClaimSchema),
    defaultValues: {
      treatingDoctor: "Dr. Anand Kale",
      admittedAt: today,
      estimatedAmount: 85000,
      patientGender: "MALE",
    },
  });

  const payerId = useWatch({ control, name: "payerId" });
  const procedureId = useWatch({ control, name: "procedureId" });
  const patientGender = useWatch({ control, name: "patientGender" });
  const assigneeId = useWatch({ control, name: "assigneeId" });

  const onSubmit = async (data: CreateClaimInput) => {
    const res = await run(data);
    if (!res.ok && res.fieldErrors) {
      applyFieldErrors(setError, res.fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">1. Patient</h2>
        <PatientPicker
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          isNewPatient={isNewPatient}
          onToggleNewPatient={setIsNewPatient}
          register={register}
          setValue={setValue}
          gender={patientGender}
          errors={errors}
        />
      </div>

      <AdmissionSection
        procedures={procedures}
        procedureId={procedureId}
        setValue={setValue}
        register={register}
        errors={errors}
      />

      <InsuranceSection
        payers={payers}
        payerId={payerId}
        assignees={executives}
        assigneeId={assigneeId}
        isHead={isHead}
        setValue={setValue}
        register={register}
        errors={errors}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={() => router.push("/claims")}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Creating claim…" : "Create cashless claim"}
        </Button>
      </div>
    </form>
  );
}
