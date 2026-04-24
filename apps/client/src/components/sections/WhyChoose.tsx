import { LayoutGrid, Search, Clock, Users } from "lucide-react";
import AnimateOnScroll from "../ui/AnimateOnScroll";

const benefits = [
  {
    title: "Clean Catalogs",
    description: "Professional photos and structured data make it easy to browse and find what you need.",
    icon: LayoutGrid,
  },
  {
    title: "Consistent Inspection",
    description: "Our dedicated team follows strict grading standards to ensure accuracy across all listings.",
    icon: Search,
  },
  {
    title: "Fast Appointment Pickup",
    description: "Book your slot and get in and out quickly with our structured pickup process.",
    icon: Clock,
  },
  {
    title: "Built for Retail Buyers & Resellers",
    description: "Features and inventory curated specifically to help reselling businesses thrive.",
    icon: Users,
  },
];

export default function WhyChoose() {
  return (
    <section className="py-24 bg-accent/50">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading mb-4">Why Buyers Choose Bid Boss</h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            This section should focus on trust, structure, and buyer confidence. Bid Boss is organized, repeatable, and built to save buyers time while helping them access strong deals.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-secondary/10 border border-secondary/10 rounded-3xl overflow-hidden">
          {benefits.map((benefit, i) => (
            <AnimateOnScroll key={i} delay={i * 50} className="bg-white p-10 md:p-16">
              <div className="flex flex-col gap-6 max-w-md mx-auto md:mx-0">
                <div className="w-14 h-14 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <benefit.icon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-secondary/60 leading-relaxed">
                    {benefit.description}
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
