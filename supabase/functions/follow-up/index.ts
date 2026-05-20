import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const FOLLOW_UP_SEQUENCE = [
  { message: "Hey—just checking back in. Still need help with this?", delayToNextMs: 55 * 60 * 1000 },
  { message: "We can get someone out today or tomorrow—want me to lock that in?", delayToNextMs: 23 * 60 * 60 * 1000 },
  { message: "Following up—do you still need help or should I close this out?", delayToNextMs: null },
];

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
      const replyText = step.message;
      const settings = await getSettings(lead.owner_user_id);
      const twilioFrom = settings?.twilio_phone_number as string | undefined;

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
