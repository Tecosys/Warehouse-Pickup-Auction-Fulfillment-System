import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import WhyChoose from "@/components/sections/WhyChoose";
import HowItWorks from "@/components/sections/HowItWorks";
import Throughput from "@/components/sections/Throughput";
import SellSection from "@/components/sections/SellSection";
import WhoWeWorkWith from "@/components/sections/WhoWeWorkWith";
import CategoriesGrid from "@/components/sections/CategoriesGrid";
import SocialProof from "@/components/sections/SocialProof";
import ResourceStrip from "@/components/sections/ResourceStrip";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <WhyChoose />
      <HowItWorks />
      <Throughput />
      <SellSection />
      <WhoWeWorkWith />
      <CategoriesGrid />
      <SocialProof />
      <ResourceStrip />
      <FinalCTA />
      <Footer />
    </main>
  );
}
