"use client";

import { Send } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

export default function ContactForm() {
  return (
    <AnimateOnScroll className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-secondary/5">
      <h2 className="text-2xl font-bold mb-8">Send us a Message</h2>
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-secondary/60">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Jane Doe"
              className="w-full bg-accent/30 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-secondary/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-secondary/60">Work Email</label>
            <input
              type="email"
              id="email"
              placeholder="jane@company.com"
              className="w-full bg-accent/30 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-secondary/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-secondary/60">Company</label>
          <input
            type="text"
            id="company"
            placeholder="Logistics Corp"
            className="w-full bg-accent/30 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-secondary/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-secondary/60">Message</label>
          <textarea
            id="message"
            rows={6}
            placeholder="How can we help?"
            className="w-full bg-accent/30 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-secondary/30"
          ></textarea>
        </div>

        <button type="submit" className="btn-primary py-4 px-8 flex items-center justify-center gap-2 group">
          SEND MESSAGE <Send size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </AnimateOnScroll>
  );
}
