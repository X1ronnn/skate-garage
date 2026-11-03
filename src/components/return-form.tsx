"use client";

import { useActionState, useState } from "react";
import { RETURN_REASONS } from "@/db/schema";
import { requestReturn } from "@/lib/actions";
import { Button } from "./ui/button";

export function ReturnForm({ orderId, uploadsEnabled }: { orderId: number; uploadsEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(requestReturn, null);

  if (state?.ok) return <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Return requested. We&apos;ll review it within 1–2 business days.</p>;
  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}>Request a return</Button>;

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm font-medium">Reason
        <select name="reason" required className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" defaultValue="">
          <option value="" disabled>Choose a reason</option>
          {RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Details <span className="font-normal text-muted-foreground">(optional)</span>
        <textarea name="details" rows={3} maxLength={1000} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Tell us what happened" />
      </label>
      {uploadsEnabled && (
        <label className="block text-sm font-medium">Photo <span className="font-normal text-muted-foreground">(optional, max 4 MB)</span>
          <input type="file" name="photo" accept="image/*" className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm" />
        </label>
      )}
      {state && !state.ok && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Submitting..." : "Submit return request"}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
