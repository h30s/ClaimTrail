import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listPayers } from "@/features/catalog/server/queries";
import { WorklistList } from "@/features/claims/components/worklist-list";
import { WorklistTabs } from "@/features/claims/components/worklist-tabs";
import { WorklistToolbar } from "@/features/claims/components/worklist-toolbar";
import { WorklistParamsSchema } from "@/features/claims/schemas";
import { listWorklist } from "@/features/claims/server/queries";
import type { WorklistTab } from "@/features/claims/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claims",
};

export default async function ClaimsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const rawParams = await props.searchParams;

  const parsed = WorklistParamsSchema.safeParse({
    tab: typeof rawParams.tab === "string" ? rawParams.tab : "action",
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    payer: typeof rawParams.payer === "string" ? rawParams.payer : undefined,
    assignee: typeof rawParams.assignee === "string" ? rawParams.assignee : undefined,
  });

  const tab = (parsed.success ? parsed.data.tab : "action") as WorklistTab;
  const q = parsed.success ? parsed.data.q : undefined;
  const payerId = parsed.success ? parsed.data.payer : undefined;
  const assigneeId = parsed.success ? parsed.data.assignee : undefined;

  const isHead = can(user.role, "claim:assign");

  const [{ rows, counts }, payers, assignees] = await Promise.all([
    listWorklist(user, { tab, q, payerId, assigneeId }, new Date()),
    listPayers({ activeOnly: true }),
    isHead
      ? db.user.findMany({
          where: { active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Claims"
        description="Active cashless requests, queries, and insurer decisions."
        actions={
          <Link href="/claims/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="size-4" />
            <span>New claim</span>
          </Link>
        }
      />

      <WorklistToolbar payers={payers} assignees={assignees} isHead={isHead} />

      <WorklistTabs currentTab={tab} counts={counts} searchParams={rawParams} />

      <WorklistList rows={rows} tab={tab} hasQuery={Boolean(q || payerId || assigneeId)} />
    </div>
  );
}
