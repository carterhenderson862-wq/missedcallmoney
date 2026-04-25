import { useNavigate } from "react-router-dom";
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
import StickyMobileCTA from "@/components/StickyMobileCTA";

const Index = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <HeroSection onCTAClick={goToAuth} />
      <BuiltFor />
      <Differentiators />
      <HowItWorks />
      <PricingSection onCTAClick={goToAuth} />
      <RealResult />
      <ChatDemo onCTAClick={goToAuth} />
      <TestimonialCards />
      <MoneyImpact />
      <HowToStart />
      <AsSeenWorking />
      <FAQSection />
      <CTASection onCTAClick={goToAuth} />
      <TrustFooter />
      <StickyMobileCTA onCTAClick={goToAuth} />
    </div>
  );
};

export default Index;
