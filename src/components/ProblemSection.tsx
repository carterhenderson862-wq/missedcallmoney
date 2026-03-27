import { motion } from "framer-motion";
import { PhoneOff, Clock, DollarSign } from "lucide-react";

const problems = [
  {
    icon: PhoneOff,
    title: "Missed calls = missed revenue",
    description:
      "Every unanswered call is a customer choosing your competitor instead.",
  },
  {
    icon: Clock,
    title: "You can't answer while on a job",
    description:
      "You're on a roof or under a sink—calling back hours later means the job's gone.",
  },
  {
    icon: DollarSign,
    title: "Follow-ups fall through the cracks",
    description:
      "No system means no second chance. Leads go cold and revenue disappears.",
  },
];

const ProblemSection = () => {
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
            The problem is <span className="text-gradient">clear</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Missed calls are costing your business thousands every month.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <problem.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {problem.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
