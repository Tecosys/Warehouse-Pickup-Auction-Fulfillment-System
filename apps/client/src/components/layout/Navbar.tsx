"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Resources", href: "/#resources" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 md:hidden transition-all duration-500 ease-in-out",
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}
        style={{ zIndex: 9999, backgroundColor: '#FFFFFF' }}
      >
        <div className="flex flex-col h-full pt-32 pb-12 px-8">
          <div className="flex flex-col gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-4xl font-heading font-bold text-secondary transition-all duration-500",
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pt-12 border-t border-secondary/5">
            <Link href="https://warehouse-admin-tecosys.vercel.app" className="btn-primary w-full py-5 text-xl shadow-xl flex items-center justify-center">
              Bid Now
            </Link>
            <div className="mt-8 flex justify-center gap-8 text-secondary/40 font-medium">
              <span>Instagram</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </div>

      <nav
        className={cn(
          "glass-nav animate-fade-down",
          isScrolled && "scrolled"
        )}
      >
        <div className="container-custom py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group relative z-[10000]">
            <Image
              src="/Logo.png"
              alt="BidBoss Logo"
              width={150}
              height={50}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link href="https://warehouse-admin-tecosys.vercel.app" className="btn-primary py-2 px-6">
              Bid Now
            </Link>
            
            <button 
              className="md:hidden p-2 text-secondary relative z-[10000]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
