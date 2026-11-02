import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://skate-garage.vercel.app"),
  title: { default: "Skate Garage | Decks, completes and skate tools", template: "%s | Skate Garage" },
  description: "Skateboard e-commerce demo by Arvin Dwight Corpuz, built with Next.js, TypeScript, Tailwind CSS, Drizzle ORM and Neon Postgres.",
  authors: [{ name: "Arvin Dwight Corpuz", url: "https://dwight-corpuz.vercel.app" }],
  openGraph: { type: "website", siteName: "Skate Garage", images: ["/hero/slide-2.jpg"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
