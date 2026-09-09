import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMyGateStatus } from "@/lib/org-signup.functions";
import { getMfaStatus } from "@/lib/mfa.functions";
import { isMfaSessionVerified, MFA_STATUS_EVENT } from "@/lib/mfa-session";
import { perfBus } from "@/lib/perf-bus";
import { emitRouteRevalidating } from "@/components/RouteLoadingBar";

type OrgStatus = any;
type MfaStatus = any;

const STATUS_CACHE_MS = 2 * 60_000;
const ORG_STATUS_EVENT = "hrppl:org-status-changed";
const statusCache = new Map<string, { status: OrgStatus; fetchedAt: number }>();
const mfaCache = new Map<string, { status: MfaStatus; fetchedAt: number }>();

function getFreshCache<T>(cache: Map<string, { status: T; fetchedAt: number }>, key: string): T | null {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.fetchedAt > STATUS_CACHE_MS) return null;
  return hit.status;
}

/**
 * Global route gate. Enforces:
 *  - Unauthenticated users can only see public pages; otherwise routed to /auth.
 *  - Authenticated users with no tenant are funnelled to /welcome so they can
 *    either create an organisation or accept a pending invitation.
 *  - Authenticated org admins whose setup isn't completed are funnelled to
 *    /org/setup. They cannot reach app pages until the wizard finishes.
 *  - Anyone arriving at /invite/$token already signed in with a matching
 *    email proceeds straight to the invite flow (auto-accept handed off to
 *    that page).
 */

// Exact-match public routes (everyone can see, signed in or not).
const PUBLIC_EXACT = new Set<string>([
  "/",
  "/auth",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
  "/developers",
  // Local-only session import. Must be reachable without a session — that is
  // the whole point of it. import.meta.env.DEV is statically false in a
  // production build, so this entry is dead weight there, not a hole.
  "/dev-session",
]);

// Prefix-match public routes.
const PUBLIC_PREFIX = [
  "/invite/",
  "/careers",
  "/sign/",
  "/email/",
  "/api/",
  "/lovable/",
  "/blog",
];

// Routes that require auth but are allowed even without a tenant / completed setup.
const TENANTLESS_ALLOWED = new Set<string>(["/welcome", "/org/setup"]);

// Routes the user is always allowed to reach so they can complete MFA setup.
const MFA_ALLOWED = new Set<string>(["/me/security", "/auth", "/signup", "/forgot-password", "/reset-password"]);

// The only in-app destination a suspended account may render.
const SUSPENDED_ROUTE = "/suspended";

/** Where a signed-in user lands when they have not asked for anywhere. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/" || pathname === "/welcome";
}

/**
 * True if this key has already fired in this browser session.
 *
 * Keeps the setup-guide nudge to once per session so it never becomes a trap:
 * navigate away and it does not drag you back. sessionStorage rather than
 * useState because the gate remounts on every navigation, which is precisely
 * what made the onboarding redirect fire repeatedly before.
 */
function oncePerSession(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    // Private mode or blocked storage: skip the nudge rather than loop.
    return true;
  }
}

/**
 * Local-development escape from the mandatory MFA gate.
 *
 * Requires BOTH conditions, and neither is enough alone:
 *   import.meta.env.DEV          - statically false in a production build, so
 *                                  Vite folds this constant to false and the
 *                                  guarded branch is dead code that never
 *                                  reaches the bundle. It cannot be switched
 *                                  on at runtime.
 *   VITE_DEV_BYPASS_MFA === "1"  - an explicit, deliberate opt-in. Absent from
 *                                  .env.example on purpose.
 *
 * Why it exists: MFA is enforced on every route outside MFA_ALLOWED, and both
 * email-OTP paths need mail credentials this environment does not have. That
 * left TOTP as the only way in, and an interrupted enrolment could strand an
 * account entirely (see the self-heal in me.security.tsx).
 *
 * This weakens nothing in production. It DOES fully disable second-factor
 * enforcement locally, so never set the variable on a machine holding real
 * data. Pinned by tests/mfa-dev-bypass.test.ts.
 */
const DEV_MFA_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_MFA === "1";

