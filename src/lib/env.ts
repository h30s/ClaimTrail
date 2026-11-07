import { z } from "zod";

const EnvSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GEMINI_API_KEY: z.string().min(1),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    STORAGE_DRIVER: z.enum(["local", "supabase"]),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_STORAGE_BUCKET: z.string().default("claim-documents"),
    DEMO_MODE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    DEMO_PASSWORD: z.string().min(10).optional(),
  })
  .superRefine((e, ctx) => {
    if (e.STORAGE_DRIVER === "supabase" && (!e.SUPABASE_URL || !e.SUPABASE_SERVICE_ROLE_KEY)) {
      ctx.addIssue({
        code: "custom",
        path: ["SUPABASE_URL"],
        message: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required when STORAGE_DRIVER=supabase",
      });
    }
  });

export const env = EnvSchema.parse(process.env);
