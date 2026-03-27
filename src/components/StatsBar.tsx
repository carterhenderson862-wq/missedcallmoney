import { motion } from "framer-motion";

const stats = [
  { value: "93%", label: "Response rate" },
  { value: "2.4x", label: "More bookings" },
  { value: "<30s", label: "Avg reply time" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 divide-x divide-border"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBar;
