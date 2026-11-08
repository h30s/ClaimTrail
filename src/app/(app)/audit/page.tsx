import { AccessDenied } from "@/components/access-denied";
import { AuditFilters } from "@/features/audit/components/audit-filters";
import { AuditTable } from "@/features/audit/components/audit-table";
import type { AuditAction } from "@/features/audit/domain/audit-actions";
import { listAudit } from "@/features/audit/server/queries";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditPage(props: {
  searchParams: Promise<{
    actorId?: string;
    action?: string;
    claimCode?: string;
    cursor?: string;
  }>;
}) {
  const user = await requireUser();
  if (!can(user.role, "audit:view")) {
    return <AccessDenied message="Only the desk head can view the compliance audit log." />;
  }

  const searchParams = await props.searchParams;
  const { actorId, action, claimCode, cursor } = searchParams;

  const [actors, auditData] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    listAudit({
      actorId: actorId || undefined,
      action: (action as AuditAction) || undefined,
      claimCode: claimCode || undefined,
      cursor: cursor || undefined,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-foreground text-xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground text-xs">
          Immutable event trail for DPDP compliance, patient data access, and desk actions
        </p>
      </div>

      <AuditFilters
        actors={actors}
        currentActorId={actorId}
        currentAction={action}
        currentClaimCode={claimCode}
      />

      <AuditTable
        rows={auditData.rows}
        nextCursor={auditData.nextCursor}
        baseSearchParams={{ actorId, action, claimCode }}
      />
    </div>
  );
}
