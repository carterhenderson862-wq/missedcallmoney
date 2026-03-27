import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-primary/20 bg-gradient-glow p-12 md:p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Every missed call is money left on the table.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
              You only pay when we book an appointment. No retainers, no lock-in contracts.
            </p>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground font-display font-semibold text-base px-10 py-6 shadow-glow hover:opacity-90 transition-opacity">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
