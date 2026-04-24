import Image from "next/image";
import AnimateOnScroll from "../ui/AnimateOnScroll";
import { CheckCircle2 } from "lucide-react";

const points = [
  {
    title: "Structured Receiving",
    description: "Every pallet is logged and tracked from the moment it enters our doors.",
  },
  {
    title: "Consistent Grading",
    description: "Multi-point inspection process applied to every category of inventory.",
  },
  {
    title: "Barcode-Driven Staging",
    description: "Zero-error staging system ensures every item is exactly where it needs to be.",
  },
  {
    title: "Fast Order Release",
    description: "Structured pickup bays and digital check-ins for maximum efficiency.",
  },
];

export default function Throughput() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Content */}
          <div className="flex-1 w-full">
            <AnimateOnScroll className="mb-10">
              <h2 className="text-3xl md:text-5xl font-heading mb-6 leading-tight">
                Built for Throughput.<br />Run with Discipline.
              </h2>
              <p className="text-secondary/60">
                This section should explain Bid Boss operational strength: receiving, grading, photography, cataloging, staging, and fast release.
              </p>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {points.map((point, i) => (
                <AnimateOnScroll key={i} delay={i * 100} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 size={20} />
                    <h3 className="font-bold">{point.title}</h3>
                  </div>
                  <p className="text-secondary/60 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <AnimateOnScroll threshold={0.2} className="flex-1 w-full">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                alt="Warehouse Throughput"
                width={800}
                height={600}
                className="object-cover w-full aspect-[4/3] transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay Decor */}
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hidden sm:block">
                <div className="text-white text-xs font-bold tracking-widest mb-1">CAPACITY</div>
                <div className="text-white text-2xl font-heading font-bold">100k SQ FT</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
