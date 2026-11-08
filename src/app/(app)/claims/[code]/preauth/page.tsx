import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getPreauthForm } from "@/features/preauth/server/queries";
import { PreauthForm } from "@/features/preauth/components/preauth-form";

export default async function PreauthPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const user = await requireUser();
  const form = await getPreauthForm(user, code);
  if (!form) notFound();

  return (
    <div className="max-w-4xl">
      <PreauthForm claimCode={code} views={form.views} progress={form.progress} />
    </div>
  );
}
