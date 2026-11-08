import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getQueryDetail } from "@/features/tpa-queries/server/queries";
import { QueryDetail } from "@/features/tpa-queries/components/query-detail";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Query Detail" };
}

export default async function QueryDetailPage({ params }: { params: Promise<{ queryId: string }> }) {
  const user = await requireUser();
  const { queryId } = await params;

  const query = await getQueryDetail(user, queryId);
  if (!query) notFound();

  return <QueryDetail query={query} currentUserName={user.name} />;
}
