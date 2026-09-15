-- =============================================================================
-- The three review systems: the keys they were missing
-- =============================================================================
--
-- `docs/remaining-work.md` records three review systems that "share
-- review_templates and never reconcile". Mapping them found that the sharing is
-- not structural at all — six tables carry a `template_id` with **no foreign
-- key on any of them** — and that one of the three is keyed on free text.
--
-- This does not reconcile the three. They assess different things (a person, a
-- competency, a duty) and that may well be correct. It gives them the keys they
-- should have had, so whoever does reconcile them starts from a schema rather
-- than from string matching.
--
-- -----------------------------------------------------------------------------
-- 1. duty_review_scores: key the score to the CYCLE, not to its name
-- -----------------------------------------------------------------------------
--
-- `duty_review_scores.cycle_label` is free text supplied by the caller, while
-- `kpi_review_cycles` has both an `id` and a `label`. Two consequences, both
-- live:
--
--   * `upsertCycle` lets an admin RENAME a cycle. Every score already recorded
--     under the old label then stops resolving to it. The scores still exist and
--     nothing points at them — the shape of data loss that leaves the data in
--     place.
--   * `/admin/duty-reviews` built its default from the clock —
--     `${year}-Q${quarter}` — and its cycle picker used `value={c.label}` while
--     holding `c.id` in the same expression. So a score could be filed against a
--     label no cycle has ever had.
--
-- Two cycles may also share a label, which makes a score ambiguous rather than
-- merely orphaned.
--
-- `cycle_label` is kept and still written, because it is what a CSV export and a
-- historical row should show, and because a cycle can be deleted. It is no
-- longer what anything is keyed on.
--
-- All three tables (duty_review_scores, kpi_review_cycles, employee_duties) are
-- empty in this project, so the backfill below is a no-op here. It is written to
-- be correct anyway: another environment may have rows, and a migration that
-- only works on an empty table is not a migration.

ALTER TABLE public.duty_review_scores
  ADD COLUMN IF NOT EXISTS cycle_id uuid REFERENCES public.kpi_review_cycles(id) ON DELETE CASCADE;

-- Backfill by the label, which is the only link that existed. Ambiguous labels
-- (two cycles, same name, same tenant) are deliberately left NULL rather than
-- resolved arbitrarily — guessing would silently attach somebody's score to the
-- wrong cycle, which is worse than leaving it unattached and visible.
UPDATE public.duty_review_scores s
SET cycle_id = c.id
FROM public.kpi_review_cycles c
WHERE s.cycle_id IS NULL
  AND c.tenant_id = s.tenant_id
  AND c.label = s.cycle_label
  AND (
    SELECT count(*) FROM public.kpi_review_cycles c2
    WHERE c2.tenant_id = s.tenant_id AND c2.label = s.cycle_label
  ) = 1;

CREATE INDEX IF NOT EXISTS duty_review_scores_cycle_idx
  ON public.duty_review_scores (cycle_id);

-- The uniqueness rule moves with the key: one score per employee per duty per
-- CYCLE. Only applied when every row has a cycle_id, so an environment with
-- unresolvable history keeps its old constraint and fails loudly on the next
-- deploy rather than losing the constraint silently.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.duty_review_scores WHERE cycle_id IS NULL) THEN
    ALTER TABLE public.duty_review_scores
      DROP CONSTRAINT IF EXISTS duty_review_scores_employee_id_duty_id_cycle_label_key;
    BEGIN
      ALTER TABLE public.duty_review_scores
        ADD CONSTRAINT duty_review_scores_employee_duty_cycle_key
        UNIQUE (employee_id, duty_id, cycle_id);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN
      NULL;  -- already applied
    END;
    ALTER TABLE public.duty_review_scores ALTER COLUMN cycle_label DROP NOT NULL;
  ELSE
    RAISE NOTICE 'duty_review_scores has rows with no cycle_id; leaving the label constraint in place';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. The template_id columns that were never keys
-- -----------------------------------------------------------------------------
--
-- A PostgREST embed resolves from the foreign-key graph. With no key it answers
-- PGRST200 and the caller's `rows ?? []` draws an empty table — the defect that
-- left four training surfaces and the leave half of both requests inboxes
-- silently empty for months (20260906092000). Nothing embeds these yet, so this
-- is prevention rather than repair.
--
-- **Each target was verified against real rows before being written**, because
-- two of these do NOT point where the name suggests:
--
--   performance_reviews.template_id       9/9 rows resolve in review_templates
--   review_cycles.template_id             1/1 rows resolve in review_templates
--   review_feedback_requests.template_id  1/1 rows resolve in
--                                         FEEDBACK_QUESTION_TEMPLATES, 0/1 in
--                                         review_templates
--   review_feedback.template_id           copied from the request row above, so
--                                         the same target
--
-- An FK to `review_templates` on either of the last two would have been wrong
-- and would have broken every 360-feedback insert.

ALTER TABLE public.performance_reviews
  DROP CONSTRAINT IF EXISTS performance_reviews_template_id_fkey;
ALTER TABLE public.performance_reviews
  ADD CONSTRAINT performance_reviews_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.review_templates(id) ON DELETE SET NULL;

-- A review cannot exist without its cycle (`cycle_id` is NOT NULL), so it goes
-- when the cycle does. Verified: 9/9 existing rows resolve.
ALTER TABLE public.performance_reviews
  DROP CONSTRAINT IF EXISTS performance_reviews_cycle_id_fkey;
ALTER TABLE public.performance_reviews
  ADD CONSTRAINT performance_reviews_cycle_id_fkey
  FOREIGN KEY (cycle_id) REFERENCES public.review_cycles(id) ON DELETE CASCADE;

ALTER TABLE public.review_cycles
  DROP CONSTRAINT IF EXISTS review_cycles_template_id_fkey;
ALTER TABLE public.review_cycles
  ADD CONSTRAINT review_cycles_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.review_templates(id) ON DELETE SET NULL;

-- `review_instances.template_id` is NOT NULL and the row is generated FROM the
-- template, so RESTRICT rather than CASCADE: deleting a template should be
-- refused while instances exist, not silently delete everyone's reviews. This
-- domain already prefers retiring to deleting.
ALTER TABLE public.review_instances
  DROP CONSTRAINT IF EXISTS review_instances_template_id_fkey;
ALTER TABLE public.review_instances
  ADD CONSTRAINT review_instances_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.review_templates(id) ON DELETE RESTRICT;

ALTER TABLE public.review_instances
  DROP CONSTRAINT IF EXISTS review_instances_employee_id_fkey;
ALTER TABLE public.review_instances
  ADD CONSTRAINT review_instances_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE public.review_feedback_requests
  DROP CONSTRAINT IF EXISTS review_feedback_requests_template_id_fkey;
ALTER TABLE public.review_feedback_requests
  ADD CONSTRAINT review_feedback_requests_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.feedback_question_templates(id) ON DELETE SET NULL;

ALTER TABLE public.review_feedback
  DROP CONSTRAINT IF EXISTS review_feedback_template_id_fkey;
ALTER TABLE public.review_feedback
  ADD CONSTRAINT review_feedback_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.feedback_question_templates(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 3. review_template_audit_log gets NO foreign key, on purpose
-- -----------------------------------------------------------------------------
--
-- It records what was done TO a template, including deleting one. A key would
-- either block that delete or null out the id of the thing the row exists to
-- describe. An audit row has to outlive its subject, which is why the column is
-- nullable text-of-record rather than a reference. Stated here so the next
-- person auditing foreign keys does not "fix" it.
