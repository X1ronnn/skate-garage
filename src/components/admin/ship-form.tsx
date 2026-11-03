"use client";

import { useActionState } from "react";
import { markShipped } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

const cls = "h-9 rounded-md border border-border bg-background px-3 text-sm";

export function ShipForm({ orderId }: { orderId: number }) {
  const [state, action, pending] = useActionState(markShipped, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="text-xs font-medium">Courier
        <select name="courier" className={`${cls} mt-1 block`} defaultValue="J&T Express">
          {["J&T Express", "LBC", "Ninja Van", "Flash Express", "Grab Express"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium">Tracking number
        <input name="trackingNumber" required className={`${cls} mt-1 block w-48 font-mono`} placeholder="JT0012345678" />
      </label>
      <Button type="submit" size="sm" className="h-9" disabled={pending}>{pending ? "Saving..." : "Mark as shipped"}</Button>
      {state && <p className={`w-full text-xs ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.ok ? state.message : state.error}</p>}
    </form>
  );
}
