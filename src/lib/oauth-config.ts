// Single source of truth for which origins may be used as the OAuth
// `redirect_uri` for this project. Keep this list in sync with the OAuth
// redirect-URL allowlist configured in Lovable Cloud / Google Cloud Console.
// Adding an origin here without adding it to the provider's allowlist will
// still fail at the provider — and vice versa.

export const ALLOWED_OAUTH_ORIGINS: readonly string[] = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://id-preview--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app",
  "https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app",
  "https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d-dev.lovable.app",
  "https://hrppl.lovable.app",
  "https://hrppl.io",
  "https://www.hrppl.io",
];

// Treat Lovable's per-PR preview subdomains (`*.lovableproject.com`,
// `*-preview--<id>.lovable.app`) as allowed without listing each one — they
// share the OAuth broker config. Add other safe wildcard patterns here.
const ALLOWED_HOST_PATTERNS: RegExp[] = [
  /\.lovableproject\.com$/i,
  /^id-preview--[a-z0-9-]+\.lovable\.app$/i,
];

export interface RedirectValidation {
  ok: boolean;
  origin: string;
  /** Same as `origin` if allowed; otherwise the safe production fallback. */
  resolvedOrigin: string;
  reason?: string;
  allowed: readonly string[];
}

/**
 * Validate the current page's origin against the OAuth allowlist BEFORE
 * starting an OAuth flow. Returns the origin to use as redirect base plus
 * a structured reason when it doesn't match. The caller is expected to
 * surface `reason` to the user AND log it for ops.
 */
export function validateOAuthOrigin(currentOrigin: string): RedirectValidation {
  const origin = currentOrigin.replace(/\/+$/, "");
  const safeFallback = "https://hrppl.io";

  if (ALLOWED_OAUTH_ORIGINS.includes(origin)) {
    return { ok: true, origin, resolvedOrigin: origin, allowed: ALLOWED_OAUTH_ORIGINS };
  }

  let host = "";
  try {
    host = new URL(origin).host;
  } catch {
    /* malformed origin — treated as not allowed */
  }
  if (host && ALLOWED_HOST_PATTERNS.some((re) => re.test(host))) {
    return { ok: true, origin, resolvedOrigin: origin, allowed: ALLOWED_OAUTH_ORIGINS };
  }

  return {
    ok: false,
    origin,
    resolvedOrigin: safeFallback,
    reason:
      `redirect_uri_mismatch: origin "${origin}" is not in the OAuth allowlist. ` +
      `Allowed: ${ALLOWED_OAUTH_ORIGINS.join(", ")}.`,
    allowed: ALLOWED_OAUTH_ORIGINS,
  };
}

/**
 * Build a redirect_uri for Google OAuth from an internal app path. Throws a
 * descriptive error if the current origin isn't on the allowlist so the
 * caller can surface a dedicated UI message instead of starting a flow that
 * will fail at Google with an opaque `redirect_uri_mismatch`.
 */
export function buildGoogleRedirectUri(path: string): { redirectUri: string; validation: RedirectValidation } {
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const validation = validateOAuthOrigin(currentOrigin);
  if (!validation.ok) {
    // Structured log so we can grep redirect mismatches in browser console + Lovable error capture.
    console.error("[oauth] redirect_uri_mismatch", {
      currentOrigin: validation.origin,
      attemptedPath: path,
      attemptedRedirectUri: `${validation.origin}${path}`,
      allowedOrigins: validation.allowed,
      fallbackOrigin: validation.resolvedOrigin,
      timestamp: new Date().toISOString(),
    });
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return {
    redirectUri: `${validation.resolvedOrigin}${safePath}`,
    validation,
  };
}
