import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { recordAudit } from "@/features/audit/server/record-audit";
import { AttentionStrip } from "@/features/claims/components/attention-strip";
import { ClaimHeader } from "@/features/claims/components/claim-header";
import { ClaimTabs } from "@/features/claims/components/claim-tabs";
import { getClaimFile } from "@/features/claims/server/queries";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function generateMetadata(props: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await props.params;
  return {
    title: code,
  };
}

export default async function ClaimLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await requireUser();
  const file = await getClaimFile(user, code, new Date());
  if (!file) notFound();

  const isHead = can(user.role, "claim:assign");
  const executives = isHead
    ? await db.user.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  await recordAudit(db, {
    actorId: user.id,
    action: "CLAIM_VIEWED",
    entityType: "claim",
    entityId: file.claim.id,
    claimId: file.claim.id,
  });

  return (
    <div className="space-y-4">
      <ClaimHeader file={file} user={user} executives={executives} />
      <AttentionStrip items={file.insight.attention} readyLine={file.readyLine} />
      <ClaimTabs code={code} />
      {children}
    </div>
  );
}
