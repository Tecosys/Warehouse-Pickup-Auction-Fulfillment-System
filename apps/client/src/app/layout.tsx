import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "BidBoss Marketplace | Canada's Liquidation & Overstock",
  description: "Canada's Marketplace for Quality Liquidation, Returns & Overstock. Bid Boss helps buyers access quality liquidation inventory through weekly online auctions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased bg-accent text-secondary`}
      >
        {children}
      </body>
    </html>
  );
}
