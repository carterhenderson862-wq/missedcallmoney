import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, User, Phone, MapPin, Wrench, Clock, Send, Hand } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lead, Message } from "@/hooks/use-leads";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  lead: Lead | null;
  messages: Message[];
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "contacted", label: "Contacted" },
  { value: "qualifying", label: "Qualifying" },
  { value: "booking", label: "Booking" },
  { value: "booked", label: "Booked" },
  { value: "lost", label: "Lost" },
  { value: "no_response", label: "No Response" },
] as const;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [manualText, setManualText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset manual text when switching leads
  useEffect(() => {
    setManualText("");
  }, [lead?.id]);

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

  const updateStatus = async (newStatus: string) => {
    setStatusUpdate(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus as Lead["status"] })
        .eq("id", lead.id);
      if (error) throw error;
      toast.success(`Status changed to ${newStatus.replace("_", " ")}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
    } finally {
      setStatusUpdate(false);
    }
  };

  const toggleTakeover = async () => {
    const nextVal = !lead.human_taken_over;
    try {
      const { error } = await supabase
        .from("leads")
        .update({ human_taken_over: nextVal })
        .eq("id", lead.id);
      if (error) throw error;
      toast.success(
        nextVal
          ? "Manual takeover — AI will not auto-reply to this lead"
          : "AI resume — AI will auto-reply again",
      );
    } catch (e: any) {
      toast.error(e?.message || "Failed to toggle takeover");
    }
  };

  const sendManual = async () => {
    const trimmed = manualText.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-manual-sms", {
        body: { leadId: lead.id, message: trimmed },
      });
      if (error) throw error;
      setManualText("");
      toast.success("Message sent");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

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

        {/* Status + takeover controls */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <select
            value={lead.status}
            disabled={statusUpdate}
            onChange={(e) => updateStatus(e.target.value)}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={toggleTakeover}
            className={cn(
              "flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border transition-colors",
              lead.human_taken_over
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Hand className="w-3 h-3" />
            {lead.human_taken_over ? "AI paused" : "Take over"}
          </button>
          {lead.human_taken_over && (
            <span className="text-[10px] text-primary font-medium">
              AI will not auto-reply
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[calc(100vh-460px)]">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Manual send */}
      <div className="px-5 py-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && sendManual()}
            placeholder="Send a message as your business…"
            className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={sendManual}
            disabled={sending || !manualText.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
