import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { EventList } from "@/features/claims/components/event-list";
import { getClaimFile } from "@/features/claims/server/queries";

export default async function ClaimActivityPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await requireUser();
  const file = await getClaimFile(user, code, new Date());
  if (!file) notFound();

  const events = await db.claimEvent.findMany({
    where: { claimId: file.claim.id },
    include: { actor: { select: { name: true } } },
    orderBy: { at: "desc" },
  });

  const dtoList = events.map((e) => ({
    id: e.id,
    type: e.type,
    stage: e.stage,
    status: e.status,
    at: e.at,
    actorName: e.actor?.name ?? null,
    note: e.note,
  }));

  return (
    <div className="max-w-3xl">
      <EventList events={dtoList} />
    </div>
  );
}
