-- A8: Standardize "location" — add nullable branch_id FK to tables that carry location data.
-- Existing free-text `location` columns are kept untouched (no breakage). Future UI can prefer
-- branch_id and fall back to the text label.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_label text;
CREATE INDEX IF NOT EXISTS idx_assets_branch_id ON public.assets(branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_label text;
CREATE INDEX IF NOT EXISTS idx_time_entries_branch_id ON public.time_entries(branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.biometric_devices
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_biometric_devices_branch_id ON public.biometric_devices(branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.medical_incidents
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_medical_incidents_branch_id ON public.medical_incidents(branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.recruitment_interviews
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_recruitment_interviews_branch_id ON public.recruitment_interviews(branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.recruitment_jobs
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_recruitment_jobs_branch_id ON public.recruitment_jobs(branch_id) WHERE branch_id IS NOT NULL;

COMMENT ON COLUMN public.assets.branch_id IS 'A8: standardized location FK. Prefer over free-text fallback.';
COMMENT ON COLUMN public.time_entries.branch_id IS 'A8: standardized location FK. location_label is for off-site work.';