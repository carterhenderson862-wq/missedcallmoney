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
            <p className="text-base text-foreground mb-1">
              One recovered job can <span className="font-bold">cover your month.</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Recover even 1–2 jobs per month and CallRecover can pay for itself.
            </p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              <span className="inline-block rounded-full bg-primary/15 text-primary text-xs font-display font-semibold px-3 py-1.5 uppercase tracking-wide">
                7-day free trial — no card required
              </span>
              <span className="inline-block rounded-full bg-secondary text-foreground text-xs font-display font-semibold px-3 py-1.5 uppercase tracking-wide border border-border">
                Cancel anytime
              </span>
            </div>
            <div className="mb-3 flex items-baseline justify-center gap-1.5 flex-wrap">
              <span className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-none">$249</span>
              <span className="text-muted-foreground/70 text-base">/ month</span>
            </div>
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
              Start your 7-day free trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
