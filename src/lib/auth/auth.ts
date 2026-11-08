// Better Auth: email + password only, no self sign-up. Accounts come from the seed or an admin.
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 10 },
  session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 }, // one shift
  user: {
    additionalFields: {
      role: { type: "string", input: false },
      active: { type: "boolean", input: false },
    },
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === "production" && !process.env.PLAYWRIGHT_TEST,
    storage: "database",
    customRules: { "/sign-in/email": { window: 60, max: 10 } },
  },
  plugins: [nextCookies()],
});
