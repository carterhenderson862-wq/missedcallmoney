ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS avg_job_value numeric NOT NULL DEFAULT 350,
  ADD COLUMN IF NOT EXISTS business_hours jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS human_taken_over boolean NOT NULL DEFAULT false;