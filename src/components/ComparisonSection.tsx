import { X, Check } from "lucide-react";

const basic = [
  "Sends one generic text",
  "Does not qualify the job",
  "Does not push toward booking",
  "Easy to ignore",
];

const callrecover = [
  "Starts a real conversation",
  "Qualifies service, urgency, location, and timing",
  "Handles follow-ups",
  "Helps turn the lead into a booked job",
];

const ComparisonSection = () => {
  return (
    <section className="py-[60px]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Not just a missed-call <span className="text-gradient">auto-reply.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <p className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Basic auto-reply
            </p>
            <ul className="space-y-3">
              {basic.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl bg-card p-8"
            style={{ border: "1px solid hsl(var(--primary) / 0.4)" }}
          >
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-4">
              CallRecover
            </p>
            <ul className="space-y-3">
              {callrecover.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
