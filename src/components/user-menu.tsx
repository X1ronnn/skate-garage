"use client";

import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buttonClass } from "./ui/button";

export function UserMenu() {
  const { data, isPending } = authClient.useSession();
  if (isPending) return <span className="h-9 w-16 animate-pulse rounded-md bg-muted" aria-hidden />;
  if (!data) return <Link href="/login" className={buttonClass("ghost", "sm", "h-9")}>Sign in</Link>;
  const role = (data.user as { role?: string }).role;
  const isAdmin = role === "admin" || role === "demo_admin";
  return (
    <span className="flex items-center gap-1">
    {isAdmin && (
      <Link href="/admin" className={buttonClass("ghost", "sm", "h-9")} title="Admin dashboard">
        <LayoutDashboard className="h-4 w-4" /><span className="hidden lg:inline">Admin</span>
      </Link>
    )}
    <Link href="/account" className={buttonClass("outline", "sm", "h-9")} title={data.user.email}>
      <User className="h-4 w-4" />
      <span className="hidden max-w-[8rem] truncate lg:inline">{data.user.name.split(" ")[0]}</span>
    </Link>
    </span>
  );
}
