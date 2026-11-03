import "server-only";

const BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

export const paypalEnabled = () => Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function accessToken() {
  const creds = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  return (await res.json()).access_token as string;
}

export async function createPaypalOrder(orderId: number, totalPhp: number) {
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ reference_id: String(orderId), description: `Skate Garage order #${orderId}`, amount: { currency_code: "PHP", value: totalPhp.toFixed(2) } }],
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Could not create PayPal order");
  return data.id as string;
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const res = await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  return { ok: res.ok && data.status === "COMPLETED", data };
}
