import { motion } from "framer-motion";

const ProofSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-mono mb-4">
            Yesterday
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-4 text-lg md:text-2xl font-display font-bold">
            <span className="text-foreground">2 missed calls</span>
            <span className="text-muted-foreground/40">→</span>
            <span className="text-foreground">1 booked job</span>
            <span className="text-muted-foreground/40">→</span>
            <span className="text-gradient">$450 recovered</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofSection;
