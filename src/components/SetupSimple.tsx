import { PhoneForwarded, Building2, PhoneMissed, CalendarCheck } from "lucide-react";

const steps = [
  { icon: PhoneForwarded, text: "Connect your number", description: "Forward missed calls in 2 minutes. Works with your existing line." },
  { icon: Building2, text: "Add your business details", description: "Hours, services, pricing — so the AI sounds like you." },
  { icon: PhoneMissed, text: "Miss a call", description: "You're on a job, driving, or off the clock. Life happens." },
  { icon: CalendarCheck, text: "Watch it book a job", description: "Our AI texts back in seconds and gets the job on your calendar." },
];

const SetupSimple = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            What you do on <span className="text-gradient">day 1</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
            Set it up once. Then missed calls get a fast SMS reply automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.text}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col items-start text-left h-full"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground font-display font-medium uppercase tracking-widest mb-2">
                Step {i + 1}
              </span>
              <p className="font-display text-base font-semibold mb-2">{step.text}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          We help you get set up. No technical work required.
        </p>
      </div>
    </section>
  );
};

export default SetupSimple;
