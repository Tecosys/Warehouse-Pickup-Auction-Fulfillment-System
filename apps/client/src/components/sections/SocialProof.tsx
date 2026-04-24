import AnimateOnScroll from "../ui/AnimateOnScroll";
import CountUp from "../ui/CountUp";
import { Star, Users, DollarSign, RefreshCw } from "lucide-react";

const stats = [
  {
    label: "Buyer Reviews",
    value: "5/5",
    icon: Star,
    isRating: true,
  },
  {
    label: "Growing Bidder Base",
    value: 15000,
    icon: Users,
    isCount: true,
    suffix: "+",
  },
  {
    label: "Professional Pickup Experience",
    value: "Efficient",
    icon: DollarSign,
  },
  {
    label: "Reliable Weekly Auctions",
    value: "Every Sunday",
    icon: RefreshCw,
  },
];

export default function SocialProof() {
  return (
    <section className="py-24 bg-secondary text-accent">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading mb-4 text-white">Trusted by Buyers. Built for Sellers.</h2>
          <p className="text-accent/60 max-w-2xl mx-auto">
            This section should combine trust and proof. It should highlight buyer confidence, repeat participation, and operational credibility.
          </p>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={i} delay={i * 100} className="flex flex-col items-center lg:items-start gap-4">
              <div className="text-primary">
                <stat.icon size={24} />
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-heading font-bold mb-1 flex items-center justify-center lg:justify-start gap-1">
                  {stat.isCount ? (
                    <CountUp end={stat.value as number} suffix={stat.suffix} />
                  ) : stat.isRating ? (
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} fill="#00A87E" className="text-primary" />
                      ))}
                    </div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-accent/40 text-sm font-medium tracking-wide uppercase">{stat.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
