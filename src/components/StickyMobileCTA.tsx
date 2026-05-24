import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const StickyMobileCTA = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border p-3">
      <Button
        onClick={onCTAClick}
        className="w-full bg-gradient-primary text-primary-foreground font-display font-semibold text-sm py-5 shadow-glow hover:opacity-90 transition-opacity"
      >
        Start your 7-day free trial
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
