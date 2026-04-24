import AnimateOnScroll from "../ui/AnimateOnScroll";
import { ArrowUpRight } from "lucide-react";

const guides = [
  {
    title: "How to Bid Smarter",
    excerpt: "Master the art of online auctions with our expert bidding strategies and tips.",
  },
  {
    title: "Pickup & Shipping Guide",
    excerpt: "Everything you need to know about getting your items home quickly and safely.",
  },
  {
    title: "Selling Overstock & Returns",
    excerpt: "A comprehensive guide for businesses looking to recover capital from surplus inventory.",
  },
  {
    title: "Auction FAQs",
    excerpt: "Quick answers to common questions about our platform, registration, and more.",
  },
];

export default function ResourceStrip() {
  return (
    <section id="resources" className="py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col items-center justify-center text-center mb-16 gap-6">
          <AnimateOnScroll className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-heading mb-4">Learn How to Buy and Sell Smarter</h2>
            <p className="text-secondary/60">
              This section is for guides and educational content that supports both buyers and sellers.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, i) => (
            <AnimateOnScroll key={i} delay={i * 100} className="h-full">
              <div className="card-hover h-full bg-accent/30 p-8 rounded-3xl border border-secondary/5 flex flex-col justify-between group">
                <div>
                  <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-secondary/60 text-sm leading-relaxed mb-8">
                    {guide.excerpt}
                  </p>
                </div>
                <button className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  Read Guide <ArrowUpRight size={16} />
                </button>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
