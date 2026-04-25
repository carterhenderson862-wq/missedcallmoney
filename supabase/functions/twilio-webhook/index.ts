import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-twilio-signature",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

/**
 * Validate Twilio webhook signature.
 * Algorithm: HMAC-SHA1 of (URL + sorted concatenation of POST params), base64.
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string,
): boolean {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const expected = createHmac("sha1", authToken).update(data).digest("base64");
  // Constant-time compare
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_AUTH_TOKEN || !supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- Twilio signature validation ---
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      console.warn("Rejected non-form-encoded request");
      return new Response(JSON.stringify({ error: "Invalid content type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-twilio-signature");
    if (!signature) {
      console.warn("Rejected request: missing X-Twilio-Signature");
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    const formData = new URLSearchParams(rawBody);
    const params: Record<string, string> = {};
    for (const [k, v] of formData.entries()) params[k] = v;

    // Twilio signs against the webhook URL it called. Honor x-forwarded-proto/host if present.
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const reqUrl = new URL(req.url);
    const webhookUrl = `${proto}://${host}${reqUrl.pathname}${reqUrl.search}`;

    const valid = validateTwilioSignature(TWILIO_AUTH_TOKEN, webhookUrl, params, signature);
    if (!valid) {
      console.warn("Rejected request: invalid Twilio signature");
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // --- End signature validation ---

    const fromNumber = params["From"] || "";
    const toNumber = params["To"] || "";
    const body = params["Body"] || "";
    const callStatus = params["CallStatus"] || null;

    if (!fromNumber || !toNumber) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route to the correct business by the Twilio number that was called
    const { data: settings } = await supabase
      .from("business_settings")
      .select("*")
      .eq("twilio_phone_number", toNumber)
      .limit(1)
      .maybeSingle();

    if (!settings) {
      console.warn(`No business found for Twilio number ${toNumber}`);
      // Return 200 so Twilio doesn't retry; this isn't an error worth retrying.
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
      return new Response(twiml, {
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      });
    }

    const ownerUserId = settings.owner_user_id;

    const isMissedCall = !body && (callStatus === "no-answer" || callStatus === "busy" || callStatus === "canceled" || !callStatus);
    const isInboundSms = !!body;

    // Find or create lead scoped to this business
    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("phone_number", fromNumber)
      .not("status", "in", '("booked","lost")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let lead = existingLead;

    if (!lead && (isMissedCall || isInboundSms)) {
      const { data: newLead, error: insertError } = await supabase
        .from("leads")
        .insert({
          owner_user_id: ownerUserId,
          phone_number: fromNumber,
          status: "new",
          source: isMissedCall ? "missed_call" : "inbound_sms",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create lead:", insertError);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lead = newLead;
    }

    if (!lead) {
      return new Response(JSON.stringify({ message: "ok" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const URGENT_KEYWORDS = ["leak", "leaking", "flood", "flooding", "urgent", "emergency", "no ac", "no heat", "broken", "burst", "backed up", "gas smell", "sparking", "no power", "no water", "overflowing"];
    const isUrgent = isInboundSms && URGENT_KEYWORDS.some(kw => body.toLowerCase().includes(kw));

    if (isInboundSms) {
      await supabase.from("messages").insert({
        owner_user_id: ownerUserId,
        lead_id: lead.id,
        direction: "inbound",
        body,
      });

      const leadUpdate: Record<string, unknown> = {};
      if (["new", "contacted"].includes(lead.status)) {
        leadUpdate.status = "responded";
      }
      if (isUrgent) leadUpdate.urgency = "high";
      leadUpdate.next_follow_up_at = null;
      leadUpdate.follow_up_count = 0;
      if (Object.keys(leadUpdate).length > 0) {
        await supabase.from("leads").update(leadUpdate).eq("id", lead.id);
      }
    }

    const { data: messageHistory } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true });

    const systemPrompt = settings?.ai_system_prompt || buildDefaultSystemPrompt(settings);
    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    const twilioFrom = settings?.twilio_phone_number;

    if (isMissedCall) {
      const bizName = settings?.business_name || "us";
      const replyText = `Hey—this is ${bizName}. Sorry we missed your call. What's going on, is this something urgent?`;

      if (!twilioFrom) {
        await supabase.from("messages").insert({
          owner_user_id: ownerUserId,
          lead_id: lead.id,
          direction: "outbound",
          body: replyText,
          status: "pending_no_phone",
        });
        return new Response(
          JSON.stringify({ message: "ok" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: fromNumber, From: twilioFrom, Body: replyText }),
      });
      const smsData = await smsResponse.json();
      if (!smsResponse.ok) {
        console.error("Twilio SMS error:", smsResponse.status, smsData);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("messages").insert({
        owner_user_id: ownerUserId,
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        twilio_sid: smsData.sid,
        status: "sent",
      });

      const updateData: Record<string, unknown> = { status: "contacted", follow_up_count: 0 };
      if (settings?.follow_up_enabled !== false) {
        updateData.next_follow_up_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      }
      await supabase.from("leads").update(updateData).eq("id", lead.id);

      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
      return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "application/xml" } });
    }

    // Inbound SMS — generate AI response
    for (const msg of messageHistory || []) {
      aiMessages.push({
        role: msg.direction === "inbound" ? "user" : "assistant",
        content: msg.body,
      });
    }

    const TIMING_KEYWORDS = ["tomorrow", "today", "morning", "afternoon", "evening", "asap", "this week", "next week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "9am", "10am", "11am", "noon", "1pm", "2pm", "3pm", "4pm", "free at", "i'm free", "im free", "available at", "can do"];
    const PROBLEM_KEYWORDS = ["leak", "broken", "not working", "clogged", "no ac", "no heat", "no hot water", "dripping", "backed up", "running", "won't turn on", "wont turn on", "needs repair", "needs fixing", "replace", "install", "ac issue", "heater", "furnace", "toilet", "faucet", "pipe", "drain", "roof", "electrical", "outlet", "breaker"];
    const lower = body.toLowerCase();
    const hasTiming = TIMING_KEYWORDS.some(kw => lower.includes(kw));
    const hasProblem = PROBLEM_KEYWORDS.some(kw => lower.includes(kw));
    const readyToBook = hasTiming && hasProblem;

    if (readyToBook) {
      aiMessages.push({
        role: "system",
        content: "FAST-TRACK: The customer has stated both their problem AND when they're available. Do NOT ask more qualifying questions. Immediately offer a specific time slot and confirm.",
      });
    } else if (isUrgent) {
      aiMessages.push({
        role: "system",
        content: "URGENT JOB DETECTED. Treat this as high priority. Respond with urgency and push to schedule ASAP. Keep it to 1-2 sentences.",
      });
    }

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
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 500;
      return new Response(JSON.stringify({ error: "AI temporarily unavailable" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const replyText = aiData.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      console.error("Empty AI response");
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!twilioFrom) {
      await supabase.from("messages").insert({
        owner_user_id: ownerUserId,
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        status: "pending_no_phone",
      });
      return new Response(
        JSON.stringify({ message: "ok" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: fromNumber, From: twilioFrom, Body: replyText }),
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) {
      console.error("Twilio SMS error:", smsResponse.status, smsData);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("messages").insert({
      owner_user_id: ownerUserId,
      lead_id: lead.id,
      direction: "outbound",
      body: replyText,
      twilio_sid: smsData.sid,
      status: "sent",
    });

    const newStatus = determineStatus(replyText, body, lead.status);
    await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
    return new Response(twiml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildDefaultSystemPrompt(settings: Record<string, unknown> | null): string {
  const bizName = (settings?.business_name as string) || "our company";
  const serviceArea = (settings?.service_area as string) || "";
  const services = (settings?.services as string[]) || [];
  const slots = settings?.available_slots || [];

  return `You are a dispatcher for ${bizName}${serviceArea ? ` serving ${serviceArea}` : ""}. Your ONE JOB is to book an appointment. Every message must move closer to a confirmed time slot.

IDENTITY:
- You work at ${bizName}. Introduce yourself naturally once: "This is ${bizName}—we got your call."
${services.length ? `- We handle: ${services.join(", ")}` : ""}
${serviceArea ? `- We serve: ${serviceArea}` : ""}

CORE RULES:
- 1–2 sentences MAX. This is SMS.
- EVERY message MUST end with a scheduling question or a time offer. No exceptions.
- Your goal is BOOKING, not chatting.
- Never reveal you are AI.

AVAILABLE SLOTS: ${JSON.stringify(slots)}`;
}

function determineStatus(aiReply: string, inboundMsg: string, currentStatus: string): string {
  const reply = aiReply.toLowerCase();
  const inbound = inboundMsg.toLowerCase();

  const confirmWords = ["yes", "yeah", "yep", "sure", "sounds good", "let's do it", "book it", "perfect", "that works", "confirm"];
  if (currentStatus === "booking" && confirmWords.some(w => inbound.includes(w))) return "booked";

  if (reply.includes("schedule") || reply.includes("time slot") || reply.includes("available") || reply.includes("tomorrow") || reply.includes("today") || reply.includes("lock that in") || reply.includes("squeeze you in")) {
    return "booking";
  }
  if (reply.includes("booked") || reply.includes("confirmed") || reply.includes("see you") || reply.includes("all set")) {
    return "booked";
  }
  if (reply.includes("?")) return "qualifying";
  return currentStatus;
}
