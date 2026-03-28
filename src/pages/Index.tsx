import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BuiltFor from "@/components/BuiltFor";
import Differentiators from "@/components/Differentiators";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import RealResult from "@/components/RealResult";
import ChatDemo from "@/components/ChatDemo";
import TestimonialCards from "@/components/TestimonialCards";
import MoneyImpact from "@/components/MoneyImpact";
import HowToStart from "@/components/HowToStart";
import AsSeenWorking from "@/components/AsSeenWorking";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import TrustFooter from "@/components/TrustFooter";
import CTAModal from "@/components/CTAModal";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const Index = () => {
  const [ctaOpen, setCtaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <HeroSection onCTAClick={() => setCtaOpen(true)} />
      <BuiltFor />
      <Differentiators />
      <HowItWorks />
      <PricingSection onCTAClick={() => setCtaOpen(true)} />
      <RealResult />
      <ChatDemo onCTAClick={() => setCtaOpen(true)} />
      <TestimonialCards />
      <MoneyImpact />
      <HowToStart />
      <AsSeenWorking />
      <FAQSection />
      <CTASection onCTAClick={() => setCtaOpen(true)} />
      <TrustFooter />
      <CTAModal open={ctaOpen} onOpenChange={setCtaOpen} />
      <StickyMobileCTA onCTAClick={() => setCtaOpen(true)} />
    </div>
  );
};

export default Index;
