"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Package, RotateCcw, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
];

export function AdminNav({ pendingReturns }: { pendingReturns: number }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={cn("flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
            <Icon className="h-4 w-4" /> {label}
            {label === "Returns" && pendingReturns > 0 && <span className={cn("ml-auto rounded-full px-1.5 text-[10px] font-semibold", active ? "bg-white/20" : "bg-orange-100 text-orange-800")}>{pendingReturns}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
