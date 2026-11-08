import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { formatDuration } from "@/lib/format";
import { DeductionsChart } from "@/features/dashboard/components/deductions-chart";
import { PendingApprovalsList } from "@/features/dashboard/components/pending-approvals-list";
import { PeriodSelect } from "@/features/dashboard/components/period-select";
import { StatTile } from "@/features/dashboard/components/stat-tile";
import { getDashboard } from "@/features/dashboard/server/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage(props: { searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const days = Number(searchParams.days) || 30;

  const data = await getDashboard(user, { days }, new Date());

  const dischargeWaitFormatted =
    data.dischargeWait.count > 0 ? formatDuration(data.dischargeWait.totalMs) : "—";
  const dischargeSub =
    data.dischargeWait.count > 0
      ? `us ${formatDuration(data.dischargeWait.hospitalMs)} · insurer ${formatDuration(data.dischargeWait.payerMs)}`
      : "No discharge approvals";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            Performance metrics, query SLAs, and deduction patterns
          </p>
        </div>
        <Suspense fallback={null}>
          <PeriodSelect currentDays={data.days} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Pending approvals"
          value={data.pendingCount}
          secondary={
            data.pendingCount > 0
              ? `oldest ${formatDuration(data.oldestPendingMs)}`
              : "All decisions received"
          }
        />

        <StatTile
          label="Queries due today"
          value={data.queriesDueTodayCount}
          secondary={
            data.queriesOverdueCount > 0 ? (
              <span className="text-danger font-medium">{data.queriesOverdueCount} overdue</span>
            ) : (
              "None overdue"
            )
          }
        />

        <StatTile
          label="Same-day replies"
          value={`${data.sameDayReplies.rate}%`}
          targetLine="target 90%"
          belowTarget={data.sameDayReplies.rate < 90}
          secondary={`${data.sameDayReplies.sameDay} of ${data.sameDayReplies.total} answered`}
        />

        <StatTile
          label="Discharge wait"
          value={dischargeWaitFormatted}
          targetLine="target 2.5h"
          belowTarget={data.dischargeWait.totalMs > 2.5 * 3600000}
          secondary={dischargeSub}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <DeductionsChart deductions={data.deductions} />
        <PendingApprovalsList items={data.pendingApprovalsList} aiSorting={data.aiSorting} />
      </div>
    </div>
  );
}
