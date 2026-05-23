import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Differentiators from "@/components/Differentiators";
import PricingSection from "@/components/PricingSection";
import SetupSimple from "@/components/SetupSimple";
import RealResult from "@/components/RealResult";
import ComparisonSection from "@/components/ComparisonSection";
import ChatDemo from "@/components/ChatDemo";
import TestimonialCards from "@/components/TestimonialCards";
import MoneyImpact from "@/components/MoneyImpact";

import AsSeenWorking from "@/components/AsSeenWorking";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import TrustFooter from "@/components/TrustFooter";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const Index = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <HeroSection onCTAClick={goToAuth} />
      <Differentiators />
      <PricingSection onCTAClick={goToAuth} />
      <SetupSimple />
      <RealResult />
      <ComparisonSection />
      <ChatDemo onCTAClick={goToAuth} />
      <TestimonialCards />
      <MoneyImpact />
      
      <AsSeenWorking />
      <FAQSection />
      <CTASection onCTAClick={goToAuth} />
      <TrustFooter />
      <StickyMobileCTA onCTAClick={goToAuth} />
    </div>
  );
};

export default Index;
