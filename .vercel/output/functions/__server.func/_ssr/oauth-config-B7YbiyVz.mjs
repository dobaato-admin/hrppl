function describeOAuthError(raw) {
  const msg = extractMessage(raw).toLowerCase();
  const code = extractCode(raw).toLowerCase();
  if (code === "access_denied" || msg.includes("access_denied") || msg.includes("consent")) {
    return {
      title: "Sign-in cancelled",
      message: "You declined the Google consent screen. To sign in with Google, please approve the requested permissions."
    };
  }
  if (code === "redirect_uri_mismatch" || msg.includes("redirect_uri") || msg.includes("redirect uri") || msg.includes("unauthorized redirect")) {
    return {
      title: "Sign-in misconfigured",
      message: "This site's Google sign-in redirect URL isn't authorised. Please contact your administrator — they need to add this domain to the Google OAuth allowlist."
    };
  }
  if (msg.includes("hd ") || msg.includes("hosted domain") || msg.includes("workspace") || msg.includes("organization") || msg.includes("not allowed for this") || code === "domain_not_allowed") {
    return {
      title: "Email domain not allowed",
      message: "Your Google account belongs to a domain that isn't permitted for this workspace. Use an approved company Google account, or contact your administrator."
    };
  }
  if (msg.includes("identity is already linked") || msg.includes("already linked")) {
    return {
      title: "Already connected",
      message: "This Google account is already linked to a user. Sign in with it directly instead."
    };
  }
  if (msg.includes("email") && msg.includes("already")) {
    return {
      title: "Email already in use",
      message: "An account with this email already exists. Sign in with your password first, then link Google from Settings → Account."
    };
  }
  if (msg.includes("popup") && msg.includes("closed")) {
    return {
      title: "Sign-in window closed",
      message: "The Google sign-in window was closed before completing. Please try again."
    };
  }
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return {
      title: "Network problem",
      message: "We couldn't reach Google. Check your connection and try again."
    };
  }
  if (msg.includes("signup_not_allowed")) {
    return {
      title: "Account not permitted",
      message: "This email has no pending invitation. Ask your organisation admin to invite you, or create a new organisation account."
    };
  }
  return {
    title: "Sign-in failed",
    message: extractMessage(raw) || "Something went wrong signing you in with Google. Please try again."
  };
}
function extractMessage(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (raw instanceof Error) return raw.message;
  if (typeof raw === "object") {
    const r = raw;
    return typeof r.message === "string" && r.message || typeof r.error_description === "string" && r.error_description || typeof r.error === "string" && r.error || "";
  }
  return String(raw);
}
function extractCode(raw) {
  if (raw && typeof raw === "object") {
    const r = raw;
    return typeof r.code === "string" && r.code || typeof r.error_code === "string" && r.error_code || typeof r.error === "string" && r.error || "";
  }
  return "";
}
function readOAuthErrorFromUrl() {
  if (typeof window === "undefined") return null;
  const sources = [];
  if (window.location.search) sources.push(new URLSearchParams(window.location.search));
  if (window.location.hash) {
    const h = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    sources.push(new URLSearchParams(h));
  }
  for (const p of sources) {
    const err = p.get("error") || p.get("error_code");
    const desc = p.get("error_description");
    if (err || desc) {
      return describeOAuthError({ error: err ?? "", error_description: desc ?? "" });
    }
  }
  return null;
}
function describePasswordSignInError(raw) {
  const code = extractCode(raw).toLowerCase();
  const msg = extractMessage(raw).toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return {
      code,
      title: "Email or password is incorrect",
      message: "Check both, then try again. If you normally sign in with Google, this account may have no password set — use “Forgot password?” to create one."
    };
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return {
      code,
      title: "Email not confirmed",
      message: "Your password is correct, but this address hasn't been confirmed yet. Open the confirmation link we emailed you, then sign in again."
    };
  }
  if (code === "user_banned" || msg.includes("user is banned")) {
    return {
      code,
      title: "Account suspended",
      message: "This account has been suspended. Contact your administrator to restore access."
    };
  }
  if (code.includes("rate_limit") || msg.includes("rate limit") || msg.includes("too many")) {
    return {
      code,
      title: "Too many attempts",
      message: "Wait a few minutes before trying again — this limit is per IP address."
    };
  }
  if (code === "email_provider_disabled" || msg.includes("email logins are disabled")) {
    return {
      code,
      title: "Email sign-in is turned off",
      message: "This workspace has disabled email and password sign-in. Use Google instead."
    };
  }
  if (code === "validation_failed" || msg.includes("validation")) {
    return {
      code,
      title: "Sign-in request was rejected",
      message: "The email address looks malformed. Check for stray spaces or a missing domain."
    };
  }
  const fallback = describeOAuthError(raw);
  return {
    code,
    title: fallback.title,
    message: extractMessage(raw) || "Something went wrong signing you in. Please try again."
  };
}
const ALLOWED_OAUTH_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://id-preview--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app",
  "https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app",
  "https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d-dev.lovable.app",
  "https://hrppl.lovable.app",
  "https://hrppl.io",
  "https://www.hrppl.io"
];
const ALLOWED_HOST_PATTERNS = [
  /\.lovableproject\.com$/i,
  /^id-preview--[a-z0-9-]+\.lovable\.app$/i
];
function validateOAuthOrigin(currentOrigin) {
  const origin = currentOrigin.replace(/\/+$/, "");
  const safeFallback = "https://hrppl.io";
  if (ALLOWED_OAUTH_ORIGINS.includes(origin)) {
    return { ok: true, origin, resolvedOrigin: origin, allowed: ALLOWED_OAUTH_ORIGINS };
  }
  let host = "";
  try {
    host = new URL(origin).host;
  } catch {
  }
  if (host && ALLOWED_HOST_PATTERNS.some((re) => re.test(host))) {
    return { ok: true, origin, resolvedOrigin: origin, allowed: ALLOWED_OAUTH_ORIGINS };
  }
  return {
    ok: false,
    origin,
    resolvedOrigin: safeFallback,
    reason: `redirect_uri_mismatch: origin "${origin}" is not in the OAuth allowlist. Allowed: ${ALLOWED_OAUTH_ORIGINS.join(", ")}.`,
    allowed: ALLOWED_OAUTH_ORIGINS
  };
}
function buildGoogleRedirectUri(path) {
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const validation = validateOAuthOrigin(currentOrigin);
  if (!validation.ok) {
    console.error("[oauth] redirect_uri_mismatch", {
      currentOrigin: validation.origin,
      attemptedPath: path,
      attemptedRedirectUri: `${validation.origin}${path}`,
      allowedOrigins: validation.allowed,
      fallbackOrigin: validation.resolvedOrigin,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return {
    redirectUri: `${validation.resolvedOrigin}${safePath}`,
    validation
  };
}
export {
  describePasswordSignInError as a,
  buildGoogleRedirectUri as b,
  describeOAuthError as d,
  readOAuthErrorFromUrl as r
};
