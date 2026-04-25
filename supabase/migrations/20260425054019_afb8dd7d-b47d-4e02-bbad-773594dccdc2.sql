-- Replace the permissive realtime policy with a topic-scoped one.
-- Frontend must subscribe to channels named exactly 'user:<auth.uid()>'.
DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;

CREATE POLICY "Users join only their own channel"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    realtime.topic() = 'user:' || auth.uid()::text
  );