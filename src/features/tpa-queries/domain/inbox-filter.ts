// features/tpa-queries/domain/inbox-filter.ts
import { istDateKey } from "@/lib/format";

export type InboxFilter = "open" | "due-today" | "overdue" | "unmatched" | "answered";

export type InboxQueryItem = {
  status: "OPEN" | "ANSWERED";
  deadlineAt: Date;
  repliedAt?: Date | null;
  claimId: string | null;
};

export function matchesFilter(filter: InboxFilter, q: InboxQueryItem, now: Date): boolean {
  switch (filter) {
    case "open":
      return q.status === "OPEN";
    case "due-today":
      return q.status === "OPEN" && istDateKey(q.deadlineAt) === istDateKey(now);
    case "overdue":
      return q.status === "OPEN" && q.deadlineAt < now;
    case "unmatched":
      return q.status === "OPEN" && q.claimId === null;
    case "answered":
      return q.status === "ANSWERED";
  }
}

export function compareForInbox(a: InboxQueryItem, b: InboxQueryItem): number {
  if (a.status !== b.status) {
    return a.status === "OPEN" ? -1 : 1;
  }

  if (a.status === "ANSWERED") {
    const aReplied = a.repliedAt?.getTime() ?? 0;
    const bReplied = b.repliedAt?.getTime() ?? 0;
    return bReplied - aReplied;
  }

  return a.deadlineAt.getTime() - b.deadlineAt.getTime();
}
