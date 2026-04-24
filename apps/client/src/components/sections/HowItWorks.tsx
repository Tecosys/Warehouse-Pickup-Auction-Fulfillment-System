import AnimateOnScroll from "../ui/AnimateOnScroll";

const steps = [
  {
    number: "1",
    title: "Browse & Register",
    description: "Create your account, browse the weekly catalog, and find the lots that match your needs.",
  },
  {
    number: "2",
    title: "Bid with Confidence",
    description: "Bid in a structured no-reserve environment with clearer listings and better visibility into what you are buying.",
  },
  {
    number: "3",
    title: "Pickup or Shipping",
    description: "After the auction closes, choose pickup or request shipping where available, then complete the process through a clean operational flow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary text-accent relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container-custom relative z-10">
        <AnimateOnScroll className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-heading mb-4">How It Works</h2>
          <p className="text-accent/60 max-w-2xl mx-auto">
            Simple 3-step flow for buyers.
          </p>
        </AnimateOnScroll>

        <div className="relative">
          {/* Dashed Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-[70%] h-px border-t-2 border-dashed border-primary/30" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {steps.map((step, i) => (
              <AnimateOnScroll key={i} delay={i * 200} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mb-8 shadow-[0_0_30px_rgba(0,168,126,0.3)] border-4 border-secondary relative z-10">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-accent/60 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
