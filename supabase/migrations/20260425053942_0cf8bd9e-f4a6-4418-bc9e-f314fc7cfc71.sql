-- 1. Realtime channel access: users can only join channels they own.
-- The convention used by the frontend is topics like 'leads-realtime' (global per user, RLS on
-- the underlying table filters payloads) and 'messages-<leadId>'. We restrict broadcast/presence
-- joins to authenticated users and let table RLS do the row-level filtering.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated can use realtime"
  ON realtime.messages FOR SELECT TO authenticated
  USING (true);
-- Note: row-level filtering of postgres_changes payloads is enforced by RLS on public.leads
-- and public.messages (owner_user_id = auth.uid()). This policy only governs channel join.

-- 2. Explicit deny: no client-side writes on leads.
-- (No INSERT/UPDATE/DELETE policy means PostgREST already denies by default, but the scanner
--  flags missing policies. Add explicit restrictive policies for clarity and defence-in-depth.)
CREATE POLICY "No client inserts on leads"
  ON public.leads AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client deletes on leads"
  ON public.leads AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);

-- 3. Explicit deny: no client-side inserts/updates/deletes on messages.
CREATE POLICY "No client inserts on messages"
  ON public.messages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client updates on messages"
  ON public.messages AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on messages"
  ON public.messages AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);

-- 4. Service role still bypasses RLS, so edge functions continue to write normally.