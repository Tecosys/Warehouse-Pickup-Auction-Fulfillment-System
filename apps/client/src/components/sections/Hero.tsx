import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const headline = "Canada's Marketplace for Quality Liquidation, Returns & Overstock".split(" ");

  return (
    <section className="relative overflow-hidden pt-20 pb-32 hero-grid-pattern">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative flex flex-col lg:flex-row items-center gap-16">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-6">
            {headline.map((word, i) => (
              <span
                key={i}
                className="inline-block mr-[0.2em] animate-slide-up opacity-0"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="text-lg md:text-xl text-secondary/70 mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
            Bid Boss helps buyers access quality liquidation inventory through weekly online auctions, and helps businesses move returned, overstock, surplus, and mixed inventory faster through a structured auction model.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up opacity-0" style={{ animationDelay: '1000ms', animationFillMode: 'forwards' }}>
            <Link href="https://warehouse-admin-tecosys.vercel.app" className="btn-primary w-full sm:w-auto flex items-center justify-center">
              Bid Now
            </Link>
            <button className="btn-outline w-full sm:w-auto">
              Sell With Us
            </button>
          </div>
        </div>

        {/* Right Hero Card */}
        <div className="flex-1 relative animate-float">
          <div className="relative z-10 bg-secondary rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

            <div className="flex flex-col items-center gap-8 py-12">
              <Image
                src="/Logo.png"
                alt="BidBoss Logo"
                width={200}
                height={100}
                className="w-48 h-auto object-contain"
              />

              <div className="flex flex-col items-center">
                <h2 className="text-accent text-3xl font-heading tracking-widest font-bold">BIDBOSS</h2>
                <div className="mt-2 bg-primary px-3 py-1 rounded text-[10px] font-bold text-white tracking-[0.2em]">
                  MARKETPLACE
                </div>
              </div>
            </div>

            {/* Animated Light Beam */}
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 animate-[shine_8s_infinite]" />
          </div>

          {/* Accent Glow behind card */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />
        </div>
      </div>
    </section>
  );
}
