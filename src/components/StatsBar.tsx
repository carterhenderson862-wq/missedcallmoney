import { motion } from "framer-motion";

const stats = [
  { value: "62%", label: "of missed callers never call back" },
  { value: "< 60s", label: "average AI response time" },
  { value: "$4,200", label: "average monthly revenue recovered" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-6 py-4 md:py-0">
              <span className="font-display text-2xl md:text-3xl font-bold text-gradient">
                {stat.value}
              </span>{" "}
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBar;
