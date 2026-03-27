import { motion } from "framer-motion";
import { PhoneMissed, MessageSquareText, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: PhoneMissed,
    title: "Missed call detected",
    description:
      "A customer calls while you're on a job. Within seconds, your AI agent reaches out via text.",
  },
  {
    icon: MessageSquareText,
    title: "Smart conversation",
    description:
      "Not a generic template — your agent asks the right questions, qualifies the job, and handles objections like a real person.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment booked",
    description:
      "The lead is qualified, the job details are captured, and the appointment lands directly in your calendar.",
  },
];

const HowItWorks = () => {
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
            From missed call to <span className="text-gradient">booked job</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three steps. Zero staff needed. Revenue recovered automatically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl border border-border bg-card p-8 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <step.icon className="w-6 h-6" />
              </div>
              <span className="absolute top-8 right-8 font-display text-5xl font-bold text-muted-foreground/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
