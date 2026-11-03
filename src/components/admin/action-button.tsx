"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Res = { ok: true; message?: string } | { ok: false; error: string };

export function ActionButton({ action, label, confirm, variant = "outline", size = "sm" }: {
  action: () => Promise<Res>; label: string; confirm?: string; variant?: "default" | "outline" | "ghost" | "secondary"; size?: "sm" | "md";
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Res | null>(null);
  const router = useRouter();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const r = await action();
            setMsg(r);
            if (r.ok) router.refresh();
          });
        }}
      >
        {pending ? "Working..." : label}
      </Button>
      {msg && <span className={msg.ok ? "text-xs text-emerald-700" : "text-xs text-red-600"}>{msg.ok ? msg.message : msg.error}</span>}
    </span>
  );
}
