"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { addReview, getReviewEligibility } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, slug }: { productId: number; slug: string }) {
  const { data: session, isPending } = authClient.useSession();
  const [elig, setElig] = useState<{ canReview: boolean; reason?: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(addReview, null);
  const router = useRouter();

  useEffect(() => {
    if (session) getReviewEligibility(productId).then(setElig);
  }, [session, productId]);
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  if (isPending) return null;
  if (!session)
    return <p className="text-sm text-muted-foreground"><Link href={`/login?next=/product/${slug}%23reviews`} className="font-medium text-foreground underline underline-offset-4">Sign in</Link> to review items you&apos;ve bought.</p>;
  if (state?.ok) return <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Thanks! Your review is live.</p>;
  if (!elig) return null;
  if (!elig.canReview) return <p className="text-sm text-muted-foreground">{elig.reason}</p>;

  return (
    <form action={action} className="space-y-3 rounded-lg border border-border p-5">
      <p className="font-medium">Write a verified review</p>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} stars`} onClick={() => setRating(i)}>
            <Star className={cn("h-6 w-6", i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300")} />
          </button>
        ))}
      </div>
      <textarea name="body" required minLength={10} maxLength={1000} rows={3} placeholder="How does it ride?" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      {state && !state.ok && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Posting..." : "Post review"}</Button>
    </form>
  );
}
