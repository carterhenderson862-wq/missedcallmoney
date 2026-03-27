import { PhoneMissed, CalendarCheck, MessageSquare, AlertTriangle } from "lucide-react";
import type { Lead } from "@/hooks/use-leads";

interface StatsBarProps {
  leads: Lead[];
}

const StatsBar = ({ leads }: StatsBarProps) => {
  const total = leads.length;
  const booked = leads.filter((l) => l.status === "booked").length;
  const active = leads.filter((l) => ["contacted", "qualifying", "booking"].includes(l.status)).length;
  const noResponse = leads.filter((l) => l.status === "no_response").length;

  const stats = [
    { label: "Total Leads", value: total, icon: PhoneMissed, color: "text-primary" },
    { label: "Booked", value: booked, icon: CalendarCheck, color: "text-primary" },
    { label: "Active Convos", value: active, icon: MessageSquare, color: "text-foreground" },
    { label: "No Response", value: noResponse, icon: AlertTriangle, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
