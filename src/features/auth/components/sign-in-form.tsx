"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { SignInSchema, type SignInInput } from "../schemas";

export function SignInForm({ demoEmail, demoPassword }: { demoEmail?: string; demoPassword?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: demoEmail ?? "",
      password: demoPassword ?? "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setServerError(null);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      if (result.error.status === 401) {
        setServerError("Email or password is incorrect.");
      } else if (result.error.status === 429) {
        setServerError("Too many attempts. Try again in a minute.");
      } else {
        setServerError(result.error.message || "Failed to sign in. Please try again.");
      }
      return;
    }

    router.push("/claims");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="border-danger/20 bg-danger-soft text-danger rounded-md border p-3 text-sm">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@claimtrail.example"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email?.message && <p className="text-danger text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password?.message && <p className="text-danger text-xs">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        Sign in to desk
      </Button>
    </form>
  );
}
