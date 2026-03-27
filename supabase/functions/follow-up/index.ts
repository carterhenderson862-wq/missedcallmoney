import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

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

    // Get all leads due for follow-up
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

    // Get business settings
    const { data: settings } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .single();

    const maxFollowUps = settings?.max_follow_ups || 3;
    const results: Array<{ leadId: string; status: string }> = [];

    for (const lead of leads) {
      // Check if max follow-ups reached
      if (lead.follow_up_count >= maxFollowUps) {
        await supabase.from("leads").update({
          status: "no_response",
          next_follow_up_at: null,
        }).eq("id", lead.id);
        results.push({ leadId: lead.id, status: "max_reached" });
        continue;
      }

      // Get conversation history
      const { data: messageHistory } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });

      // Build AI prompt for follow-up
      const aiMessages = [
        {
          role: "system",
          content: `You are following up with a customer who hasn't responded to ${settings?.business_name || "our"} outreach. This is follow-up #${lead.follow_up_count + 1}. Be brief, friendly, and create urgency without being pushy. One or two sentences max.`,
        },
        ...((messageHistory || []).map((msg) => ({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.body,
        }))),
        {
          role: "user",
          content: `The customer hasn't responded. Send a brief, natural follow-up message. Follow-up #${lead.follow_up_count + 1} of ${maxFollowUps}.`,
        },
      ];

      // Get AI response
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI error for lead ${lead.id}: ${aiResponse.status}`);
        results.push({ leadId: lead.id, status: "ai_error" });
        continue;
      }

      const aiData = await aiResponse.json();
      const replyText = aiData.choices?.[0]?.message?.content?.trim();
      if (!replyText) {
        results.push({ leadId: lead.id, status: "empty_response" });
        continue;
      }

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

      // Save message
      await supabase.from("messages").insert({
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        twilio_sid: smsData.sid || null,
        status: smsResponse.ok ? "sent" : "failed",
      });

      // Update lead
      const hours = settings?.follow_up_interval_hours || 4;
      await supabase.from("leads").update({
        follow_up_count: lead.follow_up_count + 1,
        next_follow_up_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      }).eq("id", lead.id);

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
