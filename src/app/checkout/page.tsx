import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const paypalClientId = process.env.PAYPAL_CLIENT_SECRET ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID : undefined;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="mt-8"><CheckoutClient defaults={{ fullName: user.name }} paypalClientId={paypalClientId || undefined} /></div>
    </div>
  );
}
