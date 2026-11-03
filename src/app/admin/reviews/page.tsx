import Link from "next/link";
import { getAdminReviews } from "@/lib/admin/queries";
import { deleteReview } from "@/lib/admin/actions";
import { Rating } from "@/components/rating";
import { ActionButton } from "@/components/admin/action-button";

export const metadata = { title: "Reviews" };

export default async function AdminReviews() {
  const list = await getAdminReviews();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Reviews</h1><p className="text-sm text-muted-foreground">Latest 100 reviews. Remove spam or abusive content.</p></div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {list.map((r) => (
          <li key={r.id} className="flex flex-wrap items-start gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{r.author}</span>
                {r.userId && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Verified buyer</span>}
                <span className="text-muted-foreground">on</span>
                <Link href={`/product/${r.productSlug}`} target="_blank" className="underline underline-offset-4">{r.productName}</Link>
              </div>
              <Rating value={r.rating} className="mt-1" />
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </div>
            <ActionButton label="Remove" variant="ghost" confirm="Remove this review?" action={deleteReview.bind(null, r.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
