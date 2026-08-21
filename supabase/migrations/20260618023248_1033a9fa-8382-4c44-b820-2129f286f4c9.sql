ALTER TABLE public.review_templates
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'competency';

ALTER TABLE public.feedback_question_templates
  ADD COLUMN IF NOT EXISTS industry text;

CREATE INDEX IF NOT EXISTS idx_review_templates_industry ON public.review_templates(industry);
CREATE INDEX IF NOT EXISTS idx_review_templates_kind ON public.review_templates(kind);
CREATE INDEX IF NOT EXISTS idx_feedback_templates_industry ON public.feedback_question_templates(industry);