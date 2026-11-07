import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { SettingsNav } from "@/components/settings-nav";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!can(user.role, "settings:manage")) {
    return <AccessDenied message="Only the desk head can change checklist rules and catalog settings." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure checklist rules matrix, medical document types, and insurance payers"
      />
      <SettingsNav />
      {children}
    </div>
  );
}
