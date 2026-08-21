
-- 360 feedback requests
CREATE TABLE public.review_feedback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  review_id uuid NOT NULL,
  subject_employee_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  requested_user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'peer' CHECK (kind IN ('peer','upward')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','declined')),
  message text,
  responded_at timestamptz,
  feedback_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, requested_user_id, kind)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_feedback_requests TO authenticated;
GRANT ALL ON public.review_feedback_requests TO service_role;
ALTER TABLE public.review_feedback_requests ENABLE ROW LEVEL SECURITY;

-- Requester (subject's manager / org admin / the subject themselves) creates
CREATE POLICY "requester inserts" ON public.review_feedback_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND tenant_id = public.user_tenant_id(auth.uid())
  );

-- Requested user reads own requests
CREATE POLICY "requested user reads own" ON public.review_feedback_requests
  FOR SELECT TO authenticated
  USING (requested_user_id = auth.uid());

-- Requested user updates (respond/decline) own pending
CREATE POLICY "requested user updates own" ON public.review_feedback_requests
  FOR UPDATE TO authenticated
  USING (requested_user_id = auth.uid())
  WITH CHECK (requested_user_id = auth.uid());

-- Subject (the employee being reviewed) reads requests for their review
CREATE POLICY "subject reads requests" ON public.review_feedback_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = subject_employee_id AND e.user_id = auth.uid()
  ));

-- Requester reads their own
CREATE POLICY "requester reads own" ON public.review_feedback_requests
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid());

-- Manager reads tenant
CREATE POLICY "manager reads tenant requests" ON public.review_feedback_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

-- Org admin manages tenant
CREATE POLICY "org admin manages requests" ON public.review_feedback_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all requests" ON public.review_feedback_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER touch_review_feedback_requests_updated_at
  BEFORE UPDATE ON public.review_feedback_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Tighten subject visibility on review_feedback: only after review is finalized
DROP POLICY IF EXISTS "subject reads feedback" ON public.review_feedback;
CREATE POLICY "subject reads finalized feedback" ON public.review_feedback
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.performance_reviews r
    JOIN public.employees e ON r.employee_id = e.id
    WHERE r.id = review_feedback.review_id
      AND e.user_id = auth.uid()
      AND r.status = 'finalized'
  ));
