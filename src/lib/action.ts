// Every Server Action goes through here: session, permission, input validation,
// and error translation. Services stay free of HTTP and auth plumbing.
import "server-only";
import type { z } from "zod";
import { requireUser, type SessionUser } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/permissions";
import { AppError, ForbiddenError, ValidationError } from "@/lib/errors";

export type FieldErrors = Record<string, string[] | undefined>;
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: FieldErrors };

export function defineAction<S extends z.ZodType, R>(
  config: { schema: S; permission?: Permission },
  handler: (input: z.output<S>, ctx: { user: SessionUser }) => Promise<R>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<R>> => {
    const user = await requireUser(); // redirects; must stay outside try/catch
    if (config.permission && !can(user.role, config.permission)) {
      return { ok: false, error: new ForbiddenError().message };
    }
    const parsed = config.schema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    try {
      return { ok: true, data: await handler(parsed.data, { user }) };
    } catch (error) {
      return toActionError(error);
    }
  };
}

function toActionError(error: unknown): { ok: false; error: string; fieldErrors?: FieldErrors } {
  if (error instanceof ValidationError) {
    return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof AppError) {
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Something went wrong. Try again." };
}
