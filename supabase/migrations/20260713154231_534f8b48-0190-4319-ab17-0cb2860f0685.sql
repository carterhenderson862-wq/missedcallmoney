-- Security fix: stop granting admin role via hardcoded email in migrations.
-- The previous migration (20260425065508_...) inserted an admin role by matching
-- auth.users.email = 'carterhenderson862@gmail.com'. That grant has already been
-- applied and the resulting row in public.user_roles is the source of truth.
--
-- This migration:
--   1. Does NOT re-insert any hardcoded email-based admin grant.
--   2. Preserves existing admin rows in public.user_roles (data, not code).
--   3. Serves as a marker that future admin assignments must be done directly
--      in the database (e.g., SQL editor), never baked into migration files.
--
-- No-op DO block for record-keeping.
DO $$
BEGIN
  RAISE NOTICE 'Admin roles are managed as data in public.user_roles. No hardcoded email grants.';
END $$;
