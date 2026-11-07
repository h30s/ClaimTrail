"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

type DemoUser = {
  name: string;
  role: string;
  email: string;
};

const DEMO_USERS: DemoUser[] = [
  { name: "Meera Kulkarni", role: "Desk Head", email: "meera.kulkarni@claimtrail.example" },
  { name: "Arjun Patil", role: "Desk Executive", email: "arjun.patil@claimtrail.example" },
  { name: "Sneha Joshi", role: "Desk Executive", email: "sneha.joshi@claimtrail.example" },
];

export function DemoAccounts({ demoPassword }: { demoPassword?: string }) {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleQuickSignIn = async (email: string) => {
    if (!demoPassword) return;
    setLoadingEmail(email);
    const result = await authClient.signIn.email({
      email,
      password: demoPassword,
    });
    if (!result.error) {
      router.push("/claims");
      router.refresh();
    } else {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface text-muted-foreground px-2">Demo Accounts</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {DEMO_USERS.map((user) => (
          <Button
            key={user.email}
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingEmail !== null}
            onClick={() => handleQuickSignIn(user.email)}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-foreground font-medium">{user.name}</span>
            <span className="text-muted-foreground flex items-center gap-1.5">
              {user.role}
              {loadingEmail === user.email && <Loader2 className="size-3 animate-spin" />}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
