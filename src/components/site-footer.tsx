import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-semibold">Skate Garage</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Decks, completes and tools for skaters in the Philippines. A portfolio rebuild of my original PHP store, now on Next.js, TypeScript and Postgres.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shop?category=decks" className="hover:text-foreground">Decks</Link></li>
            <li><Link href="/shop?category=completes" className="hover:text-foreground">Complete skateboards</Link></li>
            <li><Link href="/shop?category=tools" className="hover:text-foreground">Tools &amp; accessories</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Project</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="https://github.com/X1ronnn/skate-garage" className="hover:text-foreground">Source code</a></li>
            <li><a href="https://dwight-corpuz.vercel.app" className="hover:text-foreground">Built by Arvin Dwight Corpuz</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Demo store for portfolio purposes. No real orders or payments are processed.
      </div>
    </footer>
  );
}
