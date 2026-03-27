import { formatDistanceToNow } from "date-fns";
import { Phone, Loader2 } from "lucide-react";
import type { Lead } from "@/hooks/use-leads";
import { cn } from "@/lib/utils";

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  contacted: "bg-primary/15 text-primary",
  qualifying: "bg-yellow-500/15 text-yellow-400",
  booking: "bg-emerald-500/15 text-emerald-400",
  booked: "bg-emerald-500/20 text-emerald-400",
  lost: "bg-destructive/15 text-destructive",
  no_response: "bg-muted text-muted-foreground",
};

const LeadsList = ({ leads, isLoading, selectedLead, onSelectLead }: LeadsListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-sm">Leads ({leads.length})</h2>
      </div>
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-border">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No leads yet. Missed calls will appear here automatically.
          </div>
        ) : (
          leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors",
                selectedLead?.id === lead.id && "bg-secondary"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {lead.customer_name || lead.phone_number}
                  </span>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider", statusColors[lead.status] || statusColors.new)}>
                  {lead.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {lead.service_type || lead.source?.replace("_", " ") || "Unknown"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadsList;
