"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const DEMO_CREDENTIALS = { email: "demo@skategarage.dev", password: "skate-demo-2026" };
export const DEMO_ADMIN_CREDENTIALS = { email: "admin@skategarage.dev", password: "skate-admin-demo" };

const inputCls = "mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent, creds?: { email: string; password: string }, dest?: string) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    const res =
      mode === "signup" && !creds
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email(creds ?? { email, password });
    setLoading(false);
    if (res.error) return setError(res.error.message ?? "Something went wrong. Please try again.");
    router.push(dest ?? safeNext);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">{mode === "login" ? "Sign in" : "Create an account"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "login" ? "Track orders, request returns and check out faster." : "It takes less than a minute."}
      </p>

      {mode === "login" && (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/50 p-4 text-sm">
          <p className="font-medium">Just looking around?</p>
          <p className="mt-1 text-muted-foreground">Use the demo account: <span className="font-mono text-xs">{DEMO_CREDENTIALS.email}</span></p>
          <Button variant="outline" className="mt-3 w-full" disabled={loading} onClick={() => submit(undefined, DEMO_CREDENTIALS)}>
            Continue as demo customer
          </Button>
          <Button variant="ghost" className="mt-1 w-full" disabled={loading} onClick={() => submit(undefined, DEMO_ADMIN_CREDENTIALS, "/admin")}>
            View the admin dashboard (read-only)
          </Button>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className="block text-sm font-medium">Name
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
          </label>
        )}
        <label className="block text-sm font-medium">Email
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block text-sm font-medium">Password
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>New here? <Link href={`/signup?next=${encodeURIComponent(safeNext)}`} className="font-medium text-foreground underline underline-offset-4">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={`/login?next=${encodeURIComponent(safeNext)}`} className="font-medium text-foreground underline underline-offset-4">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
