import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "cn";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";

export function Sidebar({
  user,
  inboxBadge,
  className,
}: {
  user: SessionUser;
  inboxBadge?: { dueToday: number; overdue: number; hasOverdue: boolean };
  className?: string;
}) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || can(user.role, item.permission)).map(
    (item) => {
      if (item.href === "/inbox" && inboxBadge) {
        return {
          ...item,
          badge: inboxBadge.dueToday,
          hasDot: inboxBadge.hasOverdue,
        };
      }
      return item;
    },
  );

  return (
    <aside
      className={cn("border-border bg-surface flex w-64 flex-col justify-between border-r p-4", className)}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-semibold">
            CT
          </div>
          <div>
            <h1 className="text-foreground text-base font-semibold tracking-tight">ClaimTrail</h1>
            <p className="text-muted-foreground text-[11px]">Nashik Desk</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>

      <UserMenu user={user} />
    </aside>
  );
}
