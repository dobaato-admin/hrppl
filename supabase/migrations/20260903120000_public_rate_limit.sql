-- Rate limiting for UNAUTHENTICATED endpoints.
--
-- Why this exists
-- ---------------
-- `check_rate_limit` (20260623013858) opens with:
--
--     IF v_user IS NULL THEN RETURN true; END IF;
--
-- so it deliberately passes anonymous callers straight through, and
-- `rate_limit_buckets.user_id` carries `REFERENCES auth.users(id)`, so there is
-- no way to key a bucket on anything but a signed-in user. The existing limiter
-- is therefore architecturally incapable of protecting a public endpoint.
--
-- Five server functions take no session at all and four of them write:
--
--   createResumeUploadUrl  mints a signed upload URL into candidate-resumes
--   applyToJob             inserts a candidate + application
--   submitLead             inserts a marketing lead
--   trackCareersEvent      inserts an analytics row
--   getInvitationByToken   reads an invitation by token (enumeration target)
--
-- `createResumeUploadUrl` is the sharpest: it is an unauthenticated mint of a
-- storage upload credential, so an attacker can fill the bucket — and on a
-- metered plan, the bill — as fast as they can loop.
--
-- This adds a second bucket table keyed by an opaque client fingerprint (a
-- salted hash of the IP, never the IP itself) plus a SECURITY DEFINER function
-- that anon may execute. Same window/counter algorithm as the authenticated
-- one, so the two behave identically.

CREATE TABLE IF NOT EXISTS public.public_rate_limit_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- A salted hash of the caller's IP. Not the IP: this table is readable by
  -- the service role and by anything that can bypass RLS, and a raw IP list of
  -- everyone who viewed a careers page is personal data we have no reason to
  -- keep. The salt makes the hash useless outside this database.
  client_key text NOT NULL,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_key, bucket)
);

CREATE INDEX IF NOT EXISTS public_rate_limit_buckets_sweep_idx
  ON public.public_rate_limit_buckets (window_start);

ALTER TABLE public.public_rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- No policy for anon or authenticated on purpose. The counter is only ever
-- touched through the SECURITY DEFINER function below, so nobody can read the
-- table to learn who has been calling, or write to it to reset their own count.
GRANT ALL ON public.public_rate_limit_buckets TO service_role;

/**
 * Count one request from an anonymous caller. Returns false when the caller has
 * exceeded `_max_requests` inside `_window_seconds`.
 *
 * `_client_key` is hashed again here with a server-side salt so that even a
 * caller who could guess the application's hashing scheme cannot precompute
 * another visitor's key.
 */
CREATE OR REPLACE FUNCTION public.check_public_rate_limit(
  _client_key text,
  _bucket text,
  _max_requests int,
  _window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_row public.public_rate_limit_buckets%ROWTYPE;
BEGIN
  IF _client_key IS NULL OR length(_client_key) = 0 THEN
    -- No usable identity for this caller. Fail OPEN rather than closed: a
    -- proxy that strips the forwarded-for header must not be able to take the
    -- careers site offline for everyone behind it.
    RETURN true;
  END IF;

  -- extensions.digest, schema-qualified: pgcrypto lives in `extensions` on
  -- Supabase, and this function sets `search_path = public` deliberately.
  -- Widening the search_path of a SECURITY DEFINER function to reach the
  -- extension would be the wrong trade — qualifying the one call is safer.
  v_key := encode(extensions.digest(_client_key || '|hrppl-public-rl-v1', 'sha256'), 'hex');

  SELECT * INTO v_row FROM public.public_rate_limit_buckets
    WHERE client_key = v_key AND bucket = _bucket FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.public_rate_limit_buckets(client_key, bucket, window_start, request_count)
      VALUES (v_key, _bucket, now(), 1)
      ON CONFLICT (client_key, bucket) DO UPDATE
        SET request_count = public.public_rate_limit_buckets.request_count + 1,
            updated_at = now();
    RETURN true;
  END IF;

  IF v_row.window_start < now() - (_window_seconds || ' seconds')::interval THEN
    UPDATE public.public_rate_limit_buckets
      SET window_start = now(), request_count = 1, updated_at = now()
      WHERE id = v_row.id;
    RETURN true;
  END IF;

  IF v_row.request_count >= _max_requests THEN
    RETURN false;
  END IF;

  UPDATE public.public_rate_limit_buckets
    SET request_count = request_count + 1, updated_at = now()
    WHERE id = v_row.id;
  RETURN true;
END $$;

-- anon needs EXECUTE: these are the callers being limited.
REVOKE EXECUTE ON FUNCTION public.check_public_rate_limit(text, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.check_public_rate_limit(text, text, int, int) TO anon, authenticated, service_role;

/** Drop counters nobody has touched for a day. Safe to call from cron. */
CREATE OR REPLACE FUNCTION public.sweep_public_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deleted integer;
BEGIN
  DELETE FROM public.public_rate_limit_buckets WHERE window_start < now() - interval '1 day';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END $$;

REVOKE EXECUTE ON FUNCTION public.sweep_public_rate_limits() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sweep_public_rate_limits() TO service_role;
