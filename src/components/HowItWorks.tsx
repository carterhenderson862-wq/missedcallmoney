import { PhoneMissed, MessageSquareText, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: PhoneMissed,
    title: "Missed call",
    description:
      "A customer calls while you're on a job. Your AI agent picks it up instantly.",
  },
  {
    icon: MessageSquareText,
    title: "AI responds instantly",
    description:
      "Within seconds, your agent texts back, qualifies the job, and handles objections.",
  },
  {
    icon: CalendarCheck,
    title: "Job gets booked",
    description:
      "The lead is qualified, the appointment is locked in, and you get the job.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-primary font-display font-semibold text-lg mb-3">
            Miss a call → We text them → You get the job
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How it <span className="text-gradient">works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
