
-- 1. Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 3. RLS for user_roles: only admins can see/modify
CREATE POLICY "Admins view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Admin read policies for existing tables
CREATE POLICY "Admins view all business settings"
ON public.business_settings FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins view all leads"
ON public.leads FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins view all messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_admin());

-- 5. Admin user directory view (exposes auth.users data safely)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  business_name text,
  twilio_phone_number text,
  service_area text,
  services text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    b.business_name,
    b.twilio_phone_number,
    b.service_area,
    b.services
  FROM auth.users u
  LEFT JOIN public.business_settings b ON b.owner_user_id = u.id
  WHERE public.is_admin()
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 6. Signup notifications queue
CREATE TABLE public.signup_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  business_name text,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.signup_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view signup notifications"
ON public.signup_notifications FOR SELECT TO authenticated
USING (public.is_admin());

-- 7. Trigger: log signup notification on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.signup_notifications (user_id, email, business_name)
  VALUES (NEW.id, NEW.email, 'My Business');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_notify ON auth.users;
CREATE TRIGGER on_auth_user_created_notify
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification();

-- 8. Activity feed (signups, settings updates, lead events)
CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_user_id uuid,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view activity"
ON public.admin_activity FOR SELECT TO authenticated
USING (public.is_admin());

CREATE INDEX idx_admin_activity_created ON public.admin_activity(created_at DESC);

-- 9. Activity triggers
CREATE OR REPLACE FUNCTION public.log_signup_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_activity (event_type, actor_user_id, description, metadata)
  VALUES ('new_signup', NEW.id, 'New signup: ' || NEW.email, jsonb_build_object('email', NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_activity ON auth.users;
CREATE TRIGGER on_auth_user_created_activity
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.log_signup_activity();

CREATE OR REPLACE FUNCTION public.log_business_update_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_activity (event_type, actor_user_id, description, metadata)
  VALUES ('settings_updated', NEW.owner_user_id, 'Settings updated: ' || NEW.business_name, jsonb_build_object('business_name', NEW.business_name));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_business_settings_update ON public.business_settings;
CREATE TRIGGER on_business_settings_update
  AFTER UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.log_business_update_activity();

CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_activity (event_type, actor_user_id, description, metadata)
    VALUES ('new_lead', NEW.owner_user_id, 'New lead from ' || COALESCE(NEW.phone_number, 'unknown'), jsonb_build_object('lead_id', NEW.id));
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'booked' THEN
    INSERT INTO public.admin_activity (event_type, actor_user_id, description, metadata)
    VALUES ('booked_lead', NEW.owner_user_id, 'Lead booked: ' || COALESCE(NEW.customer_name, NEW.phone_number), jsonb_build_object('lead_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lead_insert ON public.leads;
CREATE TRIGGER on_lead_insert AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();
DROP TRIGGER IF EXISTS on_lead_update ON public.leads;
CREATE TRIGGER on_lead_update AFTER UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();

-- 10. Seed admin role for the designated email if user exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'carterhenderson862@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
