import { Link2, PhoneMissed, CalendarCheck } from "lucide-react";

const steps = [
  { icon: Link2, text: "Connect your number", description: "2-minute setup. Works with your existing business line." },
  { icon: PhoneMissed, text: "Miss a call", description: "Life happens — you're on a job, driving, or off the clock." },
  { icon: CalendarCheck, text: "Watch it book a job", description: "Our AI texts back in seconds and gets the job on your calendar." },
];

const HowToStart = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            How to <span className="text-gradient">get started</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.text}
              className="rounded-2xl border border-border bg-card p-8 md:p-10 flex flex-col items-start text-left h-full"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-muted-foreground font-display font-medium uppercase tracking-widest mb-2">
                Step {i + 1}
              </span>
              <p className="font-display text-xl font-semibold mb-3">{step.text}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToStart;
