import Link from "next/link";
import { Search } from "lucide-react";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";

const nav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=decks", label: "Decks" },
  { href: "/shop?category=completes", label: "Completes" },
  { href: "/shop?category=tools", label: "Tools" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">SK8</span>
          <span className="hidden sm:inline">Skate Garage</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/shop" className="ml-auto hidden max-w-xs flex-1 items-center sm:flex">
          <label className="relative w-full">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input name="q" placeholder="Search decks, brands..." className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <UserMenu />
          <CartButton />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 text-sm md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
