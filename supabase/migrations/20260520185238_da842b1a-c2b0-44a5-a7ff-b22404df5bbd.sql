
-- Restrictive write policies on admin_activity
CREATE POLICY "No client inserts on admin_activity" ON public.admin_activity
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No client updates on admin_activity" ON public.admin_activity
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on admin_activity" ON public.admin_activity
  AS RESTRICTIVE FOR DELETE TO authenticated USING (false);

-- Restrictive write policies on signup_notifications
CREATE POLICY "No client inserts on signup_notifications" ON public.signup_notifications
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No client updates on signup_notifications" ON public.signup_notifications
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on signup_notifications" ON public.signup_notifications
  AS RESTRICTIVE FOR DELETE TO authenticated USING (false);

-- Remove topic-based realtime policy on messages; owner-scoped policy is enough
DROP POLICY IF EXISTS "Users join only their own channel" ON public.messages;

-- Restrict SECURITY DEFINER functions not meant to be called directly by clients
REVOKE EXECUTE ON FUNCTION public.log_signup_activity() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_business_update_activity() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_lead_activity() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_notification() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_owner_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_business_id() FROM anon;
