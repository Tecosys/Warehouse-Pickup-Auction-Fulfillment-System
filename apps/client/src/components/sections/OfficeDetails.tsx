import { MapPin, Headset, Mail, BookOpen } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

export default function OfficeDetails() {
  return (
    <div className="space-y-6">
      {/* Offices Card */}
      <AnimateOnScroll delay={100} className="bg-white p-8 rounded-[32px] shadow-sm border border-secondary/5">
        <div className="flex items-center gap-3 text-primary mb-8">
          <MapPin size={24} />
          <h2 className="text-xl font-bold text-secondary">Our Offices</h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Seattle HQ</h3>
            <p className="text-secondary/70 leading-relaxed">
              1200 5th Ave, Suite 400<br />
              Seattle, WA 98101<br />
              United States
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">London Logistics Hub</h3>
            <p className="text-secondary/70 leading-relaxed">
              45 Floor, One Canada Square<br />
              Canary Wharf, London E14 5AB<br />
              United Kingdom
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Support Card */}
      <AnimateOnScroll delay={200} className="bg-[#E6EDEB] p-8 rounded-[32px] shadow-sm border border-primary/10 relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center text-primary">
              <Headset size={20} />
            </div>
            <h2 className="text-xl font-bold">Support</h2>
          </div>

          <p className="text-secondary/70 mb-8 leading-relaxed">
            Need technical assistance? Our support team is ready to help architect your solution.
          </p>

          <div className="space-y-4">
            <a href="mailto:support@bidboss.com" className="flex items-center gap-3 text-primary font-bold hover:gap-4 transition-all">
              <Mail size={18} /> support@bidboss.com
            </a>
            <button className="flex items-center gap-3 text-secondary font-bold hover:gap-4 transition-all">
              <BookOpen size={18} /> Read Documentation
            </button>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
