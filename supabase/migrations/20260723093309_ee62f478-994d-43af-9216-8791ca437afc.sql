
DROP POLICY IF EXISTS "Anyone can read inventories" ON public.device_inventories;
DROP POLICY IF EXISTS "Anyone can insert inventories" ON public.device_inventories;
DROP POLICY IF EXISTS "Anyone can update inventories" ON public.device_inventories;

DROP POLICY IF EXISTS "Anyone can read progress" ON public.device_progress;
DROP POLICY IF EXISTS "Anyone can insert progress" ON public.device_progress;
DROP POLICY IF EXISTS "Anyone can update progress" ON public.device_progress;

DROP POLICY IF EXISTS "Anyone can read plans" ON public.device_plans;
DROP POLICY IF EXISTS "Anyone can insert plans" ON public.device_plans;
DROP POLICY IF EXISTS "Anyone can update plans" ON public.device_plans;

REVOKE ALL ON public.device_inventories FROM anon, authenticated;
REVOKE ALL ON public.device_progress FROM anon, authenticated;
REVOKE ALL ON public.device_plans FROM anon, authenticated;

GRANT ALL ON public.device_inventories TO service_role;
GRANT ALL ON public.device_progress TO service_role;
GRANT ALL ON public.device_plans TO service_role;
