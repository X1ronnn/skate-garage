"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button variant="outline" size="sm" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}>
      <LogOut className="h-4 w-4" /> Sign out
    </Button>
  );
}
