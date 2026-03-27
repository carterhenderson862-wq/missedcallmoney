import { motion } from "framer-motion";
import { Check } from "lucide-react";

const trades = ["Plumbers", "HVAC companies", "Roofers", "Electricians"];

const BuiltFor = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
            Built for:
          </h2>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {trades.map((trade, i) => (
              <motion.div
                key={trade}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-lg text-foreground"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                {trade}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BuiltFor;
