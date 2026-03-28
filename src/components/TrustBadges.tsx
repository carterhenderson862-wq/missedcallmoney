import { CreditCard, Clock, Phone } from "lucide-react";

const badges = [
  { icon: CreditCard, label: "No credit card required" },
  { icon: Clock, label: "2-minute setup" },
  { icon: Phone, label: "Works with your existing number" },
];

const TrustBadges = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <b.icon className="w-3.5 h-3.5" />
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
