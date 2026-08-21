
-- ====== ENUMS ======
DO $$ BEGIN
  CREATE TYPE public.blog_post_status AS ENUM ('draft','scheduled','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====== CATEGORIES ======
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_categories public read" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "blog_categories admin manage" ON public.blog_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'));

-- ====== POSTS ======
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL DEFAULT '',
  content_html TEXT,
  cover_image_url TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID,
  author_name TEXT,
  status public.blog_post_status NOT NULL DEFAULT 'draft',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  reading_minutes INT,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  external_source TEXT,
  external_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_scheduled_idx ON public.blog_posts(scheduled_for) WHERE status = 'scheduled';
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts public read published" ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= now());
CREATE POLICY "blog_posts admin read all" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'));
CREATE POLICY "blog_posts admin manage" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'));

-- ====== API KEYS ======
CREATE TABLE IF NOT EXISTS public.blog_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['posts:read','posts:write']::TEXT[],
  created_by UUID,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_api_keys TO authenticated;
GRANT ALL ON public.blog_api_keys TO service_role;
ALTER TABLE public.blog_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_api_keys super_admin only" ON public.blog_api_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ====== WEBHOOKS ======
CREATE TABLE IF NOT EXISTS public.blog_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['post.published','post.updated','post.deleted']::TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_webhooks TO authenticated;
GRANT ALL ON public.blog_webhooks TO service_role;
ALTER TABLE public.blog_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_webhooks super_admin only" ON public.blog_webhooks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE IF NOT EXISTS public.blog_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.blog_webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  response_status INT,
  response_body TEXT,
  last_attempted_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_webhook_deliveries_pending_idx
  ON public.blog_webhook_deliveries(status, next_retry_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_webhook_deliveries TO authenticated;
GRANT ALL ON public.blog_webhook_deliveries TO service_role;
ALTER TABLE public.blog_webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_webhook_deliveries super_admin read" ON public.blog_webhook_deliveries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

-- ====== updated_at trigger ======
CREATE OR REPLACE FUNCTION public.blog_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_blog_posts_updated ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_set_updated_at();
DROP TRIGGER IF EXISTS trg_blog_categories_updated ON public.blog_categories;
CREATE TRIGGER trg_blog_categories_updated BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.blog_set_updated_at();
DROP TRIGGER IF EXISTS trg_blog_webhooks_updated ON public.blog_webhooks;
CREATE TRIGGER trg_blog_webhooks_updated BEFORE UPDATE ON public.blog_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.blog_set_updated_at();

-- ====== Auto-publish scheduled posts ======
CREATE OR REPLACE FUNCTION public.blog_publish_due_posts() RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  UPDATE public.blog_posts
  SET status = 'published', published_at = COALESCE(published_at, now())
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

DO $$ BEGIN
  PERFORM cron.unschedule('blog-publish-scheduled');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('blog-publish-scheduled','*/5 * * * *',$$SELECT public.blog_publish_due_posts();$$);

-- ====== Seed a default category ======
INSERT INTO public.blog_categories (slug, name, description)
VALUES
  ('product','Product','Product updates and announcements'),
  ('payroll','Payroll','Global payroll insights & compliance'),
  ('hr','HR','HR strategy, people ops and culture'),
  ('engineering','Engineering','Behind the build at hrppl')
ON CONFLICT (slug) DO NOTHING;