let warnedAboutBypass = false;
function warnBypassOnce() {
  if (warnedAboutBypass) return;
  warnedAboutBypass = true;
  console.warn(
    "[AuthRouteGate] MFA enforcement is DISABLED (VITE_DEV_BYPASS_MFA=1, dev build). " +
      "Every route is reachable without a second factor. Unset it to restore the gate.",
  );
}

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p));
}

function sanitizeRedirect(p: string): string {
  if (!p.startsWith("/") || p.startsWith("//")) return "/dashboard";
  // Don't redirect back to auth/signup themselves.
  if (p === "/auth" || p === "/signup") return "/dashboard";
  return p;
}

export function requestOrgStatusRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ORG_STATUS_EVENT));
}

export function AuthRouteGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const fetchStatus = useServerFn(getMyGateStatus);
  const fetchMfa = useServerFn(getMfaStatus);

  const [checking, setChecking] = useState(false);
  const [statusKey, setStatusKey] = useState(0); // forces re-check after sign-in/out
  const lastUserId = useRef<string | null>(null);

  // Re-run status check whenever the signed-in user changes.
  useEffect(() => {
    if (userId !== lastUserId.current) {
      lastUserId.current = userId;
      setStatusKey((k) => k + 1);
    }
  }, [userId]);

  // Re-run when MFA status changes (enrollment finished, session verified, signed out).
  useEffect(() => {
    const handler = () => {
      if (lastUserId.current) mfaCache.delete(lastUserId.current);
      setStatusKey((k) => k + 1);
    };
    window.addEventListener(MFA_STATUS_EVENT, handler);
    return () => window.removeEventListener(MFA_STATUS_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (lastUserId.current) statusCache.delete(lastUserId.current);
      setStatusKey((k) => k + 1);
    };
    window.addEventListener(ORG_STATUS_EVENT, handler);
    return () => window.removeEventListener(ORG_STATUS_EVENT, handler);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // Public routes: never gate.
    if (isPublic(pathname)) {
      setChecking(false);
      return;
    }

    // No session → must sign in.
    if (!userId) {
      navigate({
        to: "/auth",
        search: { redirect: pathname === "/auth" ? "/dashboard" : pathname },
      });
      return;
    }

    let cancelled = false;
    const cachedStatus = getFreshCache(statusCache, userId);
    const cachedMfa = getFreshCache(mfaCache, userId);
    const fullyCached = !!cachedStatus && (MFA_ALLOWED.has(pathname) || !!cachedMfa);
    setChecking(!cachedStatus || (!MFA_ALLOWED.has(pathname) && !cachedMfa));

    // Track whether THIS run turned the bar on, so the retraction below cannot
    // drift out of step with it.
    //
    // The retraction used to be guarded by `if (!cancelled)` AND
    // `if (fullyCached)`, and both guards could fail after the `true` had been
    // emitted. Cancel the effect mid-flight — which any navigation does, since
    // `pathname` is a dependency — and the `finally` ran with cancelled === true,
    // so the bar was never turned off. If the next run then had
    // `fullyCached === false` it emitted neither value, and the bar stayed lit
    // indefinitely, animating `infinite` with nothing behind it.
    //
    // A signal that can be raised must always be lowered on every exit path.
    let emittedActive = false;
    if (fullyCached) {
      emitRouteRevalidating(true); // cached UI shows, bar signals background work
      emittedActive = true;
    }
    const startedAt = performance.now();
    (async () => {
      try {
        const status = cachedStatus ?? await fetchStatus();
        if (cancelled) return;
        if (!cachedStatus) statusCache.set(userId, { status, fetchedAt: Date.now() });

        // Suspension outranks every other gate. Server-side enforcement is
        // already immediate on each request; this exists so the user sees an
        // explanation instead of an app shell where everything errors.
        if ((status as { suspended?: boolean }).suspended) {
          if (pathname !== SUSPENDED_ROUTE) {
            navigate({ to: SUSPENDED_ROUTE });
            return;
          }
          return;
        }
        // An active account has no business sitting on the suspended screen.
        if (pathname === SUSPENDED_ROUTE) {
          navigate({ to: "/dashboard" });
          return;
        }

        const hasTenant = !!status.tenantId;
        const orgCreated = !!status.orgCreated;
        const orgActivated = !!status.orgActivated;
        const roles = status.roles ?? [];
        const isOrgAdmin = roles.includes("org_admin");
        const isPlatformAdmin =
          roles.includes("super_admin") || roles.includes("regional_admin");

        // Platform admins (super / regional) bypass tenant gating.
        if (isPlatformAdmin) {
          // Still require MFA.
        } else if (!hasTenant) {
          // Trial invitees should go straight into org setup.
          if (status.pendingTrialInvitation) {
            if (pathname !== "/org/setup") {
              navigate({ to: "/org/setup" });
              return;
            }
            return;
          }

          // Tenantless users may only see /welcome and /org/setup.
          if (!TENANTLESS_ALLOWED.has(pathname)) {
            navigate({ to: "/welcome" });
            return;
          }
          return;
        } else if (isOrgAdmin && !orgCreated) {
          // Org admin must complete the creation wizard before anything else.
          // This one IS a hard gate: without a country, a currency and a tenant
          // row there is nothing for the rest of the product to operate on.
          if (pathname !== "/org/setup") {
            navigate({ to: "/org/setup" });
            return;
          }
          return;
        } else if (isOrgAdmin && !orgActivated && isLandingPath(pathname)) {
          // The organisation exists but has never been configured. Send them to
          // the guide the first time they land on the dashboard in a session.
          //
          // Deliberately NOT a gate. They finished the wizard, so the product is
          // usable and trapping them would be wrong — but dropping them on a
          // dashboard with no mention of the seven things still unconfigured is
          // how an org ends up running payroll it never set up. The dashboard
          // card carries it from here; this is just the first nudge.
          if (!oncePerSession(`setup-guide-nudge:${userId}`)) {
            navigate({ to: "/org/setup-guide" });
            return;
          }
        }

        // MFA enforcement (mandatory for everyone).
        if (DEV_MFA_BYPASS) warnBypassOnce();
        if (!MFA_ALLOWED.has(pathname) && !DEV_MFA_BYPASS) {
          const mfa = cachedMfa ?? await fetchMfa();
          if (cancelled) return;
          if (!cachedMfa) mfaCache.set(userId, { status: mfa, fetchedAt: Date.now() });
          if (!mfa.method) {
            navigate({ to: "/me/security", search: { redirect: pathname } as any });
            return;
          }
          if (!isMfaSessionVerified()) {
            navigate({ to: "/me/security", search: { redirect: pathname } as any });
            return;
          }
        }
      } catch (err) {
        // Don't trap the user behind a broken status call — log and let them through.
        console.error("[AuthRouteGate] org status check failed", err);
      } finally {
        // Retract unconditionally — NOT behind `if (!cancelled)`. A cancelled
        // run still raised the signal, so it still owes the retraction; the
        // whole point is that no exit path can leave the bar lit.
        if (emittedActive) {
          emitRouteRevalidating(false);
          emittedActive = false;
        }
        if (!cancelled) {
          setChecking(false);
          perfBus.recordGate({
            path: pathname,
            ms: Math.round(performance.now() - startedAt),
            at: Date.now(),
            cached: fullyCached,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      // Retract immediately rather than waiting for the in-flight request to
      // settle. The `finally` would eventually do it, but on a redirect-heavy
      // path (tenantless -> /welcome, no MFA -> /me/security) that can be a
      // visible delay, and `emittedActive` keeps the two from double-firing.
      if (emittedActive) {
        emitRouteRevalidating(false);
        emittedActive = false;
      }
    };
    // pathname triggers re-check on navigation; statusKey on sign-in/out.
  }, [pathname, userId, authLoading, statusKey, navigate, fetchStatus, fetchMfa]);

  // Block render of protected pages while we resolve org status, to avoid a
  // flash of forbidden content before the redirect lands.
  const gated = !authLoading && userId && !isPublic(pathname) && checking;
  if (gated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// Re-export so other callers can keep sanitize logic consistent.
export { sanitizeRedirect };
