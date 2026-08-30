-- W3.3 remainder: no tenant-level "remote work allowed" switch existed, so a
-- tenant that never intends to permit remote work still shows every employee
-- the /me/wfh request route. Defaults to true — every tenant that already
-- uses WFH keeps working exactly as before; this is opt-out, not opt-in.
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS wfh_enabled boolean NOT NULL DEFAULT true;
