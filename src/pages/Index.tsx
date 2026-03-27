import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProofSection from "@/components/ProofSection";
import BuiltFor from "@/components/BuiltFor";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import MoneyImpact from "@/components/MoneyImpact";
import Differentiators from "@/components/Differentiators";
import Industries from "@/components/Industries";
import HowToStart from "@/components/HowToStart";
import CTASection from "@/components/CTASection";
import TrustFooter from "@/components/TrustFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProofSection />
      <BuiltFor />
      <HowItWorks />
      <ChatDemo />
      <MoneyImpact />
      <Differentiators />
      <Industries />
      <HowToStart />
      <CTASection />
      <TrustFooter />
    </div>
  );
};

export default Index;
