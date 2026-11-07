// Who is asking. Cached per request so layouts, pages and actions share one lookup.
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Role } from "@/lib/enums";
import { auth } from "./auth";
import { can, type Permission } from "./permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const RoleSchema = z.enum(["DESK_HEAD", "DESK_EXECUTIVE"]);

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const userRecord = session.user as unknown as { active?: boolean; role?: string };
  if (userRecord.active === false) return null;
  const role = RoleSchema.safeParse(userRecord.role);
  if (!role.success) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: role.data,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getSessionUser();
  return user !== null && can(user.role, permission);
}
