
-- Versioning columns
DO $$ BEGIN
  CREATE TYPE public.payslip_template_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.payslip_templates
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_template_id uuid REFERENCES public.payslip_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status public.payslip_template_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS effective_from date,
  ADD COLUMN IF NOT EXISTS effective_to date,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid;

CREATE INDEX IF NOT EXISTS idx_payslip_templates_country_status_effective
  ON public.payslip_templates(country_code, status, effective_from);

-- Clone a template (copies line items) into a new draft
CREATE OR REPLACE FUNCTION public.clone_payslip_template(_template_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  src public.payslip_templates%ROWTYPE;
  new_id uuid;
  next_version int;
BEGIN
  IF NOT (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'regional_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO src FROM public.payslip_templates WHERE id = _template_id;
  IF src.id IS NULL THEN RAISE EXCEPTION 'Template not found'; END IF;

  IF has_role(auth.uid(),'regional_admin') AND NOT has_country_scope(auth.uid(), src.country_code) THEN
    RAISE EXCEPTION 'Not authorized for this country';
  END IF;

  SELECT COALESCE(MAX(version),0)+1 INTO next_version
  FROM public.payslip_templates
  WHERE country_code = src.country_code
    AND COALESCE(parent_template_id, id) = COALESCE(src.parent_template_id, src.id);

  INSERT INTO public.payslip_templates (
    country_code, currency_code, name, locale, date_format, number_format,
    currency_position, header_html, footer_html, show_employer_contributions,
    show_ytd, is_default, is_active, created_by, version, parent_template_id, status
  ) VALUES (
    src.country_code, src.currency_code, src.name || ' v' || next_version,
    src.locale, src.date_format, src.number_format, src.currency_position,
    src.header_html, src.footer_html, src.show_employer_contributions,
    src.show_ytd, false, true, auth.uid(), next_version,
    COALESCE(src.parent_template_id, src.id), 'draft'
  ) RETURNING id INTO new_id;

  INSERT INTO public.payslip_line_items (
    template_id, sort_order, code, label, category, calc_type, formula, rate, is_taxable, is_visible
  )
  SELECT new_id, sort_order, code, label, category, calc_type, formula, rate, is_taxable, is_visible
  FROM public.payslip_line_items WHERE template_id = _template_id;

  RETURN new_id;
END $$;

GRANT EXECUTE ON FUNCTION public.clone_payslip_template(uuid) TO authenticated;

-- Publish a draft template on a given effective date; close prior active version.
CREATE OR REPLACE FUNCTION public.publish_payslip_template(_template_id uuid, _effective_from date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tpl public.payslip_templates%ROWTYPE;
  family_root uuid;
BEGIN
  IF NOT (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'regional_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO tpl FROM public.payslip_templates WHERE id = _template_id;
  IF tpl.id IS NULL THEN RAISE EXCEPTION 'Template not found'; END IF;

  IF has_role(auth.uid(),'regional_admin') AND NOT has_country_scope(auth.uid(), tpl.country_code) THEN
    RAISE EXCEPTION 'Not authorized for this country';
  END IF;

  IF tpl.status <> 'draft' THEN RAISE EXCEPTION 'Only draft templates can be published'; END IF;

  family_root := COALESCE(tpl.parent_template_id, tpl.id);

  -- Close prior published version(s) for this family
  UPDATE public.payslip_templates
  SET status = 'archived',
      effective_to = _effective_from - INTERVAL '1 day'
  WHERE country_code = tpl.country_code
    AND COALESCE(parent_template_id, id) = family_root
    AND status = 'published'
    AND id <> _template_id;

  UPDATE public.payslip_templates
  SET status = 'published',
      effective_from = _effective_from,
      effective_to = NULL,
      published_at = now(),
      published_by = auth.uid()
  WHERE id = _template_id;
END $$;

GRANT EXECUTE ON FUNCTION public.publish_payslip_template(uuid, date) TO authenticated;

-- Look up active template for a country at a given date
CREATE OR REPLACE FUNCTION public.active_payslip_template(_country_code text, _on_date date)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.payslip_templates
  WHERE country_code = _country_code
    AND status = 'published'
    AND effective_from <= _on_date
    AND (effective_to IS NULL OR effective_to >= _on_date)
  ORDER BY effective_from DESC
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.active_payslip_template(text, date) TO authenticated;
