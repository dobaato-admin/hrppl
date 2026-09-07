-- Wave 6 — the LMS content layer.
--
-- Training today is upload-a-certificate: `external_url` is the only content
-- field on a course, so every course sends the learner somewhere else to
-- actually learn, and an enrollment jumps straight from `assigned` to
-- `completed` when the quiz passes. This adds lessons, ordering, per-lesson
-- progress, and the quiz gate that depends on them.
--
-- Deliberately small: two tables and three columns. Everything else the wave
-- needs already exists.
--
-- Existing courses are untouched: `content_mode` defaults to 'external', which
-- is precisely how every one of them behaves today.

-- ---------------------------------------------------------------------------
-- Courses gain a content mode
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.training_content_type AS ENUM
    ('rich_text','video','document','external_link');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.training_courses
  ADD COLUMN IF NOT EXISTS content_mode text NOT NULL DEFAULT 'external',
  -- Whether every `is_required` lesson must be finished before the quiz opens.
  -- Only consulted when content_mode = 'lessons'.
  ADD COLUMN IF NOT EXISTS require_lessons_before_quiz boolean NOT NULL DEFAULT true;

DO $$ BEGIN
  ALTER TABLE public.training_courses
    ADD CONSTRAINT training_courses_content_mode_chk
    CHECK (content_mode IN ('external','lessons'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Lessons
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.training_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  content_type public.training_content_type NOT NULL DEFAULT 'rich_text',
  -- `body` holds the markdown for rich_text and the optional caption/summary
  -- for the other three. It is rendered through renderMarkdown, which escapes
  -- before converting — see src/lib/doc-html-sanitize.ts.
  body text,
  -- For video/document: a storage path inside the `training-content` bucket,
  -- read back through a signed URL. For external_link: the URL itself.
  content_url text,
  duration_minutes integer,
  is_required boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_lessons_course
  ON public.training_lessons(course_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_lessons TO authenticated;
GRANT ALL ON public.training_lessons TO service_role;
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_training_lessons_updated ON public.training_lessons;
CREATE TRIGGER trg_training_lessons_updated BEFORE UPDATE ON public.training_lessons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Read: anyone in the tenant who administers training, plus the learners
-- actually enrolled. Deliberately NOT "everyone in the tenant" — a lesson body
-- can carry policy text an org has reason to scope.
DROP POLICY IF EXISTS "training_lessons read" ON public.training_lessons;
CREATE POLICY "training_lessons read" ON public.training_lessons
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), tenant_id)
      OR public.is_branch_admin(auth.uid(), tenant_id)
      OR EXISTS (
        SELECT 1
        FROM public.training_enrollments en
        JOIN public.employees e ON e.id = en.employee_id
        WHERE en.course_id = training_lessons.course_id
          AND e.user_id = auth.uid()
      )
    )
  );

-- Write: the same set that may author a course. branch_admin is read-only
-- here exactly as it is on training_courses.
DROP POLICY IF EXISTS "training_lessons authors write" ON public.training_lessons;
CREATE POLICY "training_lessons authors write" ON public.training_lessons
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Per-learner, per-lesson progress
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.training_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.training_lessons(id) ON DELETE CASCADE,
  -- Denormalised so the roster can aggregate per course without joining
  -- through lessons, and so a progress row survives being re-pointed.
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_tlp_course_employee
  ON public.training_lesson_progress(course_id, employee_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_lesson_progress TO authenticated;
GRANT ALL ON public.training_lesson_progress TO service_role;
ALTER TABLE public.training_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_tlp_updated ON public.training_lesson_progress;
CREATE TRIGGER trg_tlp_updated BEFORE UPDATE ON public.training_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- A learner reads and writes only their own row. Staff read the roster;
-- branch_admin only within their branches, matching training_enrollments.
DROP POLICY IF EXISTS "training_lesson_progress read" ON public.training_lesson_progress;
CREATE POLICY "training_lesson_progress read" ON public.training_lesson_progress
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      EXISTS (SELECT 1 FROM public.employees e
              WHERE e.id = training_lesson_progress.employee_id AND e.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), tenant_id)
      OR (
        public.is_branch_admin(auth.uid(), tenant_id)
        AND EXISTS (SELECT 1 FROM public.employees e
                    WHERE e.id = training_lesson_progress.employee_id
                      AND public.has_branch_access(auth.uid(), e.branch_id))
      )
    )
  );

-- Only the learner records their own progress. Staff marking a lesson complete
-- on someone's behalf would make "completed" mean nothing, and completion is
-- an input to compliance reporting.
DROP POLICY IF EXISTS "training_lesson_progress own write" ON public.training_lesson_progress;
CREATE POLICY "training_lesson_progress own write" ON public.training_lesson_progress
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.employees e
                WHERE e.id = training_lesson_progress.employee_id AND e.user_id = auth.uid())
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.employees e
                WHERE e.id = training_lesson_progress.employee_id AND e.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Storage for lesson media
-- ---------------------------------------------------------------------------
--
-- Private, like every other bucket here: reads reach the client through a
-- signed URL. The mime allow-list is the content-security boundary — no
-- text/html, no application/zip, nothing that executes in a browser tab. That
-- is also why SCORM is deferred: it is a JavaScript runtime, not a file type.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('training-content', 'training-content', false, 209715200,
  ARRAY['video/mp4','video/webm','video/quicktime',
        'application/pdf',
        'image/jpeg','image/png','image/webp','image/gif',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Objects are laid out as <tenant_id>/<course_id>/<filename>, so the first
-- path segment is the tenant check.
DROP POLICY IF EXISTS "training_content authors write" ON storage.objects;
CREATE POLICY "training_content authors write" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), public.user_tenant_id(auth.uid()))
    )
  )
  WITH CHECK (
    bucket_id = 'training-content'
    AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), public.user_tenant_id(auth.uid()))
    )
  );

-- Learners never read the object directly; the server mints a signed URL with
-- the service-role client after checking enrollment. No SELECT policy for
-- them is deliberate.
