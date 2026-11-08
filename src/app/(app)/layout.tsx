import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { requireUser } from "@/lib/auth/session";
import { getInboxBadge } from "@/features/tpa-queries/server/queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const badge = await getInboxBadge(user, new Date());

  return (
    <div className="flex min-h-dvh">
      <Sidebar user={user} inboxBadge={badge} className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav user={user} inboxBadge={badge} className="md:hidden" />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
