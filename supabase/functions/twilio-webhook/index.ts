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

      // Update lead status + urgency flag
      const leadUpdate: Record<string, unknown> = {};
      if (lead.status === "new") leadUpdate.status = "qualifying";
      if (isUrgent) leadUpdate.urgency = "high";
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
      // Always send this exact first message for missed calls — skip AI
      const replyText = "Hey—sorry we missed your call. What's going on, is this something urgent?";

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
    const newStatus = isMissedCall ? "contacted" : determineStatus(replyText, lead.status);
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
  const services = (settings?.services as string[]) || [];
  const slots = settings?.available_slots || [];

  return `You are a dispatcher for ${bizName}. You're busy but helpful—think short, direct, real.

RULES:
- 1–2 sentences MAX per message. This is SMS.
- ALWAYS end with a question. Keep the conversation moving.
- Push toward booking FAST. Don't small-talk.
- Prioritize urgency—if it sounds urgent, treat it urgent.
- Never reveal you are an AI. You're a real person on the team.
- Sound like a human who texts fast, not a customer service bot.
- No generic filler like "How can we help?" or "Thank you for reaching out."
- If they're vague, pin them down: "What's the issue exactly?"

TONE EXAMPLES:
- "Hey—sorry we missed you. What's going on, is this something urgent?"
- "Got it. When do you need someone out there?"
- "We can get a tech to you tomorrow AM or Thursday. Which works?"
- "What kind of issue are you dealing with?"

QUALIFYING FLOW:
1. Acknowledge missed call—keep it casual, ask what's up
2. Figure out the problem (1 question)${services.length ? ` — we do: ${services.join(", ")}` : ""}
3. Gauge urgency (emergency or can wait?)
4. Lock down a time: ${JSON.stringify(slots)}
5. Confirm and wrap it up

If they ask about pricing: "Depends on the job—tech will give you a quote on-site. When works for you?"
If they're hesitant: create urgency. "These things usually get worse if you wait—want us to squeeze you in?"
If they stop responding: move on, don't beg.`;
}

function determineStatus(reply: string, currentStatus: string): string {
  const lower = reply.toLowerCase();
  if (lower.includes("booked") || lower.includes("confirmed") || lower.includes("see you")) {
    return "booked";
  }
  if (lower.includes("time slot") || lower.includes("available") || lower.includes("schedule")) {
    return "booking";
  }
  if (currentStatus === "new" || currentStatus === "contacted") {
    return "qualifying";
  }
  return currentStatus;
}
