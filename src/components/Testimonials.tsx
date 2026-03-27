import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "We were missing 15+ calls a week. Now every one gets a response and we've booked 40% more jobs.",
    name: "Mike R.",
    role: "Owner, FastFlow Plumbing",
  },
  {
    quote:
      "I was skeptical, but the first week it recovered $1,800 in jobs I would have lost. Pays for itself instantly.",
    name: "Sarah T.",
    role: "Owner, CoolAir HVAC",
  },
  {
    quote:
      "My guys are on roofs all day—they can't answer phones. This thing books jobs while we work.",
    name: "James L.",
    role: "Owner, Summit Roofing",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 bg-card/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient">real businesses</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Service pros who stopped losing money from missed calls.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-2xl border border-border bg-card p-8 flex flex-col"
            >
              <p className="text-foreground leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>
              <div>
                <div className="font-display font-semibold text-foreground">
                  {t.name}
                </div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
