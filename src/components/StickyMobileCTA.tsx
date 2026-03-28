import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const StickyMobileCTA = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border p-3">
      <Button
        onClick={onCTAClick}
        className="w-full bg-gradient-primary text-primary-foreground font-display font-semibold text-sm py-5 shadow-glow hover:opacity-90 transition-opacity"
      >
        Try it on your next missed call
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
