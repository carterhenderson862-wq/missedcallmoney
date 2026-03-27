import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisons = [
  { feature: "Human-like qualifying conversations", us: true, them: false },
  { feature: "Understands job type & urgency", us: true, them: false },
  { feature: "Books directly into your calendar", us: true, them: false },
  { feature: "Integrates with Jobber / Housecall Pro", us: true, them: false },
  { feature: "Pay-per-booked-appointment pricing", us: true, them: false },
  { feature: "Sends a text after missed call", us: true, them: true },
];

const Differentiators = () => {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Not just another <span className="text-gradient">text-back tool</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Your CRM already sends a template. We close the deal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_100px] bg-secondary/50 px-6 py-4 text-sm font-display font-semibold">
              <span>Feature</span>
              <span className="text-center text-gradient">Us</span>
              <span className="text-center text-muted-foreground">Basic CRM</span>
            </div>

            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_100px_100px] px-6 py-4 text-sm items-center ${
                  i < comparisons.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-foreground/90">{row.feature}</span>
                <span className="flex justify-center">
                  {row.us ? (
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </span>
                  )}
                </span>
                <span className="flex justify-center">
                  {row.them ? (
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiators;
