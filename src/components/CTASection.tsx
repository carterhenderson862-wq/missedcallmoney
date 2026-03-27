import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="cta" className="py-[60px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-card p-12 md:p-20 text-center overflow-hidden"
          style={{ border: "1px solid hsl(var(--primary) / 0.3)" }}
        >
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              See CallRecover in <span className="text-gradient">action.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
              Book a 20-minute demo and we'll show you exactly how much revenue
              you're losing — free.
            </p>
            <Button
              size="lg"
              className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-10 py-6 shadow-glow hover:opacity-90 transition-opacity"
            >
              Book My Free Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              No credit card · No commitment · 20 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
