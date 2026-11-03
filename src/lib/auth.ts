import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Prefer an explicit secret; otherwise derive one from the (already private) database URL.
const secret =
  process.env.BETTER_AUTH_SECRET ||
  createHash("sha256").update(`skate-garage-auth:${process.env.DATABASE_URL ?? ""}`).digest("base64url");

const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
const baseURL = process.env.BETTER_AUTH_URL || prodUrl || "http://localhost:3100";
const trustedOrigins = [baseURL, prodUrl, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined].filter(Boolean) as string[];

export const auth = betterAuth({
  secret,
  baseURL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  user: { additionalFields: { role: { type: "string", defaultValue: "customer", input: false } } },
  session: { expiresIn: 60 * 60 * 24 * 7, cookieCache: { enabled: true, maxAge: 300 } },
  rateLimit: { enabled: true, window: 60, max: 30 },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
