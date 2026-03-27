import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BuiltFor from "@/components/BuiltFor";
import Differentiators from "@/components/Differentiators";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import MoneyImpact from "@/components/MoneyImpact";
import HowToStart from "@/components/HowToStart";
import CTASection from "@/components/CTASection";
import TrustFooter from "@/components/TrustFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BuiltFor />
      <Differentiators />
      <HowItWorks />
      <ChatDemo />
      <MoneyImpact />
      <HowToStart />
      <CTASection />
      <TrustFooter />
    </div>
  );
};

export default Index;
