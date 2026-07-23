
CREATE TABLE public.device_inventories (
  device_id TEXT PRIMARY KEY,
  inventory JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_inventories TO anon, authenticated;
GRANT ALL ON public.device_inventories TO service_role;
ALTER TABLE public.device_inventories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read inventories" ON public.device_inventories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inventories" ON public.device_inventories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inventories" ON public.device_inventories FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE public.device_progress (
  device_id TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  checked JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, incident_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_progress TO anon, authenticated;
GRANT ALL ON public.device_progress TO service_role;
ALTER TABLE public.device_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read progress" ON public.device_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can insert progress" ON public.device_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update progress" ON public.device_progress FOR UPDATE USING (true) WITH CHECK (true);
