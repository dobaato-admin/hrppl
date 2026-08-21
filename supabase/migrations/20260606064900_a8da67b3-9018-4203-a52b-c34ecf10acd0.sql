ALTER TABLE public.training_courses
  ADD COLUMN IF NOT EXISTS questions_per_attempt integer,
  ADD COLUMN IF NOT EXISTS shuffle_questions boolean NOT NULL DEFAULT false;