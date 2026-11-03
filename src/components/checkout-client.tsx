"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CreditCard, Lock } from "lucide-react";
import { useCart } from "./cart-provider";
import { Button, buttonClass } from "./ui/button";
import { formatPrice } from "@/lib/utils";
import { shippingFor } from "@/lib/order-utils";
import { finishPaypal, payWithDemo, placeOrder, startPaypal } from "@/lib/actions";

type Defaults = { fullName: string };
const fields = [
  { name: "fullName", label: "Full name", autoComplete: "name", span: 2 },
  { name: "phone", label: "Mobile number", autoComplete: "tel", placeholder: "0917 123 4567" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", placeholder: "6000" },
  { name: "address", label: "Street address", autoComplete: "street-address", span: 2, placeholder: "House no., street, barangay" },
  { name: "city", label: "City / municipality", autoComplete: "address-level2" },
  { name: "province", label: "Province", autoComplete: "address-level1" },
] as const;

export function CheckoutClient({ defaults, paypalClientId }: { defaults: Defaults; paypalClientId?: string }) {
  const { items, subtotal, ready, clear } = useCart();
  const router = useRouter();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  if (items.length === 0 && !orderId)
    return (
      <div className="rounded-lg border border-dashed border-border p-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/shop" className={buttonClass("default", "lg", "mt-6")}>Go to the shop</Link>
      </div>
    );

  const shipping = shippingFor(subtotal);
  const done = () => {
    clear();
    router.push(`/account/orders/${orderId}?placed=1`);
    router.refresh();
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const shippingInfo = Object.fromEntries(fields.map((x) => [x.name, String(f.get(x.name) ?? "")])) as Record<(typeof fields)[number]["name"], string>;
    const res = await placeOrder({ items: items.map((i) => ({ id: i.id, qty: i.qty })), shipping: shippingInfo });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setOrderId(res.orderId);
  }

  async function demoPay() {
    if (!orderId) return;
    setBusy(true);
    setError(null);
    const res = await payWithDemo(orderId);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    done();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <section className={orderId ? "pointer-events-none opacity-60" : ""}>
          <h2 className="text-lg font-semibold">1. Shipping details</h2>
          <form id="shipping" onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((x) => (
              <label key={x.name} className={`block text-sm font-medium ${"span" in x && x.span === 2 ? "sm:col-span-2" : ""}`}>
                {x.label}
                <input
                  name={x.name}
                  required
                  autoComplete={x.autoComplete}
                  placeholder={"placeholder" in x ? x.placeholder : undefined}
                  defaultValue={x.name === "fullName" ? defaults.fullName : undefined}
                  className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
          </form>
          {!orderId && (
            <Button form="shipping" type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={busy}>
              {busy ? "Saving..." : "Continue to payment"}
            </Button>
          )}
        </section>

        {orderId && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">2. Payment</h2>
            <p className="mt-1 text-sm text-muted-foreground">Order #{orderId} is reserved. Choose how to pay.</p>
            <div className="mt-4 space-y-4 rounded-lg border border-border p-5">
              {paypalClientId ? (
                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "PHP", intent: "capture" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    createOrder={async () => {
                      const r = await startPaypal(orderId);
                      if (!r.ok) { setError(r.error); throw new Error(r.error); }
                      return r.paypalOrderId;
                    }}
                    onApprove={async (data) => {
                      const r = await finishPaypal(orderId, data.orderID);
                      if (!r.ok) return setError(r.error);
                      done();
                    }}
                    onError={() => setError("PayPal ran into a problem. Please try again.")}
                  />
                  <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">PayPal sandbox test buyer (fake money)</p>
                    <p className="mt-1">Email: <span className="font-mono">sb-3nm4z53689497@personal.example.com</span></p>
                    <p>Password: <span className="font-mono">SkateDemo2026!</span></p>
                  </div>
                </PayPalScriptProvider>
              ) : null}
              <div className={paypalClientId ? "border-t border-border pt-4" : ""}>
                <Button size="lg" variant={paypalClientId ? "outline" : "default"} className="w-full" onClick={demoPay} disabled={busy}>
                  <CreditCard className="h-4 w-4" /> {busy ? "Processing..." : "Pay with demo card"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Simulated payment for this portfolio demo. Nothing is charged.</p>
              </div>
            </div>
          </section>
        )}
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      </div>

      <aside className="h-fit rounded-lg border border-border p-6">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                <Image src={i.image} alt={i.name} fill sizes="56px" className="object-contain p-1" />
              </div>
              <div className="flex-1">
                <p className="font-medium leading-tight">{i.name}</p>
                <p className="text-muted-foreground">Qty {i.qty}</p>
              </div>
              <p className="font-medium">{formatPrice(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Prices and stock are re-checked on the server.</p>
      </aside>
    </div>
  );
}
