-- Make the deprecated jobs view honor the caller's RLS, not the view owner's
ALTER VIEW public.jobs SET (security_invoker = true);