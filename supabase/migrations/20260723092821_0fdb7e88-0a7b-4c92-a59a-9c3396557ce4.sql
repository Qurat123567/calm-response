
CREATE TABLE public.device_plans (
  device_id TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  plan JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, incident_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_plans TO anon, authenticated;
GRANT ALL ON public.device_plans TO service_role;
ALTER TABLE public.device_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON public.device_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert plans" ON public.device_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update plans" ON public.device_plans FOR UPDATE USING (true) WITH CHECK (true);
