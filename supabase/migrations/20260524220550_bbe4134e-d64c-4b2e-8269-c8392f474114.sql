
CREATE TABLE public.sms_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  phone_number text NOT NULL,
  opted_out_at timestamptz NOT NULL DEFAULT now(),
  source_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, phone_number)
);

CREATE INDEX idx_sms_opt_outs_lookup ON public.sms_opt_outs (owner_user_id, phone_number);

ALTER TABLE public.sms_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own opt-outs"
  ON public.sms_opt_outs FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Admins view all opt-outs"
  ON public.sms_opt_outs FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "No client inserts on sms_opt_outs"
  ON public.sms_opt_outs AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client updates on sms_opt_outs"
  ON public.sms_opt_outs AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on sms_opt_outs"
  ON public.sms_opt_outs AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);
