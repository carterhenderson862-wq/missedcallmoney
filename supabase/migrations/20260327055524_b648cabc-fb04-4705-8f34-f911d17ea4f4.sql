
-- Lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualifying', 'booking', 'booked', 'lost', 'no_response');

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  service_type TEXT,
  urgency TEXT,
  location TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'missed_call',
  job_details JSONB DEFAULT '{}',
  booked_at TIMESTAMP WITH TIME ZONE,
  booked_slot TEXT,
  follow_up_count INTEGER DEFAULT 0,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table for conversation history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Business settings table
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'My Business',
  twilio_phone_number TEXT,
  services TEXT[] DEFAULT '{}',
  available_slots JSONB DEFAULT '["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"]',
  ai_system_prompt TEXT,
  follow_up_enabled BOOLEAN DEFAULT true,
  follow_up_interval_hours INTEGER DEFAULT 4,
  max_follow_ups INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role access for edge functions, authenticated read for dashboard)
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Service role can manage leads" ON public.leads FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can view messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage messages" ON public.messages FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can manage settings" ON public.business_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Service role can manage settings" ON public.business_settings FOR ALL TO service_role USING (true);

-- Indexes
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_phone ON public.leads(phone_number);
CREATE INDEX idx_leads_next_follow_up ON public.leads(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default business settings
INSERT INTO public.business_settings (business_name, services, available_slots) 
VALUES ('My Business', ARRAY['Plumbing', 'HVAC', 'Electrical', 'Roofing'], '["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"]');
