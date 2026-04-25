import { formatDistanceToNow } from "date-fns";
import { Bot, User, Phone, MapPin, Wrench, Clock } from "lucide-react";
import type { Lead, Message } from "@/hooks/use-leads";

interface ConversationViewProps {
  lead: Lead | null;
  messages: Message[];
}

const DetailRow = ({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) => (
  <div className="flex items-start gap-1.5 min-w-0">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</div>
      <div className={`truncate ${highlight ? "text-primary font-medium" : "text-foreground"}`}>{value}</div>
    </div>
  </div>
);

const ConversationView = ({ lead, messages }: ConversationViewProps) => {
  if (!lead) {
    return (
      <div className="rounded-xl border border-border bg-card flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a lead to view the conversation</p>
        </div>
      </div>
    );
  }

  const issue = (lead.job_details as Record<string, unknown> | null)?.issue as string | undefined;
  const urgencyLabel = lead.urgency === "high" ? "Urgent" : lead.urgency ? "Scheduled" : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* Lead info header */}
      <div className="px-5 py-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">
            {lead.customer_name || lead.phone_number}
          </h2>
          <div className="flex items-center gap-2">
            {urgencyLabel && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${lead.urgency === "high" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                {urgencyLabel}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <DetailRow icon={<Phone className="w-3 h-3" />} label="Phone" value={lead.phone_number} />
          {lead.service_type && <DetailRow icon={<Wrench className="w-3 h-3" />} label="Service" value={lead.service_type} />}
          {issue && <DetailRow icon={<Wrench className="w-3 h-3" />} label="Issue" value={issue} />}
          {lead.location && <DetailRow icon={<MapPin className="w-3 h-3" />} label="Location" value={lead.location} />}
          {lead.booked_slot && <DetailRow icon={<Clock className="w-3 h-3" />} label="Preferred time" value={lead.booked_slot} highlight />}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[calc(100vh-360px)]">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.direction === "inbound" ? "justify-start" : "justify-end"}`}
            >
              {msg.direction === "inbound" && (
                <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.direction === "inbound"
                    ? "bg-secondary text-secondary-foreground rounded-bl-md"
                    : "bg-primary text-primary-foreground rounded-br-md"
                }`}
              >
                {msg.body}
                <div className={`text-[10px] mt-1 ${msg.direction === "inbound" ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.direction === "outbound" && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationView;
