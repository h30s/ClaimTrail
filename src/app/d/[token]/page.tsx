import type { Metadata } from "next";
import { FileText, ShieldAlert } from "lucide-react";
import { formatInr } from "@/lib/format";
import { db } from "@/lib/db";
import { hashDoctorToken } from "@/features/doctor-signoff/server/hash";
import { DoctorDecisionForm } from "@/features/doctor-signoff/components/doctor-decision-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctor Sign-Off",
};

export default async function DoctorSignoffPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const tokenHash = hashDoctorToken(token);

  const approval = await db.doctorApproval.findUnique({
    where: { tokenHash },
    include: {
      claim: {
        include: {
          patient: true,
          procedure: true,
          payer: true,
          fields: true,
          documents: {
            where: { deletedAt: null },
            include: { documentType: true },
            orderBy: { uploadedAt: "desc" },
          },
        },
      },
    },
  });

  const isExpired = !approval || approval.expiresAt < new Date();
  const isDecided = approval && approval.status !== "PENDING";

  if (isExpired || isDecided) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="border-border bg-surface w-full max-w-md space-y-4 rounded-2xl border p-6 text-center shadow-sm">
          <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
            <ShieldAlert className="text-muted-foreground size-6" />
          </div>
          <h1 className="text-foreground text-lg font-bold">Link No Longer Available</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isDecided
              ? "A decision has already been recorded for this sign-off request."
              : "This sign-off link has expired. Please ask the insurance desk for a new one."}
          </p>
          <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-3 text-xs">
            Company A Multispeciality Hospital, Nashik · Cashless Insurance Desk
          </div>
        </div>
      </div>
    );
  }

  const { claim } = approval;
  const patient = claim.patient;
  const age = Math.max(0, claim.admittedAt.getFullYear() - patient.dateOfBirth.getFullYear());

  // Find clinical notes or indoor case paper document
  const clinicalDoc =
    claim.documents.find(
      (d) =>
        d.documentType?.key === "DOCTORS_NOTES" ||
        d.documentType?.key === "INDOOR_CASE_PAPERS" ||
        d.documentType?.key === "DIAGNOSTIC_REPORT",
    ) || claim.documents[0];

  const diagnosisField = claim.fields.find((f) => f.fieldKey === "diagnosis");
  const treatmentField = claim.fields.find((f) => f.fieldKey === "proposedTreatment");

  return (
    <div className="bg-background min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Hospital letterhead banner */}
        <div className="border-border bg-surface space-y-1 rounded-2xl border p-5 shadow-2xs">
          <p className="text-primary text-xs font-semibold tracking-wider uppercase">
            Company A Multispeciality Hospital, Nashik
          </p>
          <h1 className="text-foreground text-lg font-bold tracking-tight">Doctor Sign-Off Request</h1>
          <p className="text-muted-foreground text-xs">
            Reviewing clinical details for cashless pre-authorisation
          </p>
        </div>

        {/* Doctor greeting */}
        <div className="text-muted-foreground px-1 text-xs">
          Hello <strong className="text-foreground font-semibold">{approval.doctorName}</strong>, please
          confirm the treatment details and clinical notes before submission to {claim.payer.name}.
        </div>

        {/* Patient Summary Card */}
        <div className="border-border bg-surface space-y-4 rounded-2xl border p-5 shadow-2xs">
          <div className="border-border/60 border-b pb-3">
            <span className="text-muted-foreground block text-[11px] font-semibold tracking-wider uppercase">
              Patient
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-foreground text-base font-bold">{patient.name}</span>
              <span className="text-muted-foreground font-mono text-xs">
                {age} {patient.gender} · {patient.uhid}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Proposed Procedure</span>
              <span className="text-foreground font-medium">{claim.procedure.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Estimated Bill</span>
              <span className="text-foreground font-mono font-medium">
                {formatInr(claim.estimatedAmount)}
              </span>
            </div>
          </div>

          {diagnosisField && (
            <div className="text-xs">
              <span className="text-muted-foreground block text-[11px]">Provisional Diagnosis</span>
              <span className="text-foreground font-medium">{diagnosisField.value}</span>
            </div>
          )}

          {treatmentField && (
            <div className="text-xs">
              <span className="text-muted-foreground block text-[11px]">Proposed Treatment</span>
              <span className="text-foreground font-medium">{treatmentField.value}</span>
            </div>
          )}
        </div>

        {/* Document Preview Card */}
        {clinicalDoc && (
          <div className="border-border bg-surface space-y-3 rounded-2xl border p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <FileText className="text-primary size-4" />
                <span>Clinical Document Preview</span>
              </div>
              <a
                href={`/d/${token}/file/${clinicalDoc.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-xs font-medium hover:underline"
              >
                Open in new tab
              </a>
            </div>

            <div className="border-border bg-muted/20 overflow-hidden rounded-lg border">
              <iframe
                src={`/d/${token}/file/${clinicalDoc.id}`}
                title="Clinical Notes"
                className="h-80 w-full"
              />
            </div>
          </div>
        )}

        {/* Action Form */}
        <div className="border-border bg-surface rounded-2xl border p-5 shadow-2xs">
          <DoctorDecisionForm token={token} doctorName={approval.doctorName} />
        </div>
      </div>
    </div>
  );
}
