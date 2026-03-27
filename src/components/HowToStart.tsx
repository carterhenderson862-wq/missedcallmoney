import { Link2, PhoneMissed, CalendarCheck } from "lucide-react";

const steps = [
  { icon: Link2, text: "Connect your number" },
  { icon: PhoneMissed, text: "Miss a call" },
  { icon: CalendarCheck, text: "Watch it book a job" },
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

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {steps.map((step, i) => (
            <div
              key={step.text}
              className="flex items-center gap-4"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm text-muted-foreground font-display font-medium">
                  Step {i + 1}
                </span>
                <p className="font-display text-lg font-semibold">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToStart;
