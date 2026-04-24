import { Calendar, Package, ClipboardCheck, Truck } from "lucide-react";
import AnimateOnScroll from "../ui/AnimateOnScroll";

const features = [
  {
    title: "Weekly No-Reserve Auctions",
    description: "New auctions starting every week with no reserve prices, giving you the best deals.",
    icon: Calendar,
  },
  {
    title: "Quality Liquidation Inventory",
    description: "Direct access to high-quality returns, overstock, and surplus from top retailers.",
    icon: Package,
  },
  {
    title: "Clear Listings & Grading",
    description: "Every item is inspected and graded so you know exactly what you're bidding on.",
    icon: ClipboardCheck,
  },
  {
    title: "Fast Pickup & Shipping",
    description: "Efficient warehouse operations mean you get your items quickly after the auction.",
    icon: Truck,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading mb-4">Weekly Online Auctions Built for Real Buyers</h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            Bid Boss runs weekly no-reserve online auctions featuring quality liquidation, returns, overstock, home goods, electronics, tools, appliances, furniture, and general merchandise. The focus is value, variety, clarity, and a smoother buying experience.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <AnimateOnScroll key={i} delay={i * 100} className="h-full">
              <div className="card-hover h-full bg-accent/30 p-8 rounded-3xl border border-secondary/5 flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-secondary/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
