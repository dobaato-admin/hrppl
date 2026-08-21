
-- 1) blog_webhooks: hide plaintext secret from regular authenticated users
REVOKE SELECT (secret), UPDATE (secret), INSERT (secret) ON public.blog_webhooks FROM authenticated;
REVOKE SELECT (secret), UPDATE (secret), INSERT (secret) ON public.blog_webhooks FROM anon;

-- 2) biometric_devices: hide shared_secret and webhook_token from authenticated
REVOKE SELECT (shared_secret, webhook_token),
       UPDATE (shared_secret, webhook_token),
       INSERT (shared_secret, webhook_token)
  ON public.biometric_devices FROM authenticated;
REVOKE SELECT (shared_secret, webhook_token),
       UPDATE (shared_secret, webhook_token),
       INSERT (shared_secret, webhook_token)
  ON public.biometric_devices FROM anon;

-- 3) staff_invitations: hide token column from authenticated; only admin client (service_role) reads it
REVOKE SELECT (token), UPDATE (token), INSERT (token) ON public.staff_invitations FROM authenticated;
REVOKE SELECT (token), UPDATE (token), INSERT (token) ON public.staff_invitations FROM anon;

-- 4) staff_onboarding_profiles: drop manager read policy so managers cannot read direct report PII
DROP POLICY IF EXISTS "manager reads direct report onboarding profiles" ON public.staff_onboarding_profiles;
