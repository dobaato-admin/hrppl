
CREATE TABLE public.blog_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  route text NOT NULL,
  method text,
  reason text NOT NULL,
  api_key_id uuid,
  ip text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_access_audit TO authenticated;
GRANT ALL ON public.blog_access_audit TO service_role;

ALTER TABLE public.blog_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_access_audit super admin select"
ON public.blog_access_audit FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_blog_access_audit_created_at ON public.blog_access_audit (created_at DESC);
CREATE INDEX idx_blog_access_audit_user_id ON public.blog_access_audit (user_id);
