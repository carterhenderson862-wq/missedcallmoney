import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BuiltFor from "@/components/BuiltFor";
import Differentiators from "@/components/Differentiators";
import HowItWorks from "@/components/HowItWorks";
import RealResult from "@/components/RealResult";
import ChatDemo from "@/components/ChatDemo";
import MoneyImpact from "@/components/MoneyImpact";
import HowToStart from "@/components/HowToStart";
import CTASection from "@/components/CTASection";
import TrustFooter from "@/components/TrustFooter";
import CTAModal from "@/components/CTAModal";

const Index = () => {
  const [ctaOpen, setCtaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onCTAClick={() => setCtaOpen(true)} />
      <BuiltFor />
      <Differentiators />
      <HowItWorks />
      <RealResult />
      <ChatDemo onCTAClick={() => setCtaOpen(true)} />
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onCTAClick={() => setCtaOpen(true)} />
      <BuiltFor />
      <Differentiators />
      <HowItWorks />
      <ChatDemo onCTAClick={() => setCtaOpen(true)} />
      <MoneyImpact />
      <HowToStart />
      <CTASection onCTAClick={() => setCtaOpen(true)} />
      <TrustFooter />
      <CTAModal open={ctaOpen} onOpenChange={setCtaOpen} />
    </div>
  );
};

export default Index;
