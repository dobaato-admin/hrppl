ALTER TABLE public.security_findings_log
  ADD COLUMN IF NOT EXISTS ticket_url text,
  ADD COLUMN IF NOT EXISTS fixed_in_commit text;

COMMENT ON COLUMN public.security_findings_log.ticket_url IS 'Optional link to issue tracker ticket (Jira, GitHub Issue, Linear, etc.)';
COMMENT ON COLUMN public.security_findings_log.fixed_in_commit IS 'Optional commit SHA / PR URL where the finding was fixed';