"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "cn";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";

export function MobileNav({
  user,
  inboxBadge,
  className,
}: {
  user: SessionUser;
  inboxBadge?: { dueToday: number; overdue: number; hasOverdue: boolean };
  className?: string;
}) {
  const [open, setOpen] = useState(false);
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
    <header
      className={cn(
        "border-border bg-surface flex h-14 items-center justify-between border-b px-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-semibold">
          CT
        </div>
        <span className="text-foreground font-semibold">ClaimTrail</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <SheetHeader className="text-left">
              <SheetTitle className="text-base font-semibold">ClaimTrail</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1" onClick={() => setOpen(false)}>
              {visibleItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          <UserMenu user={user} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
