import { Wrench, Flame, HomeIcon, Zap, TreePine, Bug } from "lucide-react";

const trades = [
  { icon: Wrench, label: "Plumbing" },
  { icon: Flame, label: "HVAC" },
  { icon: HomeIcon, label: "Roofing" },
  { icon: Zap, label: "Electrical" },
  { icon: TreePine, label: "Landscaping" },
  { icon: Bug, label: "Pest Control" },
];

const AsSeenWorking = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <p className="text-center text-muted-foreground text-sm uppercase tracking-widest mb-6">
          Industries we serve
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {trades.map((trade) => (
            <div
              key={trade.label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
            >
              <trade.icon className="w-4 h-4 text-primary" />
              {trade.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AsSeenWorking;
