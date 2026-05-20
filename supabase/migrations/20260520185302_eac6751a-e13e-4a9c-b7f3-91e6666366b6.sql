
REVOKE EXECUTE ON FUNCTION public.log_signup_activity() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_business_update_activity() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_lead_activity() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_notification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_owner_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_business_id() FROM PUBLIC;
-- admin_list_users still needs to be callable by authenticated admins
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
