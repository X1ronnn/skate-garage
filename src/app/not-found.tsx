import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Bailed on this one</h1>
      <p className="mt-3 text-muted-foreground">We couldn&apos;t find that page or product.</p>
      <Link href="/shop" className={buttonClass("default", "lg", "mt-8")}>Back to the shop</Link>
    </div>
  );
}
