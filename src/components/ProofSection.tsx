import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const ProofSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-primary/20 bg-card p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-primary font-display font-semibold text-base mb-4 tracking-wide uppercase">
              Real example
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-2">
              3 missed calls → 2 booked jobs →{" "}
              <span className="text-gradient">$600 recovered</span>
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofSection;
