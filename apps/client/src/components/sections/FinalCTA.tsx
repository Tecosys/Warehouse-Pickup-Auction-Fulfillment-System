import AnimateOnScroll from "../ui/AnimateOnScroll";

export default function FinalCTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto relative rounded-[48px] overflow-hidden bg-primary p-12 md:p-24 text-center">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary animate-[pulse_6s_ease-in-out_infinite] opacity-90" />
        
        <div className="relative z-10">
          <AnimateOnScroll>
            <h2 className="text-4xl md:text-6xl font-heading text-white mb-8">Ready to Bid or Sell?</h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Join Canada's fastest-growing liquidation marketplace today. Whether you're buying or selling, we've got you covered.
            </p>
          </AnimateOnScroll>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <AnimateOnScroll delay={100} className="w-full sm:w-auto">
              <button className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg w-full transition-all hover:scale-105 hover:shadow-xl">
                Start Bidding
              </button>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200} className="w-full sm:w-auto">
              <button className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg w-full transition-all hover:bg-white/10 hover:scale-105">
                Sell With Bid Boss
              </button>
            </AnimateOnScroll>
          </div>
          
          <AnimateOnScroll delay={300} className="mt-12">
             <button className="text-white/60 font-medium hover:text-white transition-colors underline underline-offset-4">
               Contact the Logistics Team
             </button>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
