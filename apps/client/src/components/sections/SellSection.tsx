import AnimateOnScroll from "../ui/AnimateOnScroll";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Returns & Overstock Recovery",
    description: "Recapture value from customer returns and excess inventory with our recovery solutions.",
  },
  {
    title: "Truckloads, Pallets & Mixed Loads",
    description: "We handle inventory at any scale, from single pallets to full truckload liquidations.",
  },
  {
    title: "Fast Inventory Turnover",
    description: "Our high-throughput system ensures your inventory is listed and sold quickly.",
  },
  {
    title: "Built for Long-Term Supply Partnerships",
    description: "We build lasting relationships with retailers and manufacturers for consistent recovery.",
  },
];

export default function SellSection() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading mb-4 leading-tight">
            Sell to Bid Boss.<br />Move Inventory Faster.
          </h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            This section should explain that Bid Boss helps brands, retailers, importers, 3PLs, return centers, and eCommerce sellers turn excess inventory into recovery through direct buyouts and auction-based liquidation.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <AnimateOnScroll key={i} delay={i * 100} className="h-full">
              <div className="card-hover h-full bg-white p-8 rounded-3xl border-l-4 border-primary shadow-sm flex flex-col justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-secondary/60 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
