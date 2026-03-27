import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  return (
    <section id="cta" className="py-[60px]">
      <div className="container">
        <div
          className="relative rounded-3xl bg-card p-12 md:p-20 text-center overflow-hidden"
          style={{ border: "1px solid hsl(var(--primary) / 0.3)" }}
        >
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Stop losing jobs from{" "}
              <span className="text-gradient">missed calls.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
              Let it work on your next missed call.
            </p>
            <Button
              size="lg"
              onClick={onCTAClick}
              className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-10 py-6 shadow-glow hover:opacity-90 transition-opacity"
            >
              Try it on your calls
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="mt-6 text-sm text-muted-foreground/60">
              Takes 2 minutes. Works with your current number. No setup headache.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
