-- 1. Wipe existing data (test data only, per user direction)
TRUNCATE public.messages, public.leads, public.business_settings RESTART IDENTITY CASCADE;

-- 2. Add ownership columns
ALTER TABLE public.business_settings
  ADD COLUMN owner_user_id uuid NOT NULL;
ALTER TABLE public.leads
  ADD COLUMN owner_user_id uuid NOT NULL;
ALTER TABLE public.messages
  ADD COLUMN owner_user_id uuid NOT NULL;

-- One business per user
CREATE UNIQUE INDEX business_settings_owner_user_id_key
  ON public.business_settings(owner_user_id);

CREATE INDEX leads_owner_user_id_idx ON public.leads(owner_user_id);
CREATE INDEX messages_owner_user_id_idx ON public.messages(owner_user_id);
CREATE INDEX messages_lead_id_idx ON public.messages(lead_id);

-- Lookup by twilio number for inbound webhook routing
CREATE INDEX business_settings_twilio_phone_idx
  ON public.business_settings(twilio_phone_number)
  WHERE twilio_phone_number IS NOT NULL;

-- 3. Security definer helper: get the calling user's business_id
CREATE OR REPLACE FUNCTION public.current_user_business_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.business_settings WHERE owner_user_id = auth.uid() LIMIT 1;
$$;

-- 4. Drop all permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.business_settings;
DROP POLICY IF EXISTS "Service role can manage settings" ON public.business_settings;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;

-- 5. Owner-scoped policies — business_settings
CREATE POLICY "Owners view own settings"
  ON public.business_settings FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Owners insert own settings"
  ON public.business_settings FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners update own settings"
  ON public.business_settings FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- 6. Owner-scoped policies — leads
CREATE POLICY "Owners view own leads"
  ON public.leads FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Owners update own leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());
-- No INSERT/DELETE for users — leads are created by edge function (service role)

-- 7. Owner-scoped policies — messages
CREATE POLICY "Owners view own messages"
  ON public.messages FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
-- No INSERT/UPDATE/DELETE for users — messages are written by edge function

-- 8. Prevent owner_user_id tampering after insert
CREATE OR REPLACE FUNCTION public.prevent_owner_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id THEN
    RAISE EXCEPTION 'owner_user_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER business_settings_lock_owner
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();

CREATE TRIGGER leads_lock_owner
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();

-- 9. Auto-create a business_settings row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.business_settings (owner_user_id, business_name)
  VALUES (NEW.id, 'My Business')
  ON CONFLICT (owner_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. updated_at triggers (table already has columns, just ensure trigger exists)
DROP TRIGGER IF EXISTS business_settings_updated_at ON public.business_settings;
CREATE TRIGGER business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Realtime: ensure tables are in publication, RLS above will scope subscriptions
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;