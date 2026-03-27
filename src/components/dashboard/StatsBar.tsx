import { PhoneMissed, CalendarCheck, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import type { Lead } from "@/hooks/use-leads";

interface StatsBarProps {
  leads: Lead[];
}

const AVG_JOB_VALUE = 350; // average revenue per booked job

const StatsBar = ({ leads }: StatsBarProps) => {
  const missedCalls = leads.filter((l) => l.source === "missed_call").length;
  const engaged = leads.filter((l) => ["responded", "qualifying", "booking", "booked"].includes(l.status)).length;
  const booked = leads.filter((l) => l.status === "booked").length;
  const estimatedRevenue = booked * AVG_JOB_VALUE;

  const stats = [
    { label: "Missed Calls", value: missedCalls, icon: PhoneMissed, color: "text-primary" },
    { label: "Leads Engaged", value: engaged, icon: MessageSquare, color: "text-cyan-400" },
    { label: "Leads Booked", value: booked, icon: CalendarCheck, color: "text-emerald-400" },
    {
      label: "Est. Revenue",
      value: `$${estimatedRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-4">
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

      {(booked > 0 || engaged > 0) && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-foreground">
            {booked > 0 ? (
              <>
                You recovered <span className="font-bold text-emerald-400">{booked} lead{booked !== 1 ? "s" : ""}</span> worth approximately{" "}
                <span className="font-bold text-emerald-400">${estimatedRevenue.toLocaleString()}</span>
                {engaged > booked && (
                  <> — plus <span className="font-semibold text-cyan-400">{engaged - booked} more</span> still in the pipeline</>
                )}
              </>
            ) : (
              <>
                <span className="font-bold text-cyan-400">{engaged} lead{engaged !== 1 ? "s" : ""}</span> engaged and moving toward booking
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsBar;
