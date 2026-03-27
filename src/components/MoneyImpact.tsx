import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

const MoneyImpact = () => {
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
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-8">
              <DollarSign className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              You missed 12 calls this week.
            </h2>
            <p className="font-display text-2xl md:text-3xl font-bold text-gradient mb-4">
              That's potentially $3,600 in lost jobs.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
              We recover those automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoneyImpact;
