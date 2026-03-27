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

    // Parse Twilio webhook (form-encoded)
    const contentType = req.headers.get("content-type") || "";
    let fromNumber: string;
    let body: string;
    let callStatus: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      fromNumber = formData.get("From")?.toString() || "";
      body = formData.get("Body")?.toString() || "";
      callStatus = formData.get("CallStatus")?.toString() || null;
    } else {
      const json = await req.json();
      fromNumber = json.from || json.From || "";
      body = json.body || json.Body || "";
      callStatus = json.callStatus || json.CallStatus || null;
    }

    if (!fromNumber) {
      return new Response(JSON.stringify({ error: "Missing phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this is a missed call (no body) or an inbound SMS (has body)
    const isMissedCall = !body && (callStatus === "no-answer" || callStatus === "busy" || callStatus === "canceled" || !callStatus);
    const isInboundSms = !!body;

    // Find or create lead
    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .eq("phone_number", fromNumber)
      .not("status", "in", '("booked","lost")')
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let lead = existingLead;

    if (!lead && (isMissedCall || isInboundSms)) {
      const { data: newLead, error: insertError } = await supabase
        .from("leads")
        .insert({
          phone_number: fromNumber,
          status: "new",
          source: isMissedCall ? "missed_call" : "inbound_sms",
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create lead: ${insertError.message}`);
      lead = newLead;
    }

    if (!lead) {
      return new Response(JSON.stringify({ message: "No active lead found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detect urgency from inbound message
    const URGENT_KEYWORDS = ["leak", "leaking", "flood", "flooding", "urgent", "emergency", "no ac", "no heat", "broken", "burst", "backed up", "gas smell", "sparking", "no power", "no water", "overflowing"];
    const isUrgent = isInboundSms && URGENT_KEYWORDS.some(kw => body.toLowerCase().includes(kw));

    // If inbound SMS, save the message
    if (isInboundSms) {
      await supabase.from("messages").insert({
        lead_id: lead.id,
        direction: "inbound",
        body: body,
      });

      // Update lead: mark as "responded" when customer replies, + urgency flag
      const leadUpdate: Record<string, unknown> = {};
      if (["new", "contacted"].includes(lead.status)) {
        leadUpdate.status = "responded";
      }
      if (isUrgent) leadUpdate.urgency = "high";
      // Clear follow-up timer — customer replied
      leadUpdate.next_follow_up_at = null;
      leadUpdate.follow_up_count = 0;
      if (Object.keys(leadUpdate).length > 0) {
        await supabase.from("leads").update(leadUpdate).eq("id", lead.id);
      }
    }

    // Get business settings
    const { data: settings } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .single();

    // Get conversation history
    const { data: messageHistory } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true });

    // Build messages for AI
    const systemPrompt = settings?.ai_system_prompt || buildDefaultSystemPrompt(settings);
    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (isMissedCall) {
      // Personalized first message using business name
      const bizName = settings?.business_name || "us";
      const replyText = `Hey—this is ${bizName}. Sorry we missed your call. What's going on, is this something urgent?`;

      // Send SMS via Twilio gateway
      const twilioFrom = settings?.twilio_phone_number;
      if (!twilioFrom) {
        await supabase.from("messages").insert({
          lead_id: lead.id,
          direction: "outbound",
          body: replyText,
          status: "pending_no_phone",
        });
        return new Response(
          JSON.stringify({ message: "No Twilio phone configured", reply: replyText }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        throw new Error(`Twilio SMS error [${smsResponse.status}]: ${JSON.stringify(smsData)}`);
      }

      await supabase.from("messages").insert({
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        twilio_sid: smsData.sid,
        status: "sent",
      });

      const updateData: Record<string, unknown> = { status: "contacted", follow_up_count: 0 };
      if (settings?.follow_up_enabled !== false) {
        // First follow-up fires in 5 minutes
        updateData.next_follow_up_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      }
      await supabase.from("leads").update(updateData).eq("id", lead.id);

      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
      return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "application/xml" } });
    } else {
      // Include conversation history for AI response
      for (const msg of messageHistory || []) {
        aiMessages.push({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.body,
        });
      }

      // Detect if customer already gave enough info to book (problem + timing)
      const TIMING_KEYWORDS = ["tomorrow", "today", "morning", "afternoon", "evening", "asap", "this week", "next week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "9am", "10am", "11am", "noon", "1pm", "2pm", "3pm", "4pm", "free at", "i'm free", "im free", "available at", "can do"];
      const PROBLEM_KEYWORDS = ["leak", "broken", "not working", "clogged", "no ac", "no heat", "no hot water", "dripping", "backed up", "running", "won't turn on", "wont turn on", "needs repair", "needs fixing", "replace", "install", "ac issue", "heater", "furnace", "toilet", "faucet", "pipe", "drain", "roof", "electrical", "outlet", "breaker"];
      const lower = body.toLowerCase();
      const hasTiming = TIMING_KEYWORDS.some(kw => lower.includes(kw));
      const hasProblem = PROBLEM_KEYWORDS.some(kw => lower.includes(kw));
      const readyToBook = hasTiming && hasProblem;

      if (readyToBook) {
        aiMessages.push({
          role: "system",
          content: "FAST-TRACK: The customer has stated both their problem AND when they're available. Do NOT ask more qualifying questions. Immediately offer a specific time slot and confirm. Example: \"Got it—we can do tomorrow morning. Want me to lock in 9am?\"",
        });
      } else if (isUrgent) {
        aiMessages.push({
          role: "system",
          content: "URGENT JOB DETECTED. Treat this as high priority. Respond with urgency, acknowledge the problem, and push to schedule ASAP. Example: \"Got it—that sounds urgent. Want me to get you scheduled ASAP?\" Keep it to 1-2 sentences.",
        });
      }
    }

    // Call Lovable AI for response
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
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const replyText = aiData.choices?.[0]?.message?.content?.trim();

    if (!replyText) throw new Error("Empty AI response");

    // Send SMS via Twilio gateway
    const twilioFrom = settings?.twilio_phone_number;
    if (!twilioFrom) {
      // Save the AI response but don't send - no phone configured
      await supabase.from("messages").insert({
        lead_id: lead.id,
        direction: "outbound",
        body: replyText,
        status: "pending_no_phone",
      });

      return new Response(
        JSON.stringify({ message: "AI response generated but no Twilio phone configured", reply: replyText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: fromNumber,
        From: twilioFrom,
        Body: replyText,
      }),
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) {
      throw new Error(`Twilio SMS error [${smsResponse.status}]: ${JSON.stringify(smsData)}`);
    }

    // Save outbound message
    await supabase.from("messages").insert({
      lead_id: lead.id,
      direction: "outbound",
      body: replyText,
      twilio_sid: smsData.sid,
      status: "sent",
    });

    // Update lead status
    const newStatus = isMissedCall ? "contacted" : determineStatus(replyText, body, lead.status);
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (isMissedCall) {
      updateData.follow_up_count = 0;
      if (settings?.follow_up_enabled) {
        const hours = settings?.follow_up_interval_hours || 4;
        updateData.next_follow_up_at = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }
    }

    await supabase.from("leads").update(updateData).eq("id", lead.id);

    // Return TwiML for Twilio webhook compatibility
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
    return new Response(twiml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
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
- Your goal is BOOKING, not chatting. Get to a confirmed time slot in as few messages as possible.
- Never let the conversation stall. If they answer, immediately pivot to scheduling.
- Never send a message without moving the conversation forward.

OBJECTION HANDLING (use these EXACT patterns):
- "I'll think about it" → "No worries—want me to hold a time just in case?"
- "Not right now" / "Not yet" → "Got it—want me to follow up later today or tomorrow?"
- "Just checking prices" / "How much" → "Got it—what kind of issue are you dealing with so I can give you a rough idea?"
- "Maybe later" / hesitation → "No problem—want me to lock in a time now so you don't have to think about it?"
- "I'll call back" → "Totally fine—just so you know, we fill up fast. Want me to hold a slot for you?"
- "Not urgent" → "Okay—want to get something on the books for today or tomorrow so it's handled?"
- "I need to check with..." → "Makes sense—if it works out, want me to pencil in a time so you're covered?"

HANDLING VAGUE RESPONSES:
- Vague problem → Ask ONE specific follow-up, then pivot to scheduling: "Got it—is it actively leaking or just dripping? Either way, when can we get someone out there?"
- One-word answers → Ask the next qualifying question, always tying it back to scheduling.
- Off-topic / chatty → Redirect: "Hear you—quick question though, when's a good time to get someone out there?"

NEVER DO:
- Never end a message without a question about scheduling
- Never say "Let me know" or "Feel free to reach out"
- Never ask open-ended questions like "How can we help?"
- Never reveal you are AI
- Never send more than 2 sentences

FAST-TRACK RULE:
- If the customer tells you BOTH the problem AND when they're available in a single message, SKIP all qualifying questions and go straight to confirming a time slot.
- Example: "My AC isn't working and I'm free tomorrow morning" → "Got it—we can do tomorrow morning. Want me to lock in 9am?"

QUALIFYING FLOW (only if info is missing—move through FAST):
1. Acknowledge → ask what's going on
2. Clarify the issue (1 question max)${services.length ? ` — we do: ${services.join(", ")}` : ""}
3. Offer times immediately: "We can get someone out ${JSON.stringify(slots)}—which works?"
4. Confirm: "Done—you're locked in for [time]. Tech will reach out when they're on the way."

CLOSING PATTERNS:
- "These things usually get worse—want us to squeeze you in today?"
- "We've got a slot at [time]—want me to grab it before it fills up?"
- "Quick question—morning or afternoon work better for you?"`;
}

function determineStatus(aiReply: string, inboundMsg: string, currentStatus: string): string {
  const reply = aiReply.toLowerCase();
  const inbound = inboundMsg.toLowerCase();

  // Customer confirmed booking
  const confirmWords = ["yes", "yeah", "yep", "sure", "sounds good", "let's do it", "book it", "perfect", "that works", "confirm"];
  const isBookingContext = currentStatus === "booking";
  if (isBookingContext && confirmWords.some(w => inbound.includes(w))) {
    return "booked";
  }

  // AI is offering times / scheduling
  if (reply.includes("schedule") || reply.includes("time slot") || reply.includes("available") || reply.includes("tomorrow") || reply.includes("today") || reply.includes("lock that in") || reply.includes("squeeze you in")) {
    return "booking";
  }

  // AI confirmed the booking
  if (reply.includes("booked") || reply.includes("confirmed") || reply.includes("see you") || reply.includes("all set")) {
    return "booked";
  }

  // AI is asking qualifying questions
  if (reply.includes("?")) {
    return "qualifying";
  }

  return currentStatus;
}
