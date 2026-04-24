import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import ContactForm from "@/components/sections/ContactForm";
import OfficeDetails from "@/components/sections/OfficeDetails";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-accent/20">
      <Navbar />
      
      <div className="pt-24 pb-32">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <AnimateOnScroll>
              <h1 className="text-5xl md:text-6xl font-heading mb-6">Get in Touch</h1>
              <p className="text-secondary/60 text-lg leading-relaxed">
                Supporting global logistics teams with precision and authority. Reach out to discuss how BidBoss can architect your fulfillment success.
              </p>
            </AnimateOnScroll>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            <ContactForm />
            <OfficeDetails />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
