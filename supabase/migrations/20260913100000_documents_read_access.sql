-- =============================================================================
-- Documents: make the six roles the product offers actually able to read
-- =============================================================================
--
-- `/org/documents` and `/org/documents/templates` are offered by nav and by
-- route to super_admin, org_admin, branch_admin, hr, finance and manager. The
-- server guard admitted org_admin + super_admin only (fixed in
-- `src/lib/documents-guard.ts`), and underneath it the RLS admitted a third,
-- different set. This closes the database half.
--
-- Two gaps, both of which rendered as an empty table rather than as an error:
--
-- 1. **`branch_admin` had no policy at all** on `document_templates` or
--    `document_envelopes`, on either side of the read/write line. It was
--    offered both pages and the database would never have filled them.
--
-- 2. **`document_signers` and `document_events` stopped at org_admin.** finance
--    and manager could already read an envelope row but neither its signers nor
--    its history, and `hr` — which has managed signers since 20260613140425 —
--    still had no policy on events at all. So `/org/documents/envelope/$id`
--    would have drawn a document with no signatories and a blank audit trail:
--    worse than a refusal, because it looks like a finished answer.
--
-- Read visibility is encoded ONCE, in `can_read_document_envelope`, so the
-- manager's direct-report predicate and the branch admin's branch predicate are
-- not restated in three places and free to drift. Writes are untouched: every
-- role added here gets SELECT only.
--
-- `auth.uid()` is wrapped in a scalar subquery throughout, per
-- 20260908090000 — unwrapped it is re-evaluated per row, and these policies sit
-- under list queries.
--
-- Mirrored server-side by `src/lib/documents-guard.ts`; pinned by
-- `tests/documents-access.test.ts`.

-- -----------------------------------------------------------------------------
-- Who may read a given envelope
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_read_document_envelope(_user_id uuid, _envelope_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.document_envelopes env
    WHERE env.id = _envelope_id
      AND (
        -- super_admin: cross-tenant by construction, as everywhere else
        public.has_role(_user_id, 'super_admin'::app_role)
        -- org_admin / hr / finance: the whole tenant
        OR (
          env.tenant_id = public.user_tenant_id(_user_id)
          AND (
            public.has_role(_user_id, 'org_admin'::app_role)
            OR public.has_role(_user_id, 'hr'::app_role)
            OR public.has_role(_user_id, 'finance'::app_role)
          )
        )
        -- manager: their own direct reports, matching env_manager_read
        -- (20260607132133)
        OR (
          env.tenant_id = public.user_tenant_id(_user_id)
          AND public.has_role(_user_id, 'manager'::app_role)
          AND EXISTS (
            SELECT 1
            FROM public.employees e
            JOIN public.employees m ON e.manager_id = m.id
            WHERE e.id = env.employee_id
              AND m.user_id = _user_id
          )
        )
        -- branch_admin: employees in the branches they have access to, matching
        -- "branch admin manages branch employee_documents" (20260613140101)
        OR (
          env.tenant_id = public.user_tenant_id(_user_id)
          AND public.has_role(_user_id, 'branch_admin'::app_role)
          AND EXISTS (
            SELECT 1
            FROM public.employees e
            WHERE e.id = env.employee_id
              AND public.has_branch_access(_user_id, e.branch_id)
          )
        )
        -- the employee the document is about
        OR EXISTS (
          SELECT 1 FROM public.employees e
          WHERE e.id = env.employee_id AND e.user_id = _user_id
        )
      )
  )
  -- a named signatory, whoever they are
  OR EXISTS (
    SELECT 1 FROM public.document_signers s
    WHERE s.envelope_id = _envelope_id AND s.signer_user_id = _user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_read_document_envelope(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_read_document_envelope(uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- branch_admin: the two top-level tables it was missing entirely
-- -----------------------------------------------------------------------------

-- Published templates only, matching tpl_manager_read. A draft is the author's
-- working copy; a branch admin has no business reading one and no way to edit it.
DROP POLICY IF EXISTS "tpl_branch_admin_read" ON public.document_templates;
CREATE POLICY "tpl_branch_admin_read" ON public.document_templates
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin((SELECT auth.uid()), tenant_id)
    AND status = 'published'
  );

DROP POLICY IF EXISTS "env_branch_admin_read" ON public.document_envelopes;
CREATE POLICY "env_branch_admin_read" ON public.document_envelopes
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin((SELECT auth.uid()), tenant_id)
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = document_envelopes.employee_id
        AND public.has_branch_access((SELECT auth.uid()), e.branch_id)
    )
  );

-- -----------------------------------------------------------------------------
-- The detail surface: signers and events follow the envelope
-- -----------------------------------------------------------------------------
-- These are additive. The existing org_admin / super_admin / hr / signer-self
-- policies stay exactly as they are; policies are OR'd, so this only widens.

DROP POLICY IF EXISTS "sgn_envelope_reader_read" ON public.document_signers;
CREATE POLICY "sgn_envelope_reader_read" ON public.document_signers
  FOR SELECT TO authenticated
  USING (public.can_read_document_envelope((SELECT auth.uid()), envelope_id));

DROP POLICY IF EXISTS "evt_envelope_reader_read" ON public.document_events;
CREATE POLICY "evt_envelope_reader_read" ON public.document_events
  FOR SELECT TO authenticated
  USING (public.can_read_document_envelope((SELECT auth.uid()), envelope_id));
