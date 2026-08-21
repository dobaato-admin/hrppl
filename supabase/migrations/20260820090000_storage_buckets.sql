-- ---------------------------------------------------------------------------
-- Storage buckets.
--
-- The gap this closes is narrow and specific: the RLS policies on
-- storage.objects were in migrations all along (31 of them, added across
-- several earlier files), but the storage.buckets ROWS were not. They had been
-- created by hand in the old project's dashboard. So a rebuilt project got
-- every policy and no bucket, and every upload failed with bucket-not-found
-- while the access rules sat there looking correct.
--
-- This file therefore inserts buckets and NOTHING ELSE.
--
-- Deliberately no policies here
-- ----------------------------
-- An earlier draft of this migration added four tenant-scoped policies, on the
-- assumption that storage access was undocumented. It is not. The existing
-- policies are considerably tighter than tenant scope -- they are owner-scoped
-- and role-scoped, e.g.:
--
--     employee uploads own bucket files      expense_receipts owner read
--     employee reads own bucket files        medical_files_select
--     HR read tenant disciplinary files      candidate_resumes admin read
--     Employees read own non-confidential medical files
--
-- Postgres RLS policies are PERMISSIVE by default and combine with OR. Adding
-- a broader "any member of the tenant" policy alongside an owner-scoped one
-- does not narrow anything -- it widens it, letting any colleague reach files
-- the tighter policy was written to keep private. The four policies were
-- dropped again for exactly that reason.
--
-- If a storage rule needs changing, change it where it already lives, or add a
-- RESTRICTIVE policy. Do not add a permissive one here.
--
-- Bucket-to-policy coverage at the time of writing:
--     candidate-resumes    9 policies
--     disciplinary-files   7
--     employee-documents   7
--     expense-receipts     4
--     medical-files        4
--     payslips             0  -- correct: reached only via the service-role
--                              -- client in payroll-emails.functions.ts, which
--                              -- bypasses RLS. A policy would grant direct
--                              -- client access the app never asks for.
-- ---------------------------------------------------------------------------

-- All private. Every read reaches a client through a signed URL, so nothing
-- here should ever be publicly listable.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('employee-documents', 'employee-documents', false, 26214400, NULL),
  ('payslips',           'payslips',           false, 10485760, ARRAY['application/pdf']),
  ('expense-receipts',   'expense-receipts',   false, 10485760,
     ARRAY['image/jpeg','image/png','image/heic','image/webp','application/pdf']),
  ('medical-files',      'medical-files',      false, 26214400, NULL),
  ('disciplinary-files', 'disciplinary-files', false, 26214400, NULL),
  -- Bounded tightly: this is the one bucket an unauthenticated applicant can
  -- write to, via a signed upload URL minted in recruitment.functions.ts and
  -- redeemed by the public careers page with uploadToSignedUrl.
  ('candidate-resumes',  'candidate-resumes',  false, 10485760,
     ARRAY['application/pdf','application/msword',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;
