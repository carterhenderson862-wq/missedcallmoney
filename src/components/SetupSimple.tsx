import { UserPlus, Building2, PhoneForwarded, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, text: "Create your account" },
  { icon: Building2, text: "Add your business details" },
  { icon: PhoneForwarded, text: "Forward your missed calls" },
  { icon: TrendingUp, text: "Start recovering leads" },
];

const SetupSimple = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            What you do on <span className="text-gradient">day 1</span>
          </h2>
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
              <p className="font-display text-base font-semibold">{step.text}</p>
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
