// Helpers for our few route handlers (uploads, file streaming, packets).
import "server-only";
import { ZodError } from "zod";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { AppError, ForbiddenError, UnauthorizedError } from "@/lib/errors";

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Blocks cross-site POSTs to our own route handlers (Server Actions check this themselves). */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    throw new ForbiddenError("Cross-site request blocked.");
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ error: error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
}
