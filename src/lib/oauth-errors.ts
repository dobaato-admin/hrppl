// Maps OAuth / Supabase auth error payloads into clear, user-facing messages.
// Handles the most common failure modes: blocked domains (Google `hd`),
// misconfigured redirect URIs, denied consent, and already-linked identities.

export interface OAuthErrorInfo {
  title: string;
  message: string;
}

export function describeOAuthError(raw: unknown): OAuthErrorInfo {
  const msg = extractMessage(raw).toLowerCase();
  const code = extractCode(raw).toLowerCase();

  if (code === "access_denied" || msg.includes("access_denied") || msg.includes("consent")) {
    return {
      title: "Sign-in cancelled",
      message:
        "You declined the Google consent screen. To sign in with Google, please approve the requested permissions.",
    };
  }

  if (
    code === "redirect_uri_mismatch" ||
    msg.includes("redirect_uri") ||
    msg.includes("redirect uri") ||
    msg.includes("unauthorized redirect")
  ) {
    return {
      title: "Sign-in misconfigured",
      message:
        "This site's Google sign-in redirect URL isn't authorised. Please contact your administrator — they need to add this domain to the Google OAuth allowlist.",
    };
  }

  if (
    msg.includes("hd ") ||
    msg.includes("hosted domain") ||
    msg.includes("workspace") ||
    msg.includes("organization") ||
    msg.includes("not allowed for this") ||
    code === "domain_not_allowed"
  ) {
    return {
      title: "Email domain not allowed",
      message:
        "Your Google account belongs to a domain that isn't permitted for this workspace. Use an approved company Google account, or contact your administrator.",
    };
  }

  if (msg.includes("identity is already linked") || msg.includes("already linked")) {
    return {
      title: "Already connected",
      message: "This Google account is already linked to a user. Sign in with it directly instead.",
    };
  }

  if (msg.includes("email") && msg.includes("already")) {
    return {
      title: "Email already in use",
      message:
        "An account with this email already exists. Sign in with your password first, then link Google from Settings → Account.",
    };
  }

  if (msg.includes("popup") && msg.includes("closed")) {
    return {
      title: "Sign-in window closed",
      message: "The Google sign-in window was closed before completing. Please try again.",
    };
  }

  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return {
      title: "Network problem",
      message: "We couldn't reach Google. Check your connection and try again.",
    };
  }

  if (msg.includes("signup_not_allowed")) {
    return {
      title: "Account not permitted",
      message:
        "This email has no pending invitation. Ask your organisation admin to invite you, or create a new organisation account.",
    };
  }

  return {
    title: "Sign-in failed",
    message: extractMessage(raw) || "Something went wrong signing you in with Google. Please try again.",
  };
}

function extractMessage(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (raw instanceof Error) return raw.message;
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    return (
      (typeof r.message === "string" && r.message) ||
      (typeof r.error_description === "string" && r.error_description) ||
      (typeof r.error === "string" && r.error) ||
      ""
    );
  }
  return String(raw);
}

function extractCode(raw: unknown): string {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    return (
      (typeof r.code === "string" && r.code) ||
      (typeof r.error_code === "string" && r.error_code) ||
      (typeof r.error === "string" && r.error) ||
      ""
    );
  }
  return "";
}

// Parse `?error=...&error_description=...` or `#error=...&error_description=...`
// returned by OAuth providers when the redirect lands back on the app.
export function readOAuthErrorFromUrl(): OAuthErrorInfo | null {
  if (typeof window === "undefined") return null;
  const sources: URLSearchParams[] = [];
  if (window.location.search) sources.push(new URLSearchParams(window.location.search));
  if (window.location.hash) {
    const h = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
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

/**
 * Password sign-in failures, described accurately.
 *
 * describeOAuthError above is built for the Google redirect flow, and its
 * fallback says "signing you in with Google" — actively misleading on the
 * email/password form. Worse, every branch it does match is OAuth-shaped, so a
 * password failure always falls through to that fallback and the caller loses
 * the one thing that identifies the problem: GoTrue's error_code.
 *
 * These are the codes the password grant actually returns. `code` is carried
 * through deliberately so the UI can show it — "invalid_credentials" and
 * "email_not_confirmed" are the same 400 to a user staring at a red box, but
 * they have completely different fixes.
 */
export function describePasswordSignInError(raw: unknown): OAuthErrorInfo & { code: string } {
  const code = extractCode(raw).toLowerCase();
  const msg = extractMessage(raw).toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return {
      code,
      title: "Email or password is incorrect",
      message:
        "Check both, then try again. If you normally sign in with Google, this account may have no password set — use \u201CForgot password?\u201D to create one.",
    };
  }

  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return {
      code,
      title: "Email not confirmed",
      message:
        "Your password is correct, but this address hasn't been confirmed yet. Open the confirmation link we emailed you, then sign in again.",
    };
  }

  if (code === "user_banned" || msg.includes("user is banned")) {
    return {
      code,
      title: "Account suspended",
      message: "This account has been suspended. Contact your administrator to restore access.",
    };
  }

  if (code.includes("rate_limit") || msg.includes("rate limit") || msg.includes("too many")) {
    return {
      code,
      title: "Too many attempts",
      message: "Wait a few minutes before trying again — this limit is per IP address.",
    };
  }

  if (code === "email_provider_disabled" || msg.includes("email logins are disabled")) {
    return {
      code,
      title: "Email sign-in is turned off",
      message: "This workspace has disabled email and password sign-in. Use Google instead.",
    };
  }

  if (code === "validation_failed" || msg.includes("validation")) {
    return {
      code,
      title: "Sign-in request was rejected",
      message: "The email address looks malformed. Check for stray spaces or a missing domain.",
    };
  }

  const fallback = describeOAuthError(raw);
  return {
    code,
    title: fallback.title,
    message: extractMessage(raw) || "Something went wrong signing you in. Please try again.",
  };
}
