import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

// Each follow-up identifies the business — most recipients won't have the
// number saved, and an anonymous "just checking in" reads as spam.
const FOLLOW_UP_SEQUENCE = [
  { message: (biz: string) => `hey, it's ${biz} — just checking back in. still need help with this?`, delayToNextMs: 55 * 60 * 1000 },
  { message: (biz: string) => `${biz} here — we can get someone out to you, want me to lock in a time?`, delayToNextMs: 23 * 60 * 60 * 1000 },
  { message: (biz: string) => `last check-in from ${biz} — still need help, or should I close this out?`, delayToNextMs: null },
];

// TCPA-safe quiet hours: no automated follow-up texts before 8am or after
// 9pm in the business's local timezone (defaults to Central / Austin market).
const QUIET_START_HOUR = 21; // 9pm
const QUIET_END_HOUR = 8; // 8am
const DEFAULT_TIMEZONE = "America/Chicago";

function localHour(timezone: string): number {
  try {
    const h = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date());
    return parseInt(h, 10) % 24;
  } catch (_e) {
    return new Date().getUTCHours();
  }
}

// If we're inside quiet hours, return an ISO timestamp for the next 8am local.
function deferUntilMorning(timezone: string): string | null {
  const hour = localHour(timezone);
  if (hour >= QUIET_END_HOUR && hour < QUIET_START_HOUR) return null; // OK to send now
  const hoursUntil8am = hour >= QUIET_START_HOUR ? (24 - hour) + QUIET_END_HOUR : QUIET_END_HOUR - hour;
  return new Date(Date.now() + hoursUntil8am * 60 * 60 * 1000).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .not("status", "in", '("booked","lost","no_response")')
      .lte("next_follow_up_at", now)
      .order("next_follow_up_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Failed to fetch leads:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: "No follow-ups needed", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache settings per owner
    const settingsCache = new Map<string, Record<string, unknown> | null>();
    const getSettings = async (ownerId: string) => {
      if (settingsCache.has(ownerId)) return settingsCache.get(ownerId);
      const { data } = await supabase
        .from("business_settings")
        .select("*")
        .eq("owner_user_id", ownerId)
        .maybeSingle();
      settingsCache.set(ownerId, data);
      return data;
    };

    const results: Array<{ leadId: string; status: string }> = [];

    for (const lead of leads) {
      const stepIndex = lead.follow_up_count || 0;

      if (stepIndex >= FOLLOW_UP_SEQUENCE.length) {
        await supabase.from("leads").update({
          status: "no_response",
          next_follow_up_at: null,
        }).eq("id", lead.id);
        results.push({ leadId: lead.id, status: "max_reached" });
        continue;
      }

      const step = FOLLOW_UP_SEQUENCE[stepIndex];
      const settings = await getSettings(lead.owner_user_id);
      const twilioFrom = settings?.twilio_phone_number as string | undefined;
      const bizName = (settings?.business_name as string) || "our team";
      const replyText = step.message(bizName);

      // Quiet hours: don't text people in the middle of the night. Defer the
      // follow-up to the next morning without consuming a sequence step.
      const timezone = (settings?.timezone as string) || DEFAULT_TIMEZONE;
      const deferredUntil = deferUntilMorning(timezone);
      if (deferredUntil) {
        await supabase.from("leads").update({ next_follow_up_at: deferredUntil }).eq("id", lead.id);
        results.push({ leadId: lead.id, status: "deferred_quiet_hours" });
        continue;
      }

      // Global opt-out check — never message a phone number on the opt-out list.
      const { data: optOut } = await supabase
        .from("sms_opt_outs")
        .select("id")
        .eq("owner_user_id", lead.owner_user_id)
        .eq("phone_number", lead.phone_number)
        .maybeSingle();
      if (optOut) {
        await supabase.from("leads").update({
          status: "lost",
          next_follow_up_at: null,
        }).eq("id", lead.id);
        await supabase.from("admin_activity").insert({
          event_type: "skipped_due_to_opt_out",
          actor_user_id: lead.owner_user_id,
          description: `Follow-up skipped — ${lead.phone_number} is on opt-out list`,
          metadata: { lead_id: lead.id, from: lead.phone_number, channel: "follow_up" },
        }).then(() => {}, (e) => console.warn("admin_activity log failed:", e));
        results.push({ leadId: lead.id, status: "skipped_opt_out" });
        continue;
      }

      if (!twilioFrom) {
        await supabase.from("messages").insert({
          owner_user_id: lead.owner_user_id,
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

      const smsData = await smsResponse.json().catch(() => ({}));
      if (!smsResponse.ok) {
        console.error("Twilio SMS error for lead", lead.id, smsResponse.status, smsData);
      }

      await supabase.from("messages").insert({
        owner_user_id: lead.owner_user_id,
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        twilio_sid: smsData?.sid || null,
        status: smsResponse.ok ? "sent" : "failed",
      });

      const nextCount = stepIndex + 1;
      const updateData: Record<string, unknown> = { follow_up_count: nextCount };

      if (step.delayToNextMs && nextCount < FOLLOW_UP_SEQUENCE.length) {
        updateData.next_follow_up_at = new Date(Date.now() + step.delayToNextMs).toISOString();
      } else {
        updateData.next_follow_up_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      await supabase.from("leads").update(updateData).eq("id", lead.id);
      results.push({ leadId: lead.id, status: smsResponse.ok ? "sent" : "sms_failed" });
    }

    return new Response(JSON.stringify({ message: "Follow-ups processed", count: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Follow-up error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
