import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoAccounts } from "@/features/auth/components/demo-accounts";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getSessionUser } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect("/claims");

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary text-primary-foreground mb-2 flex size-10 items-center justify-center rounded-lg text-base font-bold">
            CT
          </div>
          <h1 className="text-foreground text-xl font-bold tracking-tight">ClaimTrail</h1>
          <p className="text-muted-foreground text-xs">Cashless claims and TPA workspace</p>
        </div>

        <Card className="border-border bg-surface shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Sign in</CardTitle>
            <CardDescription className="text-xs">Access the hospital insurance claims desk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInForm />
            {env.DEMO_MODE && <DemoAccounts demoPassword={env.DEMO_PASSWORD} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
