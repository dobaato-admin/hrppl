-- Revoke client-API read access on cryptographic credential columns.
-- These secrets must only be readable via service_role (server-side code).
REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM authenticated;
REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM anon;

REVOKE SELECT (secret) ON public.blog_webhooks FROM authenticated;
REVOKE SELECT (secret) ON public.blog_webhooks FROM anon;