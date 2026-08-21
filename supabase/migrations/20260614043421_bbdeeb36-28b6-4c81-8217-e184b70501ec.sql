
CREATE OR REPLACE VIEW public.disciplinary_timeline
WITH (security_invoker = true)
AS
SELECT
  c.id                                  AS case_id,
  c.tenant_id                           AS tenant_id,
  c.id                                  AS entry_id,
  'case_opened'::text                   AS entry_kind,
  c.created_at                          AS occurred_at,
  c.opened_by                           AS actor_id,
  NULL::text                            AS actor_role,
  c.category                            AS label,
  c.description                         AS notes,
  jsonb_build_object(
    'severity', c.severity,
    'status', c.status,
    'confidential', c.confidential
  )                                     AS metadata
FROM public.disciplinary_cases c

UNION ALL

SELECT
  a.case_id,
  a.tenant_id,
  a.id                                  AS entry_id,
  'action'::text                        AS entry_kind,
  COALESCE(a.action_date::timestamptz, a.created_at) AS occurred_at,
  a.performed_by                        AS actor_id,
  NULL::text                            AS actor_role,
  a.action_type                         AS label,
  a.notes,
  jsonb_build_object('document_url', a.document_url) AS metadata
FROM public.disciplinary_actions a

UNION ALL

SELECT
  ap.case_id,
  ap.tenant_id,
  ap.id                                 AS entry_id,
  CASE WHEN ap.decided_at IS NULL
       THEN 'approval_requested'
       ELSE 'approval_decided'
  END                                   AS entry_kind,
  COALESCE(ap.decided_at, ap.requested_at) AS occurred_at,
  COALESCE(ap.approver_id, ap.requested_by) AS actor_id,
  ap.approver_role                      AS actor_role,
  COALESCE(ap.decision, 'pending')      AS label,
  ap.notes,
  jsonb_build_object(
    'requested_by', ap.requested_by,
    'approver_id', ap.approver_id,
    'decision', ap.decision
  )                                     AS metadata
FROM public.disciplinary_approvals ap

UNION ALL

SELECT
  c.id                                  AS case_id,
  c.tenant_id                           AS tenant_id,
  c.id                                  AS entry_id,
  'case_closed'::text                   AS entry_kind,
  c.closed_at                           AS occurred_at,
  c.closed_by                           AS actor_id,
  NULL::text                            AS actor_role,
  COALESCE(c.outcome, c.status)         AS label,
  NULL::text                            AS notes,
  jsonb_build_object('outcome', c.outcome, 'status', c.status) AS metadata
FROM public.disciplinary_cases c
WHERE c.closed_at IS NOT NULL;

GRANT SELECT ON public.disciplinary_timeline TO authenticated;
GRANT SELECT ON public.disciplinary_timeline TO service_role;
