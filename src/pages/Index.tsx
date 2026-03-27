import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ChatDemo from "@/components/ChatDemo";
import Differentiators from "@/components/Differentiators";
import Industries from "@/components/Industries";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Differentiators />
      <Industries />
      <CTASection />
    </div>
  );
};

export default Index;
