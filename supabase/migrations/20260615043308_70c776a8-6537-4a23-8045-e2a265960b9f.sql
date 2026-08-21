
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  role_audience TEXT[] NOT NULL DEFAULT ARRAY['all']::text[],
  body_md TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  sort_order INT NOT NULL DEFAULT 100,
  published BOOLEAN NOT NULL DEFAULT true,
  view_count INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_articles TO authenticated;
GRANT ALL ON public.knowledge_articles TO service_role;

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read published articles"
  ON public.knowledge_articles FOR SELECT TO authenticated
  USING (published = true OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins insert articles"
  ON public.knowledge_articles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins update articles"
  ON public.knowledge_articles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete articles"
  ON public.knowledge_articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS knowledge_articles_category_idx ON public.knowledge_articles(category);

CREATE TRIGGER knowledge_articles_touch_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.knowledge_article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.knowledge_article_views TO authenticated;
GRANT ALL ON public.knowledge_article_views TO service_role;

ALTER TABLE public.knowledge_article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own views"
  ON public.knowledge_article_views FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users record their own views"
  ON public.knowledge_article_views FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS knowledge_article_views_user_idx ON public.knowledge_article_views(user_id, viewed_at DESC);
