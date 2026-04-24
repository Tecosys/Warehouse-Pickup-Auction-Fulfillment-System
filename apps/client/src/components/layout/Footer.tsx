import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-accent py-20 border-t border-secondary/5">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/Logo.png"
                alt="BidBoss Logo"
                width={150}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-secondary/60 text-sm leading-relaxed">
              Canada's Marketplace for Quality Liquidation, Returns & Overstock. Built for resellers, run with discipline.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold uppercase tracking-wider text-xs text-secondary/40">Marketplace</h4>
              <Link href="/" className="font-medium hover:text-primary transition-colors text-sm">Home</Link>
              <Link href="#" className="font-medium hover:text-primary transition-colors text-sm">Auctions</Link>
              <Link href="#" className="font-medium hover:text-primary transition-colors text-sm">Sell With Us</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold uppercase tracking-wider text-xs text-secondary/40">Resources</h4>
              <Link href="#" className="font-medium hover:text-primary transition-colors text-sm">How It Works</Link>
              <Link href="#" className="font-medium hover:text-primary transition-colors text-sm">Buying Guides</Link>
              <Link href="#" className="font-medium hover:text-primary transition-colors text-sm">FAQs</Link>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-secondary/5">
          <p className="text-secondary/40 text-xs font-medium">
            © {new Date().getFullYear()} BidBoss Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-secondary/40 hover:text-primary transition-colors text-xs font-medium">Instagram</Link>
            <Link href="#" className="text-secondary/40 hover:text-primary transition-colors text-xs font-medium">LinkedIn</Link>
            <Link href="#" className="text-secondary/40 hover:text-primary transition-colors text-xs font-medium">Facebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
