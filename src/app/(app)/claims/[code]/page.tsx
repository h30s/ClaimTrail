import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { listDocumentTypes } from "@/features/catalog/server/queries";
import { TimelineCard } from "@/features/claims/components/timeline-card";
import { getClaimFile } from "@/features/claims/server/queries";
import { listClaimDocuments } from "@/features/documents/server/queries";
import { ChecklistBoard } from "@/features/documents/components/checklist-board";

export default async function ClaimDocumentsPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await requireUser();
  const file = await getClaimFile(user, code, new Date());
  if (!file) notFound();

  const [docTypes, documents] = await Promise.all([listDocumentTypes(), listClaimDocuments(user, code)]);

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <ChecklistBoard
          gaps={file.insight.gaps}
          stage={file.claim.stage}
          payerName={file.payer.name}
          procedureName={file.procedure.name}
          claimCode={code}
          documents={documents}
          catalogDocTypes={docTypes.map((dt) => ({
            id: dt.id,
            key: dt.key,
            label: dt.label,
          }))}
        />
      </div>

      <div className="space-y-4">
        <TimelineCard code={code} events={file.recentEvents} />
      </div>
    </div>
  );
}
