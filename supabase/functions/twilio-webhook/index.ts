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
      // Idempotency: if Twilio retries with same MessageSid, skip duplicate work.
      const inboundSid = params["MessageSid"] || params["SmsSid"] || null;
      if (inboundSid) {
        const { data: existingMsg } = await supabase
          .from("messages")
          .select("id")
          .eq("twilio_sid", inboundSid)
          .maybeSingle();
        if (existingMsg) {
          const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
          return new Response(twiml, {
            headers: { ...corsHeaders, "Content-Type": "application/xml" },
          });
        }
      }

      await supabase.from("messages").insert({
        owner_user_id: ownerUserId,
        lead_id: lead.id,
        direction: "inbound",
        body,
        twilio_sid: inboundSid,
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
      const replyText = `Hey—sorry we missed your call. What's going on, is this something urgent?`;

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
      const smsData = await smsResponse.json().catch(() => ({}));
      if (!smsResponse.ok) {
        console.error("Twilio SMS error (missed-call reply):", smsResponse.status, smsData);
        // Return 200 to prevent Twilio retry storms; the inbound is already recorded as a lead.
        const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
        return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "application/xml" } });
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

    // (legacy keyword fast-track removed — dispatcher checklist below drives flow)

    // Build dispatcher checklist of what's still missing on this lead
    const missing: string[] = [];
    if (!lead.service_type) missing.push("service_type (plumbing/HVAC/roofing/electrical/other)");
    if (!lead.urgency) missing.push("urgency (urgent vs scheduled)");
    if (!lead.job_details || Object.keys((lead.job_details as Record<string, unknown>) || {}).length === 0) missing.push("issue (what exactly is wrong)");
    if (!lead.location) missing.push("location (area or address)");
    if (!lead.customer_name) missing.push("customer_name");
    if (!lead.booked_slot) missing.push("preferred_time");

    const nextNeeded = missing[0] || null;

    if (isUrgent && !lead.urgency) {
      aiMessages.push({
        role: "system",
        content: "URGENT JOB DETECTED. Acknowledge urgency in 1 short sentence, then ask the next missing detail. Example: 'Got it — we'll treat this as urgent. Are you available now or later today?' 1-2 sentences max.",
      });
    }

    if (nextNeeded) {
      aiMessages.push({
        role: "system",
        content: `DISPATCHER CHECKLIST: Ask ONE question to capture: ${nextNeeded}. Do NOT ask anything already collected. Keep it to 1 sentence, natural and contractor-like. Examples by field:\n- service_type: "Is this for plumbing, HVAC, roofing, electrical, or something else?"\n- issue: "What's the issue exactly?"\n- location: "What area or address is this for?"\n- customer_name: "What's your name so we can put it with the request?"\n- preferred_time: "Want the earliest available, or is there a time that works best?"`,
      });
    } else {
      aiMessages.push({
        role: "system",
        content: "ALL DETAILS COLLECTED. Confirm booking intent in 1 sentence: 'Perfect — I'll mark this as ready to book and have the team confirm shortly.' Do NOT ask more questions.",
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
      // Return 200 with empty TwiML so Twilio doesn't retry and re-trigger AI cost.
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
      return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "application/xml" } });
    }

    const aiData = await aiResponse.json();
    const replyText = aiData.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      console.error("Empty AI response");
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
      return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "application/xml" } });
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

    // Extract structured details from the latest customer message via tool calling
    try {
      const extractResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Extract any details the customer provided in this SMS. Only set fields explicitly mentioned. Leave others null." },
            { role: "user", content: `Customer SMS: "${body}"\n\nKnown so far: ${JSON.stringify({ service_type: lead.service_type, customer_name: lead.customer_name, location: lead.location, urgency: lead.urgency, booked_slot: lead.booked_slot, issue: (lead.job_details as Record<string, unknown>)?.issue || null })}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "save_lead_details",
              description: "Save details extracted from the customer SMS.",
              parameters: {
                type: "object",
                properties: {
                  service_type: { type: ["string", "null"], description: "plumbing, HVAC, roofing, electrical, or other" },
                  customer_name: { type: ["string", "null"] },
                  location: { type: ["string", "null"], description: "Area, neighborhood, or address" },
                  urgency: { type: ["string", "null"], enum: ["high", "normal", null], description: "high if urgent/emergency/ASAP, normal otherwise" },
                  preferred_time: { type: ["string", "null"], description: "Preferred day/time the customer mentioned" },
                  issue: { type: ["string", "null"], description: "Short description of the actual problem" },
                  ready_to_book: { type: "boolean", description: "True if the customer agreed to a time or said yes to booking" },
                },
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "save_lead_details" } },
        }),
      });

      if (extractResp.ok) {
        const extractData = await extractResp.json();
        const toolCall = extractData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const args = JSON.parse(toolCall.function.arguments);
          const updates: Record<string, unknown> = {};
          if (args.service_type && !lead.service_type) updates.service_type = args.service_type;
          if (args.customer_name && !lead.customer_name) updates.customer_name = args.customer_name;
          if (args.location && !lead.location) updates.location = args.location;
          if (args.urgency && !lead.urgency) updates.urgency = args.urgency;
          if (args.preferred_time && !lead.booked_slot) updates.booked_slot = args.preferred_time;
          if (args.issue) {
            const existing = (lead.job_details as Record<string, unknown>) || {};
            updates.job_details = { ...existing, issue: args.issue };
          }
          if (args.ready_to_book) {
            updates.status = "booked";
            updates.booked_at = new Date().toISOString();
          } else {
            updates.status = determineStatus(replyText, body, lead.status);
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from("leads").update(updates).eq("id", lead.id);
          }
        }
      } else {
        // Fallback: just update status
        const newStatus = determineStatus(replyText, body, lead.status);
        await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);
      }
    } catch (e) {
      console.error("Extraction failed:", e);
      const newStatus = determineStatus(replyText, body, lead.status);
      await supabase.from("leads").update({ status: newStatus }).eq("id", lead.id);
    }

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

CONVERSATION FLOW:
1. First reply already asked: "Is this urgent or something we can schedule later?"
2. Based on the customer's answer, branch tone and speed:
   - URGENT (urgent, emergency, ASAP, leak, no AC, flood, no heat, broken, burst, etc.): Acknowledge fast, offer same-day/ASAP slots. Tone: "Got it—we'll treat this as urgent. Are you free now or later today?"
   - NON-URGENT (later, schedule, whenever, no rush, sometime, next week): Stay warm, offer next available days. Tone: "Perfect—what day works best for you?"
3. Once you have the problem AND a time window, lock in a specific slot and confirm.

CORE RULES:
- 1–2 sentences MAX. This is SMS. No paragraphs, no robotic phrasing.
- EVERY message MUST end with a clear next step: a scheduling question, a time offer, or a booking confirmation.
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
