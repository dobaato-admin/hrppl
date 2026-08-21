DROP POLICY IF EXISTS "blog_posts admin manage" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts admin read all" ON public.blog_posts;
CREATE POLICY "blog_posts super_admin manage" ON public.blog_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "blog_posts super_admin read all" ON public.blog_posts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "blog_categories admin manage" ON public.blog_categories;
CREATE POLICY "blog_categories super_admin manage" ON public.blog_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));