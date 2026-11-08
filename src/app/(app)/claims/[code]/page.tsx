import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { TimelineCard } from "@/features/claims/components/timeline-card";
import { getClaimFile } from "@/features/claims/server/queries";
import { ChecklistSection } from "@/features/checklist/components/checklist-section";

export default async function ClaimDocumentsPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await requireUser();
  const file = await getClaimFile(user, code, new Date());
  if (!file) notFound();

  const docTypes = await listDocumentTypes();
  const docTypeLabels = Object.fromEntries(docTypes.map((dt) => [dt.id, dt.label]));

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <ChecklistSection
          gaps={file.insight.gaps}
          stage={file.claim.stage}
          payerName={file.payer.name}
          procedureName={file.procedure.name}
          docTypeLabels={docTypeLabels}
        />
      </div>

      <div className="space-y-4">
        <TimelineCard code={code} events={file.recentEvents} />
      </div>
    </div>
  );
}
