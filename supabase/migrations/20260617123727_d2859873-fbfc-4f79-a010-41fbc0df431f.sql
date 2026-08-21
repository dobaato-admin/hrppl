
ALTER TABLE public.attendance_entries
  ADD COLUMN IF NOT EXISTS clock_in_latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS clock_in_longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS clock_in_geofence_id uuid REFERENCES public.sign_geofences(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clock_in_distance_meters numeric;

CREATE INDEX IF NOT EXISTS knowledge_articles_tags_gin ON public.knowledge_articles USING GIN (tags);
