import { PhoneMissed, CalendarCheck, MessageSquare, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { isToday } from "date-fns";
import type { Lead } from "@/hooks/use-leads";

interface StatsBarProps {
  leads: Lead[];
}

const AVG_JOB_VALUE = 350;

const StatsBar = ({ leads }: StatsBarProps) => {
  const missedCalls = leads.filter((l) => l.source === "missed_call").length;
  const missedToday = leads.filter((l) => l.source === "missed_call" && isToday(new Date(l.created_at))).length;
  const engaged = leads.filter((l) => ["responded", "qualifying", "booking", "booked"].includes(l.status)).length;
  const booked = leads.filter((l) => l.status === "booked").length;
  const lost = leads.filter((l) => ["lost", "no_response"].includes(l.status)).length;
  const recoveredRevenue = booked * AVG_JOB_VALUE;
  const lostRevenue = lost * AVG_JOB_VALUE;

  const stats = [
    { label: "Missed Calls", value: missedCalls, icon: PhoneMissed, color: "text-primary" },
    { label: "Leads Engaged", value: engaged, icon: MessageSquare, color: "text-cyan-400" },
    { label: "Recovered", value: `$${recoveredRevenue.toLocaleString()}`, icon: CalendarCheck, color: "text-emerald-400" },
    { label: "Lost Revenue", value: `$${lostRevenue.toLocaleString()}`, icon: AlertTriangle, color: "text-destructive" },
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

      {/* Missed today alert */}
      {missedToday > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 flex items-center gap-3">
          <PhoneMissed className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-foreground">
            You missed <span className="font-bold text-destructive">{missedToday} call{missedToday !== 1 ? "s" : ""}</span> today
            {" "}— estimated lost revenue: <span className="font-bold text-destructive">${(missedToday * AVG_JOB_VALUE).toLocaleString()}</span> if not recovered.
          </p>
        </div>
      )}

      {/* Recovery insight */}
      {(booked > 0 || engaged > 0) && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-foreground">
            {booked > 0 ? (
              <>
                Recovered <span className="font-bold text-emerald-400">${recoveredRevenue.toLocaleString()}</span> from{" "}
                <span className="font-bold text-emerald-400">{booked} booked job{booked !== 1 ? "s" : ""}</span>
                {engaged > booked && (
                  <> — plus <span className="font-semibold text-cyan-400">{engaged - booked} more</span> in the pipeline</>
                )}
                {lost > 0 && (
                  <> · <span className="text-destructive font-semibold">${lostRevenue.toLocaleString()}</span> still unrecovered</>
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
