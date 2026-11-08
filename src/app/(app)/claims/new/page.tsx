import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listPayers, listProcedures } from "@/features/catalog/server/queries";
import { NewClaimForm } from "@/features/claims/components/new-claim-form";

export const metadata: Metadata = {
  title: "New Claim",
};

export default async function NewClaimPage() {
  const user = await requireUser();
  const isHead = can(user.role, "claim:assign");

  const [payers, procedures, executives] = await Promise.all([
    listPayers({ activeOnly: true }),
    listProcedures({ activeOnly: true }),
    isHead
      ? db.user.findMany({
          where: { active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Cashless Request"
        description="Create a new pre-auth request and generate its required checklist."
      />

      <NewClaimForm payers={payers} procedures={procedures} executives={executives} isHead={isHead} />
    </div>
  );
}
