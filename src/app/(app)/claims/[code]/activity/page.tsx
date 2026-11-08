import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { EventList } from "@/features/claims/components/event-list";
import { getClaimFile } from "@/features/claims/server/queries";
import { listAudit } from "@/features/audit/server/queries";
import { AuditTable } from "@/features/audit/components/audit-table";

export default async function ClaimActivityPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await requireUser();
  const file = await getClaimFile(user, code, new Date());
  if (!file) notFound();

  const isHead = can(user.role, "audit:view");

  const [events, auditData] = await Promise.all([
    db.claimEvent.findMany({
      where: { claimId: file.claim.id },
      include: { actor: { select: { name: true } } },
      orderBy: { at: "desc" },
    }),
    isHead ? listAudit({ claimCode: code }) : Promise.resolve(null),
  ]);

  const dtoList = events.map((e) => ({
    id: e.id,
    type: e.type,
    stage: e.stage,
    status: e.status,
    at: e.at,
    actorName: e.actor?.name ?? null,
    note: e.note,
  }));

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-foreground mb-3 text-sm font-semibold">Claim Timeline</h2>
        <EventList events={dtoList} />
      </div>

      {isHead && auditData && auditData.rows.length > 0 && (
        <div className="border-border space-y-3 border-t pt-6">
          <div>
            <h2 className="text-foreground text-sm font-semibold">Compliance Audit Trail</h2>
            <p className="text-muted-foreground text-xs">
              Detailed record of user accesses, packet downloads, and data modifications
            </p>
          </div>
          <AuditTable rows={auditData.rows} nextCursor={null} />
        </div>
      )}
    </div>
  );
}
