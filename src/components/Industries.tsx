import { motion } from "framer-motion";
import { Wrench, Flame, HomeIcon, Zap } from "lucide-react";

const industries = [
  { icon: Wrench, name: "Plumbing", description: "Emergency calls are your bread & butter. Never miss one again." },
  { icon: Flame, name: "HVAC", description: "Seasonal demand spikes? Your AI agent scales instantly." },
  { icon: HomeIcon, name: "Roofing", description: "High-ticket jobs lost to voicemail. Not anymore." },
  { icon: Zap, name: "Electrical", description: "Every missed call is a $300–$2,000 job walking away." },
];

const Industries = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient">the trades</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We speak your customers' language — literally.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 text-center group hover:border-primary/30 transition-colors"
            >
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:shadow-glow transition-shadow">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
