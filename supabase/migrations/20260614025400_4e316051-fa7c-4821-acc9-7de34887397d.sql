CREATE TABLE public.medical_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.medical_incidents(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX medical_attachments_incident_idx ON public.medical_attachments(incident_id);
CREATE INDEX medical_attachments_tenant_idx ON public.medical_attachments(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_attachments TO authenticated;
GRANT ALL ON public.medical_attachments TO service_role;

ALTER TABLE public.medical_attachments ENABLE ROW LEVEL SECURITY;

-- HR / org admin / super admin in same tenant can read attachments.
-- For non-confidential incidents, the owning employee can also see them.
CREATE POLICY "medical_attachments_read"
  ON public.medical_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_incidents mi
      WHERE mi.id = medical_attachments.incident_id
        AND mi.tenant_id = medical_attachments.tenant_id
        AND (
          public.is_org_admin(auth.uid(), mi.tenant_id)
          OR public.is_hr(auth.uid(), mi.tenant_id)
          OR (
            NOT mi.confidential
            AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = mi.employee_id AND e.user_id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "medical_attachments_insert"
  ON public.medical_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.medical_incidents mi
      WHERE mi.id = medical_attachments.incident_id
        AND mi.tenant_id = medical_attachments.tenant_id
        AND (public.is_org_admin(auth.uid(), mi.tenant_id) OR public.is_hr(auth.uid(), mi.tenant_id))
    )
  );

CREATE POLICY "medical_attachments_delete"
  ON public.medical_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_incidents mi
      WHERE mi.id = medical_attachments.incident_id
        AND (public.is_org_admin(auth.uid(), mi.tenant_id) OR public.is_hr(auth.uid(), mi.tenant_id))
    )
  );