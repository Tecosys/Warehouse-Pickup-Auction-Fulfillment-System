import AnimateOnScroll from "../ui/AnimateOnScroll";
import { Store, Warehouse, ShoppingCart, Truck } from "lucide-react";

const partners = [
  { name: "Retailers & Brands", icon: Store },
  { name: "3PLs & Return Centers", icon: Warehouse },
  { name: "Amazon / eCommerce Sellers", icon: ShoppingCart },
  { name: "Freight & Logistics Partners", icon: Truck },
];

export default function WhoWeWorkWith() {
  return (
    <section className="py-20 bg-white border-y border-secondary/5">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading mb-4">Who We Work With</h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            This section should identify the main supply-side partners we want to attract.
          </p>
        </AnimateOnScroll>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-20">
          {partners.map((partner, i) => (
            <AnimateOnScroll key={i} delay={i * 100} className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-secondary/40 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                <partner.icon size={32} />
              </div>
              <span className="font-bold text-secondary/70 group-hover:text-secondary transition-colors whitespace-nowrap">
                {partner.name}
              </span>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
