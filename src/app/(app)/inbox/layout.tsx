import { requireUser } from "@/lib/auth/session";
import type { InboxFilter } from "@/features/tpa-queries/domain/inbox-filter";
import { listInbox } from "@/features/tpa-queries/server/queries";
import { InboxFilters } from "@/features/tpa-queries/components/inbox-filters";
import { QueryList } from "@/features/tpa-queries/components/query-list";
import { SimulateEmailDialog } from "@/features/tpa-queries/components/simulate-email-dialog";
import { InboxLayoutClient } from "@/features/tpa-queries/components/inbox-layout-client";

export default async function InboxLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  await params;
  const now = new Date();
  const filter: InboxFilter = "open";

  const { rows, counts } = await listInbox(user, filter, now);

  const sidebar = (
    <div className="flex h-full flex-col">
      <InboxFilters currentFilter={filter} counts={counts} />
      <div className="flex-1 overflow-y-auto">
        <QueryList queries={rows} filter={filter} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-bold tracking-tight">Query Inbox</h1>
          <p className="text-muted-foreground text-xs">
            Live query emails from health insurers and TPAs with reply countdowns
          </p>
        </div>
        <SimulateEmailDialog />
      </div>

      <InboxLayoutClient sidebar={sidebar}>{children}</InboxLayoutClient>
    </div>
  );
}
