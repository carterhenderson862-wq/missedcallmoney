import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  return (
    <section id="pricing" className="scroll-mt-20 py-[60px]">
      <div className="container">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Simple pricing
          </h2>
          <p className="text-muted-foreground mb-8">
            One plan. No surprises.
          </p>

          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 text-center">
            <div className="mb-2">
              <span className="font-display text-2xl md:text-3xl font-bold text-primary">Free trial</span>
              <span className="text-muted-foreground text-base ml-1">(7 days)</span>
            </div>
            <div className="mb-3">
              <span className="text-muted-foreground text-sm">Then </span>
              <span className="font-display text-4xl font-bold text-foreground">$249</span>
              <span className="text-muted-foreground text-lg">/month</span>
            </div>
            <p className="text-sm text-muted-foreground/70 mb-2">
              If this recovers just <span className="font-bold text-foreground">one job</span>, it pays for itself.
            </p>
            <p className="text-xs text-muted-foreground/50 mb-8">
              No risk. Cancel anytime.
            </p>

            <ul className="space-y-3 text-sm text-foreground mb-8 text-left max-w-xs mx-auto">
              {[
                "Unlimited missed call recovery",
                "AI-powered text conversations",
                "Automatic booking",
                "Cancel anytime",
                "No contracts",
                "No setup fees",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              onClick={onCTAClick}
              className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-10 py-6 shadow-glow hover:opacity-90 transition-opacity w-full"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
