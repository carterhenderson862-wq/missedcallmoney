import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BuiltFor from "@/components/BuiltFor";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import MoneyImpact from "@/components/MoneyImpact";
import Differentiators from "@/components/Differentiators";
import Industries from "@/components/Industries";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BuiltFor />
      <HowItWorks />
      <ChatDemo />
      <MoneyImpact />
      <Differentiators />
      <Industries />
      <CTASection />
    </div>
  );
};

export default Index;
