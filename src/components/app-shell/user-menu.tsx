"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const roleLabel = user.role === "DESK_HEAD" ? "Desk Head" : "Desk Executive";

  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full">
          <UserIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground truncate text-xs">{roleLabel}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground w-full justify-start text-xs"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 size-3.5" />
        Sign out
      </Button>
    </div>
  );
}
