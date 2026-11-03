import type { OrderStatus } from "@/db/schema";

export const FREE_SHIPPING_THRESHOLD = 3000;
export const SHIPPING_FEE = 150;
export const shippingFor = (subtotal: number) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);

export const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid · preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  returned: "Returned",
};

export const statusTone: Record<OrderStatus, string> = {
  pending_payment: "border-amber-300 bg-amber-50 text-amber-800",
  paid: "border-sky-300 bg-sky-50 text-sky-800",
  shipped: "border-indigo-300 bg-indigo-50 text-indigo-800",
  delivered: "border-emerald-300 bg-emerald-50 text-emerald-800",
  cancelled: "border-zinc-300 bg-zinc-50 text-zinc-600",
  return_requested: "border-orange-300 bg-orange-50 text-orange-800",
  returned: "border-zinc-300 bg-zinc-50 text-zinc-700",
};

export const RETURNABLE: OrderStatus[] = ["paid", "shipped", "delivered"];
export const REVIEWABLE: OrderStatus[] = ["paid", "shipped", "delivered", "return_requested", "returned"];
