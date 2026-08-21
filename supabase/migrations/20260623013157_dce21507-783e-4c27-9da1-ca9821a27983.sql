
ALTER TABLE public.offboarding_comms_removal_audit
  DROP CONSTRAINT IF EXISTS offboarding_comms_removal_audit_case_id_fkey;
ALTER TABLE public.offboarding_comms_removal_audit
  ADD CONSTRAINT offboarding_comms_removal_audit_case_id_fkey
  FOREIGN KEY (case_id) REFERENCES public.offboarding_cases(id) ON DELETE NO ACTION;
ALTER TABLE public.offboarding_comms_removal_audit
  DROP CONSTRAINT IF EXISTS offboarding_comms_removal_audit_tenant_id_fkey;
ALTER TABLE public.offboarding_comms_removal_audit
  ADD CONSTRAINT offboarding_comms_removal_audit_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE NO ACTION;
