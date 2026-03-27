import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

// Hardcoded follow-up sequence — each message + delay to next
const FOLLOW_UP_SEQUENCE = [
  {
    message: "Hey—just checking back in. Still need help with this?",
    delayToNextMs: 55 * 60 * 1000, // ~55 min (so next fires ~1hr after initial)
  },
  {
    message: "We can get someone out today or tomorrow—want me to lock that in?",
    delayToNextMs: 23 * 60 * 60 * 1000, // ~23 hrs (so next fires ~next day)
  },
  {
    message: "Following up—do you still need help or should I close this out?",
    delayToNextMs: null, // final message
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .not("status", "in", '("booked","lost","no_response")')
      .lte("next_follow_up_at", now)
      .order("next_follow_up_at", { ascending: true })
      .limit(20);

    if (error) throw new Error(`Failed to fetch leads: ${error.message}`);
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: "No follow-ups needed", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: settings } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .single();

    const results: Array<{ leadId: string; status: string }> = [];

    for (const lead of leads) {
      const stepIndex = lead.follow_up_count || 0;

      // Past the sequence — mark as no_response
      if (stepIndex >= FOLLOW_UP_SEQUENCE.length) {
        await supabase.from("leads").update({
          status: "no_response",
          next_follow_up_at: null,
        }).eq("id", lead.id);
        results.push({ leadId: lead.id, status: "max_reached" });
        continue;
      }

      const step = FOLLOW_UP_SEQUENCE[stepIndex];
      const replyText = step.message;

      // Send SMS
      const twilioFrom = settings?.twilio_phone_number;
      if (!twilioFrom) {
        await supabase.from("messages").insert({
          lead_id: lead.id,
          direction: "outbound",
          body: replyText,
          status: "pending_no_phone",
        });
        results.push({ leadId: lead.id, status: "no_phone" });
        continue;
      }

      const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: lead.phone_number,
          From: twilioFrom,
          Body: replyText,
        }),
      });

      const smsData = await smsResponse.json();

      await supabase.from("messages").insert({
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        twilio_sid: smsData.sid || null,
        status: smsResponse.ok ? "sent" : "failed",
      });

      // Schedule next follow-up or mark done
      const nextCount = stepIndex + 1;
      const updateData: Record<string, unknown> = { follow_up_count: nextCount };

      if (step.delayToNextMs && nextCount < FOLLOW_UP_SEQUENCE.length) {
        updateData.next_follow_up_at = new Date(Date.now() + step.delayToNextMs).toISOString();
      } else {
        // Final message sent — will be marked no_response on next cycle if no reply
        updateData.next_follow_up_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      await supabase.from("leads").update(updateData).eq("id", lead.id);
      results.push({ leadId: lead.id, status: smsResponse.ok ? "sent" : "sms_failed" });
    }

    return new Response(JSON.stringify({ message: "Follow-ups processed", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Follow-up error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
