import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { Role } from "@/db/schema";

export const requireAdminView = cache(async function requireAdminView(next = "/admin") {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  const role = (s.user as { role?: Role }).role;
  if (role !== "admin" && role !== "demo_admin") redirect("/");
  return { user: s.user, role, readOnly: role === "demo_admin" };
});

/** For mutations: only full admins may write. Demo admins get a friendly error. */
export async function assertAdminWrite() {
  const s = await getSession();
  const role = (s?.user as { role?: Role } | undefined)?.role;
  if (role === "demo_admin") throw new Error("The demo admin is read-only. Changes are disabled in this demo.");
  if (role !== "admin") throw new Error("You don't have permission to do that.");
  return s!.user;
}
