
-- ============================================================
-- Onboarding checklist templates
-- ============================================================
CREATE TABLE public.onboarding_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  role_target text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX onb_tpl_tenant_idx ON public.onboarding_checklist_templates(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_checklist_templates TO authenticated;
GRANT ALL ON public.onboarding_checklist_templates TO service_role;
ALTER TABLE public.onboarding_checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onb_tpl tenant admin read" ON public.onboarding_checklist_templates
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "onb_tpl tenant admin write" ON public.onboarding_checklist_templates
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_onb_tpl_updated BEFORE UPDATE ON public.onboarding_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.onboarding_checklist_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.onboarding_checklist_templates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  owner_role text NOT NULL DEFAULT 'employee',
  due_offset_days integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX onb_tpl_items_template_idx ON public.onboarding_checklist_template_items(template_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_checklist_template_items TO authenticated;
GRANT ALL ON public.onboarding_checklist_template_items TO service_role;
ALTER TABLE public.onboarding_checklist_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onb_tpl_items tenant admin read" ON public.onboarding_checklist_template_items
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "onb_tpl_items tenant admin write" ON public.onboarding_checklist_template_items
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_onb_tpl_items_updated BEFORE UPDATE ON public.onboarding_checklist_template_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Attached training courses for an onboarding template
CREATE TABLE public.onboarding_checklist_template_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.onboarding_checklist_templates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  due_offset_days integer NOT NULL DEFAULT 14,
  required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX onb_tpl_courses_template_idx ON public.onboarding_checklist_template_courses(template_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_checklist_template_courses TO authenticated;
GRANT ALL ON public.onboarding_checklist_template_courses TO service_role;
ALTER TABLE public.onboarding_checklist_template_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onb_tpl_courses tenant admin read" ON public.onboarding_checklist_template_courses
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "onb_tpl_courses tenant admin write" ON public.onboarding_checklist_template_courses
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

-- ============================================================
-- Training bundles
-- ============================================================
CREATE TABLE public.training_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  target_role text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX training_bundles_tenant_idx ON public.training_bundles(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_bundles TO authenticated;
GRANT ALL ON public.training_bundles TO service_role;
ALTER TABLE public.training_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_bundles tenant admin read" ON public.training_bundles
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "training_bundles tenant admin write" ON public.training_bundles
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_training_bundles_updated BEFORE UPDATE ON public.training_bundles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.training_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.training_bundles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  due_offset_days integer NOT NULL DEFAULT 14,
  required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX training_bundle_items_bundle_idx ON public.training_bundle_items(bundle_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_bundle_items TO authenticated;
GRANT ALL ON public.training_bundle_items TO service_role;
ALTER TABLE public.training_bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_bundle_items tenant admin read" ON public.training_bundle_items
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "training_bundle_items tenant admin write" ON public.training_bundle_items
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

-- ============================================================
-- Document request bundles
-- ============================================================
CREATE TABLE public.document_request_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doc_req_tpl_tenant_idx ON public.document_request_templates(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_request_templates TO authenticated;
GRANT ALL ON public.document_request_templates TO service_role;
ALTER TABLE public.document_request_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_req_tpl tenant admin read" ON public.document_request_templates
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "doc_req_tpl tenant admin write" ON public.document_request_templates
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_doc_req_tpl_updated BEFORE UPDATE ON public.document_request_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.document_request_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.document_request_templates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_template_id uuid NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  required_signature boolean NOT NULL DEFAULT true,
  due_offset_days integer NOT NULL DEFAULT 7,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doc_req_tpl_items_template_idx ON public.document_request_template_items(template_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_request_template_items TO authenticated;
GRANT ALL ON public.document_request_template_items TO service_role;
ALTER TABLE public.document_request_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_req_tpl_items tenant admin read" ON public.document_request_template_items
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "doc_req_tpl_items tenant admin write" ON public.document_request_template_items
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'super_admin'))
  );
