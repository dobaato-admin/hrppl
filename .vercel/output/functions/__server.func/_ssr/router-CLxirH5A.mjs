import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, q as queryOptions, u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent, d as useRouterState, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { I as notFound, J as redirect, l as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { a as requireAuthAllowSuspended, r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { c as createTanStackInvokeToolHandler, a as createTanStackOAuthProtectedResourceMetadataHandler, b as createTanStackListToolsHandler, d as createTanStackMcpHandler, e as defineTool, f as defineMcp, g as auth } from "../_libs/lovable.dev__mcp-js.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { v as verifyWebhookRequest, W as WebhookError } from "../_libs/lovable.dev__webhooks-js.mjs";
import { render } from "../_libs/react-email__render.mjs";
import { TEMPLATES } from "./registry-Y5CZHtkF.mjs";
import { s as sendLovableEmail } from "../_libs/lovable.dev__email-js.mjs";
import { createHmac, timingSafeEqual as timingSafeEqual$1 } from "crypto";
import { sendInternalEmail } from "./send-internal.server-9cG3k97B.mjs";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.mjs";
import { distanceMeters } from "./geofences.functions-C8KvPefL.mjs";
import { L as LoaderCircle, P as Paperclip, U as Upload, D as Download, T as Trash2 } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType, D as arrayType, B as enumType, E as recordType, F as anyType, A as booleanType, C as numberType, G as literalType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/jose.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
const appCss = "/assets/styles-_JPAJlk_.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const ROLE_REFRESH_EVENT = "auth:refresh-roles";
const initialState = {
  user: null,
  session: null,
  roles: [],
  loading: true,
  rolesLoaded: false
};
let authState = initialState;
let initialized = false;
let roleRequestId = 0;
let roleRefreshHandler = null;
let unsubscribeAuth = null;
const listeners = /* @__PURE__ */ new Set();
async function fetchRoles(userId) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) {
    console.error("[useAuth] failed to load roles", error);
    return [];
  }
  return (data ?? []).map((row) => row.role);
}
function emit() {
  for (const listener of listeners) listener(authState);
}
function setAuthState(next) {
  authState = { ...authState, ...next };
  emit();
}
async function refreshRoles(nextUserId) {
  const requestId = ++roleRequestId;
  if (!nextUserId) {
    setAuthState({ roles: [], rolesLoaded: true, loading: false });
    return;
  }
  setAuthState({ rolesLoaded: false });
  const nextRoles = await fetchRoles(nextUserId);
  if (requestId !== roleRequestId) return;
  setAuthState({ roles: nextRoles, rolesLoaded: true, loading: false });
}
function ensureAuthStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const failOpen = window.setTimeout(() => {
    setAuthState({ loading: false, rolesLoaded: true });
  }, 4e3);
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    const previousUserId = authState.user?.id ?? null;
    const nextUserId = session?.user?.id ?? null;
    const shouldRefreshRoles = previousUserId !== nextUserId || event === "SIGNED_IN" || event === "USER_UPDATED" || !authState.rolesLoaded;
    setAuthState({ session, user: session?.user ?? null });
    if (!nextUserId) {
      void refreshRoles(null);
      return;
    }
    if (shouldRefreshRoles) {
      window.setTimeout(() => {
        void refreshRoles(nextUserId);
      }, 0);
    } else {
      setAuthState({ loading: false });
    }
  });
  unsubscribeAuth = () => sub.subscription.unsubscribe();
  void supabase.auth.getSession().then(({ data }) => {
    setAuthState({ session: data.session, user: data.session?.user ?? null });
    void refreshRoles(data.session?.user?.id ?? null);
  }).finally(() => {
    window.clearTimeout(failOpen);
    if (!authState.rolesLoaded) {
      setAuthState({ loading: false });
    }
  });
  roleRefreshHandler = () => {
    void refreshRoles(authState.user?.id ?? null);
  };
  window.addEventListener(ROLE_REFRESH_EVENT, roleRefreshHandler);
}
function requestRoleRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROLE_REFRESH_EVENT));
  }
}
function useAuth() {
  const [state, setState] = reactExports.useState(authState);
  reactExports.useEffect(() => {
    ensureAuthStore();
    setState(authState);
    const listener = (next) => setState(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        if (roleRefreshHandler) window.removeEventListener(ROLE_REFRESH_EVENT, roleRefreshHandler);
        unsubscribeAuth?.();
        roleRefreshHandler = null;
        unsubscribeAuth = null;
        initialized = false;
      }
    };
  }, []);
  return state;
}
const getMyOrgStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7c8c04f9b97e895f756963cd8788d397e8eeafd37caf3f9dce935c4d2ad87b85"));
const getMyGateStatus = createServerFn({
  method: "GET"
}).middleware([requireAuthAllowSuspended]).handler(createSsrRpc("f4cf7e338edff3096390043e75330342e0cf10216d426c1abef0a029bd7af291"));
const createOrgSchema = objectType({
  name: stringType().trim().min(2).max(120),
  legal_name: stringType().trim().max(160).optional().or(literalType("")),
  primary_contact_name: stringType().trim().max(160).optional().or(literalType("")),
  country_code: stringType().trim().length(2),
  contact_email: stringType().trim().email().max(255),
  contact_phone: stringType().trim().max(40).optional().or(literalType("")),
  address_line1: stringType().trim().max(160).optional().or(literalType("")),
  address_line2: stringType().trim().max(160).optional().or(literalType("")),
  city: stringType().trim().max(120).optional().or(literalType("")),
  region: stringType().trim().max(120).optional().or(literalType("")),
  postal_code: stringType().trim().max(32).optional().or(literalType("")),
  website: stringType().trim().max(255).optional().or(literalType("")),
  tagline: stringType().trim().max(160).optional().or(literalType("")),
  registration_number: stringType().trim().max(80).optional().or(literalType("")),
  tax_id_number: stringType().trim().max(80).optional().or(literalType("")),
  owner_job_title: stringType().trim().max(120).optional().or(literalType(""))
});
const createOrganization = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => createOrgSchema.parse(data)).handler(createSsrRpc("ade327610be33474957676510b7908c27c6c147b972fefc9c429006a6113bbf2"));
const stepSchema = objectType({
  step: enumType(["details", "branding", "departments", "defaults", "invites"])
});
const updateOrgProfileSchema = objectType({
  legal_name: stringType().trim().max(160).optional().or(literalType("")),
  primary_contact_name: stringType().trim().max(160).optional().or(literalType("")),
  contact_phone: stringType().trim().max(40).optional().or(literalType("")),
  address_line1: stringType().trim().max(160).optional().or(literalType("")),
  address_line2: stringType().trim().max(160).optional().or(literalType("")),
  city: stringType().trim().max(120).optional().or(literalType("")),
  region: stringType().trim().max(120).optional().or(literalType("")),
  postal_code: stringType().trim().max(32).optional().or(literalType("")),
  website: stringType().trim().max(255).optional().or(literalType("")),
  tagline: stringType().trim().max(160).optional().or(literalType("")),
  registration_number: stringType().trim().max(80).optional().or(literalType("")),
  tax_id_number: stringType().trim().max(80).optional().or(literalType(""))
});
const updateOrganizationProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => updateOrgProfileSchema.parse(data)).handler(createSsrRpc("3ccb4e88c8f860d7f444773904575501cc69be2a14778af5e01fc030d3795a60"));
const markSetupStep = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => stepSchema.parse(data)).handler(createSsrRpc("937c92ae7566598ba1ab50fa0dbfcd444ac89df6cfd14f6e7b9874440f38c54c"));
const seedSchema = objectType({
  departments: arrayType(stringType().trim().min(1).max(80)).max(20).default(["Operations", "Engineering", "People"]),
  withLeaveTypes: booleanType().default(true)
});
const seedOrgDefaults = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => seedSchema.parse(data)).handler(createSsrRpc("08807eaea5098b595bd997b9687cbd4994ba7d625aecf537fd7a4c553d5e53c5"));
const resetMyOrgSetup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ca815b6f41830c534cf0bf8dcf97cf99d787bae94b7d8ba7d561fefc3717ed3c"));
const getMfaStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d0006175a4e9d4f0d33a0a73a987fa1293ea7bc56387c8a8db9488c0d7d5cef5"));
const startEmailMfa = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  purpose: enumType(["enroll", "login"])
}).parse(input)).handler(createSsrRpc("ccb3fc392e3f62f117512375633491672440415e51b57e05c58789c916ea85da"));
const verifyEmailMfa = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  purpose: enumType(["enroll", "login"]),
  code: stringType().regex(/^\d{6}$/)
}).parse(input)).handler(createSsrRpc("89ef84d1b03da127c5ea648832c30daef92635551353c45f0cf39583ff126f1d"));
const setTotpEnrolled = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("190e8a7bfd793c4778792abe5fd4c30440a216e1f5236671476bc9b341a39dd4"));
const KEY = "hrppl.mfa.verifiedAt";
const MFA_STATUS_EVENT = "hrppl:mfa-status-changed";
function emitChange() {
  try {
    window.dispatchEvent(new CustomEvent(MFA_STATUS_EVENT));
  } catch {
  }
}
function setMfaSessionVerified() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
  }
  emitChange();
}
function clearMfaSessionVerified() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
  }
  emitChange();
}
function notifyMfaStatusChanged() {
  emitChange();
}
function isMfaSessionVerified() {
  try {
    const v = sessionStorage.getItem(KEY);
    return !!v;
  } catch {
    return false;
  }
}
const mfaSession = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MFA_STATUS_EVENT,
  clearMfaSessionVerified,
  isMfaSessionVerified,
  notifyMfaStatusChanged,
  setMfaSessionVerified
}, Symbol.toStringTag, { value: "Module" }));
const MAX = 50;
const perfBus = {
  navs: [],
  gates: [],
  renders: /* @__PURE__ */ new Map(),
  listeners: /* @__PURE__ */ new Set(),
  recordNav(sample) {
    this.navs.unshift(sample);
    if (this.navs.length > MAX) this.navs.length = MAX;
    this.emit();
  },
  recordGate(sample) {
    this.gates.unshift(sample);
    if (this.gates.length > MAX) this.gates.length = MAX;
    this.emit();
  },
  bumpRender(path) {
    this.renders.set(path, (this.renders.get(path) ?? 0) + 1);
    this.emit();
  },
  clear() {
    this.navs = [];
    this.gates = [];
    this.renders.clear();
    this.emit();
  },
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  emit() {
    this.listeners.forEach((fn) => fn());
  }
};
if (typeof window !== "undefined") {
  window.__hrpplPerfBus = perfBus;
}
const ROUTE_REVALIDATING_EVENT = "hrppl:route-revalidating";
const SHOW_DELAY_MS = 180;
const MAX_VISIBLE_MS = 15e3;
const LINGER_MS = 200;
function RouteLoadingBar() {
  const routerStatus = useRouterState({ select: (s) => s.status });
  const isPending = routerStatus === "pending";
  const [externalWanted, setExternalWanted] = reactExports.useState(false);
  const [visible, setVisible] = reactExports.useState(false);
  const lingerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handler = (e) => {
      const detail = e.detail;
      if (detail?.active) {
        if (lingerRef.current) {
          window.clearTimeout(lingerRef.current);
          lingerRef.current = null;
        }
        setExternalWanted(true);
      } else {
        if (lingerRef.current) window.clearTimeout(lingerRef.current);
        lingerRef.current = window.setTimeout(() => setExternalWanted(false), LINGER_MS);
      }
    };
    window.addEventListener(ROUTE_REVALIDATING_EVENT, handler);
    return () => {
      window.removeEventListener(ROUTE_REVALIDATING_EVENT, handler);
      if (lingerRef.current) window.clearTimeout(lingerRef.current);
    };
  }, []);
  const wanted = isPending || externalWanted;
  reactExports.useEffect(() => {
    if (!wanted) {
      setVisible(false);
      return;
    }
    const show = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    const cap = window.setTimeout(() => setVisible(false), SHOW_DELAY_MS + MAX_VISIBLE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(cap);
    };
  }, [wanted]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-testid": "route-loading-bar",
      "aria-hidden": true,
      className: "fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-1/3 animate-[routeloading_1.1s_ease-in-out_infinite] bg-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes routeloading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(320%); }
        }
      ` })
      ]
    }
  );
}
function emitRouteRevalidating(active) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ROUTE_REVALIDATING_EVENT, { detail: { active } })
  );
}
const STATUS_CACHE_MS = 2 * 6e4;
const ORG_STATUS_EVENT = "hrppl:org-status-changed";
const statusCache = /* @__PURE__ */ new Map();
const mfaCache = /* @__PURE__ */ new Map();
function getFreshCache(cache, key) {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.fetchedAt > STATUS_CACHE_MS) return null;
  return hit.status;
}
const PUBLIC_EXACT = /* @__PURE__ */ new Set([
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
  "/dev-session"
]);
const PUBLIC_PREFIX = [
  "/invite/",
  "/careers",
  "/sign/",
  "/email/",
  "/api/",
  "/lovable/",
  "/blog"
];
const TENANTLESS_ALLOWED = /* @__PURE__ */ new Set(["/welcome", "/org/setup"]);
const MFA_ALLOWED = /* @__PURE__ */ new Set(["/me/security", "/auth", "/signup", "/forgot-password", "/reset-password"]);
const SUSPENDED_ROUTE = "/suspended";
const DEV_MFA_BYPASS = false;
function isPublic(pathname) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p));
}
function sanitizeRedirect$2(p) {
  if (!p.startsWith("/") || p.startsWith("//")) return "/dashboard";
  if (p === "/auth" || p === "/signup") return "/dashboard";
  return p;
}
function requestOrgStatusRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ORG_STATUS_EVENT));
}
function AuthRouteGate({ children }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const fetchStatus = useServerFn(getMyGateStatus);
  const fetchMfa = useServerFn(getMfaStatus);
  const [checking, setChecking] = reactExports.useState(false);
  const [statusKey, setStatusKey] = reactExports.useState(0);
  const lastUserId = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (userId !== lastUserId.current) {
      lastUserId.current = userId;
      setStatusKey((k) => k + 1);
    }
  }, [userId]);
  reactExports.useEffect(() => {
    const handler = () => {
      if (lastUserId.current) mfaCache.delete(lastUserId.current);
      setStatusKey((k) => k + 1);
    };
    window.addEventListener(MFA_STATUS_EVENT, handler);
    return () => window.removeEventListener(MFA_STATUS_EVENT, handler);
  }, []);
  reactExports.useEffect(() => {
    const handler = () => {
      if (lastUserId.current) statusCache.delete(lastUserId.current);
      setStatusKey((k) => k + 1);
    };
    window.addEventListener(ORG_STATUS_EVENT, handler);
    return () => window.removeEventListener(ORG_STATUS_EVENT, handler);
  }, []);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (isPublic(pathname)) {
      setChecking(false);
      return;
    }
    if (!userId) {
      navigate({
        to: "/auth",
        search: { redirect: pathname === "/auth" ? "/dashboard" : pathname }
      });
      return;
    }
    let cancelled = false;
    const cachedStatus = getFreshCache(statusCache, userId);
    const cachedMfa = getFreshCache(mfaCache, userId);
    const fullyCached = !!cachedStatus && (MFA_ALLOWED.has(pathname) || !!cachedMfa);
    setChecking(!cachedStatus || !MFA_ALLOWED.has(pathname) && !cachedMfa);
    let emittedActive = false;
    if (fullyCached) {
      emitRouteRevalidating(true);
      emittedActive = true;
    }
    const startedAt = performance.now();
    (async () => {
      try {
        const status = cachedStatus ?? await fetchStatus();
        if (cancelled) return;
        if (!cachedStatus) statusCache.set(userId, { status, fetchedAt: Date.now() });
        if (status.suspended) {
          if (pathname !== SUSPENDED_ROUTE) {
            navigate({ to: SUSPENDED_ROUTE });
            return;
          }
          return;
        }
        if (pathname === SUSPENDED_ROUTE) {
          navigate({ to: "/dashboard" });
          return;
        }
        const hasTenant = !!status.tenantId;
        const setupDone = !!status.setupCompleted;
        const roles = status.roles ?? [];
        const isOrgAdmin = roles.includes("org_admin");
        const isPlatformAdmin = roles.includes("super_admin") || roles.includes("regional_admin");
        if (isPlatformAdmin) {
        } else if (!hasTenant) {
          if (status.pendingTrialInvitation) {
            if (pathname !== "/org/setup") {
              navigate({ to: "/org/setup" });
              return;
            }
            return;
          }
          if (!TENANTLESS_ALLOWED.has(pathname)) {
            navigate({ to: "/welcome" });
            return;
          }
          return;
        } else if (isOrgAdmin && !setupDone) {
          if (pathname !== "/org/setup") {
            navigate({ to: "/org/setup" });
            return;
          }
          return;
        }
        if (DEV_MFA_BYPASS) ;
        if (!MFA_ALLOWED.has(pathname) && !DEV_MFA_BYPASS) {
          const mfa = cachedMfa ?? await fetchMfa();
          if (cancelled) return;
          if (!cachedMfa) mfaCache.set(userId, { status: mfa, fetchedAt: Date.now() });
          if (!mfa.method) {
            navigate({ to: "/me/security", search: { redirect: pathname } });
            return;
          }
          if (!isMfaSessionVerified()) {
            navigate({ to: "/me/security", search: { redirect: pathname } });
            return;
          }
        }
      } catch (err) {
        console.error("[AuthRouteGate] org status check failed", err);
      } finally {
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
            cached: fullyCached
          });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (emittedActive) {
        emitRouteRevalidating(false);
        emittedActive = false;
      }
    };
  }, [pathname, userId, authLoading, statusKey, navigate, fetchStatus, fetchMfa]);
  const gated = !authLoading && userId && !isPublic(pathname) && checking;
  if (gated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$32 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "hrppl — Global HRMS & Payroll Platform" },
      { name: "description", content: "hrppl is the modern global HRMS, payroll and practice management platform. Multi-country payroll, compliant payslips, performance reviews and a full developer API for finance and HR teams worldwide." },
      { name: "keywords", content: "global payroll, HRMS, HRIS, multi-country payroll, payroll software, HR platform, practice management, payroll API, international HR" },
      { name: "author", content: "hrppl" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { property: "og:description", content: "Run multi-country payroll, HR and compliance from one platform. Built for global finance and HR teams." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "hrppl" },
      { property: "og:url", content: "https://hrppl.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { name: "twitter:description", content: "Run multi-country payroll, HR and compliance from one platform." }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap"
      }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "hrppl",
          url: "https://hrppl.io",
          logo: "https://hrppl.io/favicon.ico",
          description: "Global HRMS, payroll and practice management platform.",
          sameAs: ["https://hrppl.io"]
        })
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "hrppl",
          url: "https://hrppl.io",
          inLanguage: "en",
          publisher: { "@type": "Organization", name: "hrppl", url: "https://hrppl.io" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://hrppl.io/blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$32.useRouteContext();
  const router2 = useRouter();
  reactExports.useEffect(() => {
    let start = performance.now();
    let path = typeof window !== "undefined" ? window.location.pathname : "/";
    const unsubBefore = router2.subscribe("onBeforeNavigate", (e) => {
      start = performance.now();
      path = e?.toLocation?.pathname ?? path;
    });
    const unsubResolved = router2.subscribe("onResolved", () => {
      perfBus.recordNav({
        id: path,
        path,
        ms: Math.round(performance.now() - start),
        at: Date.now()
      });
    });
    return () => {
      unsubBefore?.();
      unsubResolved?.();
    };
  }, [router2]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoadingBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthRouteGate, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})
  ] });
}
const $$splitComponentImporter$2t = () => import("./welcome-BKhcjQVK.mjs");
const Route$31 = createFileRoute("/welcome")({
  head: () => ({
    meta: [{
      title: "Welcome — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2t, "component")
});
const $$splitComponentImporter$2s = () => import("./unsubscribe-DHK06RPr.mjs");
const Route$30 = createFileRoute("/unsubscribe")({
  validateSearch: objectType({
    token: stringType().optional()
  }),
  component: lazyRouteComponent($$splitComponentImporter$2s, "component")
});
const $$splitComponentImporter$2r = () => import("./terms-CT0upT0S.mjs");
const TITLE$3 = "Terms of Service — hrppl";
const DESCRIPTION$3 = "The terms that govern your use of hrppl's global HRMS, payroll and practice management platform.";
const URL$4 = "https://hrppl.io/terms";
const Route$2$ = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: TITLE$3
    }, {
      name: "description",
      content: DESCRIPTION$3
    }, {
      property: "og:title",
      content: TITLE$3
    }, {
      property: "og:description",
      content: DESCRIPTION$3
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: URL$4
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: TITLE$3
    }, {
      name: "twitter:description",
      content: DESCRIPTION$3
    }],
    links: [{
      rel: "canonical",
      href: URL$4
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2r, "component")
});
const $$splitComponentImporter$2q = () => import("./team-B1phDD1k.mjs");
const Route$2_ = createFileRoute("/team")({
  head: () => ({
    meta: [{
      title: "Dashboard — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2q, "component")
});
const $$splitComponentImporter$2p = () => import("./suspended-CDtrYcgb.mjs");
const Route$2Z = createFileRoute("/suspended")({
  head: () => ({
    meta: [{
      title: "Account suspended — hrppl"
    }, {
      name: "robots",
      content: "noindex, nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2p, "component")
});
const BASE_URL = "https://hrppl.io";
const Route$2Y = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/pricing", changefreq: "monthly", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/careers", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/help", changefreq: "monthly", priority: "0.6" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$2o = () => import("./signup-DMDGTtq4.mjs");
objectType({
  fullName: stringType().min(2, "Full name must be at least 2 characters").max(100, "Full name must be under 100 characters"),
  email: stringType().min(1, "Email is required").email("Please enter a valid email address"),
  password: stringType().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: stringType().min(1, "Please confirm your password"),
  agreeTerms: booleanType().refine((v) => v === true, {
    message: "You must agree to the Terms of Service and Privacy Policy"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
function sanitizeRedirect$1(raw) {
  if (typeof raw !== "string") return void 0;
  if (!raw.startsWith("/") || raw.startsWith("//")) return void 0;
  return raw;
}
const Route$2X = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Sign up — hrppl"
    }, {
      name: "description",
      content: "Create an hrppl account to run global HR, payroll and practice management from one platform."
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }, {
      property: "og:title",
      content: "Sign up — hrppl"
    }, {
      property: "og:description",
      content: "Create your hrppl account."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://hrppl.io/signup"
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io/signup"
    }]
  }),
  validateSearch: (search) => {
    const r = sanitizeRedirect$1(search.redirect);
    return r ? {
      redirect: r
    } : {};
  },
  component: lazyRouteComponent($$splitComponentImporter$2o, "component")
});
const $$splitComponentImporter$2n = () => import("./reset-password-DBxvr-mt.mjs");
const Route$2W = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset Password — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2n, "component")
});
const $$splitComponentImporter$2m = () => import("./regional-BxoaAL2I.mjs");
const Route$2V = createFileRoute("/regional")({
  head: () => ({
    meta: [{
      title: "Regional Admin — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2m, "component")
});
const $$splitComponentImporter$2l = () => import("./recognition-CpVH90Yr.mjs");
const Route$2U = createFileRoute("/recognition")({
  head: () => ({
    meta: [{
      title: "Recognition — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2l, "component")
});
const $$splitComponentImporter$2k = () => import("./privacy-CV909v8B.mjs");
const TITLE$2 = "Privacy Policy — hrppl";
const DESCRIPTION$2 = "How hrppl collects, uses and protects personal data across our global HRMS, payroll and practice management platform.";
const URL$3 = "https://hrppl.io/privacy";
const Route$2T = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: TITLE$2
    }, {
      name: "description",
      content: DESCRIPTION$2
    }, {
      property: "og:title",
      content: TITLE$2
    }, {
      property: "og:description",
      content: DESCRIPTION$2
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: URL$3
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: TITLE$2
    }, {
      name: "twitter:description",
      content: DESCRIPTION$2
    }],
    links: [{
      rel: "canonical",
      href: URL$3
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2k, "component")
});
const $$splitComponentImporter$2j = () => import("./pricing-BmsYYB2p.mjs");
const TITLE$1 = "Pricing — hrppl Global HRMS & Payroll";
const DESCRIPTION$1 = "Simple, transparent pricing for hrppl. Multi-country payroll, HRMS and practice management with per-employee plans for teams of every size.";
const URL$2 = "https://hrppl.io/pricing";
const Route$2S = createFileRoute("/pricing")({
  head: () => ({
    meta: [{
      title: TITLE$1
    }, {
      name: "description",
      content: DESCRIPTION$1
    }, {
      property: "og:title",
      content: TITLE$1
    }, {
      property: "og:description",
      content: DESCRIPTION$1
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: URL$2
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: TITLE$1
    }, {
      name: "twitter:description",
      content: DESCRIPTION$1
    }],
    links: [{
      rel: "canonical",
      href: URL$2
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2j, "component")
});
const $$splitComponentImporter$2i = () => import("./performance-DZMbmRss.mjs");
const Route$2R = createFileRoute("/performance")({
  head: () => ({
    meta: [{
      title: "My performance — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2i, "component")
});
const $$splitComponentImporter$2h = () => import("./org-CGjN7viZ.mjs");
const Route$2Q = createFileRoute("/org")({
  component: lazyRouteComponent($$splitComponentImporter$2h, "component")
});
const $$splitComponentImporter$2g = () => import("./notifications-PZNDlKZp.mjs");
const Route$2P = createFileRoute("/notifications")({
  head: () => ({
    meta: [{
      title: "Notifications — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2g, "component")
});
const $$splitComponentImporter$2f = () => import("./my-payslips-cAw94lMv.mjs");
const Route$2O = createFileRoute("/my-payslips")({
  head: () => ({
    meta: [{
      title: "My payslips — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2f, "component")
});
const $$splitComponentImporter$2e = () => import("./me-DDorMb9j.mjs");
const Route$2N = createFileRoute("/me")({
  head: () => ({
    meta: [{
      title: "Me — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2e, "component")
});
function supabaseForUser$2(ctx) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
const listEmployeesTool = defineTool({
  name: "list_employees",
  title: "List employees",
  description: "List employees in the signed-in user's organisation. Returns id, full name, email, status, and department for up to `limit` employees (default 50, max 200).",
  inputSchema: {
    limit: numberType().int().min(1).max(200).optional().describe("Max rows to return. Defaults to 50."),
    search: stringType().trim().min(1).optional().describe("Optional case-insensitive filter matched against full name or email.")
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase2 = supabaseForUser$2(ctx);
    const { data: auth2 } = await supabase2.auth.getUser();
    const userId = auth2?.user?.id;
    if (!userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data: profile } = await supabase2.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    const tenantId = profile?.tenant_id;
    if (!tenantId) {
      return {
        content: [{ type: "text", text: "Your account is not attached to an organisation." }],
        structuredContent: { employees: [] }
      };
    }
    let query = supabase2.from("employees").select("id, first_name, last_name, email, status, department_id").eq("tenant_id", tenantId).order("first_name", { ascending: true }).limit(limit ?? 50);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const employees = (data ?? []).map((e) => ({
      ...e,
      full_name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(employees, null, 2) }],
      structuredContent: { employees }
    };
  }
});
function supabaseForUser$1(ctx) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
const listPendingExpensesTool = defineTool({
  name: "list_pending_expense_claims",
  title: "List pending expense claims",
  description: "List submitted expense claims awaiting approval in the signed-in user's organisation. Returns id, employee id, title, amount, currency, and submitted date.",
  inputSchema: {
    limit: numberType().int().min(1).max(200).optional().describe("Max rows to return. Defaults to 50.")
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase2 = supabaseForUser$1(ctx);
    const { data, error } = await supabase2.from("expense_claims").select("id, employee_id, title, amount, currency, status, submitted_at").eq("status", "submitted").order("submitted_at", { ascending: true }).limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { expense_claims: data ?? [] }
    };
  }
});
function supabaseForUser(ctx) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
const listPendingLeaveTool = defineTool({
  name: "list_pending_leave_requests",
  title: "List pending leave requests",
  description: "List leave requests awaiting approval in the signed-in user's organisation. Returns request id, employee id, leave type, start/end dates, days, and reason.",
  inputSchema: {
    limit: numberType().int().min(1).max(200).optional().describe("Max rows to return. Defaults to 50.")
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase2 = supabaseForUser(ctx);
    const { data, error } = await supabase2.from("leave_requests").select("id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status").eq("status", "pending").order("start_date", { ascending: true }).limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leave_requests: data ?? [] }
    };
  }
});
const whoamiTool = defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Return the signed-in user's id and email as recognised by hrppl. Use to verify connectivity and confirm the active account before calling other tools.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const info = {
      user_id: ctx.getUserId(),
      email: ctx.getUserEmail(),
      client_id: ctx.getClientId()
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info
    };
  }
});
const projectRef = "xnrjfrxzahmfdrqfsnnq";
const mcp = defineMcp({
  name: "hrppl-mcp",
  title: "hrppl",
  version: "0.1.0",
  instructions: "Tools for hrppl (HRMS & Payroll). Callers act as the signed-in hrppl user; all data access is scoped by the user's organisation via row-level security. Use `whoami` to verify connectivity, then `list_employees`, `list_pending_leave_requests`, or `list_pending_expense_claims`.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated"
  }),
  tools: [whoamiTool, listEmployeesTool, listPendingLeaveTool, listPendingExpensesTool]
});
const Route$2M = createFileRoute("/mcp")({
  server: {
    handlers: {
      ANY: createTanStackMcpHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const $$splitComponentImporter$2d = () => import("./leave-DEAGKxvB.mjs");
const Route$2L = createFileRoute("/leave")({
  head: () => ({
    meta: [{
      title: "My leave — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2d, "component")
});
const $$splitComponentImporter$2c = () => import("./forgot-password-DoVZEk8n.mjs");
const Route$2K = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Forgot password — hrppl"
    }, {
      name: "description",
      content: "Reset your hrppl account password."
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }, {
      property: "og:title",
      content: "Forgot password — hrppl"
    }, {
      property: "og:description",
      content: "Reset your hrppl account password."
    }, {
      property: "og:url",
      content: "https://hrppl.io/forgot-password"
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io/forgot-password"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2c, "component")
});
const $$splitComponentImporter$2b = () => import("./developers-Ctlhz5Ob.mjs");
const Route$2J = createFileRoute("/developers")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw redirect({
      to: "/auth"
    });
    const {
      data: roles
    } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isSuper = (roles ?? []).some((r) => r.role === "super_admin");
    if (!isSuper) throw redirect({
      to: "/dashboard"
    });
  },
  head: () => ({
    meta: [{
      title: "Developer Portal — hrppl API"
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2b, "component")
});
const $$splitComponentImporter$2a = () => import("./dev-session-C3qUMD-j.mjs");
const Route$2I = createFileRoute("/dev-session")({
  head: () => ({
    meta: [{
      title: "Import session (dev) — hrppl"
    }, {
      name: "robots",
      content: "noindex, nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2a, "component")
});
const $$splitComponentImporter$29 = () => import("./dashboard-lh8bB_3H.mjs");
const Route$2H = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "hrppl Dashboard — your workspace"
    }, {
      name: "description",
      content: "Your hrppl workspace dashboard: leave, timesheets, reviews, payslips and admin tiles at a glance."
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }, {
      property: "og:title",
      content: "hrppl Dashboard"
    }, {
      property: "og:description",
      content: "Your hrppl workspace at a glance."
    }, {
      property: "og:url",
      content: "https://hrppl.io/dashboard"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
const $$splitComponentImporter$28 = () => import("./contact-kJGebIhg.mjs");
const TITLE = "Contact hrppl — Sales & Support";
const DESCRIPTION = "Get in touch with the hrppl team. Talk to sales about global payroll, ask product questions, or reach support.";
const URL$1 = "https://hrppl.io/contact";
const Route$2G = createFileRoute("/contact")({
  head: () => ({
    meta: [{
      title: TITLE
    }, {
      name: "description",
      content: DESCRIPTION
    }, {
      property: "og:title",
      content: TITLE
    }, {
      property: "og:description",
      content: DESCRIPTION
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: URL$1
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: TITLE
    }, {
      name: "twitter:description",
      content: DESCRIPTION
    }],
    links: [{
      rel: "canonical",
      href: URL$1
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
const $$splitComponentImporter$27 = () => import("./auth-Fv35fpzz.mjs");
function sanitizeRedirect(raw) {
  if (typeof raw !== "string") return void 0;
  if (!raw.startsWith("/") || raw.startsWith("//")) return void 0;
  return raw;
}
const Route$2F = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Sign in — hrppl"
    }, {
      name: "description",
      content: "Sign in to your hrppl workspace, or create a new account to start running global payroll and HR."
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }, {
      property: "og:title",
      content: "Sign in — hrppl"
    }, {
      property: "og:description",
      content: "Sign in to hrppl, the global HRMS and payroll platform."
    }, {
      property: "og:url",
      content: "https://hrppl.io/auth"
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io/auth"
    }]
  }),
  validateSearch: (search) => {
    const r = sanitizeRedirect(search.redirect);
    return r ? {
      redirect: r
    } : {};
  },
  component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
const $$splitComponentImporter$26 = () => import("./attendance-C-GMumF8.mjs");
const Route$2E = createFileRoute("/attendance")({
  head: () => ({
    meta: [{
      title: "My attendance — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
const $$splitComponentImporter$25 = () => import("./admin-CChAcs_3.mjs");
const Route$2D = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
const $$splitComponentImporter$24 = () => import("./index-VhJn5bsf.mjs");
const Route$2C = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "hrppl — Global HRMS, Payroll & Practice Management Platform"
    }, {
      name: "description",
      content: "Run global HR, multi-country payroll, performance, time and invoicing from one platform. hrppl gives finance and HR teams compliant payslips, white-label practice management and a full API in 40+ countries."
    }, {
      name: "keywords",
      content: "global payroll, HRMS, multi-country payroll, payroll software, HR platform, practice management, payroll API, payslip software, international HR, HRIS"
    }, {
      property: "og:title",
      content: "hrppl — Global HRMS & Payroll Platform"
    }, {
      property: "og:description",
      content: "Multi-country payroll, HR, performance and practice management. Built for global finance and HR teams."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://hrppl.io"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: "hrppl — Global HRMS & Payroll Platform"
    }, {
      name: "twitter:description",
      content: "Multi-country payroll, HR, performance and practice management."
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io"
    }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "hrppl",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "Global HRMS, payroll and practice management platform for finance and HR teams.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "128"
        }
      })
    }, {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [{
          "@type": "Question",
          name: "Which countries does hrppl support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "hrppl supports payroll, leave and compliance rules across 40+ countries with locale-aware payslips, tax codes, overtime and holiday calendars."
          }
        }, {
          "@type": "Question",
          name: "Is there an API?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Every UI action has a matching REST endpoint, with OAuth 2.0, signed webhooks, SCIM 2.0 and an OpenAPI 3.1 spec."
          }
        }, {
          "@type": "Question",
          name: "Can accountants and outsourced HR firms white-label hrppl?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Practice firms get clients, projects, jobs, time tracking and invoicing under their own brand and custom domain."
          }
        }]
      })
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
const $$splitComponentImporter$23 = () => import("./org.index-DALAYPr3.mjs");
const Route$2B = createFileRoute("/org/")({
  head: () => ({
    meta: [{
      title: "Organization — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
const $$splitComponentImporter$22 = () => import("./onboarding.index-8IQeCeL1.mjs");
const Route$2A = createFileRoute("/onboarding/")({
  head: () => ({
    meta: [{
      title: "Onboarding — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
const $$splitComponentImporter$21 = () => import("./me.index-CdDmYRsM.mjs");
const Route$2z = createFileRoute("/me/")({
  head: () => ({
    meta: [{
      title: "Me — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
const $$splitComponentImporter$20 = () => import("./help.index-BsvseT67.mjs");
const Route$2y = createFileRoute("/help/")({
  component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
const $$splitComponentImporter$1$ = () => import("./careers.index-BFR_zyMP.mjs");
const Route$2x = createFileRoute("/careers/")({
  head: () => ({
    meta: [{
      title: "Careers — hrppl"
    }, {
      name: "description",
      content: "Open roles at hrppl. Help build the global HRMS and payroll platform finance and HR teams rely on."
    }, {
      property: "og:title",
      content: "Careers — hrppl"
    }, {
      property: "og:description",
      content: "Browse and apply to open positions at hrppl."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://hrppl.io/careers"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: "Careers — hrppl"
    }, {
      name: "twitter:description",
      content: "Browse and apply to open positions at hrppl."
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io/careers"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1$, "component")
});
const logBlogAccessAttempt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  route: stringType().min(1).max(200),
  reason: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("433e258188ae53b7c0191d5fbb7b72126ecd201401245dd282f544da490a0dbb"));
const PostInput = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  slug: stringType().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: stringType().max(400).optional().nullable(),
  content_md: stringType().max(2e5).default(""),
  cover_image_url: stringType().url().max(2048).optional().nullable(),
  category_id: stringType().uuid().optional().nullable(),
  tags: arrayType(stringType().min(1).max(40)).max(20).default([]),
  status: enumType(["draft", "scheduled", "published", "archived"]).default("draft"),
  scheduled_for: stringType().datetime().optional().nullable(),
  seo_title: stringType().max(200).optional().nullable(),
  seo_description: stringType().max(300).optional().nullable(),
  og_image_url: stringType().url().max(2048).optional().nullable(),
  canonical_url: stringType().url().max(2048).optional().nullable()
});
const listAdminPosts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("eb404470d2144d59004dadac2858374fdd883cb7d710cde218a869f56256b015"));
const getAdminPost = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("cc5d62f2c2167ae3fac996611f1c212c9eef4c5bba9e0ccce81cf270a4dd66ab"));
const upsertPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PostInput.parse(d)).handler(createSsrRpc("c79b265bf8b5cbe1e3a96456e7f15d2e1d4776703c5081baca8c3ca84d3396f0"));
const deletePost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3843831164d0def4cb3afbf32fde4fbd1ac8c93e12b37a3c66d852aa39340c0d"));
const listCategories = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8bf11339de321924fac14bfd28030a1559f57319cba9e686b2740d135f6f6e8d"));
const listApiKeys = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("19900ef92794213055c03d7158ef306d2caafe8df9a9ede72d9e25a0e31937d9"));
const createApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(80),
  scopes: arrayType(enumType(["posts:read", "posts:write", "posts:publish"])).min(1).default(["posts:read", "posts:write"])
}).parse(d)).handler(createSsrRpc("adaf7648ff4e7d59d5ca8f8f77a420f2d2e4d24a9d3fd04db29ea02e0d718588"));
const revokeApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("71826642922ceb648aa25339e920a6c0d827957ba66820f0645dfa4be1a67c68"));
const listWebhooks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("34a83ed382ea82139d2bf1bd77c067a1e6916f647f9cd8bd2830970e7286a28d"));
const upsertWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(80),
  url: stringType().url().max(2048),
  events: arrayType(enumType(["post.published", "post.updated", "post.deleted"])).min(1),
  active: booleanType().default(true)
}).parse(d)).handler(createSsrRpc("2015f29c65cc7436d5792ee2e6e64c8afbe308bbd909a53777cc99fe11f74a5c"));
const deleteWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("deeb97f5c1e0d576dcb574454d69c9ac9dcdcac04ff39c767c44a29a8af7c5bc"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ca45231f5b6d9bbb28cdec444aff051557b9bfa47ac9e618adf8b43795dae463"));
const listPublishedPosts = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  limit: numberType().min(1).max(50).default(20),
  category: stringType().min(1).max(60).optional(),
  tag: stringType().min(1).max(40).optional()
}).parse(d ?? {})).handler(createSsrRpc("e2cbed737503162e46e2ab3f882490859e69491c19f9c07d7dd3510044f18adc"));
const getPublishedPost = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("5e47b6b5462336cd213aaf587762c19db3f76ae26cbad921e5799a17bbfd9e41"));
const postsQuery = (s) => queryOptions({
  queryKey: ["blog", "posts", s],
  queryFn: () => listPublishedPosts({
    data: {
      limit: 24,
      category: s.category,
      tag: s.tag
    }
  })
});
const $$splitComponentImporter$1_ = () => import("./blog.index-apN2R_xv.mjs");
const $$splitErrorComponentImporter$g = () => import("./blog.index-DEYR3D1V.mjs");
const Route$2w = createFileRoute("/blog/")({
  validateSearch: (s) => ({
    category: typeof s.category === "string" ? s.category : void 0,
    tag: typeof s.tag === "string" ? s.tag : void 0
  }),
  loaderDeps: ({
    search
  }) => search,
  loader: ({
    context,
    deps
  }) => context.queryClient.ensureQueryData(postsQuery(deps)),
  head: () => ({
    meta: [{
      title: "Blog — hrppl"
    }, {
      name: "description",
      content: "Insights on global payroll, HR strategy, and product updates from the hrppl team."
    }, {
      property: "og:title",
      content: "hrppl Blog — Global Payroll & HR Insights"
    }, {
      property: "og:description",
      content: "Articles, guides and product updates from hrppl."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://hrppl.io/blog"
    }],
    links: [{
      rel: "canonical",
      href: "https://hrppl.io/blog"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$g, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$1_, "component")
});
const $$splitComponentImporter$1Z = () => import("./admin.index-fSG_5V6V.mjs");
const Route$2v = createFileRoute("/admin/")({
  head: () => ({
    meta: [{
      title: "Super Admin — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1Z, "component")
});
const $$splitComponentImporter$1Y = () => import("./sign._envelopeId-B6dymln6.mjs");
const Route$2u = createFileRoute("/sign/$envelopeId")({
  head: () => ({
    meta: [{
      title: "Sign document — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1Y, "component")
});
const $$splitComponentImporter$1X = () => import("./settings.profile-FLh8Y9bo.mjs");
const Route$2t = createFileRoute("/settings/profile")({
  head: () => ({
    meta: [{
      title: "Profile — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1X, "component")
});
const $$splitComponentImporter$1W = () => import("./settings.organization-5RgIzfFt.mjs");
const Route$2s = createFileRoute("/settings/organization")({
  head: () => ({
    meta: [{
      title: "Organization settings — hrppl"
    }, {
      name: "description",
      content: "Configure your organization's country, currency, and payroll defaults."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1W, "component")
});
const $$splitComponentImporter$1V = () => import("./settings.notifications-BY9dIrmq.mjs");
const Route$2r = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [{
      title: "Notification Settings — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1V, "component")
});
const $$splitComponentImporter$1U = () => import("./settings.billing-DCfXoHzE.mjs");
const Route$2q = createFileRoute("/settings/billing")({
  head: () => ({
    meta: [{
      title: "Billing & subscription — hrppl"
    }, {
      name: "description",
      content: "Manage your hrppl plan, billing period, and payment history."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1U, "component")
});
const $$splitComponentImporter$1T = () => import("./settings.account-BjAZ5hLH.mjs");
const Route$2p = createFileRoute("/settings/account")({
  head: () => ({
    meta: [{
      title: "Account — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1T, "component")
});
const $$splitComponentImporter$1S = () => import("./practice.time-m4M3GZpO.mjs");
const Route$2o = createFileRoute("/practice/time")({
  head: () => ({
    meta: [{
      title: "Time entries — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1S, "component")
});
const $$splitComponentImporter$1R = () => import("./practice.projects-CCW_baPi.mjs");
const Route$2n = createFileRoute("/practice/projects")({
  head: () => ({
    meta: [{
      title: "Projects — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1R, "component")
});
const $$splitComponentImporter$1Q = () => import("./practice.jobs-CSOt2Q-E.mjs");
const searchSchema = objectType({
  project: stringType().uuid().optional()
});
const Route$2m = createFileRoute("/practice/jobs")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [{
      title: "Jobs — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1Q, "component")
});
const $$splitComponentImporter$1P = () => import("./practice.invoices-CN07HG-F.mjs");
const Route$2l = createFileRoute("/practice/invoices")({
  head: () => ({
    meta: [{
      title: "Invoices — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1P, "component")
});
const $$splitComponentImporter$1O = () => import("./practice.clients-Bcw88bjj.mjs");
const Route$2k = createFileRoute("/practice/clients")({
  head: () => ({
    meta: [{
      title: "Clients — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1O, "component")
});
const $$splitComponentImporter$1N = () => import("./platform.tenants-Ij43TiFl.mjs");
const Route$2j = createFileRoute("/platform/tenants")({
  head: () => ({
    meta: [{
      title: "Tenants — Platform"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1N, "component")
});
const $$splitComponentImporter$1M = () => import("./platform.leads-BWSF079I.mjs");
const Route$2i = createFileRoute("/platform/leads")({
  head: () => ({
    meta: [{
      title: "Leads — hrppl admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1M, "component")
});
const $$splitComponentImporter$1L = () => import("./platform.invitations-C7rviNCW.mjs");
const Route$2h = createFileRoute("/platform/invitations")({
  head: () => ({
    meta: [{
      title: "Org trial invitations — Platform"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1L, "component")
});
const $$splitComponentImporter$1K = () => import("./platform.fx-BpEdEg37.mjs");
const Route$2g = createFileRoute("/platform/fx")({
  head: () => ({
    meta: [{
      title: "FX rates — Platform"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1K, "component")
});
const $$splitComponentImporter$1J = () => import("./org.white-label-PG5fO0xS.mjs");
const Route$2f = createFileRoute("/org/white-label")({
  head: () => ({
    meta: [{
      title: "White-label — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1J, "component")
});
const $$splitComponentImporter$1I = () => import("./org.training-DbNvdIny.mjs");
const Route$2e = createFileRoute("/org/training")({
  head: () => ({
    meta: [{
      title: "Training — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1I, "component")
});
const $$splitComponentImporter$1H = () => import("./org.timesheets-CUeUiKUy.mjs");
const Route$2d = createFileRoute("/org/timesheets")({
  head: () => ({
    meta: [{
      title: "Timesheets — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1H, "component")
});
const $$splitComponentImporter$1G = () => import("./org.timesheet-review-RntUUmUv.mjs");
const Route$2c = createFileRoute("/org/timesheet-review")({
  head: () => ({
    meta: [{
      title: "Timesheet review — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1G, "component")
});
const $$splitComponentImporter$1F = () => import("./org.setup-51s_frwk.mjs");
const Route$2b = createFileRoute("/org/setup")({
  head: () => ({
    meta: [{
      title: "Set up your organization — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1F, "component")
});
const $$splitComponentImporter$1E = () => import("./org.roles-8weSyg_D.mjs");
const Route$2a = createFileRoute("/org/roles")({
  head: () => ({
    meta: [{
      title: "Roles & permissions — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1E, "component")
});
const $$splitComponentImporter$1D = () => import("./org.reports-DjNn5tES.mjs");
const Route$29 = createFileRoute("/org/reports")({
  head: () => ({
    meta: [{
      title: "Reports — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1D, "component")
});
const $$splitComponentImporter$1C = () => import("./org.recruitment-D80Lncos.mjs");
const Route$28 = createFileRoute("/org/recruitment")({
  head: () => ({
    meta: [{
      title: "Recruitment — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1C, "component")
});
const $$splitComponentImporter$1B = () => import("./org.promotions-CrpNVPLc.mjs");
const Route$27 = createFileRoute("/org/promotions")({
  head: () => ({
    meta: [{
      title: "Promotions — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1B, "component")
});
const $$splitComponentImporter$1A = () => import("./org.performance-DF4hSi13.mjs");
const Route$26 = createFileRoute("/org/performance")({
  head: () => ({
    meta: [{
      title: "Performance — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1A, "component")
});
const $$splitComponentImporter$1z = () => import("./org.payroll-DQHX3ZpK.mjs");
const Route$25 = createFileRoute("/org/payroll")({
  head: () => ({
    meta: [{
      title: "Payroll — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1z, "component")
});
const $$splitComponentImporter$1y = () => import("./org.pay-rates-D0kx5_PJ.mjs");
const Route$24 = createFileRoute("/org/pay-rates")({
  head: () => ({
    meta: [{
      title: "Pay rates — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1y, "component")
});
const $$splitComponentImporter$1x = () => import("./org.leave-BTJBuo3A.mjs");
const Route$23 = createFileRoute("/org/leave")({
  head: () => ({
    meta: [{
      title: "Leave management — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1x, "component")
});
const $$splitComponentImporter$1w = () => import("./org.invitations-Db1xZhZG.mjs");
const Route$22 = createFileRoute("/org/invitations")({
  head: () => ({
    meta: [{
      title: "Staff invitations — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1w, "component")
});
const $$splitComponentImporter$1v = () => import("./org.expenses-OzbDwemV.mjs");
const Route$21 = createFileRoute("/org/expenses")({
  head: () => ({
    meta: [{
      title: "Expenses — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1v, "component")
});
const $$splitComponentImporter$1u = () => import("./org.employees-BTYehagQ.mjs");
const Route$20 = createFileRoute("/org/employees")({
  head: () => ({
    meta: [{
      title: "Employees — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1u, "component")
});
const $$splitComponentImporter$1t = () => import("./org.documents-DByVHVS0.mjs");
const Route$1$ = createFileRoute("/org/documents")({
  head: () => ({
    meta: [{
      title: "Documents — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1t, "component")
});
const $$splitComponentImporter$1s = () => import("./org.danger-Ch9sFdnC.mjs");
const Route$1_ = createFileRoute("/org/danger")({
  head: () => ({
    meta: [{
      title: "Danger zone — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1s, "component")
});
const $$splitComponentImporter$1r = () => import("./org.branches-I-Kh6T8h.mjs");
const Route$1Z = createFileRoute("/org/branches")({
  head: () => ({
    meta: [{
      title: "Branches — Organization"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1r, "component")
});
const $$splitComponentImporter$1q = () => import("./org.analytics-CBTYcOFM.mjs");
const Route$1Y = createFileRoute("/org/analytics")({
  head: () => ({
    meta: [{
      title: "Analytics — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1q, "component")
});
const $$splitComponentImporter$1p = () => import("./onboarding.profile-RNFLbtZd.mjs");
const Route$1X = createFileRoute("/onboarding/profile")({
  head: () => ({
    meta: [{
      title: "Complete your profile — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1p, "component")
});
const $$splitComponentImporter$1o = () => import("./me.training-CPjlSgoJ.mjs");
const Route$1W = createFileRoute("/me/training")({
  head: () => ({
    meta: [{
      title: "My training — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1o, "component")
});
const $$splitComponentImporter$1n = () => import("./me.toil-daKDjDlL.mjs");
const Route$1V = createFileRoute("/me/toil")({
  head: () => ({
    meta: [{
      title: "My time in lieu — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1n, "component")
});
const $$splitNotFoundComponentImporter$e = () => import("./me.timeline-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$f = () => import("./me.timeline-Dw_DunTZ.mjs");
const $$splitComponentImporter$1m = () => import("./me.timeline-BdBFXsIT.mjs");
const Route$1U = createFileRoute("/me/timeline")({
  component: lazyRouteComponent($$splitComponentImporter$1m, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$f, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$e, "notFoundComponent")
});
const $$splitComponentImporter$1l = () => import("./me.signatures-C1uPgE14.mjs");
const Route$1T = createFileRoute("/me/signatures")({
  head: () => ({
    meta: [{
      title: "My signatures — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1l, "component")
});
const $$splitComponentImporter$1k = () => import("./me.security-CbZ_D4TQ.mjs");
const Route$1S = createFileRoute("/me/security")({
  // Declared so the router actually parses ?redirect=, and sanitised so this
  // page cannot be used to bounce someone to an arbitrary path. /auth has done
  // this since it was written; this route was reading the raw location instead.
  validateSearch: (search) => {
    const raw = search.redirect;
    if (typeof raw !== "string") return {};
    return {
      redirect: sanitizeRedirect$2(raw)
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1k, "component")
});
const $$splitComponentImporter$1j = () => import("./me.reviews-BndNl0G6.mjs");
const $$splitNotFoundComponentImporter$d = () => import("./me.reviews-BQStBdPb.mjs");
const $$splitErrorComponentImporter$e = () => import("./me.reviews-yz4deNaO.mjs");
const Route$1R = createFileRoute("/me/reviews")({
  head: () => ({
    meta: [{
      title: "My scorecards — WorldPay HRMS"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$e, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$d, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$1j, "component")
});
const $$splitNotFoundComponentImporter$c = () => import("./me.requests-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$d = () => import("./me.requests-DHil1VjB.mjs");
const $$splitComponentImporter$1i = () => import("./me.requests-BJu-N3Rl.mjs");
const Route$1Q = createFileRoute("/me/requests")({
  head: () => ({
    meta: [{
      title: "My requests — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1i, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$d, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$c, "notFoundComponent")
});
const $$splitComponentImporter$1h = () => import("./me.grievances-ikZeiazB.mjs");
const Route$1P = createFileRoute("/me/grievances")({
  head: () => ({
    meta: [{
      title: "My grievances — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1h, "component")
});
const $$splitComponentImporter$1g = () => import("./me.expenses-B4UpIAnI.mjs");
const Route$1O = createFileRoute("/me/expenses")({
  head: () => ({
    meta: [{
      title: "My expenses — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1g, "component")
});
const $$splitComponentImporter$1f = () => import("./me.duty-self-review-ByfpjsE5.mjs");
const Route$1N = createFileRoute("/me/duty-self-review")({
  head: () => ({
    meta: [{
      title: "My duty self-review — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1f, "component")
});
const $$splitNotFoundComponentImporter$b = () => import("./me.duties-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$c = () => import("./me.duties-R8WVsbNM.mjs");
const $$splitComponentImporter$1e = () => import("./me.duties-dsrM3mpc.mjs");
const Route$1M = createFileRoute("/me/duties")({
  head: () => ({
    meta: [{
      title: "My duties — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1e, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$c, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$b, "notFoundComponent")
});
const $$splitComponentImporter$1d = () => import("./me.documents-BRI9Bc0d.mjs");
const Route$1L = createFileRoute("/me/documents")({
  head: () => ({
    meta: [{
      title: "Documents — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1d, "component")
});
const $$splitComponentImporter$1c = () => import("./me.directory-DKW1-mDR.mjs");
const Route$1K = createFileRoute("/me/directory")({
  head: () => ({
    meta: [{
      title: "Directory — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1c, "component")
});
const $$splitComponentImporter$1b = () => import("./me.dashboard-lLk7K6ZI.mjs");
const Route$1J = createFileRoute("/me/dashboard")({
  head: () => ({
    meta: [{
      title: "My dashboard — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1b, "component")
});
const $$splitComponentImporter$1a = () => import("./me.contact-casaUsqU.mjs");
const Route$1I = createFileRoute("/me/contact")({
  head: () => ({
    meta: [{
      title: "Contact — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1a, "component")
});
const $$splitComponentImporter$19 = () => import("./me.banking-tax-Bcqt-0vo.mjs");
const Route$1H = createFileRoute("/me/banking-tax")({
  head: () => ({
    meta: [{
      title: "Banking & tax — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
const $$splitNotFoundComponentImporter$a = () => import("./me.assets-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$b = () => import("./me.assets-n7-eO9MN.mjs");
const $$splitComponentImporter$18 = () => import("./me.assets-DV1Rnx0l.mjs");
const Route$1G = createFileRoute("/me/assets")({
  component: lazyRouteComponent($$splitComponentImporter$18, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$b, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$a, "notFoundComponent")
});
const $$splitComponentImporter$17 = () => import("./invite._token-qBa4Yejl.mjs");
const Route$1F = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [{
      title: "Accept invitation — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
const $$splitComponentImporter$16 = () => import("./hr.variations-D2cOmtGo.mjs");
const Route$1E = createFileRoute("/hr/variations")({
  head: () => ({
    meta: [{
      title: "Employment variations — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
const $$splitComponentImporter$15 = () => import("./help.guide-6LA45GpT.mjs");
const Route$1D = createFileRoute("/help/guide")({
  component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
const $$splitComponentImporter$14 = () => import("./help._slug-CfNr3UoQ.mjs");
const Route$1C = createFileRoute("/help/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
function redactEmail$1(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
const Route$1B = createFileRoute("/email/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = "https://xnrjfrxzahmfdrqfsnnq.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ valid: false, reason: "already_unsubscribed" });
        }
        return Response.json({ valid: true });
      },
      POST: async ({ request }) => {
        const supabaseUrl = "https://xnrjfrxzahmfdrqfsnnq.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        let token = url.searchParams.get("token");
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/x-www-form-urlencoded")) {
          const formText = await request.text();
          const params = new URLSearchParams(formText);
          if (!params.get("List-Unsubscribe")) {
            const formToken = params.get("token");
            if (formToken) {
              token = formToken;
            }
          }
        } else {
          try {
            const body = await request.json();
            if (body.token) {
              token = body.token;
            }
          } catch {
          }
        }
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { data: updated, error: updateError } = await supabase2.from("email_unsubscribe_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("token", token).is("used_at", null).select().maybeSingle();
        if (updateError) {
          console.error("Failed to mark token as used", { error: updateError, token });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        if (!updated) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          { email: tokenRecord.email.toLowerCase(), reason: "unsubscribe" },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to suppress email", {
            error: suppressError,
            email_redacted: redactEmail$1(tokenRecord.email)
          });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        console.log("Email unsubscribed", {
          email_redacted: redactEmail$1(tokenRecord.email)
        });
        return Response.json({ success: true });
      }
    }
  }
});
const ALLOWED = {
  "HRPPL-Admin-Setup-Playbook.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "HRPPL-Go-Live-Checklist.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "HRPPL-Go-Live-Checklist.pdf": "application/pdf"
};
const Route$1A = createFileRoute("/downloads/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const filename = (params._splat ?? "").split("/").pop() ?? "";
        const contentType = ALLOWED[filename];
        if (!contentType) {
          return new Response("Not found", { status: 404 });
        }
        const assetUrl = new URL(`/_dl/${filename}`, request.url);
        const upstream = await fetch(assetUrl.toString());
        if (!upstream.ok) {
          return new Response("Not found", { status: 404 });
        }
        const headers = new Headers();
        headers.set("content-type", contentType);
        headers.set(
          "content-disposition",
          `attachment; filename="${filename}"`
        );
        headers.set("cache-control", "public, max-age=3600");
        headers.set("x-content-type-options", "nosniff");
        const len = upstream.headers.get("content-length");
        if (len) headers.set("content-length", len);
        return new Response(upstream.body, { status: 200, headers });
      }
    }
  }
});
const $$splitComponentImporter$13 = () => import("./careers._slug-Cs6Mu1CO.mjs");
const Route$1z = createFileRoute("/careers/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
const postQuery = (slug) => queryOptions({
  queryKey: ["blog", "post", slug],
  queryFn: () => getPublishedPost({
    data: {
      slug
    }
  })
});
const relatedQuery = () => queryOptions({
  queryKey: ["blog", "related"],
  queryFn: () => listPublishedPosts({
    data: {
      limit: 3
    }
  })
});
const $$splitComponentImporter$12 = () => import("./blog._slug-D77gdufJ.mjs");
const $$splitErrorComponentImporter$a = () => import("./blog._slug-BXCiMyug.mjs");
const $$splitNotFoundComponentImporter$9 = () => import("./blog._slug-CgNmn7za.mjs");
const Route$1y = createFileRoute("/blog/$slug")({
  loader: async ({
    context,
    params
  }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data.post) throw notFound();
    await context.queryClient.ensureQueryData(relatedQuery());
    return data;
  },
  head: ({
    loaderData,
    params
  }) => {
    const p = loaderData?.post;
    if (!p) return {
      meta: [{
        title: "Article — hrppl"
      }]
    };
    const title = p.seo_title || p.title;
    const desc = p.seo_description || p.excerpt || "Read this article on the hrppl blog.";
    const url = `https://hrppl.io/blog/${params.slug}`;
    const ogImage = p.og_image_url || p.cover_image_url || void 0;
    return {
      meta: [{
        title: `${title} — hrppl Blog`
      }, {
        name: "description",
        content: desc
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: desc
      }, {
        property: "og:type",
        content: "article"
      }, {
        property: "og:url",
        content: url
      }, ...ogImage ? [{
        property: "og:image",
        content: ogImage
      }, {
        name: "twitter:image",
        content: ogImage
      }] : [], {
        name: "twitter:card",
        content: "summary_large_image"
      }, {
        name: "twitter:title",
        content: title
      }, {
        name: "twitter:description",
        content: desc
      }],
      links: [{
        rel: "canonical",
        href: p.canonical_url || url
      }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: desc,
          image: ogImage,
          datePublished: p.published_at,
          dateModified: p.updated_at,
          author: {
            "@type": "Person",
            name: p.author_name ?? "hrppl"
          },
          mainEntityOfPage: url
        })
      }]
    };
  },
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$9, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$a, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
const $$splitComponentImporter$11 = () => import("./admin.training-ES48tQuC.mjs");
const Route$1x = createFileRoute("/admin/training")({
  head: () => ({
    meta: [{
      title: "Training catalog — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
const $$splitComponentImporter$10 = () => import("./admin.toil-dUz4RRg9.mjs");
const Route$1w = createFileRoute("/admin/toil")({
  head: () => ({
    meta: [{
      title: "Time in lieu admin — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
const $$splitComponentImporter$$ = () => import("./admin.templates-BWXYdeUB.mjs");
const Route$1v = createFileRoute("/admin/templates")({
  head: () => ({
    meta: [{
      title: "Templates Hub — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$$, "component")
});
const $$splitComponentImporter$_ = () => import("./admin.teams-Bb8hAwr3.mjs");
const Route$1u = createFileRoute("/admin/teams")({
  head: () => ({
    meta: [{
      title: "Team members — hrppl"
    }, {
      name: "description",
      content: "View, manage and request information from your entire team."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$_, "component")
});
const $$splitNotFoundComponentImporter$8 = () => import("./admin.team-assignments-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$9 = () => import("./admin.team-assignments-DHil1VjB.mjs");
const $$splitComponentImporter$Z = () => import("./admin.team-assignments-D0jeMDKf.mjs");
const Route$1t = createFileRoute("/admin/team-assignments")({
  head: () => ({
    meta: [{
      title: "Team assignments — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Z, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$9, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$8, "notFoundComponent")
});
const $$splitComponentImporter$Y = () => import("./admin.security-findings-DvEPnd1F.mjs");
const Route$1s = createFileRoute("/admin/security-findings")({
  head: () => ({
    meta: [{
      title: "Security findings — hrppl"
    }, {
      name: "robots",
      content: "noindex, nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Y, "component")
});
const $$splitComponentImporter$X = () => import("./admin.security-YqnvgZ7N.mjs");
const Route$1r = createFileRoute("/admin/security")({
  head: () => ({
    meta: [{
      title: "Security Findings — hrppl"
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$X, "component")
});
const $$splitComponentImporter$W = () => import("./admin.review-templates-Zv2T5SiS.mjs");
const Route$1q = createFileRoute("/admin/review-templates")({
  head: () => ({
    meta: [{
      title: "Review templates — WorldPay HRMS"
    }]
  }),
  // Gated at the route, per CLAUDE.md. This page hand-rolled `canAccess` and
  // rendered its own chrome-less "no access" panel, so the six roles that
  // cannot open it landed on a bare page with no sidebar and no way back — the
  // QA sweep flagged it for 6 of 8 roles. ORG_ADMIN_ONLY matches the set the
  // inline check used, so access is unchanged.
  component: lazyRouteComponent($$splitComponentImporter$W, "component")
});
const $$splitComponentImporter$V = () => import("./admin.review-cycles-BEx53ZCb.mjs");
const Route$1p = createFileRoute("/admin/review-cycles")({
  head: () => ({
    meta: [{
      title: "KPI review cycles — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$V, "component")
});
const $$splitComponentImporter$U = () => import("./admin.review-analytics-C430HL5O.mjs");
const Route$1o = createFileRoute("/admin/review-analytics")({
  head: () => ({
    meta: [{
      title: "Review analytics — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$U, "component")
});
const $$splitNotFoundComponentImporter$7 = () => import("./admin.requests-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$8 = () => import("./admin.requests-DHil1VjB.mjs");
const $$splitComponentImporter$T = () => import("./admin.requests-B_P8FJpz.mjs");
const Route$1n = createFileRoute("/admin/requests")({
  head: () => ({
    meta: [{
      title: "Requests inbox — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$T, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$8, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$7, "notFoundComponent")
});
const $$splitComponentImporter$S = () => import("./admin.payslip-templates-DCbFhvBk.mjs");
const Route$1m = createFileRoute("/admin/payslip-templates")({
  head: () => ({
    meta: [{
      title: "Payslip Templates — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$S, "component")
});
const $$splitComponentImporter$R = () => import("./admin.payroll-wizard-GuguYh_9.mjs");
const Route$1l = createFileRoute("/admin/payroll-wizard")({
  head: () => ({
    meta: [{
      title: "Payroll setup wizard — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$R, "component")
});
const $$splitComponentImporter$Q = () => import("./admin.payroll-setup-wizard-DDryFwjf.mjs");
const Route$1k = createFileRoute("/admin/payroll-setup-wizard")({
  head: () => ({
    meta: [{
      title: "Payroll Setup Wizard — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Q, "component")
});
const $$splitComponentImporter$P = () => import("./admin.payroll-setup-DYfyyNaQ.mjs");
const Route$1j = createFileRoute("/admin/payroll-setup")({
  head: () => ({
    meta: [{
      title: "Payroll Setup — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$P, "component")
});
const $$splitComponentImporter$O = () => import("./admin.payroll-settings-Dk7Y6kbs.mjs");
const Route$1i = createFileRoute("/admin/payroll-settings")({
  head: () => ({
    meta: [{
      title: "Payroll Settings — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$O, "component")
});
const $$splitComponentImporter$N = () => import("./admin.overtime-setup-wizard-DKRWKbrZ.mjs");
const Route$1h = createFileRoute("/admin/overtime-setup-wizard")({
  head: () => ({
    meta: [{
      title: "Overtime Setup Wizard — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$N, "component")
});
const $$splitComponentImporter$M = () => import("./admin.overtime-rates-E6pt3FhJ.mjs");
const Route$1g = createFileRoute("/admin/overtime-rates")({
  head: () => ({
    meta: [{
      title: "Overtime & penalty rates — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$M, "component")
});
const $$splitComponentImporter$L = () => import("./admin.onboarding-packs-CAtsrML_.mjs");
const Route$1f = createFileRoute("/admin/onboarding-packs")({
  head: () => ({
    meta: [{
      title: "Onboarding & offboarding packs — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$L, "component")
});
const $$splitNotFoundComponentImporter$6 = () => import("./admin.offboarding-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$7 = () => import("./admin.offboarding-BlLR645h.mjs");
const $$splitComponentImporter$K = () => import("./admin.offboarding-BYGJK-Nj.mjs");
const Route$1e = createFileRoute("/admin/offboarding")({
  // OFFBOARDING_ROLES, not ADMIN_LAYOUT_ROLES: the gate must match the RLS
  // policy on offboarding_cases. See the comment on the constant.
  component: lazyRouteComponent($$splitComponentImporter$K, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$7, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$6, "notFoundComponent")
});
const $$splitNotFoundComponentImporter$5 = () => import("./admin.medical-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$6 = () => import("./admin.medical-BFg4IvwZ.mjs");
const $$splitComponentImporter$J = () => import("./admin.medical-CB--zD-X.mjs");
const Route$1d = createFileRoute("/admin/medical")({
  component: lazyRouteComponent($$splitComponentImporter$J, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$6, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$5, "notFoundComponent")
});
const $$splitComponentImporter$I = () => import("./admin.leave-types-CXkEhJCM.mjs");
const Route$1c = createFileRoute("/admin/leave-types")({
  head: () => ({
    meta: [{
      title: "Leave types — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$I, "component")
});
const $$splitComponentImporter$H = () => import("./admin.leave-setup-wizard-CVJFnz4u.mjs");
const Route$1b = createFileRoute("/admin/leave-setup-wizard")({
  head: () => ({
    meta: [{
      title: "Leave Setup Wizard — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$H, "component")
});
const $$splitComponentImporter$G = () => import("./admin.kpi-kra-Cyx2q_pH.mjs");
const Route$1a = createFileRoute("/admin/kpi-kra")({
  head: () => ({
    meta: [{
      title: "KPI & KRA library — WorldPay HRMS"
    }, {
      name: "description",
      content: "Browse standard KPI and KRA presets and apply them to your tenant in one click."
    }]
  }),
  // Gated at the route with an explicit role set, per the convention in
  // CLAUDE.md. This page previously hand-rolled `roles.includes("org_admin")`
  // inline and rendered its own "Forbidden" panel — one of the nine admin pages
  // that skipped AdminGate, which is why tests/admin-gate-role-sets.test.ts
  // could not pin its allow-set.
  component: lazyRouteComponent($$splitComponentImporter$G, "component")
});
const $$splitComponentImporter$F = () => import("./admin.knowledge-BaGQwSUi.mjs");
const Route$19 = createFileRoute("/admin/knowledge")({
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
const $$splitComponentImporter$E = () => import("./admin.id-requests-BwCfu2zh.mjs");
const Route$18 = createFileRoute("/admin/id-requests")({
  head: () => ({
    meta: [{
      title: "Missing info requests — hrppl"
    }, {
      name: "description",
      content: "Review, approve, cancel, and resend missing-information requests in bulk."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const $$splitComponentImporter$D = () => import("./admin.holidays-CRVQniLM.mjs");
const Route$17 = createFileRoute("/admin/holidays")({
  head: () => ({
    meta: [{
      title: "Public holidays — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitComponentImporter$C = () => import("./admin.holiday-categories-BNVYNOPi.mjs");
const Route$16 = createFileRoute("/admin/holiday-categories")({
  head: () => ({
    meta: [{
      title: "Holiday categories — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitComponentImporter$B = () => import("./admin.holiday-calendar-CvKB7g4d.mjs");
const Route$15 = createFileRoute("/admin/holiday-calendar")({
  head: () => ({
    meta: [{
      title: "Holiday calendar — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./admin.geofences-D9mJMI81.mjs");
const Route$14 = createFileRoute("/admin/geofences")({
  head: () => ({
    meta: [{
      title: "Signing geofences — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./admin.feedback-templates-BCt_o_rl.mjs");
const Route$13 = createFileRoute("/admin/feedback-templates")({
  head: () => ({
    meta: [{
      title: "360 feedback templates — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./admin.expenses-jTiAAM0G.mjs");
const Route$12 = createFileRoute("/admin/expenses")({
  head: () => ({
    meta: [{
      title: "Expense settings — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./admin.employee-holidays-DgaCYQya.mjs");
const Route$11 = createFileRoute("/admin/employee-holidays")({
  head: () => ({
    meta: [{
      title: "Employee holiday overrides — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitNotFoundComponentImporter$4 = () => import("./admin.employee-duties-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$5 = () => import("./admin.employee-duties-gYZlnbe1.mjs");
const $$splitComponentImporter$w = () => import("./admin.employee-duties-DJdKG6HS.mjs");
const Route$10 = createFileRoute("/admin/employee-duties")({
  head: () => ({
    meta: [{
      title: "Duties & responsibilities — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$5, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$4, "notFoundComponent")
});
const $$splitComponentImporter$v = () => import("./admin.duty-reviews-Bv5wLtC0.mjs");
const Route$$ = createFileRoute("/admin/duty-reviews")({
  head: () => ({
    meta: [{
      title: "Duty-based KPI review — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Card = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const CaseSchema = objectType({
  id: stringType().uuid().optional(),
  employee_id: stringType().uuid(),
  case_number: stringType().max(60).optional().nullable(),
  category: enumType(["verbal_warning", "written_warning", "final_warning", "suspension", "termination", "pip", "investigation", "other"]),
  severity: enumType(["low", "medium", "high", "critical"]).default("low"),
  incident_date: stringType().optional().nullable(),
  description: stringType().min(1).max(5e3),
  status: enumType(["draft", "open", "investigation", "hearing_scheduled", "hearing_held", "decision_pending", "decision_issued", "appeal_open", "under_review", "appealed", "closed", "withdrawn"]).default("draft"),
  outcome: stringType().max(2e3).optional().nullable(),
  assigned_to: stringType().uuid().optional().nullable(),
  due_date: stringType().optional().nullable(),
  appeal_deadline: stringType().optional().nullable(),
  confidential: booleanType().default(false)
});
const listCases = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid().optional(),
  assigned_to_me: booleanType().optional(),
  status: stringType().optional()
}).parse(d ?? {})).handler(createSsrRpc("1588f6379566ed5fe0712c28cb8a7cddc11a6c7353a22b745c0edf1f1d3cd13a"));
const upsertCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CaseSchema.parse(d)).handler(createSsrRpc("e92e3ff542436bd5a061f4f4873d70c7317486ddf595e4dea5e241b5c7fad5c4"));
const deleteCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2085180efdf4b63b2cbef0a425c5b0c12d34f15acbd4afd46315ac36ab18d26e"));
const assignCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  assigned_to: stringType().uuid().nullable(),
  due_date: stringType().optional().nullable(),
  appeal_deadline: stringType().optional().nullable(),
  confidential: booleanType().optional()
}).parse(d)).handler(createSsrRpc("ae727b651f3ebb7883ee1bda085d09af9c6bf362fef5982c5c5cdfab91752fe8"));
const transitionCaseStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  to_status: stringType(),
  notes: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("3a73a63b8d7e00023b41a53569f5fedb498f4ed5a5a4a7a932e2a06d099414f2"));
const ActionSchema = objectType({
  id: stringType().uuid().optional(),
  case_id: stringType().uuid(),
  action_type: enumType(["warning_issued", "hearing_scheduled", "hearing_held", "appeal_filed", "outcome_recorded", "note", "document_attached", "status_changed"]),
  action_date: stringType().optional(),
  notes: stringType().max(4e3).optional().nullable(),
  document_url: stringType().url().max(500).optional().nullable()
});
const listActions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7d41a8a207444a57a9cdd9405fe9022468edde413499c8c17cacb653878c0b2a"));
const addAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ActionSchema.parse(d)).handler(createSsrRpc("204761bffb91fef0a2583828d5e098518b3ecfd200a5cd402f02207232746fc6"));
const deleteAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("a0df176bc0b2ffcd80083a4307aa3aaf1b172b11c3ff547553db43d4c0183499"));
const listApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid().optional(),
  pending_for_me: booleanType().optional()
}).parse(d ?? {})).handler(createSsrRpc("38f15c59de22297c225c51c19ce6f80f81999ac95fe0b0761af9d828a3788bf4"));
const requestApproval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  approver_id: stringType().uuid(),
  approver_role: enumType(["manager", "hr", "legal", "org_admin"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("598c872155879b7ce24f12c04b13c84d5726c1a7c37b4a32f7e7204917bc215f"));
const decideApproval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  approval_id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("b599389b700411d5326a882095d49132be54a1a71575b1dcc0198b1fe56d66cb"));
const recordCaseAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  storage_path: stringType().min(1).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(120).optional().nullable(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional().nullable()
}).parse(d)).handler(createSsrRpc("450c2850d094d4deeb12475a25fa4d62ce8ce454eff78dd7b2f3d4c40f67098c"));
const listCaseAttachments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3626d58098700108e1af2e20841b5c131acf906f4795180c4a2ae74b3bf163f9"));
const deleteCaseAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("bc712b193130f003731961ea9744f78e2c38f9eb06d9d8058aade9a3a369e653"));
const getAttachmentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  storage_path: stringType().min(1).max(500)
}).parse(d)).handler(createSsrRpc("8475f2eb35958e96d327092198cf7e3face4314ce3647d04ec4f59eaa13efefb"));
const GrievanceSchema = objectType({
  id: stringType().uuid().optional(),
  against_employee_id: stringType().uuid().optional().nullable(),
  category: enumType(["harassment", "discrimination", "workplace", "pay", "management", "safety", "other"]),
  subject: stringType().min(1).max(200),
  description: stringType().min(1).max(5e3),
  is_anonymous: booleanType().default(false),
  severity: enumType(["low", "medium", "high", "critical"]).default("medium")
});
const GrievanceUpdateSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["submitted", "acknowledged", "investigating", "resolved", "dismissed"]).optional(),
  assigned_to: stringType().uuid().optional().nullable(),
  resolution: stringType().max(4e3).optional().nullable(),
  severity: enumType(["low", "medium", "high", "critical"]).optional()
});
const listGrievances = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all"]).default("all")
}).parse(d ?? {})).handler(createSsrRpc("3a438b4a0d2d96312e1412c80cd1a42846047e9ae6afe8fe934ae87621f257a8"));
const fileGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => GrievanceSchema.parse(d)).handler(createSsrRpc("744cb23bdc1c0d5915d9b3c715b338e6bdb151e44020b749709875c8ef08032c"));
const updateGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => GrievanceUpdateSchema.parse(d)).handler(createSsrRpc("dc94ab1ddd11d3d0b8dd832a4e5327a85d026039c7aa2ac95c3b5e8199ca90e6"));
const withdrawGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("fcec3e78436396cc4a06fae10c266dce20d3882812c5f688238fbb402849288a"));
const listGrievanceComments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("757f0ee24b32e336dd618a12769e63e6b042a752af2ac7688c83bdb7465ea5c2"));
const addGrievanceComment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid(),
  comment: stringType().min(1).max(4e3),
  is_internal: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("f8e3bded2e85be19044a01c21ccaaa46c9af56cb2329cc7be4c47cf49cc67772"));
const recordGrievanceAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid(),
  storage_path: stringType().min(1).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(120).optional().nullable(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional().nullable()
}).parse(d)).handler(createSsrRpc("5f63873bc3979e64b4a61a6beed91fb184d9a5afb659c9a00f3d0c9d8a93c3d5"));
const listGrievanceAttachments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("01b8467da135182d02b4c1e430e784aafeba1fee2ec28a2aa300c85146bfa5f3"));
const deleteGrievanceAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b0a27f2d10824671bbac900bf31e8d2589d40e45e4469cd29a8aa86a0b6f32c5"));
const listHrUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cb5d34f0a4888e01931179354c19068d89b2637fc45396fb4bf55f91e4e57e91"));
const $$splitComponentImporter$u = () => import("./admin.discipline-Df_EhKwj.mjs");
const Route$_ = createFileRoute("/admin/discipline")({
  head: () => ({
    meta: [{
      title: "Discipline & grievances — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
function sevColor(s) {
  return s === "critical" ? "bg-status-stuck" : s === "high" ? "bg-status-pending" : s === "medium" ? "bg-status-working" : "bg-muted";
}
function GrievanceThread({
  grievance,
  canInternal
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceComments);
  const addFn = useServerFn(addGrievanceComment);
  const {
    data
  } = useQuery({
    queryKey: ["grievance-comments", grievance.id],
    queryFn: () => listFn({
      data: {
        grievance_id: grievance.id
      }
    })
  });
  const comments = data?.comments ?? [];
  const [text, setText] = reactExports.useState("");
  const [internal, setInternal] = reactExports.useState(false);
  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addFn({
        data: {
          grievance_id: grievance.id,
          comment: text,
          is_internal: internal
        }
      });
      setText("");
      setInternal(false);
      qc.invalidateQueries({
        queryKey: ["grievance-comments", grievance.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: grievance.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-white ${sevColor(grievance.severity)}`, children: grievance.severity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: grievance.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm whitespace-pre-wrap", children: grievance.description }),
      grievance.resolution && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-md bg-status-done/10 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-status-done", children: "Resolution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: grievance.resolution })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      comments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border p-3 ${c.is_internal ? "border-status-pending bg-status-pending/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.profiles?.full_name ?? c.profiles?.email ?? "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(c.created_at).toLocaleString() })
        ] }),
        c.is_internal && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-status-pending border-status-pending", children: "Internal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm whitespace-pre-wrap", children: c.comment })
      ] }, c.id)),
      comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: "No comments yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: send, className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: text, onChange: (e) => setText(e.target.value), placeholder: "Write a comment…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        canInternal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: internal, onChange: (e) => setInternal(e.target.checked) }),
          "Internal note (HR only)"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", children: "Post" })
      ] })
    ] })
  ] });
}
function GrievanceAttachments({
  grievance,
  canUpload
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievanceAttachments);
  const recordFn = useServerFn(recordGrievanceAttachment);
  const delFn = useServerFn(deleteGrievanceAttachment);
  const urlFn = useServerFn(getAttachmentDownloadUrl);
  const {
    data
  } = useQuery({
    queryKey: ["grievance-attachments", grievance.id],
    queryFn: () => listFn({
      data: {
        grievance_id: grievance.id
      }
    })
  });
  const items = data?.attachments ?? [];
  const fileRef = reactExports.useRef(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Max 20 MB");
      return;
    }
    setBusy(true);
    try {
      const path = `${grievance.tenant_id}/grievance/${grievance.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const {
        error
      } = await supabase.storage.from("disciplinary-files").upload(path, file, {
        upsert: false,
        contentType: file.type
      });
      if (error) throw error;
      await recordFn({
        data: {
          grievance_id: grievance.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size
        }
      });
      toast.success("Uploaded");
      qc.invalidateQueries({
        queryKey: ["grievance-attachments", grievance.id]
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function download(p) {
    try {
      const r = await urlFn({
        data: {
          storage_path: p
        }
      });
      window.open(r.url, "_blank");
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this file?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["grievance-attachments", grievance.id]
      });
    } catch (e) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
        "Evidence files"
      ] }),
      canUpload && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", className: "hidden", onChange: upload }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => fileRef.current?.click(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-3 w-3" }),
          busy ? "Uploading…" : "Upload"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
      items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "inline h-3 w-3 mr-1" }),
          a.file_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => download(a.storage_path), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }),
          canUpload && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, a.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-2", children: "No files" })
    ] })
  ] });
}
const $$splitComponentImporter$t = () => import("./admin.diagnostics-DZqlW4gk.mjs");
const Route$Z = createFileRoute("/admin/diagnostics")({
  head: () => ({
    meta: [{
      title: "Performance diagnostics — hrppl"
    }, {
      name: "robots",
      content: "noindex, nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./admin.designations-CvE1Cb3h.mjs");
const Route$Y = createFileRoute("/admin/designations")({
  head: () => ({
    meta: [{
      title: "Designations — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./admin.departments-BbxIhJYA.mjs");
const Route$X = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [{
      title: "Departments — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./admin.blog-integrations-5XqTYi36.mjs");
const Route$W = createFileRoute("/admin/blog-integrations")({
  head: () => ({
    meta: [{
      title: "Blog API & Webhooks — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./admin.blog-BZfidWQz.mjs");
const Route$V = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [{
      title: "Blog CMS — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./admin.biometric-wPgHXSDg.mjs");
const Route$U = createFileRoute("/admin/biometric")({
  head: () => ({
    meta: [{
      title: "Biometric attendance — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./admin.billing-ops-BWP71Ln2.mjs");
const Route$T = createFileRoute("/admin/billing-ops")({
  head: () => ({
    meta: [{
      title: "Billing operations — hrppl"
    }, {
      name: "description",
      content: "Super-admin dashboard: billing alerts, mandates, invoices, reconciliation, discrepancy reports, audit timeline, and invoice impact preview."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./admin.billing-Dl1YStkt.mjs");
const Route$S = createFileRoute("/admin/billing")({
  head: () => ({
    meta: [{
      title: "Direct-debit billing — hrppl"
    }, {
      name: "description",
      content: "Configure direct-debit billing, manage mandates, and view monthly net-employee usage."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./admin.audit-history-CBIHzLb2.mjs");
const Route$R = createFileRoute("/admin/audit-history")({
  head: () => ({
    meta: [{
      title: "Audit history — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./admin.au-stp-audit-Dt02h1zK.mjs");
const Route$Q = createFileRoute("/admin/au-stp-audit")({
  head: () => ({
    meta: [{
      title: "AU STP2 & Payday Super audit — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitNotFoundComponentImporter$3 = () => import("./admin.assets-j5V5m0A2.mjs");
const $$splitErrorComponentImporter$4 = () => import("./admin.assets-Dc17i1wk.mjs");
const $$splitComponentImporter$j = () => import("./admin.assets-Bb2SJU-f.mjs");
const Route$P = createFileRoute("/admin/assets")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$4, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$3, "notFoundComponent")
});
const $$splitComponentImporter$i = () => import("./admin.api-docs-D3e3_t0p.mjs");
const Route$O = createFileRoute("/admin/api-docs")({
  head: () => ({
    meta: [{
      title: "API reference — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const Route$N = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      ANY: createTanStackOAuthProtectedResourceMetadataHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const Route$M = createFileRoute("/.mcp/list-tools")({
  server: {
    handlers: {
      // ANY: TanStack returns SPA HTML for methods not in `handlers`; the SDK 405s instead.
      ANY: createTanStackListToolsHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const $$splitComponentImporter$h = () => import("./org.recruitment.index-B8JsXhaH.mjs");
const Route$L = createFileRoute("/org/recruitment/")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./org.onboarding.index-CEtXg6Qr.mjs");
const Route$K = createFileRoute("/org/onboarding/")({
  head: () => ({
    meta: [{
      title: "Onboarding admin — WorldPay HRMS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./org.documents.index-BfVXFGBZ.mjs");
const Route$J = createFileRoute("/org/documents/")({
  head: () => ({
    meta: [{
      title: "Envelopes — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const getCareersByTenantSlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120)
}).parse(d)).handler(createSsrRpc("0d2e6486bb79d16006411b50330fa12aa33a0f2c05073e892dae795341f2d24a"));
const getJobBySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120),
  job_slug: stringType().trim().min(1).max(200)
}).parse(d)).handler(createSsrRpc("dc53f2f3eecc862902d2ef16ba7bb8998c9600c067da1ee890ae0825b8543e58"));
const getCareersSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ca629a86389fff83ec9be09f23e23516a4e9b6c1a7267d8bd44548bdecd9200f"));
const updateCareersSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  public_slug: stringType().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  headline: stringType().trim().max(200).nullable().optional(),
  about_html: stringType().trim().max(1e4).nullable().optional(),
  brand_color: stringType().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F172A"),
  hero_image_url: stringType().url().nullable().optional(),
  is_enabled: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("e749404053deaff22d38d90a24e7676b66711eac6d84e7001fde765012587b9c"));
const updateJobPublication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  is_published: booleanType(),
  public_slug: stringType().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).nullable().optional(),
  public_summary: stringType().trim().max(2e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("63d91e4b39380a95e603911e12138847e2f093467e085a0da7b00321a2568afc"));
const $$splitComponentImporter$e = () => import("./careers._tenantSlug.index-BGqZYnda.mjs");
const $$splitNotFoundComponentImporter$2 = () => import("./careers._tenantSlug.index-DZts_LYb.mjs");
const $$splitErrorComponentImporter$3 = () => import("./careers._tenantSlug.index-DI1kwYp7.mjs");
const Route$I = createFileRoute("/careers/$tenantSlug/")({
  loader: async ({
    params
  }) => {
    const r = await getCareersByTenantSlug({
      data: {
        tenant_slug: params.tenantSlug
      }
    });
    if (!r.site) throw notFound();
    return r;
  },
  head: ({
    loaderData,
    params
  }) => {
    const title = loaderData?.site?.headline ? `${loaderData.site.headline} — Careers` : `Careers — ${params.tenantSlug}`;
    const description = loaderData?.site?.headline ? `Open roles at ${loaderData.site.headline}. Browse our team's job openings.` : "Open job opportunities.";
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: description
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: description
      }, ...loaderData?.site?.hero_image_url ? [{
        property: "og:image",
        content: loaderData.site.hero_image_url
      }, {
        name: "twitter:image",
        content: loaderData.site.hero_image_url
      }] : []]
    };
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$2, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./sign.certificate._token-Dpu5NYzf.mjs");
const Route$H = createFileRoute("/sign/certificate/$token")({
  head: () => ({
    meta: [{
      title: "Signed copy — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./org.settings.mfa-policy-D3WmXQcJ.mjs");
const Route$G = createFileRoute("/org/settings/mfa-policy")({
  head: () => ({
    meta: [{
      title: "MFA policy — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./org.recruitment._jobId-CfbdvwCL.mjs");
const Route$F = createFileRoute("/org/recruitment/$jobId")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./org.onboarding.tracker-7hbyKN1b.mjs");
const Route$E = createFileRoute("/org/onboarding/tracker")({
  head: () => ({
    meta: [{
      title: "Onboarding tracker — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./org.documents.templates-95z1CTeR.mjs");
const Route$D = createFileRoute("/org/documents/templates")({
  head: () => ({
    meta: [{
      title: "Document templates — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./org.documents.expiring-D-FXKZHh.mjs");
const Route$C = createFileRoute("/org/documents/expiring")({
  head: () => ({
    meta: [{
      title: "Document verification — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./org.careers.settings-D20RffCn.mjs");
const Route$B = createFileRoute("/org/careers/settings")({
  head: () => ({
    meta: [{
      title: "Careers page — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
function parseSuppressionPayload(body) {
  const parsed = JSON.parse(body);
  if (!parsed.data) {
    throw new Error("Missing data field in payload");
  }
  const data = parsed.data;
  if (!data.email || !data.reason) {
    throw new Error("Missing required fields: email, reason");
  }
  return data;
}
function mapReasonToStatus(reason) {
  switch (reason) {
    case "bounce":
      return "bounced";
    case "complaint":
      return "complained";
    default:
      return "suppressed";
  }
}
function mapReasonToMessage(reason) {
  switch (reason) {
    case "bounce":
      return "Permanent bounce — email address is invalid or rejected";
    case "complaint":
      return "Spam complaint — recipient marked email as spam";
    case "unsubscribe":
      return "Recipient unsubscribed";
    default:
      return "Email suppressed";
  }
}
const Route$A = createFileRoute("/lovable/email/suppression")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://xnrjfrxzahmfdrqfsnnq.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        let payload;
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseSuppressionPayload
          });
          payload = verified.payload;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
                console.error("Invalid webhook signature");
                return Response.json({ error: "Invalid signature" }, { status: 401 });
              case "stale_timestamp":
                console.error("Stale webhook timestamp");
                return Response.json({ error: "Stale timestamp" }, { status: 401 });
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid payload", { code: error.code });
                return Response.json({ error: "Invalid payload" }, { status: 400 });
              default:
                console.error("Webhook verification failed", {
                  code: error.code,
                  message: error.message
                });
                return Response.json({ error: "Verification failed" }, { status: 401 });
            }
          }
          console.error("Unexpected error during verification", { error });
          return Response.json({ error: "Internal error" }, { status: 500 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const normalizedEmail = payload.email.toLowerCase();
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          {
            email: normalizedEmail,
            reason: payload.reason,
            metadata: payload.metadata ?? null
          },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to upsert suppressed email", {
            error: suppressError,
            email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1]
          });
          return Response.json({ error: "Failed to write suppression" }, { status: 500 });
        }
        const sendLogStatus = mapReasonToStatus(payload.reason);
        const sendLogMessage = mapReasonToMessage(payload.reason);
        const { error: insertError } = await supabase2.from("email_send_log").insert({
          message_id: payload.message_id ?? null,
          template_name: "system",
          recipient_email: normalizedEmail,
          status: sendLogStatus,
          error_message: sendLogMessage,
          metadata: payload.metadata ?? null
        });
        if (insertError) {
          console.warn("Failed to insert email_send_log", {
            error: insertError
          });
        }
        console.log("Suppression processed", {
          email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1],
          reason: payload.reason,
          is_retry: payload.is_retry,
          retry_count: payload.retry_count,
          has_message_id: !!payload.message_id
        });
        return Response.json({ success: true });
      }
    }
  }
});
const $$splitComponentImporter$6 = () => import("./careers._tenantSlug._jobSlug-M5fdrndX.mjs");
const $$splitNotFoundComponentImporter$1 = () => import("./careers._tenantSlug._jobSlug-CiXRwOof.mjs");
const $$splitErrorComponentImporter$2 = () => import("./careers._tenantSlug._jobSlug-DI1kwYp7.mjs");
const Route$z = createFileRoute("/careers/$tenantSlug/$jobSlug")({
  loader: async ({
    params
  }) => {
    const r = await getJobBySlug({
      data: {
        tenant_slug: params.tenantSlug,
        job_slug: params.jobSlug
      }
    });
    if (!r.job) throw notFound();
    return r;
  },
  head: ({
    loaderData
  }) => {
    const title = loaderData?.job?.title ?? "Job opening";
    const description = loaderData?.job?.public_summary ?? `Apply for ${loaderData?.job?.title ?? "this role"}.`;
    const jsonLd = loaderData?.job ? {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: loaderData.job.title,
      description: loaderData.job.description_html || loaderData.job.public_summary,
      datePosted: loaderData.job.published_at,
      employmentType: loaderData.job.employment_type,
      jobLocation: loaderData.job.location ? {
        "@type": "Place",
        address: loaderData.job.location
      } : void 0,
      baseSalary: loaderData.job.salary_min && loaderData.job.salary_max ? {
        "@type": "MonetaryAmount",
        currency: loaderData.job.currency ?? "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: loaderData.job.salary_min,
          maxValue: loaderData.job.salary_max,
          unitText: "YEAR"
        }
      } : void 0
    } : null;
    return {
      meta: [{
        title: `${title} — Careers`
      }, {
        name: "description",
        content: description
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: description
      }],
      scripts: jsonLd ? [{
        type: "application/ld+json",
        children: JSON.stringify(jsonLd)
      }] : []
    };
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const tagDescriptions = {
  Meta: "Health, identity, and discovery endpoints.",
  Auth: "OAuth 2.0, token introspection, and session endpoints.",
  Tenants: "Regional/Super Admin tenant lifecycle and subscription confirmation.",
  Config: "Per-tenant configuration: tax rules, holidays, leave types, OT, penalties, pay components.",
  Employees: "Employee master data.",
  Attendance: "Clock in/out, timesheets, and bulk device pushes.",
  Leave: "Leave requests, approvals, and balances.",
  Payroll: "Payroll runs, payslips, and bank-file generation.",
  Performance: "Goals, reviews, and appraisal cycles.",
  Expenses: "Expense claims and approvals.",
  Files: "Upload and download of binary attachments.",
  Jobs: "Async job status (bulk imports, payroll runs).",
  Webhooks: "Outbound event subscriptions and delivery logs.",
  SCIM: "SCIM 2.0 user/group provisioning for IdPs (Okta, Azure AD, Google)."
};
const tags = Object.entries(tagDescriptions).map(([name, description]) => ({
  name,
  description
}));
const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "OAuth 2.0 access token or Personal Access Token (PAT)."
  },
  oauth2: {
    type: "oauth2",
    description: "OAuth 2.0 with Authorization Code + PKCE and Client Credentials grants.",
    flows: {
      authorizationCode: {
        authorizationUrl: "https://api.worldpayhrms.com/oauth/authorize",
        tokenUrl: "https://api.worldpayhrms.com/oauth/token",
        refreshUrl: "https://api.worldpayhrms.com/oauth/token",
        scopes: {
          "employees:read": "Read employee records",
          "employees:write": "Create/update employees",
          "attendance:read": "Read attendance",
          "attendance:write": "Record attendance",
          "leave:read": "Read leave",
          "leave:write": "Create leave requests",
          "leave:approve": "Approve/reject leave",
          "payroll:read": "Read payroll runs and payslips",
          "payroll:write": "Create/process payroll",
          "payroll:finalize": "Finalize payroll runs",
          "performance:read": "Read goals and reviews",
          "performance:write": "Create/update goals and reviews",
          "expenses:read": "Read expenses",
          "expenses:write": "Submit expenses",
          "files:read": "Download files",
          "files:write": "Upload files",
          "admin:config": "Manage tenant configuration",
          "admin:webhooks": "Manage outbound webhooks",
          "regional_admin": "Regional/Country Admin operations",
          "super_admin": "Platform-wide operations"
        }
      },
      clientCredentials: {
        tokenUrl: "https://api.worldpayhrms.com/oauth/token",
        scopes: {
          "employees:read": "Read employee records",
          "employees:write": "Create/update employees",
          "payroll:read": "Read payroll",
          "payroll:write": "Process payroll",
          "admin:config": "Manage tenant configuration",
          "admin:webhooks": "Manage outbound webhooks"
        }
      }
    }
  },
  apiKey: {
    type: "apiKey",
    in: "header",
    name: "X-Api-Key",
    description: "Tenant-scoped API key. Prefer OAuth where possible."
  }
};
const parameters = {
  Cursor: {
    name: "cursor",
    in: "query",
    schema: { type: "string" },
    description: "Opaque cursor returned by a previous page."
  },
  Limit: {
    name: "limit",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
    description: "Maximum number of items to return."
  },
  Fields: {
    name: "fields",
    in: "query",
    schema: { type: "string" },
    description: "Comma-separated list of fields to include (sparse fieldsets)."
  },
  Include: {
    name: "include",
    in: "query",
    schema: { type: "string" },
    description: "Comma-separated list of related resources to expand."
  },
  IdempotencyKey: {
    name: "Idempotency-Key",
    in: "header",
    schema: { type: "string", format: "uuid" },
    description: "Client-generated UUID for safe retry of POST/PUT."
  },
  IfMatch: {
    name: "If-Match",
    in: "header",
    schema: { type: "string" },
    description: "ETag of the resource version the client expects (optimistic concurrency)."
  },
  TenantId: {
    name: "X-Tenant-Id",
    in: "header",
    schema: { type: "string" },
    description: "Override tenant when the token is scoped to multiple tenants (Regional/Super admin)."
  }
};
const schemas = {
  Error: {
    type: "object",
    required: ["code", "message"],
    properties: {
      code: { type: "string", example: "validation_error" },
      message: { type: "string" },
      details: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            issue: { type: "string" }
          }
        }
      },
      request_id: { type: "string", format: "uuid" }
    }
  },
  Page: {
    type: "object",
    required: ["data"],
    properties: {
      data: { type: "array", items: {} },
      next_cursor: { type: "string", nullable: true },
      has_more: { type: "boolean" }
    }
  },
  Money: {
    type: "object",
    required: ["amount", "currency"],
    properties: {
      amount: { type: "number", description: "Decimal amount (not minor units)." },
      currency: { type: "string", minLength: 3, maxLength: 3, example: "AED" }
    }
  },
  Country: {
    type: "object",
    required: ["code", "name", "currency"],
    properties: {
      code: { type: "string", minLength: 2, maxLength: 2, example: "AE" },
      name: { type: "string", example: "United Arab Emirates" },
      currency: { type: "string", minLength: 3, maxLength: 3, example: "AED" },
      region: { type: "string", nullable: true, example: "MENA" }
    }
  },
  Tenant: {
    type: "object",
    required: ["id", "name", "country_code", "status"],
    properties: {
      id: { type: "string", example: "ten_01HZX..." },
      name: { type: "string" },
      legal_name: { type: "string", nullable: true },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      base_currency: { type: "string", minLength: 3, maxLength: 3 },
      status: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] },
      plan_id: { type: "string", nullable: true },
      billing_cycle: { type: "string", enum: ["monthly", "annual"], nullable: true },
      activated_at: { type: "string", format: "date-time", nullable: true },
      expires_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" }
    }
  },
  TenantCreate: {
    type: "object",
    required: ["name", "country_code"],
    properties: {
      name: { type: "string" },
      legal_name: { type: "string" },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      base_currency: { type: "string", minLength: 3, maxLength: 3 },
      org_admin_email: { type: "string", format: "email" }
    }
  },
  SubscriptionConfirmation: {
    type: "object",
    required: ["amount", "currency", "reference", "paid_on", "plan_id", "period_start", "period_end"],
    properties: {
      amount: { type: "number" },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      reference: { type: "string", description: "Bank reference / invoice number." },
      paid_on: { type: "string", format: "date" },
      plan_id: { type: "string" },
      period_start: { type: "string", format: "date" },
      period_end: { type: "string", format: "date" },
      note: { type: "string" }
    }
  },
  Employee: {
    type: "object",
    required: ["id", "tenant_id", "first_name", "last_name", "email", "country_code", "status"],
    properties: {
      id: { type: "string" },
      tenant_id: { type: "string" },
      external_id: { type: "string", nullable: true },
      first_name: { type: "string" },
      last_name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string", nullable: true },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      department: { type: "string", nullable: true },
      job_title: { type: "string", nullable: true },
      manager_id: { type: "string", nullable: true },
      hire_date: { type: "string", format: "date", nullable: true },
      termination_date: { type: "string", format: "date", nullable: true },
      employment_type: {
        type: "string",
        enum: ["full_time", "part_time", "contract", "intern"],
        nullable: true
      },
      base_salary: { $ref: "#/components/schemas/Money", nullable: true },
      status: { type: "string", enum: ["active", "on_leave", "terminated"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" }
    }
  },
  EmployeeCreate: {
    type: "object",
    required: ["first_name", "last_name", "email", "country_code"],
    properties: {
      external_id: { type: "string" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      country_code: { type: "string", minLength: 2, maxLength: 2 },
      department: { type: "string" },
      job_title: { type: "string" },
      manager_id: { type: "string" },
      hire_date: { type: "string", format: "date" },
      employment_type: { type: "string", enum: ["full_time", "part_time", "contract", "intern"] },
      base_salary: { $ref: "#/components/schemas/Money" }
    }
  },
  AttendancePunch: {
    type: "object",
    required: ["employee_id", "type", "occurred_at"],
    properties: {
      employee_id: { type: "string" },
      type: { type: "string", enum: ["clock_in", "clock_out", "break_start", "break_end"] },
      occurred_at: { type: "string", format: "date-time" },
      source: { type: "string", enum: ["web", "mobile", "device", "api"], default: "api" },
      device_id: { type: "string", nullable: true },
      geo: {
        type: "object",
        properties: { lat: { type: "number" }, lng: { type: "number" } }
      }
    }
  },
  LeaveRequest: {
    type: "object",
    required: ["id", "employee_id", "leave_type_id", "start_date", "end_date", "status"],
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      leave_type_id: { type: "string" },
      start_date: { type: "string", format: "date" },
      end_date: { type: "string", format: "date" },
      days: { type: "number" },
      reason: { type: "string", nullable: true },
      status: { type: "string", enum: ["pending", "approved", "rejected", "cancelled"] },
      approver_id: { type: "string", nullable: true },
      decided_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" }
    }
  },
  LeaveBalance: {
    type: "object",
    properties: {
      employee_id: { type: "string" },
      leave_type_id: { type: "string" },
      entitlement: { type: "number" },
      taken: { type: "number" },
      pending: { type: "number" },
      remaining: { type: "number" },
      as_of: { type: "string", format: "date" }
    }
  },
  PayrollRun: {
    type: "object",
    required: ["id", "tenant_id", "period", "currency", "status"],
    properties: {
      id: { type: "string" },
      tenant_id: { type: "string" },
      period: { type: "string", example: "2026-05", description: "YYYY-MM." },
      country_code: { type: "string" },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      status: {
        type: "string",
        enum: ["draft", "calculating", "calculated", "finalized", "paid", "failed"]
      },
      employee_count: { type: "integer" },
      gross_total: { type: "number" },
      net_total: { type: "number" },
      created_at: { type: "string", format: "date-time" },
      finalized_at: { type: "string", format: "date-time", nullable: true }
    }
  },
  Payslip: {
    type: "object",
    properties: {
      id: { type: "string" },
      payroll_run_id: { type: "string" },
      employee_id: { type: "string" },
      currency: { type: "string" },
      gross: { type: "number" },
      net: { type: "number" },
      tax: { type: "number" },
      deductions: { type: "number" },
      overtime: { type: "number" },
      penalties: { type: "number" },
      lines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            component_code: { type: "string" },
            description: { type: "string" },
            amount: { type: "number" },
            kind: { type: "string", enum: ["earning", "deduction", "tax", "contribution"] }
          }
        }
      },
      pdf_url: { type: "string", format: "uri", nullable: true }
    }
  },
  TaxRule: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      name: { type: "string" },
      effective_from: { type: "string", format: "date" },
      effective_to: { type: "string", format: "date", nullable: true },
      brackets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "number" },
            to: { type: "number", nullable: true },
            rate: { type: "number", description: "0–1 decimal (e.g. 0.15 = 15%)." },
            fixed: { type: "number", nullable: true }
          }
        }
      }
    }
  },
  Holiday: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      date: { type: "string", format: "date" },
      name: { type: "string" },
      paid: { type: "boolean" }
    }
  },
  LeaveType: {
    type: "object",
    properties: {
      id: { type: "string" },
      code: { type: "string", example: "ANNUAL" },
      name: { type: "string" },
      country_code: { type: "string" },
      accrual_per_year: { type: "number" },
      paid: { type: "boolean" },
      requires_attachment: { type: "boolean" },
      gender_restriction: { type: "string", enum: ["any", "male", "female"], default: "any" }
    }
  },
  OvertimeRate: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      kind: { type: "string", enum: ["weekday", "weekend", "holiday", "night"] },
      multiplier: { type: "number", example: 1.5 },
      min_minutes: { type: "integer", default: 0 },
      cap_minutes_per_day: { type: "integer", nullable: true }
    }
  },
  PenaltyRule: {
    type: "object",
    properties: {
      id: { type: "string" },
      country_code: { type: "string" },
      kind: { type: "string", enum: ["late", "absence", "early_out"] },
      amount: { type: "number", nullable: true },
      percent_of_daily: { type: "number", nullable: true },
      grace_minutes: { type: "integer", default: 0 }
    }
  },
  PayComponent: {
    type: "object",
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      name: { type: "string" },
      kind: { type: "string", enum: ["earning", "deduction", "tax", "contribution"] },
      formula: { type: "string", description: "Expression evaluated per employee per run." },
      taxable: { type: "boolean" },
      country_code: { type: "string", nullable: true }
    }
  },
  Review: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      cycle_id: { type: "string" },
      reviewer_id: { type: "string" },
      status: { type: "string", enum: ["draft", "submitted", "acknowledged"] },
      overall_rating: { type: "number", nullable: true },
      submitted_at: { type: "string", format: "date-time", nullable: true }
    }
  },
  Goal: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      weight: { type: "number" },
      target_date: { type: "string", format: "date", nullable: true },
      progress: { type: "number", minimum: 0, maximum: 100 },
      status: { type: "string", enum: ["active", "achieved", "missed", "cancelled"] }
    }
  },
  Expense: {
    type: "object",
    properties: {
      id: { type: "string" },
      employee_id: { type: "string" },
      category: { type: "string" },
      amount: { $ref: "#/components/schemas/Money" },
      incurred_on: { type: "string", format: "date" },
      receipt_file_id: { type: "string", nullable: true },
      status: { type: "string", enum: ["draft", "submitted", "approved", "rejected", "reimbursed"] }
    }
  },
  Job: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { type: "string", example: "employees.bulk_import" },
      status: { type: "string", enum: ["queued", "running", "succeeded", "failed"] },
      progress: { type: "number", minimum: 0, maximum: 100 },
      result_url: { type: "string", format: "uri", nullable: true },
      error: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      finished_at: { type: "string", format: "date-time", nullable: true }
    }
  },
  Webhook: {
    type: "object",
    required: ["url", "events"],
    properties: {
      id: { type: "string" },
      url: { type: "string", format: "uri" },
      events: { type: "array", items: { type: "string" }, example: ["payroll.run.completed", "payslip.published"] },
      active: { type: "boolean", default: true },
      secret: { type: "string", description: "Shown once on creation; used to compute HMAC signature." },
      created_at: { type: "string", format: "date-time" }
    }
  },
  WebhookDelivery: {
    type: "object",
    properties: {
      id: { type: "string" },
      webhook_id: { type: "string" },
      event: { type: "string" },
      status_code: { type: "integer", nullable: true },
      attempt: { type: "integer" },
      delivered: { type: "boolean" },
      next_retry_at: { type: "string", format: "date-time", nullable: true },
      created_at: { type: "string", format: "date-time" }
    }
  }
};
const responses = {
  Unauthorized: {
    description: "Missing or invalid credentials.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  },
  Forbidden: {
    description: "Token does not have the required scope.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  },
  NotFound: {
    description: "Resource not found.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  },
  ValidationError: {
    description: "Request validation failed.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  },
  RateLimited: {
    description: "Rate limit exceeded.",
    headers: {
      "X-RateLimit-Limit": { schema: { type: "integer" } },
      "X-RateLimit-Remaining": { schema: { type: "integer" } },
      "X-RateLimit-Reset": { schema: { type: "integer" }, description: "Unix epoch seconds." },
      "Retry-After": { schema: { type: "integer" } }
    },
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  }
};
const json$2 = (schemaRef) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } }
});
const pageOf = (schemaRef) => ({
  "application/json": {
    schema: {
      allOf: [
        { $ref: "#/components/schemas/Page" },
        {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: `#/components/schemas/${schemaRef}` } }
          }
        }
      ]
    }
  }
});
const commonErrors = {
  "400": { $ref: "#/components/responses/ValidationError" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "403": { $ref: "#/components/responses/Forbidden" },
  "404": { $ref: "#/components/responses/NotFound" },
  "429": { $ref: "#/components/responses/RateLimited" }
};
const listParams = [
  { $ref: "#/components/parameters/Cursor" },
  { $ref: "#/components/parameters/Limit" },
  { $ref: "#/components/parameters/Fields" },
  { $ref: "#/components/parameters/Include" }
];
const writeParams = [
  { $ref: "#/components/parameters/IdempotencyKey" },
  { $ref: "#/components/parameters/TenantId" }
];
const paths = {
  "/health": {
    get: {
      tags: ["Meta"],
      summary: "Service health",
      security: [],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  version: { type: "string", example: "v1" },
                  time: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/me": {
    get: {
      tags: ["Meta"],
      summary: "Current principal",
      responses: {
        "200": {
          description: "Token introspection.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tenant_id: { type: "string", nullable: true },
                  user_id: { type: "string", nullable: true },
                  scopes: { type: "array", items: { type: "string" } },
                  country_scope: { type: "array", items: { type: "string" } },
                  role: { type: "string" }
                }
              }
            }
          }
        },
        ...commonErrors
      }
    }
  },
  // ---- Tenants (Regional / Super admin) ----
  "/tenants": {
    get: {
      tags: ["Tenants"],
      summary: "List tenants in scope",
      parameters: [
        ...listParams,
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] } },
        { name: "country_code", in: "query", schema: { type: "string" } }
      ],
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      responses: { "200": { description: "OK", content: pageOf("Tenant") }, ...commonErrors }
    },
    post: {
      tags: ["Tenants"],
      summary: "Create a tenant (pending)",
      parameters: writeParams,
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      requestBody: { required: true, content: json$2("TenantCreate") },
      responses: { "201": { description: "Created", content: json$2("Tenant") }, ...commonErrors }
    }
  },
  "/tenants/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Tenants"],
      summary: "Get tenant",
      responses: { "200": { description: "OK", content: json$2("Tenant") }, ...commonErrors }
    },
    patch: {
      tags: ["Tenants"],
      summary: "Update tenant status / plan",
      parameters: writeParams,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["pending", "active", "suspended", "cancelled"] },
                plan_id: { type: "string" },
                billing_cycle: { type: "string", enum: ["monthly", "annual"] },
                expires_at: { type: "string", format: "date-time" }
              }
            }
          }
        }
      },
      responses: { "200": { description: "OK", content: json$2("Tenant") }, ...commonErrors }
    }
  },
  "/tenants/{id}/subscription-confirmations": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: {
      tags: ["Tenants"],
      summary: "Record an offline subscription payment (manual confirmation)",
      description: "Used by Regional Admins to confirm a tenant's subscription after receiving payment via bank transfer / cheque. Flips tenant to active and sets the billing period.",
      parameters: writeParams,
      security: [{ bearerAuth: ["regional_admin"] }, { bearerAuth: ["super_admin"] }],
      requestBody: { required: true, content: json$2("SubscriptionConfirmation") },
      responses: { "201": { description: "Recorded", content: json$2("Tenant") }, ...commonErrors }
    }
  },
  // ---- Config ----
  "/config/tax-rules": {
    get: { tags: ["Config"], summary: "List tax rules", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("TaxRule") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create tax rule", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json$2("TaxRule") }, responses: { "201": { description: "Created", content: json$2("TaxRule") }, ...commonErrors } }
  },
  "/config/holidays": {
    get: { tags: ["Config"], summary: "List public holidays", parameters: [...listParams, { name: "country_code", in: "query", schema: { type: "string" } }, { name: "year", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "OK", content: pageOf("Holiday") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Add holiday", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json$2("Holiday") }, responses: { "201": { description: "Created", content: json$2("Holiday") }, ...commonErrors } }
  },
  "/config/leave-types": {
    get: { tags: ["Config"], summary: "List leave types", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("LeaveType") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create leave type", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json$2("LeaveType") }, responses: { "201": { description: "Created", content: json$2("LeaveType") }, ...commonErrors } }
  },
  "/config/overtime-rates": {
    get: { tags: ["Config"], summary: "List overtime rate matrix", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("OvertimeRate") }, ...commonErrors } },
    put: { tags: ["Config"], summary: "Replace overtime rate matrix for a country", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/OvertimeRate" } } } } }, responses: { "200": { description: "OK" }, ...commonErrors } }
  },
  "/config/penalties": {
    get: { tags: ["Config"], summary: "List penalty rules", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("PenaltyRule") }, ...commonErrors } },
    put: { tags: ["Config"], summary: "Replace penalty rules for a country", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PenaltyRule" } } } } }, responses: { "200": { description: "OK" }, ...commonErrors } }
  },
  "/config/pay-components": {
    get: { tags: ["Config"], summary: "List pay components", parameters: listParams, responses: { "200": { description: "OK", content: pageOf("PayComponent") }, ...commonErrors } },
    post: { tags: ["Config"], summary: "Create pay component", parameters: writeParams, security: [{ bearerAuth: ["admin:config"] }], requestBody: { required: true, content: json$2("PayComponent") }, responses: { "201": { description: "Created", content: json$2("PayComponent") }, ...commonErrors } }
  },
  // ---- Employees ----
  "/employees": {
    get: {
      tags: ["Employees"],
      summary: "List employees",
      parameters: [
        ...listParams,
        { name: "filter[status]", in: "query", schema: { type: "string" } },
        { name: "filter[department]", in: "query", schema: { type: "string" } },
        { name: "filter[country_code]", in: "query", schema: { type: "string" } }
      ],
      security: [{ bearerAuth: ["employees:read"] }],
      responses: { "200": { description: "OK", content: pageOf("Employee") }, ...commonErrors }
    },
    post: {
      tags: ["Employees"],
      summary: "Create employee",
      parameters: writeParams,
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: { required: true, content: json$2("EmployeeCreate") },
      responses: { "201": { description: "Created", content: json$2("Employee") }, ...commonErrors }
    }
  },
  "/employees/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Employees"], summary: "Get employee", security: [{ bearerAuth: ["employees:read"] }], responses: { "200": { description: "OK", content: json$2("Employee") }, ...commonErrors } },
    patch: {
      tags: ["Employees"],
      summary: "Update employee",
      parameters: [...writeParams, { $ref: "#/components/parameters/IfMatch" }],
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: { required: true, content: json$2("EmployeeCreate") },
      responses: { "200": { description: "OK", content: json$2("Employee") }, ...commonErrors }
    },
    delete: { tags: ["Employees"], summary: "Terminate employee", parameters: writeParams, security: [{ bearerAuth: ["employees:write"] }], responses: { "204": { description: "Terminated" }, ...commonErrors } }
  },
  "/employees/bulk": {
    post: {
      tags: ["Employees"],
      summary: "Bulk import employees (async)",
      parameters: writeParams,
      security: [{ bearerAuth: ["employees:write"] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary", description: "CSV file." },
                upsert_key: { type: "string", default: "external_id" }
              }
            }
          }
        }
      },
      responses: { "202": { description: "Job accepted", content: json$2("Job") }, ...commonErrors }
    }
  },
  // ---- Attendance ----
  "/attendance": {
    get: {
      tags: ["Attendance"],
      summary: "List attendance records",
      parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } }],
      security: [{ bearerAuth: ["attendance:read"] }],
      responses: { "200": { description: "OK", content: pageOf("AttendancePunch") }, ...commonErrors }
    }
  },
  "/attendance/clock": {
    post: {
      tags: ["Attendance"],
      summary: "Record a single punch",
      parameters: writeParams,
      security: [{ bearerAuth: ["attendance:write"] }],
      requestBody: { required: true, content: json$2("AttendancePunch") },
      responses: { "201": { description: "Recorded", content: json$2("AttendancePunch") }, ...commonErrors }
    }
  },
  "/attendance/bulk": {
    post: {
      tags: ["Attendance"],
      summary: "Bulk push punches (biometric devices)",
      parameters: writeParams,
      security: [{ bearerAuth: ["attendance:write"] }, { apiKey: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/AttendancePunch" } } } } },
      responses: { "202": { description: "Accepted", content: json$2("Job") }, ...commonErrors }
    }
  },
  // ---- Leave ----
  "/leave-requests": {
    get: { tags: ["Leave"], summary: "List leave requests", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["leave:read"] }], responses: { "200": { description: "OK", content: pageOf("LeaveRequest") }, ...commonErrors } },
    post: { tags: ["Leave"], summary: "Create leave request", parameters: writeParams, security: [{ bearerAuth: ["leave:write"] }], requestBody: { required: true, content: json$2("LeaveRequest") }, responses: { "201": { description: "Created", content: json$2("LeaveRequest") }, ...commonErrors } }
  },
  "/leave-requests/{id}/approve": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Leave"], summary: "Approve leave request", parameters: writeParams, security: [{ bearerAuth: ["leave:approve"] }], responses: { "200": { description: "Approved", content: json$2("LeaveRequest") }, ...commonErrors } }
  },
  "/leave-requests/{id}/reject": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: {
      tags: ["Leave"],
      summary: "Reject leave request",
      parameters: writeParams,
      security: [{ bearerAuth: ["leave:approve"] }],
      requestBody: { content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
      responses: { "200": { description: "Rejected", content: json$2("LeaveRequest") }, ...commonErrors }
    }
  },
  "/leave-balances/{employee_id}": {
    parameters: [{ name: "employee_id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Leave"], summary: "Get leave balances", security: [{ bearerAuth: ["leave:read"] }], responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/LeaveBalance" } } } } }, ...commonErrors } }
  },
  // ---- Payroll ----
  "/payroll-runs": {
    get: { tags: ["Payroll"], summary: "List payroll runs", parameters: listParams, security: [{ bearerAuth: ["payroll:read"] }], responses: { "200": { description: "OK", content: pageOf("PayrollRun") }, ...commonErrors } },
    post: {
      tags: ["Payroll"],
      summary: "Start a payroll run",
      parameters: writeParams,
      security: [{ bearerAuth: ["payroll:write"] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["period", "country_code"],
              properties: {
                period: { type: "string", example: "2026-05" },
                country_code: { type: "string" },
                employee_ids: { type: "array", items: { type: "string" }, description: "Omit to include all eligible employees." }
              }
            }
          }
        }
      },
      responses: { "202": { description: "Accepted", content: json$2("PayrollRun") }, ...commonErrors }
    }
  },
  "/payroll-runs/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Payroll"], summary: "Get payroll run", security: [{ bearerAuth: ["payroll:read"] }], responses: { "200": { description: "OK", content: json$2("PayrollRun") }, ...commonErrors } }
  },
  "/payroll-runs/{id}/finalize": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Payroll"], summary: "Finalize and publish payslips", parameters: writeParams, security: [{ bearerAuth: ["payroll:finalize"] }], responses: { "200": { description: "Finalized", content: json$2("PayrollRun") }, ...commonErrors } }
  },
  "/payroll-runs/{id}/bank-file": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Payroll"],
      summary: "Generate bank payment file (SEPA/ACH/WPS/SWIFT)",
      parameters: [{ name: "format", in: "query", required: true, schema: { type: "string", enum: ["sepa", "ach", "wps", "swift"] } }],
      security: [{ bearerAuth: ["payroll:finalize"] }],
      responses: { "200": { description: "Signed download URL", content: { "application/json": { schema: { type: "object", properties: { url: { type: "string", format: "uri" }, expires_at: { type: "string", format: "date-time" } } } } } }, ...commonErrors }
    }
  },
  "/payslips/{employee_id}": {
    parameters: [{ name: "employee_id", in: "path", required: true, schema: { type: "string" } }],
    get: {
      tags: ["Payroll"],
      summary: "List payslips for an employee",
      parameters: [...listParams, { name: "period", in: "query", schema: { type: "string" } }],
      security: [{ bearerAuth: ["payroll:read"] }],
      responses: { "200": { description: "OK", content: pageOf("Payslip") }, ...commonErrors }
    }
  },
  // ---- Performance ----
  "/goals": {
    get: { tags: ["Performance"], summary: "List goals", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["performance:read"] }], responses: { "200": { description: "OK", content: pageOf("Goal") }, ...commonErrors } },
    post: { tags: ["Performance"], summary: "Create goal", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], requestBody: { required: true, content: json$2("Goal") }, responses: { "201": { description: "Created", content: json$2("Goal") }, ...commonErrors } }
  },
  "/reviews": {
    get: { tags: ["Performance"], summary: "List reviews", parameters: listParams, security: [{ bearerAuth: ["performance:read"] }], responses: { "200": { description: "OK", content: pageOf("Review") }, ...commonErrors } },
    post: { tags: ["Performance"], summary: "Create review", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], requestBody: { required: true, content: json$2("Review") }, responses: { "201": { description: "Created", content: json$2("Review") }, ...commonErrors } }
  },
  "/reviews/{id}/submit": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Performance"], summary: "Submit a review", parameters: writeParams, security: [{ bearerAuth: ["performance:write"] }], responses: { "200": { description: "Submitted", content: json$2("Review") }, ...commonErrors } }
  },
  // ---- Expenses ----
  "/expenses": {
    get: { tags: ["Expenses"], summary: "List expenses", parameters: [...listParams, { name: "employee_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], security: [{ bearerAuth: ["expenses:read"] }], responses: { "200": { description: "OK", content: pageOf("Expense") }, ...commonErrors } },
    post: { tags: ["Expenses"], summary: "Submit expense", parameters: writeParams, security: [{ bearerAuth: ["expenses:write"] }], requestBody: { required: true, content: json$2("Expense") }, responses: { "201": { description: "Created", content: json$2("Expense") }, ...commonErrors } }
  },
  // ---- Files ----
  "/files": {
    post: {
      tags: ["Files"],
      summary: "Upload a file",
      parameters: writeParams,
      security: [{ bearerAuth: ["files:write"] }],
      requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" }, purpose: { type: "string", example: "receipt" } } } } } },
      responses: { "201": { description: "Uploaded", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, url: { type: "string", format: "uri" } } } } } }, ...commonErrors }
    }
  },
  "/files/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Files"], summary: "Download file (signed redirect)", security: [{ bearerAuth: ["files:read"] }], responses: { "302": { description: "Redirect to signed URL" }, ...commonErrors } }
  },
  // ---- Jobs ----
  "/jobs/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Jobs"], summary: "Get async job status", responses: { "200": { description: "OK", content: json$2("Job") }, ...commonErrors } }
  },
  // ---- Webhooks ----
  "/webhooks": {
    get: { tags: ["Webhooks"], summary: "List webhook subscriptions", parameters: listParams, security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "OK", content: pageOf("Webhook") }, ...commonErrors } },
    post: { tags: ["Webhooks"], summary: "Create webhook subscription", parameters: writeParams, security: [{ bearerAuth: ["admin:webhooks"] }], requestBody: { required: true, content: json$2("Webhook") }, responses: { "201": { description: "Created (secret returned once)", content: json$2("Webhook") }, ...commonErrors } }
  },
  "/webhooks/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    delete: { tags: ["Webhooks"], summary: "Delete subscription", security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "204": { description: "Deleted" }, ...commonErrors } }
  },
  "/webhooks/{id}/test": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    post: { tags: ["Webhooks"], summary: "Send a test event", security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "Delivered", content: json$2("WebhookDelivery") }, ...commonErrors } }
  },
  "/webhooks/{id}/deliveries": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    get: { tags: ["Webhooks"], summary: "List recent deliveries", parameters: listParams, security: [{ bearerAuth: ["admin:webhooks"] }], responses: { "200": { description: "OK", content: pageOf("WebhookDelivery") }, ...commonErrors } }
  },
  // ---- SCIM 2.0 ----
  "/scim/v2/Users": {
    get: { tags: ["SCIM"], summary: "SCIM list users", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" }, ...commonErrors } },
    post: { tags: ["SCIM"], summary: "SCIM create user", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/scim+json": { schema: { type: "object" } } } }, responses: { "201": { description: "Created" }, ...commonErrors } }
  }
};
const webhookEvent = (eventName, dataRef) => ({
  post: {
    summary: eventName,
    description: `Fired when \`${eventName}\` occurs. Signed with HMAC-SHA256 over the request body using the per-subscription secret. Verify the \`X-WorldPay-Signature\` header.`,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["id", "type", "tenant_id", "data", "created_at"],
            properties: {
              id: { type: "string", example: "evt_01HZX..." },
              type: { type: "string", example: eventName },
              tenant_id: { type: "string" },
              created_at: { type: "string", format: "date-time" },
              data: { $ref: `#/components/schemas/${dataRef}` }
            }
          }
        }
      }
    },
    responses: {
      "2XX": { description: "Return any 2xx to acknowledge. Non-2xx triggers retries with exponential backoff." }
    }
  }
});
const webhooks = {
  "employee.created": webhookEvent("employee.created", "Employee"),
  "employee.updated": webhookEvent("employee.updated", "Employee"),
  "employee.terminated": webhookEvent("employee.terminated", "Employee"),
  "attendance.recorded": webhookEvent("attendance.recorded", "AttendancePunch"),
  "leave.requested": webhookEvent("leave.requested", "LeaveRequest"),
  "leave.approved": webhookEvent("leave.approved", "LeaveRequest"),
  "leave.rejected": webhookEvent("leave.rejected", "LeaveRequest"),
  "payroll.run.started": webhookEvent("payroll.run.started", "PayrollRun"),
  "payroll.run.completed": webhookEvent("payroll.run.completed", "PayrollRun"),
  "payroll.run.failed": webhookEvent("payroll.run.failed", "PayrollRun"),
  "payslip.published": webhookEvent("payslip.published", "Payslip"),
  "review.submitted": webhookEvent("review.submitted", "Review"),
  "tenant.activated": webhookEvent("tenant.activated", "Tenant"),
  "tenant.suspended": webhookEvent("tenant.suspended", "Tenant"),
  "subscription.confirmed": webhookEvent("subscription.confirmed", "Tenant")
};
const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "WorldPay HRMS API",
    version: "1.0.0",
    summary: "Global HRMS & Payroll Suite — Public API v1",
    description: "Plug-and-play REST + Webhooks API for the WorldPay HRMS suite. Every UI action has a corresponding API endpoint. All requests are scoped to a tenant derived from the bearer token. Idempotent writes (`Idempotency-Key`), cursor pagination, sparse fieldsets (`?fields=`), filtering (`?filter[...]=`) and resource expansion (`?include=`) are supported across all list endpoints.",
    contact: { name: "WorldPay HRMS API", url: "https://docs.worldpayhrms.com", email: "api@worldpayhrms.com" },
    license: { name: "Proprietary" }
  },
  servers: [
    { url: "https://api.worldpayhrms.com/api/v1", description: "Production" },
    { url: "https://sandbox.worldpayhrms.com/api/v1", description: "Sandbox" },
    { url: "/api/v1", description: "Current host" }
  ],
  tags,
  security: [{ bearerAuth: [] }, { oauth2: [] }, { apiKey: [] }],
  paths,
  webhooks,
  components: {
    securitySchemes,
    parameters,
    schemas,
    responses
  }
};
const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};
async function isCallerSuperAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return false;
  try {
    const { createClient: createClient2 } = await import("../_libs/supabase__supabase-js.mjs");
    const supabase2 = createClient2(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: userData, error: userErr } = await supabase2.auth.getUser(token);
    if (userErr || !userData?.user) return false;
    const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
    const { data: roleRows } = await supabaseAdmin2.from("user_roles").select("role").eq("user_id", userData.user.id);
    return (roleRows ?? []).some((r) => r.role === "super_admin");
  } catch {
    return false;
  }
}
const Route$y = createFileRoute("/api/v1/openapi.json")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: SECURITY_HEADERS }),
      GET: async ({ request }) => {
        const ok = await isCallerSuperAdmin(request);
        if (!ok) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              ...SECURITY_HEADERS
            }
          });
        }
        return new Response(JSON.stringify(openApiSpec, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...SECURITY_HEADERS
          }
        });
      }
    }
  }
});
const Route$x = createFileRoute("/api/v1/docs")({
  server: {
    handlers: {
      GET: async () => new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }
  }
});
const $$splitNotFoundComponentImporter = () => import("./admin.employees._employeeId-CoYiw-LT.mjs");
const $$splitErrorComponentImporter$1 = () => import("./admin.employees._employeeId-ClGxJGV1.mjs");
const $$splitComponentImporter$5 = () => import("./admin.employees._employeeId-CpQGBSLw.mjs");
const Route$w = createFileRoute("/admin/employees/$employeeId")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const Route$v = createFileRoute("/.mcp/invoke-tool/$tool")({
  server: {
    handlers: {
      // ANY: TanStack returns SPA HTML for methods not in `handlers`; the SDK 405s instead.
      ANY: createTanStackInvokeToolHandler(mcp, { resourcePath: "/mcp", metadataPath: "/.well-known/oauth-protected-resource", trustForwardedHost: true })
    }
  }
});
const oauthApi = () => supabase.auth.oauth;
const $$splitErrorComponentImporter = () => import("../_._lovable.oauth.consent-Bdkfpiut.mjs");
const $$splitComponentImporter$4 = () => import("../_._lovable.oauth.consent-W9uqKqNC.mjs");
const Route$u = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : ""
  }),
  beforeLoad: async ({
    search,
    location
  }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      const redirectPath = location.pathname + location.searchStr;
      throw redirect({
        to: "/auth",
        search: {
          redirect: redirectPath
        }
      });
    }
  },
  loader: async ({
    location
  }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id");
    const {
      data,
      error
    } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({
      href: immediate
    });
    return data;
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
const $$splitComponentImporter$3 = () => import("./org.onboarding.control-room.index-BVi2pJ8-.mjs");
const Route$t = createFileRoute("/org/onboarding/control-room/")({
  head: () => ({
    meta: [{
      title: "Onboarding control room — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./org.recruitment.candidate._candidateId-CXyBJlPW.mjs");
const Route$s = createFileRoute("/org/recruitment/candidate/$candidateId")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./org.onboarding.control-room._id-C_MZIhUa.mjs");
const Route$r = createFileRoute("/org/onboarding/control-room/$id")({
  head: () => ({
    meta: [{
      title: "Onboarding control room — HRPPL"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./org.documents.envelope._id-X3-Wvz21.mjs");
const Route$q = createFileRoute("/org/documents/envelope/$id")({
  head: () => ({
    meta: [{
      title: "Envelope — hrppl"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SITE_NAME = "global-payroll-bliss";
const SENDER_DOMAIN = "notify.hrppl.io";
const FROM_DOMAIN = "hrppl.io";
function redactEmail(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const Route$p = createFileRoute("/lovable/email/transactional/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = "https://xnrjfrxzahmfdrqfsnnq.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error: authError } = await supabase2.auth.getUser(token);
        if (authError || !user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { data: roleRows } = await supabase2.from("user_roles").select("role").eq("user_id", user.id);
        const allowedRoles = /* @__PURE__ */ new Set(["super_admin", "org_admin", "manager", "regional_admin"]);
        const hasPrivilegedRole = (roleRows ?? []).some((r) => allowedRoles.has(r.role));
        if (!hasPrivilegedRole) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        let templateName;
        let recipientEmail;
        let idempotencyKey;
        let messageId;
        let templateData = {};
        try {
          const body = await request.json();
          templateName = body.templateName || body.template_name;
          recipientEmail = body.recipientEmail || body.recipient_email;
          messageId = crypto.randomUUID();
          idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId;
          if (body.templateData && typeof body.templateData === "object") {
            templateData = body.templateData;
          }
        } catch {
          return Response.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
        if (!templateName) {
          return Response.json(
            { error: "templateName is required" },
            { status: 400 }
          );
        }
        const template = TEMPLATES[templateName];
        if (!template) {
          console.error("Template not found in registry", { templateName });
          return Response.json(
            { error: "Template not found" },
            { status: 404 }
          );
        }
        const effectiveRecipient = template.to || recipientEmail;
        if (!effectiveRecipient) {
          return Response.json(
            {
              error: "recipientEmail is required (unless the template defines a fixed recipient)"
            },
            { status: 400 }
          );
        }
        const { data: suppressed, error: suppressionError } = await supabase2.from("suppressed_emails").select("id").eq("email", effectiveRecipient.toLowerCase()).maybeSingle();
        if (suppressionError) {
          console.error("Suppression check failed — refusing to send", {
            error: suppressionError,
            recipient_redacted: redactEmail(effectiveRecipient)
          });
          return Response.json(
            { error: "Failed to verify suppression status" },
            { status: 500 }
          );
        }
        if (suppressed) {
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed"
          });
          console.log("Email suppressed", {
            templateName,
            recipient_redacted: redactEmail(effectiveRecipient)
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const normalizedEmail = effectiveRecipient.toLowerCase();
        let unsubscribeToken;
        const { data: existingToken, error: tokenLookupError } = await supabase2.from("email_unsubscribe_tokens").select("token, used_at").eq("email", normalizedEmail).maybeSingle();
        if (tokenLookupError) {
          console.error("Token lookup failed", {
            error: tokenLookupError,
            email_redacted: redactEmail(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to look up unsubscribe token"
          });
          return Response.json(
            { error: "Failed to prepare email" },
            { status: 500 }
          );
        }
        if (existingToken && !existingToken.used_at) {
          unsubscribeToken = existingToken.token;
        } else if (!existingToken) {
          unsubscribeToken = generateToken();
          const { error: tokenError } = await supabase2.from("email_unsubscribe_tokens").upsert(
            { token: unsubscribeToken, email: normalizedEmail },
            { onConflict: "email", ignoreDuplicates: true }
          );
          if (tokenError) {
            console.error("Failed to create unsubscribe token", {
              error: tokenError
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to create unsubscribe token"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          const { data: storedToken, error: reReadError } = await supabase2.from("email_unsubscribe_tokens").select("token").eq("email", normalizedEmail).maybeSingle();
          if (reReadError || !storedToken) {
            console.error("Failed to read back unsubscribe token after upsert", {
              error: reReadError,
              email_redacted: redactEmail(normalizedEmail)
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to confirm unsubscribe token storage"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          unsubscribeToken = storedToken.token;
        } else {
          console.warn("Unsubscribe token already used but email not suppressed", {
            email_redacted: redactEmail(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed",
            error_message: "Unsubscribe token used but email missing from suppressed list"
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const element = reactExports.createElement(template.component, templateData);
        const html = await render(element);
        const plainText = await render(element, { plainText: true });
        const resolvedSubject = typeof template.subject === "function" ? template.subject(templateData) : template.subject;
        await supabase2.from("email_send_log").insert({
          message_id: messageId,
          template_name: templateName,
          recipient_email: effectiveRecipient,
          status: "pending"
        });
        const { error: enqueueError } = await supabase2.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: effectiveRecipient,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: "transactional",
            label: templateName,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (enqueueError) {
          console.error("Failed to enqueue email", {
            error: enqueueError,
            templateName,
            recipient_redacted: redactEmail(effectiveRecipient)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to enqueue email"
          });
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 500 }
          );
        }
        console.log("Transactional email enqueued", {
          templateName,
          recipient_redacted: redactEmail(effectiveRecipient)
        });
        return Response.json({ success: true, queued: true });
      }
    }
  }
});
const Route$o = createFileRoute("/lovable/email/transactional/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        if (token !== apiKey) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const templateNames = Object.keys(TEMPLATES);
        const results = [];
        for (const name of templateNames) {
          const entry = TEMPLATES[name];
          const displayName = entry.displayName || name;
          if (!entry.previewData) {
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "preview_data_required"
            });
            continue;
          }
          try {
            const html = await render(
              reactExports.createElement(entry.component, entry.previewData)
            );
            const resolvedSubject = typeof entry.subject === "function" ? entry.subject(entry.previewData) : entry.subject;
            results.push({
              templateName: name,
              displayName,
              subject: resolvedSubject,
              html,
              status: "ready"
            });
          } catch (err) {
            console.error("Failed to render template for preview", {
              template: name,
              error: err
            });
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "render_failed",
              errorMessage: err instanceof Error ? err.message : String(err)
            });
          }
        }
        return Response.json({ templates: results });
      }
    }
  }
});
const MAX_RETRIES = 5;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_SEND_DELAY_MS = 200;
const DEFAULT_AUTH_TTL_MINUTES = 15;
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60;
function isRateLimited(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 429;
  }
  return error instanceof Error && error.message.includes("429");
}
function isForbidden(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 403;
  }
  return error instanceof Error && error.message.includes("403");
}
function getRetryAfterSeconds(error) {
  if (error && typeof error === "object" && "retryAfterSeconds" in error) {
    return error.retryAfterSeconds ?? 60;
  }
  return 60;
}
async function moveToDlq(supabase2, queue, msg, reason) {
  const payload = msg.message;
  await supabase2.from("email_send_log").insert({
    message_id: payload.message_id,
    template_name: payload.label || queue,
    recipient_email: payload.to,
    status: "dlq",
    error_message: reason
  });
  const { error } = await supabase2.rpc("move_to_dlq", {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload
  });
  if (error) {
    console.error("Failed to move message to DLQ", { queue, msg_id: msg.msg_id, reason, error });
  }
}
const Route$n = createFileRoute("/lovable/email/queue/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://xnrjfrxzahmfdrqfsnnq.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: state } = await supabase2.from("email_send_state").select("retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes").single();
        if (state?.retry_after_until && new Date(state.retry_after_until) > /* @__PURE__ */ new Date()) {
          return Response.json({ skipped: true, reason: "rate_limited" });
        }
        const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE;
        const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS;
        const ttlMinutes = {
          auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
          transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES
        };
        let totalProcessed = 0;
        for (const queue of ["auth_emails", "transactional_emails"]) {
          const { data: messages, error: readError } = await supabase2.rpc("read_email_batch", {
            queue_name: queue,
            batch_size: batchSize,
            vt: 30
          });
          if (readError) {
            console.error("Failed to read email batch", { queue, error: readError });
            continue;
          }
          if (!messages?.length) continue;
          const messageIds = Array.from(
            new Set(
              messages.map(
                (msg) => msg?.message?.message_id && typeof msg.message.message_id === "string" ? msg.message.message_id : null
              ).filter((id) => Boolean(id))
            )
          );
          const failedAttemptsByMessageId = /* @__PURE__ */ new Map();
          if (messageIds.length > 0) {
            const { data: failedRows, error: failedRowsError } = await supabase2.from("email_send_log").select("message_id").in("message_id", messageIds).eq("status", "failed");
            if (failedRowsError) {
              console.error("Failed to load failed-attempt counters", {
                queue,
                error: failedRowsError
              });
            } else {
              for (const row of failedRows ?? []) {
                const messageId = row?.message_id;
                if (typeof messageId !== "string" || !messageId) continue;
                failedAttemptsByMessageId.set(
                  messageId,
                  (failedAttemptsByMessageId.get(messageId) ?? 0) + 1
                );
              }
            }
          }
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const payload = msg.message;
            const failedAttempts = payload?.message_id && typeof payload.message_id === "string" ? failedAttemptsByMessageId.get(payload.message_id) ?? 0 : msg.read_ct ?? 0;
            const queuedAt = payload.queued_at ?? msg.enqueued_at;
            if (queuedAt) {
              const ageMs = Date.now() - new Date(queuedAt).getTime();
              const maxAgeMs = ttlMinutes[queue] * 60 * 1e3;
              if (ageMs > maxAgeMs) {
                console.warn("Email expired (TTL exceeded)", {
                  queue,
                  msg_id: msg.msg_id,
                  queued_at: queuedAt,
                  ttl_minutes: ttlMinutes[queue]
                });
                await moveToDlq(supabase2, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`);
                continue;
              }
            }
            if (failedAttempts >= MAX_RETRIES) {
              await moveToDlq(supabase2, queue, msg, `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`);
              continue;
            }
            if (payload.message_id) {
              const { data: alreadySent } = await supabase2.from("email_send_log").select("id").eq("message_id", payload.message_id).eq("status", "sent").maybeSingle();
              if (alreadySent) {
                console.warn("Skipping duplicate send (already sent)", {
                  queue,
                  msg_id: msg.msg_id,
                  message_id: payload.message_id
                });
                const { error: dupDelError } = await supabase2.rpc("delete_email", {
                  queue_name: queue,
                  message_id: msg.msg_id
                });
                if (dupDelError) {
                  console.error("Failed to delete duplicate message from queue", { queue, msg_id: msg.msg_id, error: dupDelError });
                }
                continue;
              }
            }
            try {
              await sendLovableEmail(
                {
                  run_id: payload.run_id,
                  to: payload.to,
                  from: payload.from,
                  sender_domain: payload.sender_domain,
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                  purpose: payload.purpose,
                  label: payload.label,
                  idempotency_key: payload.idempotency_key,
                  unsubscribe_token: payload.unsubscribe_token,
                  message_id: payload.message_id
                },
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL }
              );
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "sent"
              });
              const { error: delError } = await supabase2.rpc("delete_email", {
                queue_name: queue,
                message_id: msg.msg_id
              });
              if (delError) {
                console.error("Failed to delete sent message from queue", { queue, msg_id: msg.msg_id, error: delError });
              }
              totalProcessed++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              console.error("Email send failed", {
                queue,
                msg_id: msg.msg_id,
                read_ct: msg.read_ct,
                failed_attempts: failedAttempts,
                error: errorMsg
              });
              if (isRateLimited(error)) {
                await supabase2.from("email_send_log").insert({
                  message_id: payload.message_id,
                  template_name: payload.label || queue,
                  recipient_email: payload.to,
                  status: "failed",
                  error_message: errorMsg.slice(0, 1e3)
                });
                const retryAfterSecs = getRetryAfterSeconds(error);
                await supabase2.from("email_send_state").update({
                  retry_after_until: new Date(
                    Date.now() + retryAfterSecs * 1e3
                  ).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("id", 1);
                return Response.json({ processed: totalProcessed, stopped: "rate_limited" });
              }
              if (isForbidden(error)) {
                await moveToDlq(supabase2, queue, msg, errorMsg.slice(0, 1e3));
                return Response.json({ processed: totalProcessed, stopped: "forbidden" });
              }
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "failed",
                error_message: errorMsg.slice(0, 1e3)
              });
              if (payload?.message_id && typeof payload.message_id === "string") {
                failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1);
              }
            }
            if (i < messages.length - 1) {
              await new Promise((r) => setTimeout(r, sendDelayMs));
            }
          }
        }
        return Response.json({ processed: totalProcessed });
      }
    }
  }
});
let warnedAboutFallback = false;
function isAuthorizedCronRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  if (!token) return false;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret.length > 0) {
    return timingSafeEqual(token, cronSecret);
  }
  if (process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK !== "1") return false;
  if (!warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn(
      "[cron-auth] CRON_SECRET is not set and the service-role fallback is enabled. The service-role key is being accepted as a bearer token on public hook endpoints. Set CRON_SECRET, remove CRON_ALLOW_SERVICE_ROLE_FALLBACK, then rotate the service-role key."
    );
  }
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!svc && timingSafeEqual(token, svc);
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
const PENDING_STATUSES = ["pending", "queued", "scheduled", "draft"];
const Route$m = createFileRoute("/api/public/hooks/super-sla-sweep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const { data, error } = await supabaseAdmin2.from("super_contributions").update({ status: "overdue" }).lt("payment_due_date", today).in("status", PENDING_STATUSES).select("id,tenant_id");
        if (error) {
          console.error("super-sla-sweep error", error);
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({
          ok: true,
          swept: data?.length ?? 0,
          at: (/* @__PURE__ */ new Date()).toISOString()
        }), { headers: { "Content-Type": "application/json" } });
      }
    }
  }
});
const Route$l = createFileRoute("/api/public/hooks/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });
        const sig = request.headers.get("stripe-signature");
        if (!sig) return new Response("Missing signature", { status: 400 });
        const body = await request.text();
        const { getStripe } = await import("./stripe.server-C4vshzUl.mjs");
        const stripe = getStripe();
        let event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, secret);
        } catch (e) {
          return new Response(`Invalid signature: ${e?.message}`, { status: 400 });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const { data: dup } = await supabaseAdmin2.from("billing_audit_log").select("id").eq("stripe_event_id", event.id).maybeSingle();
        if (dup) return Response.json({ ok: true, duplicate: true });
        const obj = event.data?.object ?? {};
        const customerId = obj.customer ?? void 0;
        const subscriptionId = obj.subscription ?? obj.id ?? void 0;
        let tenantId = null;
        if (customerId) {
          const { data: t } = await supabaseAdmin2.from("tenant_subscriptions").select("tenant_id").eq("stripe_customer_id", customerId).maybeSingle();
          tenantId = t?.tenant_id ?? null;
        }
        try {
          switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.created": {
              const status = obj.status;
              const mapped = status === "canceled" ? "cancelled" : status === "trialing" ? "trialing" : status === "past_due" ? "past_due" : status === "active" ? "active" : void 0;
              await supabaseAdmin2.from("tenant_subscriptions").update({
                ...mapped ? { status: mapped } : {},
                current_period_start: new Date(obj.current_period_start * 1e3).toISOString().slice(0, 10),
                current_period_end: new Date(obj.current_period_end * 1e3).toISOString().slice(0, 10),
                trial_ends_at: obj.trial_end ? new Date(obj.trial_end * 1e3).toISOString().slice(0, 10) : null
              }).eq("stripe_subscription_id", obj.id);
              break;
            }
            case "customer.subscription.deleted": {
              await supabaseAdmin2.from("tenant_subscriptions").update({ status: "cancelled" }).eq("stripe_subscription_id", obj.id);
              break;
            }
            case "invoice.payment_succeeded":
            case "invoice.payment_failed":
            case "invoice.finalized":
            case "invoice.paid": {
              if (tenantId) {
                const lastErr = obj.last_finalization_error?.message ?? obj.last_payment_error?.message ?? null;
                await supabaseAdmin2.from("tenant_invoices").upsert({
                  tenant_id: tenantId,
                  stripe_invoice_id: obj.id,
                  stripe_customer_id: customerId ?? null,
                  stripe_subscription_id: obj.subscription ?? null,
                  status: obj.status,
                  amount_due: obj.amount_due ?? 0,
                  amount_paid: obj.amount_paid ?? 0,
                  currency: obj.currency ?? null,
                  hosted_invoice_url: obj.hosted_invoice_url ?? null,
                  invoice_pdf: obj.invoice_pdf ?? null,
                  period_start: obj.period_start ? new Date(obj.period_start * 1e3).toISOString().slice(0, 10) : null,
                  period_end: obj.period_end ? new Date(obj.period_end * 1e3).toISOString().slice(0, 10) : null,
                  attempt_count: obj.attempt_count ?? 0,
                  last_payment_error: lastErr,
                  invoice_created_at: obj.created ? new Date(obj.created * 1e3).toISOString() : null,
                  paid_at: obj.status_transitions?.paid_at ? new Date(obj.status_transitions.paid_at * 1e3).toISOString() : null
                }, { onConflict: "stripe_invoice_id" });
                if (event.type === "invoice.payment_failed") {
                  await supabaseAdmin2.from("billing_admin_alerts").insert({
                    tenant_id: tenantId,
                    alert_type: "invoice_payment_failed",
                    severity: "error",
                    title: `Invoice payment failed (${(obj.amount_due ?? 0) / 100} ${obj.currency ?? ""})`,
                    message: lastErr ?? "Stripe reports payment failure",
                    context: { invoice_id: obj.id, attempt_count: obj.attempt_count, hosted_invoice_url: obj.hosted_invoice_url }
                  });
                }
              }
              break;
            }
            case "setup_intent.succeeded":
            case "payment_method.attached": {
              const pmId = obj.payment_method ?? obj.id;
              const pmType = obj.payment_method_types?.[0] ?? obj.type ?? null;
              if (customerId) {
                const { data: beforeSub } = await supabaseAdmin2.from("tenant_subscriptions").select("mandate_status, mandate_payment_method_id").eq("stripe_customer_id", customerId).maybeSingle();
                await supabaseAdmin2.from("tenant_subscriptions").update({
                  mandate_status: "active",
                  mandate_payment_method_id: pmId,
                  mandate_last_checked_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("stripe_customer_id", customerId);
                await supabaseAdmin2.from("billing_audit_log").insert({
                  tenant_id: tenantId,
                  event_type: "mandate.attached",
                  stripe_event_id: event.id + ":mandate",
                  payload: { payment_method: pmId, type: pmType }
                });
                await supabaseAdmin2.from("billing_ops_audit").insert({
                  action: "mandate.update",
                  target_type: "mandate",
                  target_id: pmId,
                  tenant_id: tenantId,
                  before: beforeSub,
                  after: { mandate_status: "active", mandate_payment_method_id: pmId },
                  metadata: { source: "stripe_webhook", event_type: event.type, type: pmType }
                });
              }
              break;
            }
            case "mandate.updated": {
              if (customerId) {
                const { data: beforeSub } = await supabaseAdmin2.from("tenant_subscriptions").select("mandate_status, mandate_payment_method_id").eq("stripe_customer_id", customerId).maybeSingle();
                await supabaseAdmin2.from("tenant_subscriptions").update({
                  mandate_status: obj.status,
                  mandate_last_checked_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("stripe_customer_id", customerId);
                await supabaseAdmin2.from("billing_ops_audit").insert({
                  action: "mandate.update",
                  target_type: "mandate",
                  target_id: obj.id ?? null,
                  tenant_id: tenantId,
                  before: beforeSub,
                  after: { mandate_status: obj.status },
                  metadata: { source: "stripe_webhook", event_type: event.type }
                });
              }
              break;
            }
            default:
              break;
          }
        } catch (e) {
          await supabaseAdmin2.from("billing_admin_alerts").insert({
            tenant_id: tenantId,
            alert_type: "stripe_webhook_handler_error",
            severity: "error",
            title: `Webhook handler error: ${event.type}`,
            message: e?.message ?? String(e),
            context: { event_id: event.id, event_type: event.type }
          });
        }
        await supabaseAdmin2.from("billing_audit_log").insert({
          tenant_id: tenantId,
          event_type: event.type,
          stripe_event_id: event.id,
          payload: {
            id: obj.id,
            status: obj.status,
            amount_due: obj.amount_due,
            amount_paid: obj.amount_paid,
            subscription: subscriptionId,
            customer: customerId
          }
        });
        return Response.json({ ok: true });
      }
    }
  }
});
async function ingestFindingsAndAlert(findings) {
  let inserted = 0;
  let alerted = 0;
  const newErrorFindings = [];
  for (const f of findings) {
    const scanned_at = f.scanned_at ?? (/* @__PURE__ */ new Date()).toISOString();
    const { data: existing } = await supabaseAdmin.from("security_findings_log").select("id,status").eq("scanner_name", f.scanner_name).eq("internal_id", f.internal_id).order("scanned_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      await supabaseAdmin.from("security_findings_log").update({ scanned_at }).eq("id", existing.id);
      continue;
    }
    const { data: row, error } = await supabaseAdmin.from("security_findings_log").insert({
      scanner_name: f.scanner_name,
      internal_id: f.internal_id,
      title: f.title,
      severity: f.severity,
      status: f.status ?? "open",
      description: f.description ?? null,
      remediation: f.remediation ?? null,
      scanned_at
    }).select("id").single();
    if (error || !row) continue;
    inserted += 1;
    if (f.severity === "error" && (f.status ?? "open") === "open") {
      newErrorFindings.push({ ...f, id: row.id });
    }
  }
  if (!newErrorFindings.length) return { inserted, alerted };
  const { data: superRoles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "super_admin");
  const superIds = (superRoles ?? []).map((r) => r.user_id);
  if (!superIds.length) return { inserted, alerted };
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id,email,full_name").in("id", superIds);
  const recipients = (profiles ?? []).filter((p) => p.email);
  const { data: governance } = await supabaseAdmin.from("tenant_governance").select("tenant_id, security_alert_webhook_url").not("security_alert_webhook_url", "is", null);
  for (const finding of newErrorFindings) {
    for (const r of recipients) {
      try {
        await sendInternalEmail({
          templateName: "security-finding-alert",
          recipientEmail: r.email,
          templateData: {
            recipientName: r.full_name ?? "Admin",
            scannerName: finding.scanner_name,
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            internalId: finding.internal_id,
            scannedAt: finding.scanned_at,
            findingsUrl: "https://hrppl.io/admin/security",
            errorCount: newErrorFindings.length
          }
        });
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "email",
          recipient: r.email,
          status: "sent",
          sent_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        alerted += 1;
      } catch (err) {
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "email",
          recipient: r.email,
          status: "failed",
          error_message: String(err?.message ?? err)
        });
      }
    }
    for (const g of governance ?? []) {
      const url = g.security_alert_webhook_url;
      if (!url) continue;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "security.finding.error",
            occurred_at: (/* @__PURE__ */ new Date()).toISOString(),
            finding: {
              id: finding.id,
              scanner_name: finding.scanner_name,
              internal_id: finding.internal_id,
              severity: finding.severity,
              title: finding.title,
              description: finding.description,
              scanned_at: finding.scanned_at
            }
          })
        });
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "webhook",
          recipient: url,
          status: res.ok ? "sent" : "failed",
          error_message: res.ok ? null : `HTTP ${res.status}`,
          sent_at: res.ok ? (/* @__PURE__ */ new Date()).toISOString() : null
        });
        if (res.ok) alerted += 1;
      } catch (err) {
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "webhook",
          recipient: url,
          status: "failed",
          error_message: String(err?.message ?? err)
        });
      }
    }
  }
  return { inserted, alerted };
}
const Body = objectType({
  scanned_at: stringType().optional(),
  findings: arrayType(objectType({
    scanner_name: stringType().min(1).max(80),
    internal_id: stringType().min(1).max(200),
    title: stringType().min(1).max(255),
    severity: enumType(["error", "warn", "info"]),
    status: enumType(["open", "fixed", "ignored", "accepted_risk"]).optional(),
    description: stringType().max(8e3).optional(),
    remediation: stringType().max(8e3).optional()
  })).min(0).max(500)
});
function verifySig(secret, signatureHex, body) {
  if (!signatureHex) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(signatureHex, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual$1(a, b);
  } catch {
    return false;
  }
}
const Route$k = createFileRoute("/api/public/hooks/security-scan-results")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SECURITY_SCAN_WEBHOOK_SECRET;
        if (!secret) return new Response("Server not configured", { status: 503 });
        const raw = await request.text();
        if (!verifySig(secret, request.headers.get("x-scan-signature"), raw)) {
          return new Response("Invalid signature", { status: 401 });
        }
        let payload;
        try {
          payload = Body.parse(JSON.parse(raw));
        } catch (e) {
          return new Response(`Invalid payload: ${e.message}`, { status: 400 });
        }
        const scanned_at = payload.scanned_at ?? (/* @__PURE__ */ new Date()).toISOString();
        const result = await ingestFindingsAndAlert(
          payload.findings.map((f) => ({ ...f, scanned_at }))
        );
        return Response.json({ ok: true, ...result });
      }
    }
  }
});
const Route$j = createFileRoute("/api/public/hooks/review-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const { sendInternalEmail: sendInternalEmail2 } = await import("./send-internal.server-9cG3k97B.mjs");
          const DAY_MS = 24 * 60 * 60 * 1e3;
          const now = /* @__PURE__ */ new Date();
          const todayIso = now.toISOString().slice(0, 10);
          const todayMonthDay = todayIso.slice(5);
          const dow = now.getUTCDay();
          const isWeekendToday = dow === 0 || dow === 6;
          const holidayCache = /* @__PURE__ */ new Map();
          async function isHolidayToday(countryCode) {
            if (!countryCode) return false;
            if (holidayCache.has(countryCode)) return holidayCache.get(countryCode);
            const { data } = await supabaseAdmin2.from("public_holidays").select("holiday_date,is_recurring").eq("country_code", countryCode);
            const hit = (data ?? []).some((h) => {
              if (h.holiday_date === todayIso) return true;
              if (h.is_recurring && typeof h.holiday_date === "string" && h.holiday_date.slice(5) === todayMonthDay) return true;
              return false;
            });
            holidayCache.set(countryCode, hit);
            return hit;
          }
          const tenantCountryCache = /* @__PURE__ */ new Map();
          async function tenantCountry(tenantId) {
            if (tenantCountryCache.has(tenantId)) return tenantCountryCache.get(tenantId);
            const { data } = await supabaseAdmin2.from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
            const cc = data?.country_code ?? null;
            tenantCountryCache.set(tenantId, cc);
            return cc;
          }
          async function isBusinessDayFor(tenantId) {
            if (isWeekendToday) return false;
            const cc = await tenantCountry(tenantId);
            return !await isHolidayToday(cc);
          }
          let sent = 0;
          let inAppCreated = 0;
          const { data: cycles } = await supabaseAdmin2.from("review_cycles").select("id,tenant_id,name,period_start,period_end,status,reminders_enabled,reminder_interval_days,reminder_start_offset_days,reminder_business_days_only,reminder_max_count").eq("status", "active");
          const prefCache = /* @__PURE__ */ new Map();
          async function loadPref(userId) {
            if (prefCache.has(userId)) return prefCache.get(userId);
            const { data } = await supabaseAdmin2.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
            prefCache.set(userId, data ?? null);
            return data ?? null;
          }
          for (const cycle of cycles ?? []) {
            if (cycle.reminders_enabled === false) continue;
            if (cycle.reminder_business_days_only && !await isBusinessDayFor(cycle.tenant_id)) continue;
            if (cycle.period_start && cycle.reminder_start_offset_days > 0) {
              const startMs = (/* @__PURE__ */ new Date(cycle.period_start + "T00:00:00Z")).getTime() + cycle.reminder_start_offset_days * DAY_MS;
              if (now.getTime() < startMs) continue;
            }
            const intervalDaysCycle = cycle.reminder_interval_days ?? 3;
            const maxCount = cycle.reminder_max_count ?? null;
            const { data: reviews } = await supabaseAdmin2.from("performance_reviews").select("id,tenant_id,employee_id,reviewer_id,status,last_reminder_at,reminder_count").eq("cycle_id", cycle.id).in("status", ["draft", "self_submitted", "finalized"]);
            for (const r of reviews ?? []) {
              if (maxCount != null && (r.reminder_count ?? 0) >= maxCount) continue;
              let kind = null;
              let targetUserId = null;
              let prefKey = null;
              if (r.status === "draft") {
                kind = "self";
                prefKey = "notify_review_self_pending";
                const { data: emp } = await supabaseAdmin2.from("employees").select("user_id").eq("id", r.employee_id).maybeSingle();
                targetUserId = emp?.user_id ?? null;
              } else if (r.status === "self_submitted") {
                kind = "manager";
                prefKey = "notify_review_manager_pending";
                targetUserId = r.reviewer_id;
              } else if (r.status === "finalized") {
                kind = "acknowledgment";
                prefKey = "notify_review_acknowledgment";
                const { data: emp } = await supabaseAdmin2.from("employees").select("user_id").eq("id", r.employee_id).maybeSingle();
                targetUserId = emp?.user_id ?? null;
              }
              if (!kind || !targetUserId) continue;
              const userPref = await loadPref(targetUserId);
              const userInterval = userPref?.review_reminder_min_interval_days ?? null;
              const userBizOnly = !!userPref?.review_reminder_business_days_only;
              if (userBizOnly && !await isBusinessDayFor(r.tenant_id)) continue;
              const effectiveIntervalDays = Math.max(
                intervalDaysCycle,
                userInterval ?? 0
              );
              if (r.last_reminder_at) {
                const sinceMs = now.getTime() - new Date(r.last_reminder_at).getTime();
                if (sinceMs < effectiveIntervalDays * DAY_MS) continue;
              }
              const { data: prof } = await supabaseAdmin2.from("profiles").select("email,full_name").eq("id", targetUserId).maybeSingle();
              const { data: empRow } = await supabaseAdmin2.from("employees").select("first_name,last_name").eq("id", r.employee_id).maybeSingle();
              const employeeName = empRow ? `${empRow.first_name ?? ""} ${empRow.last_name ?? ""}`.trim() : void 0;
              await supabaseAdmin2.from("in_app_notifications").insert({
                tenant_id: r.tenant_id,
                user_id: targetUserId,
                kind: `review_${kind}_pending`,
                title: kind === "self" ? "Self-review pending" : kind === "manager" ? `Review pending${employeeName ? ` for ${employeeName}` : ""}` : "Acknowledge your finalized review",
                body: `Cycle: ${cycle.name}`,
                link: "/performance",
                metadata: { cycle_id: cycle.id, review_id: r.id, kind }
              });
              inAppCreated += 1;
              if (prof?.email) {
                await sendInternalEmail2({
                  templateName: "review-reminder",
                  recipientEmail: prof.email,
                  idempotencyKey: `review-reminder-${r.id}-${(r.reminder_count ?? 0) + 1}`,
                  preferenceKey: prefKey,
                  templateData: {
                    kind,
                    recipientName: prof.full_name ?? void 0,
                    cycleName: cycle.name,
                    employeeName,
                    dueDate: cycle.period_end
                  }
                });
                sent += 1;
              }
              await supabaseAdmin2.from("performance_reviews").update({
                last_reminder_at: now.toISOString(),
                reminder_count: (r.reminder_count ?? 0) + 1
              }).eq("id", r.id);
            }
            const { count: awaitingCalibration } = await supabaseAdmin2.from("performance_reviews").select("id", { count: "exact", head: true }).eq("cycle_id", cycle.id).eq("status", "manager_submitted");
            if ((awaitingCalibration ?? 0) > 0) {
              const { data: admins } = await supabaseAdmin2.from("user_roles").select("user_id").in("role", ["org_admin", "super_admin"]);
              const adminIds = Array.from(new Set((admins ?? []).map((a) => a.user_id)));
              if (adminIds.length) {
                const { data: adminProfs } = await supabaseAdmin2.from("profiles").select("id,email,full_name,tenant_id").in("id", adminIds);
                for (const a of adminProfs ?? []) {
                  if (a.tenant_id && a.tenant_id !== cycle.tenant_id) continue;
                  await supabaseAdmin2.from("in_app_notifications").insert({
                    tenant_id: cycle.tenant_id,
                    user_id: a.id,
                    kind: "review_calibration_pending",
                    title: `${awaitingCalibration} review${awaitingCalibration === 1 ? "" : "s"} ready for calibration`,
                    body: `Cycle: ${cycle.name}`,
                    link: "/org/performance",
                    metadata: { cycle_id: cycle.id, count: awaitingCalibration }
                  });
                  inAppCreated += 1;
                  if (a.email) {
                    await sendInternalEmail2({
                      templateName: "review-reminder",
                      recipientEmail: a.email,
                      idempotencyKey: `review-calibration-${cycle.id}-${now.toISOString().slice(0, 10)}`,
                      preferenceKey: "notify_review_calibration",
                      templateData: {
                        kind: "calibration",
                        recipientName: a.full_name ?? void 0,
                        cycleName: cycle.name,
                        dueDate: cycle.period_end
                      }
                    });
                    sent += 1;
                  }
                }
              }
            }
          }
          return new Response(JSON.stringify({ ok: true, sent, inAppCreated }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("[review-reminders] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$i = createFileRoute("/api/public/hooks/review-instance-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const { sendInternalEmail: sendInternalEmail2 } = await import("./send-internal.server-9cG3k97B.mjs");
          const DAY_MS = 864e5;
          const now = /* @__PURE__ */ new Date();
          const horizon = new Date(now.getTime() + 3 * DAY_MS).toISOString().slice(0, 10);
          const { data: pending } = await supabaseAdmin2.from("review_instances").select("id,tenant_id,template_id,item_id,employee_id,due_date,scheduled_for,period_label,reminder_sent_at,reminder_count,status").eq("status", "pending").lte("due_date", horizon);
          const { data: submitted } = await supabaseAdmin2.from("review_instances").select("id,tenant_id,template_id,item_id,employee_id,due_date,scheduled_for,period_label,reminder_sent_at,reminder_count,status").eq("status", "submitted");
          let emailSent = 0;
          let inAppCreated = 0;
          const tplCache = /* @__PURE__ */ new Map();
          async function getTpl(id) {
            if (tplCache.has(id)) return tplCache.get(id);
            const { data } = await supabaseAdmin2.from("review_templates").select("id,name,competencies").eq("id", id).maybeSingle();
            tplCache.set(id, data);
            return data;
          }
          async function notify(inst, recipientUserId, kind) {
            const sinceMs = inst.reminder_sent_at ? now.getTime() - new Date(inst.reminder_sent_at).getTime() : Infinity;
            if (sinceMs < 2 * DAY_MS) return;
            const tpl = await getTpl(inst.template_id);
            const comp = (tpl?.competencies ?? []).find((c) => c.id === inst.item_id);
            const itemLabel = comp?.label ?? inst.item_id;
            const dueLabel = inst.due_date ?? inst.scheduled_for;
            const overdue = inst.due_date && inst.due_date < now.toISOString().slice(0, 10);
            const title = kind === "employee" ? overdue ? `Overdue scorecard: ${itemLabel}` : `Scorecard due soon: ${itemLabel}` : `Awaiting your review: ${itemLabel}`;
            const body = kind === "employee" ? `${tpl?.name ?? "Review"} • ${inst.period_label} • Due ${dueLabel}` : `${tpl?.name ?? "Review"} • ${inst.period_label} • Submitted by employee`;
            await supabaseAdmin2.from("in_app_notifications").insert({
              tenant_id: inst.tenant_id,
              user_id: recipientUserId,
              kind: kind === "employee" ? "review_instance_due" : "review_instance_awaiting_approval",
              title,
              body,
              link: kind === "employee" ? "/me/reviews" : "/admin/review-analytics",
              metadata: { instance_id: inst.id, template_id: inst.template_id, item_id: inst.item_id, overdue }
            });
            inAppCreated += 1;
            const { data: prof } = await supabaseAdmin2.from("profiles").select("email,full_name").eq("id", recipientUserId).maybeSingle();
            if (prof?.email) {
              await sendInternalEmail2({
                templateName: "review-reminder",
                recipientEmail: prof.email,
                idempotencyKey: `ri-${inst.id}-${(inst.reminder_count ?? 0) + 1}-${kind}`,
                templateData: {
                  kind: kind === "employee" ? "self" : "manager",
                  recipientName: prof.full_name ?? void 0,
                  cycleName: `${tpl?.name ?? "Review"} — ${itemLabel}`,
                  dueDate: dueLabel
                }
              });
              emailSent += 1;
            }
            await supabaseAdmin2.from("review_instances").update({
              reminder_sent_at: now.toISOString(),
              reminder_count: (inst.reminder_count ?? 0) + 1
            }).eq("id", inst.id);
          }
          for (const inst of pending ?? []) {
            const { data: emp } = await supabaseAdmin2.from("employees").select("user_id").eq("id", inst.employee_id).maybeSingle();
            const uid = emp?.user_id;
            if (uid) await notify(inst, uid, "employee");
          }
          const adminCache = /* @__PURE__ */ new Map();
          async function getApprovers(tenantId) {
            if (adminCache.has(tenantId)) return adminCache.get(tenantId);
            const { data: roles } = await supabaseAdmin2.from("user_roles").select("user_id,role").in("role", ["org_admin", "manager"]);
            const ids = (roles ?? []).map((r) => r.user_id);
            const { data: profs } = ids.length ? await supabaseAdmin2.from("profiles").select("id").eq("tenant_id", tenantId).in("id", ids) : { data: [] };
            const list = (profs ?? []).map((p) => p.id);
            adminCache.set(tenantId, list);
            return list;
          }
          for (const inst of submitted ?? []) {
            const approvers = await getApprovers(inst.tenant_id);
            for (const uid of approvers) await notify(inst, uid, "approver");
          }
          return new Response(JSON.stringify({ ok: true, emailSent, inAppCreated }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$h = createFileRoute("/api/public/hooks/onboarding-task-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const { sendInternalEmail: sendInternalEmail2 } = await import("./send-internal.server-9cG3k97B.mjs");
          const DAY_MS = 864e5;
          const now = /* @__PURE__ */ new Date();
          const todayIso = now.toISOString().slice(0, 10);
          const cutoffIso = new Date(now.getTime() + 2 * DAY_MS).toISOString().slice(0, 10);
          const { data: tasks } = await supabaseAdmin2.from("onboarding_control_room_tasks").select("id,assignment_id,assigned_to,owner_role,title,due_date,status,last_reminder_at").in("status", ["pending", "in_progress"]).not("due_date", "is", null).lte("due_date", cutoffIso);
          let sent = 0;
          for (const t of tasks ?? []) {
            if (t.last_reminder_at) {
              const since = now.getTime() - new Date(t.last_reminder_at).getTime();
              if (since < DAY_MS) continue;
            }
            const due = (/* @__PURE__ */ new Date(t.due_date + "T00:00:00Z")).getTime();
            const diffDays = Math.floor((due - now.getTime()) / DAY_MS);
            const isOverdue = due < now.getTime();
            const { data: a } = await supabaseAdmin2.from("onboarding_assignments").select("employee_id").eq("id", t.assignment_id).maybeSingle();
            if (!a?.employee_id) continue;
            const { data: emp } = await supabaseAdmin2.from("employees").select("first_name,last_name,email,manager_id").eq("id", a.employee_id).maybeSingle();
            if (!emp) continue;
            const employeeName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();
            const recipients = /* @__PURE__ */ new Set();
            if (t.assigned_to) {
              const { data: u } = await supabaseAdmin2.from("profiles").select("email").eq("id", t.assigned_to).maybeSingle();
              if (u?.email) recipients.add(u.email);
            }
            if (recipients.size === 0 && emp.manager_id) {
              const { data: mgr } = await supabaseAdmin2.from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
              if (mgr?.email) recipients.add(mgr.email);
            }
            if (recipients.size === 0 && t.owner_role === "employee" && emp.email) {
              recipients.add(emp.email);
            }
            if (recipients.size === 0) continue;
            for (const to of recipients) {
              await sendInternalEmail2({
                templateName: "onboarding-task-reminder",
                recipientEmail: to,
                preferenceKey: "notify_onboarding_task",
                idempotencyKey: `onboarding-task-reminder-${t.id}-${todayIso}`,
                templateData: {
                  employeeName,
                  taskTitle: t.title,
                  ownerRole: t.owner_role,
                  dueDate: t.due_date,
                  daysUntilDue: Math.max(0, diffDays),
                  isOverdue
                }
              });
              sent++;
            }
            await supabaseAdmin2.from("onboarding_control_room_tasks").update({ last_reminder_at: now.toISOString() }).eq("id", t.id);
          }
          return new Response(JSON.stringify({ ok: true, sent }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("[onboarding-task-reminders]", e);
          return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$g = createFileRoute("/api/public/hooks/onboarding-overdue-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const { sendInternalEmail: sendInternalEmail2 } = await import("./send-internal.server-9cG3k97B.mjs");
          const DAY_MS = 24 * 60 * 60 * 1e3;
          const INTERVAL_DAYS = 3;
          const now = /* @__PURE__ */ new Date();
          const todayIso = now.toISOString().slice(0, 10);
          let sent = 0;
          let inAppCreated = 0;
          const { data: assignments } = await supabaseAdmin2.from("onboarding_assignments").select("id,tenant_id,employee_id,checklist_id,due_date,status,signed_off_at,last_reminder_at,reminder_count").eq("status", "in_progress").is("signed_off_at", null).not("due_date", "is", null).lt("due_date", todayIso);
          for (const a of assignments ?? []) {
            if (a.last_reminder_at) {
              const since = now.getTime() - new Date(a.last_reminder_at).getTime();
              if (since < INTERVAL_DAYS * DAY_MS) continue;
            }
            const { data: emp } = await supabaseAdmin2.from("employees").select("id,user_id,first_name,last_name,manager_id").eq("id", a.employee_id).maybeSingle();
            if (!emp) continue;
            const employeeName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || void 0;
            const { data: checklist } = await supabaseAdmin2.from("onboarding_checklists").select("name").eq("id", a.checklist_id).maybeSingle();
            const checklistName = checklist?.name;
            const dueDate = a.due_date;
            const daysOverdue = Math.max(
              0,
              Math.floor((now.getTime() - (/* @__PURE__ */ new Date(dueDate + "T00:00:00Z")).getTime()) / DAY_MS)
            );
            if (emp.user_id) {
              await supabaseAdmin2.from("in_app_notifications").insert({
                tenant_id: a.tenant_id,
                user_id: emp.user_id,
                kind: "onboarding_overdue",
                title: "Onboarding task overdue",
                body: checklistName ? `Checklist: ${checklistName}` : "An onboarding task is overdue.",
                link: "/onboarding",
                metadata: { assignment_id: a.id, checklist_id: a.checklist_id, due_date: dueDate, days_overdue: daysOverdue }
              });
              inAppCreated += 1;
              const { data: prof } = await supabaseAdmin2.from("profiles").select("email,full_name").eq("id", emp.user_id).maybeSingle();
              if (prof?.email) {
                await sendInternalEmail2({
                  templateName: "onboarding-overdue",
                  recipientEmail: prof.email,
                  idempotencyKey: `onboarding-overdue-emp-${a.id}-${(a.reminder_count ?? 0) + 1}`,
                  preferenceKey: "notify_onboarding_overdue",
                  templateData: {
                    audience: "employee",
                    recipientName: prof.full_name ?? void 0,
                    employeeName,
                    checklistName,
                    dueDate,
                    daysOverdue
                  }
                });
                sent += 1;
              }
            }
            if (emp.manager_id) {
              const { data: mgr } = await supabaseAdmin2.from("employees").select("user_id,first_name,last_name").eq("id", emp.manager_id).maybeSingle();
              const mgrUserId = mgr?.user_id;
              if (mgrUserId) {
                await supabaseAdmin2.from("in_app_notifications").insert({
                  tenant_id: a.tenant_id,
                  user_id: mgrUserId,
                  kind: "onboarding_overdue_manager",
                  title: `Onboarding overdue${employeeName ? `: ${employeeName}` : ""}`,
                  body: checklistName ? `Checklist: ${checklistName}` : "A direct report's onboarding task is overdue.",
                  link: "/org/onboarding",
                  metadata: { assignment_id: a.id, employee_id: a.employee_id, checklist_id: a.checklist_id, due_date: dueDate, days_overdue: daysOverdue }
                });
                inAppCreated += 1;
                const { data: mgrProf } = await supabaseAdmin2.from("profiles").select("email,full_name").eq("id", mgrUserId).maybeSingle();
                if (mgrProf?.email) {
                  await sendInternalEmail2({
                    templateName: "onboarding-overdue",
                    recipientEmail: mgrProf.email,
                    idempotencyKey: `onboarding-overdue-mgr-${a.id}-${(a.reminder_count ?? 0) + 1}`,
                    preferenceKey: "notify_onboarding_overdue",
                    templateData: {
                      audience: "manager",
                      recipientName: mgrProf.full_name ?? void 0,
                      employeeName,
                      checklistName,
                      dueDate,
                      daysOverdue
                    }
                  });
                  sent += 1;
                }
              }
            }
            await supabaseAdmin2.from("onboarding_assignments").update({
              last_reminder_at: now.toISOString(),
              reminder_count: (a.reminder_count ?? 0) + 1
            }).eq("id", a.id);
          }
          return new Response(
            JSON.stringify({ ok: true, processed: (assignments ?? []).length, emailsSent: sent, inAppCreated }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("onboarding-overdue-reminders error", e);
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$f = createFileRoute("/api/public/hooks/offboarding-due-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const in7 = /* @__PURE__ */ new Date();
        in7.setDate(in7.getDate() + 7);
        const horizon = in7.toISOString().slice(0, 10);
        const { data: cases } = await supabaseAdmin2.from("offboarding_cases").select("id,tenant_id,employee_id,manager_id,hr_owner_id,last_working_day,status,reason").not("status", "in", "(completed,cancelled)");
        let sent = 0;
        for (const c of cases ?? []) {
          const { data: state } = await supabaseAdmin2.from("offboarding_reminder_state").select("last_alert_date,alert_count").eq("case_id", c.id).maybeSingle();
          if (state?.last_alert_date === today) continue;
          const lwd = c.last_working_day;
          const lwdSoon = lwd && lwd >= today && lwd <= horizon;
          const lwdOverdue = lwd && lwd < today;
          const { data: overdueItems } = await supabaseAdmin2.from("offboarding_checklist_items").select("id,title,due_date,is_blocking,completed").eq("case_id", c.id).eq("completed", false).eq("is_blocking", true).lt("due_date", today);
          const { data: pendingReturns } = await supabaseAdmin2.from("asset_assignments").select("id, return_status, assets:asset_id(name,asset_tag)").eq("employee_id", c.employee_id).is("return_confirmed_at", null).neq("return_status", "confirmed");
          const flags = [];
          if (lwdSoon) flags.push(`Last working day ${lwd} approaching`);
          if (lwdOverdue) flags.push(`Last working day ${lwd} has passed`);
          if ((overdueItems ?? []).length) flags.push(`${overdueItems.length} overdue blocking task(s)`);
          if ((pendingReturns ?? []).length) flags.push(`${pendingReturns.length} asset return(s) pending confirmation`);
          if (!flags.length) continue;
          const { data: emp } = await supabaseAdmin2.from("employees").select("user_id").eq("id", c.employee_id).maybeSingle();
          const targets = /* @__PURE__ */ new Set();
          if (c.hr_owner_id) targets.add(c.hr_owner_id);
          if (c.manager_id) targets.add(c.manager_id);
          if (emp?.user_id) targets.add(emp.user_id);
          if (!targets.size) continue;
          const body = flags.join(" • ");
          const rows = Array.from(targets).map((user_id) => ({
            tenant_id: c.tenant_id,
            user_id,
            kind: "offboarding_reminder",
            title: lwdOverdue ? "Offboarding overdue" : "Offboarding reminder",
            body,
            link: "/admin/offboarding",
            metadata: { case_id: c.id, last_working_day: lwd, overdue_items: overdueItems?.length ?? 0, pending_returns: pendingReturns?.length ?? 0 }
          }));
          await supabaseAdmin2.from("in_app_notifications").insert(rows);
          await supabaseAdmin2.from("offboarding_reminder_state").upsert({
            case_id: c.id,
            tenant_id: c.tenant_id,
            last_alert_date: today,
            alert_count: (state?.alert_count ?? 0) + 1,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          sent += rows.length;
        }
        return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
      }
    }
  }
});
const Route$e = createFileRoute("/api/public/hooks/monthly-billing-cycle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const body = await request.json().catch(() => ({}));
        const now = /* @__PURE__ */ new Date();
        const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        const year = body.year ?? target.getUTCFullYear();
        const month = body.month ?? target.getUTCMonth() + 1;
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        try {
          const { runMonthlyBillingForAllTenants, reconcileMonth } = await import("./billing.server-BzOVdJud.mjs");
          const results = await runMonthlyBillingForAllTenants(year, month);
          const summary = {
            year,
            month,
            total: results.length,
            reported: results.filter((r) => r.status === "reported").length,
            skipped: results.filter((r) => r.status === "skipped").length,
            failed: results.filter((r) => r.status === "failed").length
          };
          let reconciliation = null;
          if (!body.skipReconcile) {
            try {
              reconciliation = await reconcileMonth(year, month);
            } catch (e) {
              await supabaseAdmin2.from("billing_admin_alerts").insert({
                alert_type: "reconciliation_run_failed",
                severity: "error",
                title: `Reconciliation crashed for ${year}-${String(month).padStart(2, "0")}`,
                message: e?.message ?? String(e),
                context: { year, month }
              });
            }
          }
          if (summary.failed > 0) {
            await supabaseAdmin2.from("billing_admin_alerts").insert({
              alert_type: "monthly_billing_partial_failure",
              severity: "warning",
              title: `${summary.failed} tenants failed to report usage for ${year}-${String(month).padStart(2, "0")}`,
              message: `Reported ${summary.reported}/${summary.total}; ${summary.failed} failed.`,
              context: { year, month, summary }
            });
          }
          return Response.json({ ok: true, summary, reconciliation, results });
        } catch (e) {
          await supabaseAdmin2.from("billing_admin_alerts").insert({
            alert_type: "monthly_billing_cron_failed",
            severity: "error",
            title: `Monthly billing cron failed (${year}-${String(month).padStart(2, "0")})`,
            message: e?.message ?? String(e),
            context: { year, month }
          });
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500 });
        }
      }
    }
  }
});
async function loadAdmin$1() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin2;
}
async function getOrCreateBalance(admin, tenantId, employeeId, leaveTypeId, year) {
  const {
    data: existing
  } = await admin.from("leave_balances").select("*").eq("employee_id", employeeId).eq("leave_type_id", leaveTypeId).eq("year", year).maybeSingle();
  if (existing) return existing;
  const {
    data: created
  } = await admin.from("leave_balances").insert({
    tenant_id: tenantId,
    employee_id: employeeId,
    leave_type_id: leaveTypeId,
    year,
    accrued_days: 0,
    used_days: 0,
    pending_days: 0,
    carried_over_days: 0
  }).select().single();
  return created;
}
async function runMonthlyAccrualImpl(opts) {
  const admin = await loadAdmin$1();
  const periodKey = `${opts.year}-${String(opts.month).padStart(2, "0")}`;
  const summary = {
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  let ltQuery = admin.from("leave_types").select("id,tenant_id,accrual_per_month").eq("is_active", true).gt("accrual_per_month", 0);
  if (opts.tenantId) ltQuery = ltQuery.eq("tenant_id", opts.tenantId);
  const {
    data: leaveTypes,
    error: ltErr
  } = await ltQuery;
  if (ltErr) throw new Error(ltErr.message);
  for (const lt of leaveTypes ?? []) {
    const {
      data: emps
    } = await admin.from("employees").select("id,tenant_id,hire_date,termination_date,status").eq("tenant_id", lt.tenant_id).eq("status", "active");
    for (const emp of emps ?? []) {
      try {
        const periodStart = new Date(Date.UTC(opts.year, opts.month - 1, 1));
        const periodEnd = new Date(Date.UTC(opts.year, opts.month, 0));
        const hire = /* @__PURE__ */ new Date(emp.hire_date + "T00:00:00Z");
        if (hire > periodEnd) {
          summary.skipped++;
          continue;
        }
        if (emp.termination_date) {
          const term = /* @__PURE__ */ new Date(emp.termination_date + "T00:00:00Z");
          if (term < periodStart) {
            summary.skipped++;
            continue;
          }
        }
        const amount = Number(lt.accrual_per_month);
        const {
          error: logErr
        } = await admin.from("leave_accrual_log").insert({
          tenant_id: lt.tenant_id,
          employee_id: emp.id,
          leave_type_id: lt.id,
          kind: "accrual",
          period_key: periodKey,
          amount,
          actor_id: opts.actorId,
          reason: `Monthly accrual ${periodKey}`
        });
        if (logErr) {
          if (logErr.code === "23505") {
            summary.skipped++;
            continue;
          }
          throw new Error(logErr.message);
        }
        const bal = await getOrCreateBalance(admin, lt.tenant_id, emp.id, lt.id, opts.year);
        await admin.from("leave_balances").update({
          accrued_days: Number(bal.accrued_days) + amount
        }).eq("id", bal.id);
        summary.processed++;
      } catch (e) {
        summary.failed++;
        summary.errors.push(`${emp.id}/${lt.id}: ${e.message ?? String(e)}`);
      }
    }
  }
  return summary;
}
const runMonthlyLeaveAccrual = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  year: numberType().int().min(2e3).max(2100).optional(),
  month: numberType().int().min(1).max(12).optional(),
  tenantId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("7ed9904cc68911432d82eecd7363a8fdb3dcefa6b0bcba4a65119e90b6c6c73c"));
async function runMonthlyAccrualSystem(year, month) {
  return runMonthlyAccrualImpl({
    year,
    month,
    actorId: null
  });
}
async function runCarryOverImpl(opts) {
  const admin = await loadAdmin$1();
  const periodKey = `${opts.fromYear}->${opts.fromYear + 1}`;
  const summary = {
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  let ltQuery = admin.from("leave_types").select("id,tenant_id,allow_carry_over,max_carry_over_days").eq("is_active", true).eq("allow_carry_over", true);
  if (opts.tenantId) ltQuery = ltQuery.eq("tenant_id", opts.tenantId);
  const {
    data: leaveTypes,
    error: ltErr
  } = await ltQuery;
  if (ltErr) throw new Error(ltErr.message);
  for (const lt of leaveTypes ?? []) {
    const {
      data: balances
    } = await admin.from("leave_balances").select("*").eq("leave_type_id", lt.id).eq("year", opts.fromYear);
    for (const bal of balances ?? []) {
      try {
        const remaining = Math.max(0, Number(bal.accrued_days) + Number(bal.carried_over_days) - Number(bal.used_days));
        const cap = Number(lt.max_carry_over_days);
        const carryAmount = cap > 0 ? Math.min(remaining, cap) : remaining;
        if (carryAmount <= 0) {
          summary.skipped++;
          continue;
        }
        const {
          error: logErr
        } = await admin.from("leave_accrual_log").insert({
          tenant_id: bal.tenant_id,
          employee_id: bal.employee_id,
          leave_type_id: lt.id,
          kind: "carry_over",
          period_key: periodKey,
          amount: carryAmount,
          actor_id: opts.actorId,
          reason: `Year-end carry-over from ${opts.fromYear}`
        });
        if (logErr) {
          if (logErr.code === "23505") {
            summary.skipped++;
            continue;
          }
          throw new Error(logErr.message);
        }
        const next = await getOrCreateBalance(admin, bal.tenant_id, bal.employee_id, lt.id, opts.fromYear + 1);
        await admin.from("leave_balances").update({
          carried_over_days: Number(next.carried_over_days) + carryAmount
        }).eq("id", next.id);
        summary.processed++;
      } catch (e) {
        summary.failed++;
        summary.errors.push(`${bal.employee_id}/${lt.id}: ${e.message ?? String(e)}`);
      }
    }
  }
  return summary;
}
const runYearEndCarryOver = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fromYear: numberType().int().min(2e3).max(2100).optional(),
  tenantId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("b6a045e5655649ee3d5a2483ed47eb6f1d6471dcb9093d1f68913ce06263465a"));
async function runCarryOverSystem(fromYear) {
  return runCarryOverImpl({
    fromYear,
    actorId: null
  });
}
const adjustLeaveBalance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  leaveTypeId: stringType().uuid(),
  year: numberType().int().min(2e3).max(2100),
  field: enumType(["accrued_days", "used_days", "carried_over_days"]),
  delta: numberType().min(-365).max(365).refine((n) => n !== 0, "Delta must be non-zero"),
  reason: stringType().min(1).max(500)
}).parse(d)).handler(createSsrRpc("4b2e174424fdef09003bb03cd2e7c0b7c26d2eaa9fb73b5410ac47ee497df150"));
const projectLeaveBalances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  targetDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("c4f1764d024bcad6fb3c5751ea205c700100e9ff4c49966898058c6e6f88cb63"));
const Route$d = createFileRoute("/api/public/hooks/leave-carry-over")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const body = await request.json().catch(() => ({}));
          const fromYear = Number(body?.fromYear) || (/* @__PURE__ */ new Date()).getUTCFullYear() - 1;
          const summary = await runCarryOverSystem(fromYear);
          return new Response(JSON.stringify({ ok: true, fromYear, ...summary }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("[leave-carry-over] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
async function runAccrual(year, month) {
  const summary = await runMonthlyAccrualSystem(year, month);
  return new Response(JSON.stringify({ ok: true, year, month, ...summary }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
function failed(e) {
  console.error("[leave-accrual] failed", e);
  const message = e instanceof Error ? e.message : String(e);
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
const Route$c = createFileRoute("/api/public/hooks/leave-accrual")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) return unauthorized();
        try {
          const body = await request.json().catch(() => ({}));
          const now = /* @__PURE__ */ new Date();
          const year = Number(body?.year) || now.getUTCFullYear();
          const month = Number(body?.month) || now.getUTCMonth() + 1;
          return await runAccrual(year, month);
        } catch (e) {
          return failed(e);
        }
      },
      // Vercel Cron entry point — GET only, no body.
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) return unauthorized();
        try {
          const now = /* @__PURE__ */ new Date();
          return await runAccrual(now.getUTCFullYear(), now.getUTCMonth() + 1);
        } catch (e) {
          return failed(e);
        }
      }
    }
  }
});
const Route$b = createFileRoute("/api/public/hooks/kpi-cycle-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const { sendInternalEmail: sendInternalEmail2 } = await import("./send-internal.server-9cG3k97B.mjs");
        const admin = supabaseAdmin2;
        const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const todayStart = (/* @__PURE__ */ new Date(todayIso + "T00:00:00Z")).toISOString();
        const { data: cycles } = await admin.from("kpi_review_cycles").select("id, tenant_id, label, starts_on, ends_on, reminder_days_before, last_reminder_sent_at").eq("status", "open");
        let totalSent = 0;
        const summary = [];
        for (const c of cycles ?? []) {
          if (c.last_reminder_sent_at && new Date(c.last_reminder_sent_at).toISOString() >= todayStart) continue;
          const ends = new Date(c.ends_on);
          const today = new Date(todayIso);
          const daysRemaining = Math.ceil((ends.getTime() - today.getTime()) / 864e5);
          if (daysRemaining < 0) continue;
          if (daysRemaining > Number(c.reminder_days_before ?? 3)) continue;
          const { data: duties } = await admin.from("employee_duties").select("employee_id, employees!inner(id, tenant_id, user_id, email, first_name)").eq("tenant_id", c.tenant_id).eq("is_active", true);
          const byEmp = /* @__PURE__ */ new Map();
          for (const d of duties ?? []) {
            const e = d.employees;
            if (!e || byEmp.has(e.id)) continue;
            byEmp.set(e.id, e);
          }
          const employeeIds = Array.from(byEmp.keys());
          if (employeeIds.length === 0) continue;
          const { data: counts } = await admin.from("employee_duties").select("employee_id").eq("tenant_id", c.tenant_id).eq("is_active", true).in("employee_id", employeeIds);
          const totalByEmp = /* @__PURE__ */ new Map();
          for (const r of counts ?? []) totalByEmp.set(r.employee_id, (totalByEmp.get(r.employee_id) ?? 0) + 1);
          const { data: subs } = await admin.from("duty_review_scores").select("employee_id").eq("tenant_id", c.tenant_id).eq("cycle_label", c.label).eq("submitter_kind", "self").in("employee_id", employeeIds);
          const subByEmp = /* @__PURE__ */ new Map();
          for (const r of subs ?? []) subByEmp.set(r.employee_id, (subByEmp.get(r.employee_id) ?? 0) + 1);
          let sent = 0;
          const inAppRows = [];
          for (const [empId, emp] of byEmp) {
            const have = subByEmp.get(empId) ?? 0;
            const need = totalByEmp.get(empId) ?? 0;
            if (need > 0 && have >= need) continue;
            if (emp.user_id) {
              inAppRows.push({
                tenant_id: c.tenant_id,
                user_id: emp.user_id,
                kind: "kpi_cycle_reminder",
                title: `Reminder: KPI self-review for ${c.label} (${daysRemaining}d left)`,
                body: `Submit your duty self-scores before ${c.ends_on}.`,
                link: "/me/duty-self-review",
                metadata: { cycle_id: c.id, cycle_label: c.label, days_remaining: daysRemaining }
              });
            }
            if (emp.email) {
              try {
                await sendInternalEmail2({
                  templateName: "kpi-cycle-status",
                  recipientEmail: emp.email,
                  idempotencyKey: `kpi-${c.id}-reminder-${todayIso}-${emp.email}`,
                  templateData: {
                    kind: "reminder",
                    recipientName: emp.first_name || void 0,
                    cycleName: c.label,
                    startsOn: c.starts_on,
                    endsOn: c.ends_on,
                    daysRemaining,
                    appUrl: (process.env.PUBLIC_APP_URL || "https://hrppl.io") + "/me/duty-self-review"
                  }
                });
                sent += 1;
              } catch (e) {
                console.error("[kpi-cycle-reminders] email failed", e);
              }
            }
          }
          if (inAppRows.length) await admin.from("in_app_notifications").insert(inAppRows);
          await admin.from("kpi_review_cycles").update({ last_reminder_sent_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", c.id);
          totalSent += sent;
          summary.push({ cycle: c.label, tenant_id: c.tenant_id, sent });
        }
        return new Response(JSON.stringify({ ok: true, totalSent, cycles: summary }), {
          headers: { "content-type": "application/json" }
        });
      }
    }
  }
});
const DOC_TYPES = ["national_id", "passport", "drivers_license", "tax_id", "social_security", "bank_details", "next_of_kin", "address_proof", "other"];
const DOC_LABELS = {
  national_id: "National ID / Passport",
  passport: "Passport",
  drivers_license: "Driver's license",
  tax_id: "Tax ID / TFN",
  social_security: "Social security number",
  bank_details: "Bank account details",
  next_of_kin: "Next of kin / emergency contact",
  address_proof: "Proof of address",
  other: "Other document"
};
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_MIN = [1, 5, 15, 60, 240];
const listTeamMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("46c8b615d0fc64d22a6adb7ad83a15fff13302ed7ecdea0a63c8184afdfa0548"));
const recordFiltersSchema = objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType().min(1).max(40)).max(30).optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  search: stringType().trim().max(200).optional(),
  page: numberType().int().min(1).max(1e3).optional(),
  pageSize: numberType().int().min(5).max(200).optional()
});
const listEmployeeRecord = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => recordFiltersSchema.parse(d)).handler(createSsrRpc("31511fa15cd52d112388b324e6d3598afc46e9e92ddc5524b2950e7e96f22d87"));
async function writeAudit(supabase2, tenantId, requestId, actorId, action, fromStatus, toStatus, metadata = {}) {
  try {
    await supabase2.from("id_request_audit_log").insert({
      tenant_id: tenantId,
      request_id: requestId,
      actor_id: actorId,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      metadata
    });
  } catch {
  }
}
async function sendRequestEmailWithRetry(supabase2, request, emp) {
  if (!emp.email) {
    await supabase2.from("id_document_requests").update({
      last_send_status: "failed",
      last_send_error: "Employee has no email on file",
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: request.send_attempts + 1,
      next_retry_at: null
    }).eq("id", request.id);
    await writeAudit(supabase2, request.tenant_id, request.id, null, "send_failed", null, null, {
      reason: "no_email"
    });
    return {
      ok: false,
      error: "no_email"
    };
  }
  try {
    const {
      data: tenant
    } = await supabase2.from("tenants").select("name").eq("id", emp.tenant_id).maybeSingle();
    const docLabel = DOC_LABELS[request.document_type] ?? request.document_type.replace(/_/g, " ");
    const subject = `Action required: please provide ${docLabel}`;
    const html = `
      <p>Hi ${emp.first_name ?? ""},</p>
      <p>${tenant?.name ?? "Your organisation"} needs you to provide the following information:
      <strong>${docLabel}</strong>.</p>
      ${request.notes ? `<p>Notes from your admin: ${request.notes}</p>` : ""}
      <p>Please log in to your account and upload this information at your earliest convenience.</p>
    `.trim();
    const {
      error: enqErr
    } = await supabase2.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: emp.email,
        subject,
        html,
        template_name: "id_document_request",
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        request_id: request.id
      }
    });
    if (enqErr) throw new Error(enqErr.message);
    await supabase2.from("id_document_requests").update({
      last_send_status: "sent",
      last_send_error: null,
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: request.send_attempts + 1,
      next_retry_at: null
    }).eq("id", request.id);
    await writeAudit(supabase2, request.tenant_id, request.id, null, "send_succeeded", null, null, {
      attempt: request.send_attempts + 1
    });
    return {
      ok: true
    };
  } catch (e) {
    const attempt = request.send_attempts + 1;
    const giveUp = attempt >= MAX_RETRY_ATTEMPTS;
    const delay = RETRY_BACKOFF_MIN[Math.min(attempt - 1, RETRY_BACKOFF_MIN.length - 1)];
    const nextRetry = giveUp ? null : new Date(Date.now() + delay * 6e4).toISOString();
    await supabase2.from("id_document_requests").update({
      last_send_status: giveUp ? "failed" : "retrying",
      last_send_error: String(e?.message ?? e),
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: attempt,
      next_retry_at: nextRetry
    }).eq("id", request.id);
    await writeAudit(supabase2, request.tenant_id, request.id, null, "send_failed", null, null, {
      error: String(e?.message ?? e),
      attempt,
      next_retry_at: nextRetry
    });
    return {
      ok: false,
      error: String(e?.message ?? e)
    };
  }
}
const requestMissingDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  documentType: enumType(DOC_TYPES),
  notes: stringType().trim().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("c9c31c2df543d8bfc60477a1aa8dff113e67e5a66a27e0198f54e6af2c89e06f"));
const cancelDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("a6cb68553cf517c858c7ad571f392fd06ce54f5d8218d9b58044f44293034b88"));
const approveDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("30df93f3498b9334a5651e2e9281a235bf9f7388a90d6906c85adcbc252cd68d"));
const resendDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("39dec211cd382844785c2f202405400fcbf326401b6e68136a0d1b7bef881032"));
const bulkSchema = objectType({
  ids: arrayType(stringType().uuid()).min(1).max(200)
});
const bulkApproveDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(createSsrRpc("9f956a5b8665c04f5d1dcd861eabe996a1578383afb8939260c5e710c64f959a"));
const bulkCancelDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(createSsrRpc("d42e8026e584921cd288473bb6579d169c454e46704fd05b1c4dacddda698b17"));
const bulkResendDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(createSsrRpc("a32e063520edc4817837f5df6e4419e71f39cc385dbe0857e81b0847ab2538ea"));
const listAllDocumentRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["pending", "submitted", "cancelled", "all"]).optional()
}).parse(d ?? {})).handler(createSsrRpc("1bb86553dfedc144d277c249795c3740bcb07e30a2bc3824ccdf7aaf2fd1e50e"));
const listRequestAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("936931105481384f5d3d2bc133bc714a987ed5cb30c7ae96ee618d49bdc09e94"));
const exportEmployeeHistoryCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType()).max(30).optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  search: stringType().trim().max(200).optional()
}).parse(d)).handler(createSsrRpc("7d1f87e6d832cd0d18219102c01098a8e39c8d1c2410f9e0fbf164fce23841b1"));
async function processDueRetries(supabaseAdmin2, limit = 50) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: due
  } = await supabaseAdmin2.from("id_document_requests").select("id,tenant_id,employee_id,document_type,notes,status,send_attempts").eq("status", "pending").in("last_send_status", ["failed", "retrying"]).lte("next_retry_at", nowIso).order("next_retry_at", {
    ascending: true
  }).limit(limit);
  let processed = 0;
  for (const req of due ?? []) {
    const {
      data: emp
    } = await supabaseAdmin2.from("employees").select("id,tenant_id,first_name,last_name,email").eq("id", req.employee_id).maybeSingle();
    if (!emp) continue;
    await sendRequestEmailWithRetry(supabaseAdmin2, req, emp);
    processed++;
  }
  return {
    processed,
    found: due?.length ?? 0
  };
}
const Route$a = createFileRoute("/api/public/hooks/id-request-retries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const result = await processDueRetries(supabaseAdmin2, 50);
          return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      },
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        return new Response("ok");
      }
    }
  }
});
const listReconciliation = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["open", "reviewed", "resolved", "dismissed", "all"]).default("open"),
  limit: numberType().int().min(1).max(500).default(200)
}).parse(d ?? {})).handler(createSsrRpc("e4ed6ea3c7a177936390ea01be671b67dfde284c55431c074f3bd3568513ab9c"));
const resolveReconciliation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["reviewed", "resolved", "dismissed"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("4b7e5bcbafcd4221892bf5095ae7fc86cbf11611a3f6a190929ffb77b66da2e6"));
const runReconciliation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  lookback_hours: numberType().int().min(1).max(720).default(48)
}).parse(d ?? {})).handler(createSsrRpc("d2099c667ea0e2840c941a1603a9d7c0c7cf1046abd9e62126e3fae6c7fb9b7b"));
async function doReconcile(supabase2, tenantId, lookbackHours) {
  const since = new Date(Date.now() - lookbackHours * 3600 * 1e3).toISOString();
  const {
    data: audits
  } = await supabase2.from("geofence_audit_log").select("*").eq("tenant_id", tenantId).gte("created_at", since).in("action", ["capture", "tracking_started", "tracking_stopped", "suspicious_flagged"]);
  const {
    data: punches
  } = await supabase2.from("attendance_entries").select("*").eq("tenant_id", tenantId).gte("created_at", since);
  const {
    data: fences
  } = await supabase2.from("sign_geofences").select("*").eq("tenant_id", tenantId);
  const fenceById = new Map((fences ?? []).map((f) => [f.id, f]));
  const created = [];
  const WINDOW_MS = 15 * 60 * 1e3;
  for (const a of audits ?? []) {
    if (a.action !== "capture") continue;
    const at = new Date(a.created_at).getTime();
    const match = (punches ?? []).find((p) => {
      const pt = p.clock_in ? new Date(p.clock_in).getTime() : new Date(p.created_at).getTime();
      return Math.abs(pt - at) <= WINDOW_MS;
    });
    if (!match) {
      created.push({
        tenant_id: tenantId,
        geofence_id: a.geofence_id,
        actor_user_id: a.actor_user_id,
        event_time: a.created_at,
        event_type: "enter",
        audit_log_id: a.id,
        mismatch_type: "no_attendance_for_enter",
        details: {
          accuracy_m: a.accuracy_m,
          suspicious: a.is_suspicious
        }
      });
    } else if (a.is_suspicious) {
      created.push({
        tenant_id: tenantId,
        geofence_id: a.geofence_id,
        actor_user_id: a.actor_user_id,
        attendance_entry_id: match.id,
        event_time: a.created_at,
        event_type: "capture",
        audit_log_id: a.id,
        mismatch_type: "accuracy_low",
        details: {
          reason: a.suspicious_reason,
          accuracy_m: a.accuracy_m
        }
      });
    }
  }
  for (const p of punches ?? []) {
    if (p.clock_in_latitude == null || p.clock_in_longitude == null) continue;
    const pt = p.clock_in ? new Date(p.clock_in).getTime() : new Date(p.created_at).getTime();
    const nearby = (audits ?? []).find((a) => a.action === "capture" && Math.abs(new Date(a.created_at).getTime() - pt) <= WINDOW_MS);
    if (!nearby) {
      created.push({
        tenant_id: tenantId,
        geofence_id: p.clock_in_geofence_id ?? null,
        attendance_entry_id: p.id,
        event_time: p.clock_in ?? p.created_at,
        event_type: "enter",
        mismatch_type: "no_geofence_for_punch",
        details: {
          source: p.source,
          distance_m: p.clock_in_distance_meters
        }
      });
      continue;
    }
    if (p.clock_in_geofence_id) {
      const f = fenceById.get(p.clock_in_geofence_id);
      if (f) {
        const dist = distanceMeters(Number(p.clock_in_latitude), Number(p.clock_in_longitude), Number(f.latitude), Number(f.longitude));
        if (dist > Number(f.radius_meters) * 1.2) {
          created.push({
            tenant_id: tenantId,
            geofence_id: f.id,
            attendance_entry_id: p.id,
            event_time: p.clock_in ?? p.created_at,
            event_type: "enter",
            audit_log_id: nearby.id,
            mismatch_type: "outside_window",
            details: {
              distance_m: Math.round(dist),
              radius_m: f.radius_meters
            }
          });
        }
      }
    }
  }
  if (created.length) {
    const {
      data: existing
    } = await supabase2.from("geofence_reconciliation").select("audit_log_id, attendance_entry_id, mismatch_type").eq("tenant_id", tenantId).gte("event_time", since);
    const seen = new Set((existing ?? []).map((e) => `${e.audit_log_id ?? ""}|${e.attendance_entry_id ?? ""}|${e.mismatch_type}`));
    const fresh = created.filter((c) => !seen.has(`${c.audit_log_id ?? ""}|${c.attendance_entry_id ?? ""}|${c.mismatch_type}`));
    if (fresh.length) {
      await supabase2.from("geofence_reconciliation").insert(fresh);
    }
    return {
      scanned: (audits?.length ?? 0) + (punches?.length ?? 0),
      created: fresh.length
    };
  }
  return {
    scanned: (audits?.length ?? 0) + (punches?.length ?? 0),
    created: 0
  };
}
const Route$9 = createFileRoute("/api/public/hooks/geofence-reconciliation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("unauthorized", { status: 401 });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const admin = supabaseAdmin2;
        const { data: tenants, error } = await admin.from("tenants").select("id");
        if (error) return new Response(error.message, { status: 500 });
        const results = [];
        for (const t of tenants ?? []) {
          try {
            const r = await doReconcile(admin, t.id, 24);
            results.push({ tenant_id: t.id, ...r });
          } catch (e) {
            results.push({ tenant_id: t.id, error: e.message });
          }
        }
        return new Response(JSON.stringify({ ok: true, results }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  }
});
const Route$8 = createFileRoute("/api/public/hooks/feedback-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
          const { data: pending } = await supabaseAdmin2.from("review_feedback_requests").select("id,due_date,reminder_count,last_reminder_at").eq("status", "pending");
          let bumped = 0;
          for (const r of pending ?? []) {
            const ok = !r.due_date || r.due_date <= today;
            if (!ok) continue;
            if (r.last_reminder_at && r.last_reminder_at > cutoff) continue;
            const { error } = await supabaseAdmin2.from("review_feedback_requests").update({
              last_reminder_at: (/* @__PURE__ */ new Date()).toISOString(),
              reminder_count: (r.reminder_count ?? 0) + 1
            }).eq("id", r.id);
            if (!error) bumped += 1;
          }
          return new Response(JSON.stringify({ ok: true, reminded: bumped }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("[feedback-reminders] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$7 = createFileRoute("/api/public/hooks/discipline-due-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const in3 = /* @__PURE__ */ new Date();
        in3.setDate(in3.getDate() + 3);
        const horizon = in3.toISOString().slice(0, 10);
        const { data: cases } = await supabaseAdmin2.from("disciplinary_cases").select("id,tenant_id,case_number,assigned_to,employee_id,due_date,appeal_deadline,status,category").not("status", "in", "(closed,withdrawn)");
        let sent = 0;
        for (const c of cases ?? []) {
          const overdue = c.due_date && c.due_date < today;
          const appealSoon = c.appeal_deadline && c.appeal_deadline >= today && c.appeal_deadline <= horizon;
          if (!overdue && !appealSoon) continue;
          const { data: state } = await supabaseAdmin2.from("disciplinary_overdue_state").select("last_alert_date,alert_count").eq("case_id", c.id).maybeSingle();
          if (state?.last_alert_date === today) continue;
          const targets = [c.assigned_to].filter(Boolean);
          if (appealSoon) {
            const { data: emp } = await supabaseAdmin2.from("employees").select("user_id").eq("id", c.employee_id).maybeSingle();
            if (emp?.user_id) targets.push(emp.user_id);
          }
          const unique = Array.from(new Set(targets));
          if (!unique.length) continue;
          const rows = unique.map((user_id) => ({
            tenant_id: c.tenant_id,
            user_id,
            kind: overdue ? "discipline_overdue" : "discipline_appeal_window",
            title: overdue ? "Disciplinary case overdue" : "Appeal window closing soon",
            body: overdue ? `Case ${c.case_number ?? c.id.slice(0, 8)} passed its due date (${c.due_date}).` : `Appeal deadline for case ${c.case_number ?? c.id.slice(0, 8)} is ${c.appeal_deadline}.`,
            link: "/admin/discipline",
            metadata: { case_id: c.id }
          }));
          await supabaseAdmin2.from("in_app_notifications").insert(rows);
          await supabaseAdmin2.from("disciplinary_overdue_state").upsert({
            case_id: c.id,
            tenant_id: c.tenant_id,
            last_alert_date: today,
            alert_count: (state?.alert_count ?? 0) + 1
          });
          sent += rows.length;
        }
        return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
      }
    }
  }
});
const Route$6 = createFileRoute("/api/public/hooks/compliance-attestation-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const url = new URL(request.url);
          const forceHour = url.searchParams.get("hour");
          const targetHour = forceHour !== null ? Number(forceHour) : null;
          const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
          let onboardingSent = 0;
          let offboardingSent = 0;
          let tenantsConsidered = 0;
          const { data: dueTenants, error: tzErr } = await supabaseAdmin2.rpc(
            "tenants_due_for_reminder_now",
            targetHour !== null ? { _target_hour: targetHour } : {}
          );
          if (tzErr) throw new Error(tzErr.message);
          const allowedTenantIds = new Set((dueTenants ?? []).map((t) => t.tenant_id));
          tenantsConsidered = allowedTenantIds.size;
          if (allowedTenantIds.size === 0) {
            return new Response(JSON.stringify({ ok: true, skipped: "no tenants in their local reminder hour" }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
          let sendInternalEmail2 = null;
          try {
            const mod = await import("./send-internal.server-9cG3k97B.mjs");
            sendInternalEmail2 = mod.sendInternalEmail;
          } catch {
          }
          const recordLog = async (tenant_id, scope, ref_id, user_id, channel, escalated) => {
            await supabaseAdmin2.from("compliance_reminder_log").insert({ tenant_id, scope, ref_id, user_id, channel, escalated });
          };
          const notify = async (user_id, tenant_id, title, body, link) => {
            if (!user_id) return;
            await supabaseAdmin2.from("in_app_notifications").insert({ user_id, tenant_id, kind: "attestation_reminder", title, body, link });
          };
          const { data: onbRows } = await supabaseAdmin2.rpc("list_onboarding_tasks_due_reminder");
          for (const row of onbRows ?? []) {
            if (!allowedTenantIds.has(row.tenant_id)) continue;
            const link = `/org/onboarding/control-room/${row.assignment_id}`;
            const title = row.escalate ? `Escalated: ${row.title} overdue ${row.days_overdue}d` : `Reminder: ${row.title} due`;
            const body = row.escalate ? `This onboarding step is ${row.days_overdue} days overdue and has been escalated to the line manager.` : `Please complete this onboarding step (attestation or evidence is still missing).`;
            await notify(row.assignee_user_id, row.tenant_id, title, body, link);
            await recordLog(row.tenant_id, "onboarding_task", row.task_id, row.assignee_user_id, "in_app", row.escalate);
            if (sendInternalEmail2 && row.assignee_user_id) {
              const { data: u } = await supabaseAdmin2.from("profiles").select("email").eq("id", row.assignee_user_id).maybeSingle();
              if (u?.email) {
                try {
                  await sendInternalEmail2({ to: u.email, subject: title, html: `<p>${body}</p><p><a href="${link}">Open task</a></p>` });
                  await recordLog(row.tenant_id, "onboarding_task", row.task_id, row.assignee_user_id, "email", row.escalate);
                } catch {
                }
              }
            }
            if (row.escalate) {
              const { data: emp } = await supabaseAdmin2.from("employees").select("manager_id").eq("id", row.employee_id).maybeSingle();
              if (emp?.manager_id) {
                const { data: mgr } = await supabaseAdmin2.from("employees").select("user_id, email").eq("id", emp.manager_id).maybeSingle();
                if (mgr?.user_id) {
                  await notify(mgr.user_id, row.tenant_id, `[Escalation] ${title}`, body, link);
                  await recordLog(row.tenant_id, "onboarding_task", row.task_id, mgr.user_id, "in_app", true);
                }
                if (sendInternalEmail2 && mgr?.email) {
                  try {
                    await sendInternalEmail2({ to: mgr.email, subject: `[Escalation] ${title}`, html: `<p>${body}</p><p><a href="${link}">Open task</a></p>` });
                    await recordLog(row.tenant_id, "onboarding_task", row.task_id, mgr.user_id ?? null, "email", true);
                  } catch {
                  }
                }
              }
            }
            await supabaseAdmin2.from("onboarding_control_room_tasks").update({
              last_reminder_at: (/* @__PURE__ */ new Date()).toISOString(),
              reminder_count: (row.reminder_count ?? 0) + 1
            }).eq("id", row.task_id);
            onboardingSent++;
          }
          const { data: offRows } = await supabaseAdmin2.rpc("list_offboarding_comms_due_reminder");
          for (const row of offRows ?? []) {
            if (!allowedTenantIds.has(row.tenant_id)) continue;
            const { data: c } = await supabaseAdmin2.from("offboarding_cases").select("hr_owner_id, manager_id, employee_id").eq("id", row.case_id).maybeSingle();
            const link = `/admin/offboarding?case=${row.case_id}`;
            const title = row.escalate ? `Escalated: ${row.channel_label} removal overdue ${row.days_overdue}d` : `Reminder: verify ${row.channel_label} removal`;
            const body = `Offboarding case requires evidence + attestation that the employee was removed from ${row.channel_label}.`;
            const recipients = /* @__PURE__ */ new Set();
            if (c?.hr_owner_id) recipients.add(c.hr_owner_id);
            if (row.escalate && c?.manager_id) recipients.add(c.manager_id);
            for (const uid of recipients) {
              await notify(uid, row.tenant_id, title, body, link);
              await recordLog(row.tenant_id, "offboarding_comms", row.row_id, uid, "in_app", row.escalate);
              if (sendInternalEmail2) {
                const { data: u } = await supabaseAdmin2.from("profiles").select("email").eq("id", uid).maybeSingle();
                if (u?.email) {
                  try {
                    await sendInternalEmail2({ to: u.email, subject: title, html: `<p>${body}</p><p><a href="${link}">Open case</a></p>` });
                    await recordLog(row.tenant_id, "offboarding_comms", row.row_id, uid, "email", row.escalate);
                  } catch {
                  }
                }
              }
            }
            await supabaseAdmin2.from("offboarding_comms_removal").update({
              last_reminder_at: (/* @__PURE__ */ new Date()).toISOString(),
              reminder_count: (row.reminder_count ?? 0) + 1
            }).eq("id", row.row_id);
            offboardingSent++;
          }
          return new Response(JSON.stringify({ ok: true, onboardingSent, offboardingSent, tenantsConsidered }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$5 = createFileRoute("/api/public/hooks/blog-webhook-deliveries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const { data: deliveries } = await supabaseAdmin2.from("blog_webhook_deliveries").select("*").in("status", ["pending", "retrying"]).lte("next_retry_at", now).lt("attempts", 6).limit(50);
        if (!deliveries?.length) return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
        const { data: hooks } = await supabaseAdmin2.from("blog_webhooks").select("id,url,secret,active");
        const byId = new Map((hooks ?? []).map((h) => [h.id, h]));
        let processed = 0;
        for (const d of deliveries) {
          const hook = byId.get(d.webhook_id);
          if (!hook || !hook.active) {
            await supabaseAdmin2.from("blog_webhook_deliveries").update({
              status: "skipped",
              last_attempted_at: now
            }).eq("id", d.id);
            continue;
          }
          const bodyText = JSON.stringify(d.payload);
          const signature = createHmac("sha256", hook.secret).update(bodyText).digest("hex");
          let ok = false, respStatus = null, respBody = "";
          try {
            const r = await fetch(hook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-HRPPL-Event": String(d.event),
                "X-HRPPL-Signature": `sha256=${signature}`,
                "X-HRPPL-Delivery": String(d.id)
              },
              body: bodyText,
              signal: AbortSignal.timeout(1e4)
            });
            respStatus = r.status;
            respBody = (await r.text()).slice(0, 2e3);
            ok = r.ok;
          } catch (err) {
            respBody = String(err.message ?? err).slice(0, 2e3);
          }
          const attempts = (d.attempts ?? 0) + 1;
          const status = ok ? "delivered" : attempts >= 6 ? "failed" : "retrying";
          const backoffMins = [1, 5, 15, 60, 240, 720][Math.min(attempts - 1, 5)];
          const next_retry_at = ok ? null : new Date(Date.now() + backoffMins * 6e4).toISOString();
          await supabaseAdmin2.from("blog_webhook_deliveries").update({
            attempts,
            status,
            response_status: respStatus,
            response_body: respBody,
            last_attempted_at: now,
            next_retry_at
          }).eq("id", d.id);
          processed++;
        }
        return new Response(JSON.stringify({ processed }), { status: 200 });
      }
    }
  }
});
const seedStripePrices = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("56009bcd82cc592ed4df4e8902eba9f6d4ad9503fe938232f7d55e1a0474c362"));
const listBillingAlerts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b27b018f44dc7f7ef1ebe15fe8418bcc6fb40c1bdd9fa2e01a8c500843aa86a8"));
const resolveBillingAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("543f2aba4ff3039c548b52dc68cdef230c52a25c755f98f9e20e13f3de0caaba"));
const retryBillingAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("5a42409c302e66a9653658bce909de48ebeb1efb38974f842890346bd0a632ac"));
const listTenantsBillingOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d381560dbf7cf124233e9cc95534e52ff527d33405202ed17430f9dbddb87f3f"));
const runReconciliationForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12)
}).parse(i)).handler(createSsrRpc("36002535fb1e225721b4860489096fcd2b4b75866a0c63d6ec6b6c2f7281d1aa"));
const exportBillingForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  format: enumType(["csv", "pdf"]).default("csv")
}).parse(i)).handler(createSsrRpc("c7e9e012819dc4c51d2c906a4d6bf65f09d06e45ee9e2631cfa0866036effb41"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid(),
  newPlanCode: enumType(["starter_v2", "pro_v2"]),
  effectiveImmediately: booleanType().optional().default(true)
}).parse(i)).handler(createSsrRpc("eb1089c484d1e0548424139905e67d90196e1bbdeab974097626d0325615b35f"));
const listReconciliationForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int(),
  month: numberType().int().min(1).max(12)
}).parse(i)).handler(createSsrRpc("ecb59828d050cca8bf9b27aae93d9898232d3f32b87ae550918de3f636afa156"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  action: stringType().optional().nullable(),
  limit: numberType().int().min(1).max(500).optional().default(100)
}).parse(i)).handler(createSsrRpc("d1a592560e2ee4cf5b12da250f45e18702f535a1a53094abeb042c7fdc0adbd3"));
const listDiscrepancies = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().optional().nullable(),
  month: numberType().int().min(1).max(12).optional().nullable(),
  tenantId: stringType().uuid().optional().nullable(),
  onlyDiscrepancies: booleanType().optional().default(true)
}).parse(i)).handler(createSsrRpc("dbfc5bf6a9532386ec281d2d8d4bd469a47d19c7c6a74d17cab2fbe776c1ba25"));
const exportDiscrepanciesCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().optional().nullable(),
  month: numberType().int().min(1).max(12).optional().nullable(),
  tenantId: stringType().uuid().optional().nullable(),
  onlyDiscrepancies: booleanType().optional().default(true)
}).parse(i)).handler(createSsrRpc("11361e080bf6fd48995609975a61bcc526e5e4ffb72cdeda4601f69a92a5d6a2"));
const listTenantsLite = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f160c4e6ab95124c1db9e08fcfbc462ba4caccc3316e0c92e16dc12f137ad9cb"));
const previewInvoiceImpact = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  overridePlanCode: enumType(["starter_v2", "pro_v2"]).optional().nullable(),
  overridePlanChangeDate: stringType().optional().nullable(),
  overrideTrialEndsAt: stringType().optional().nullable(),
  overrideAddonAU: booleanType().optional().nullable()
}).parse(i)).handler(createSsrRpc("7032244eb569294ab033b465f4ab4f16fd8da60134934eec5b55237b6c0380b5"));
const listAlertSuppressions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b5c30167e8b61a0d90d6d775704bd6ed3add13c4a80caaa25fc595bcedc5d3d2"));
const upsertAlertSuppression = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional().nullable(),
  tenant_id: stringType().uuid().optional().nullable(),
  alert_type: stringType().optional().nullable(),
  reason: stringType().optional().nullable(),
  expires_at: stringType().optional().nullable()
}).parse(i)).handler(createSsrRpc("58bcfc7760ceebef3131838ec850d2eab5d22a0ad806266a8723840c70a02520"));
const deleteAlertSuppression = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("06a97018592a4c12e0ffef13021722e2739cad095d776f1c4c6acacf7459fff7"));
const listRetryPolicies = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cacd25b2d7bed51bcd78f3fcbebf99fc670ba4e01f3a7e0fe0d4bbfca0346334"));
const upsertRetryPolicy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  alert_type: stringType().min(1),
  enabled: booleanType(),
  max_attempts: numberType().int().min(1).max(50),
  backoff_seconds: numberType().int().min(10),
  backoff_multiplier: numberType().min(1).max(10),
  max_backoff_seconds: numberType().int().min(60)
}).parse(i)).handler(createSsrRpc("b408a65fc1086339c9c3087cdfc72155a04cc434d080e671f8e380d489a4916f"));
const exportBillingOpsAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  actorEmail: stringType().optional().nullable(),
  action: stringType().optional().nullable(),
  from: stringType().optional().nullable(),
  to: stringType().optional().nullable()
}).parse(i)).handler(createSsrRpc("97396264961f0b973e0b41b2d86f9785ab0350e3dcf88b1a7103fbc598b9a609"));
const listBillingOpsAuditFiltered = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  actorEmail: stringType().optional().nullable(),
  action: stringType().optional().nullable(),
  from: stringType().optional().nullable(),
  to: stringType().optional().nullable(),
  limit: numberType().int().min(1).max(500).optional().default(200)
}).parse(i)).handler(createSsrRpc("7820bc776ea6553100598f413c7dfa090e68c3bcbd3827ff8f9182cb9411454c"));
async function processDueAutoRetries(limit = 25) {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    getRetryPolicy,
    computeNextRetryAt,
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: due
  } = await supabaseAdmin2.from("billing_admin_alerts").select("*").neq("status", "resolved").eq("auto_retry_exhausted", false).not("next_retry_at", "is", null).lte("next_retry_at", nowIso).order("next_retry_at", {
    ascending: true
  }).limit(limit);
  let ok = 0, failed2 = 0;
  for (const alert of due ?? []) {
    const policy = await getRetryPolicy(alert.alert_type);
    if (!policy?.enabled) {
      await supabaseAdmin2.from("billing_admin_alerts").update({
        next_retry_at: null
      }).eq("id", alert.id);
      continue;
    }
    const attempt = (alert.retry_count ?? 0) + 1;
    const ctx = alert.context ?? {};
    let result = {
      ok: false,
      message: "no handler"
    };
    try {
      if (alert.alert_type === "stripe_usage_report_failed" || alert.alert_type === "monthly_billing_unhandled_error" || alert.alert_type === "monthly_billing_partial_failure") {
        const {
          runMonthlyBillingForTenant,
          runMonthlyBillingForAllTenants
        } = await import("./billing.server-BzOVdJud.mjs");
        result = alert.tenant_id && ctx.year && ctx.month ? await runMonthlyBillingForTenant(alert.tenant_id, ctx.year, ctx.month, false) : ctx.year && ctx.month ? await runMonthlyBillingForAllTenants(ctx.year, ctx.month) : result;
      } else if (alert.alert_type.startsWith("reconciliation")) {
        const {
          reconcileMonth
        } = await import("./billing.server-BzOVdJud.mjs");
        if (ctx.year && ctx.month) result = await reconcileMonth(ctx.year, ctx.month);
      } else if (alert.alert_type === "invoice_payment_failed" && ctx.invoice_id) {
        const {
          getStripe
        } = await import("./stripe.server-C4vshzUl.mjs");
        result = await getStripe().invoices.pay(ctx.invoice_id, void 0, {
          idempotencyKey: `invoice_pay:${ctx.invoice_id}`
        }).catch((e) => ({
          error: e?.message
        }));
      }
    } catch (e) {
      result = {
        error: e?.message ?? String(e)
      };
    }
    const success = !result?.error && (Array.isArray(result) ? !result.some((r) => r.status === "failed") : result?.status !== "failed");
    if (success) {
      await supabaseAdmin2.from("billing_admin_alerts").update({
        status: "resolved",
        resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
        next_retry_at: null,
        retry_count: attempt,
        last_auto_retry_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", alert.id);
      ok++;
    } else {
      const nextAt = computeNextRetryAt(policy, attempt);
      await supabaseAdmin2.from("billing_admin_alerts").update({
        retry_count: attempt,
        last_auto_retry_at: (/* @__PURE__ */ new Date()).toISOString(),
        next_retry_at: nextAt,
        auto_retry_exhausted: nextAt === null
      }).eq("id", alert.id);
      failed2++;
    }
    await logBillingOpsAudit({
      actor_email: "system@auto-retry",
      action: success ? "alert.auto_retry.success" : "alert.auto_retry.failed",
      target_type: "alert",
      target_id: alert.id,
      tenant_id: alert.tenant_id,
      metadata: {
        attempt,
        alert_type: alert.alert_type,
        result_summary: summarizeResult(result)
      }
    });
  }
  return {
    processed: (due ?? []).length,
    ok,
    failed: failed2
  };
}
function summarizeResult(r) {
  if (!r) return null;
  if (Array.isArray(r)) return {
    count: r.length,
    failed: r.filter((x) => x.status === "failed").length
  };
  return {
    status: r.status,
    error: r.error
  };
}
const Route$4 = createFileRoute("/api/public/hooks/auto-retry-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const out = await processDueAutoRetries(50);
          return new Response(JSON.stringify({ status: "ok", ...out }), {
            status: 200,
            headers: { "content-type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500,
            headers: { "content-type": "application/json" }
          });
        }
      }
    }
  }
});
function isAuthorized(request) {
  const secret = process.env.AUDIT_RETENTION_SECRET;
  if (secret && secret.length > 0) {
    const auth2 = request.headers.get("authorization") ?? "";
    if (auth2 === `Bearer ${secret}`) return true;
  }
  return isAuthorizedCronRequest(request);
}
async function runRetention() {
  const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
  const { data, error } = await supabaseAdmin2.rpc("run_audit_retention");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ ok: true, summary: data ?? [] }), {
    headers: { "content-type": "application/json" }
  });
}
const Route$3 = createFileRoute("/api/public/hooks/audit-retention-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
        return runRetention();
      },
      // Vercel Cron entry point — GET only, no body.
      GET: async ({ request }) => {
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
        return runRetention();
      }
    }
  }
});
const ApiPostSchema = objectType({
  title: stringType().min(1).max(200),
  slug: stringType().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: stringType().max(400).optional().nullable(),
  content_md: stringType().max(2e5).default(""),
  cover_image_url: stringType().url().max(2048).optional().nullable(),
  tags: arrayType(stringType().min(1).max(40)).max(20).default([]),
  category_slug: stringType().min(1).max(60).optional().nullable(),
  status: enumType(["draft", "scheduled", "published"]).default("draft"),
  scheduled_for: stringType().datetime().optional().nullable(),
  seo_title: stringType().max(200).optional().nullable(),
  seo_description: stringType().max(300).optional().nullable(),
  og_image_url: stringType().url().max(2048).optional().nullable(),
  canonical_url: stringType().url().max(2048).optional().nullable(),
  external_source: stringType().max(60).optional().nullable(),
  external_ref: stringType().max(200).optional().nullable()
});
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
function mdToHtml(md) {
  if (!md) return "";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const lines = md.split(/\r?\n/);
  let html = "", inUl = false;
  const close = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
  };
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      close();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      close();
      html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        html += "<ul>";
        inUl = true;
      }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    close();
    html += `<p>${inline(line)}</p>`;
  }
  close();
  return html;
}
function jsonHeaders$1() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key"
  };
}
const json$1 = (status, body) => new Response(JSON.stringify(body), { status, headers: jsonHeaders$1() });
async function authenticate$1(request, method, requiredScope) {
  const { authenticateBlogApi } = await import("./blog-api-auth.server-DDHkaLgf.mjs");
  return authenticateBlogApi(request, "/api/public/blog/posts", method, requiredScope);
}
async function enqueueWebhook$1(event, post) {
  const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
  const { data: hooks } = await supabaseAdmin2.from("blog_webhooks").select("id,events").eq("active", true);
  const matches = (hooks ?? []).filter((h) => h.events.includes(event));
  if (!matches.length) return;
  const payload = { event, occurred_at: (/* @__PURE__ */ new Date()).toISOString(), data: { post } };
  await supabaseAdmin2.from("blog_webhook_deliveries").insert(
    matches.map((h) => ({ webhook_id: h.id, event, payload, status: "pending", next_retry_at: (/* @__PURE__ */ new Date()).toISOString() }))
  );
}
const Route$2 = createFileRoute("/api/public/blog/posts")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: jsonHeaders$1() }),
      GET: async ({ request }) => {
        const auth2 = await authenticate$1(request, "GET", "posts:read");
        if ("error" in auth2) return auth2.error;
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 25), 100);
        const status = url.searchParams.get("status");
        const slug = url.searchParams.get("slug");
        let q = supabaseAdmin2.from("blog_posts").select("*").order("updated_at", { ascending: false }).limit(limit);
        if (status) q = q.eq("status", status);
        if (slug) q = q.eq("slug", slug);
        const { data, error } = await q;
        if (error) return json$1(500, { error: error.message });
        return json$1(200, { posts: data });
      },
      POST: async ({ request }) => {
        const auth2 = await authenticate$1(request, "POST", "posts:write");
        if ("error" in auth2) return auth2.error;
        let body;
        try {
          body = await request.json();
        } catch {
          return json$1(400, { error: "Invalid JSON" });
        }
        const parsed = ApiPostSchema.safeParse(body);
        if (!parsed.success) return json$1(400, { error: "Validation failed", details: parsed.error.flatten() });
        const d = parsed.data;
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        let category_id = null;
        if (d.category_slug) {
          const { data: c } = await supabaseAdmin2.from("blog_categories").select("id").eq("slug", d.category_slug).maybeSingle();
          category_id = c?.id ?? null;
        }
        const slug = d.slug ?? slugify(d.title);
        const content_html = mdToHtml(d.content_md);
        const reading_minutes = Math.max(1, Math.round(d.content_md.split(/\s+/).filter(Boolean).length / 220));
        const published_at = d.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null;
        const existingQuery = d.external_ref ? supabaseAdmin2.from("blog_posts").select("id").eq("external_ref", d.external_ref).maybeSingle() : supabaseAdmin2.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
        const { data: existing } = await existingQuery;
        const payload = {
          title: d.title,
          slug,
          excerpt: d.excerpt ?? null,
          content_md: d.content_md,
          content_html,
          cover_image_url: d.cover_image_url ?? null,
          category_id,
          tags: d.tags,
          status: d.status,
          scheduled_for: d.status === "scheduled" ? d.scheduled_for : null,
          seo_title: d.seo_title ?? null,
          seo_description: d.seo_description ?? null,
          og_image_url: d.og_image_url ?? null,
          canonical_url: d.canonical_url ?? null,
          reading_minutes,
          published_at,
          external_source: d.external_source ?? null,
          external_ref: d.external_ref ?? null,
          author_name: d.external_source ?? "API"
        };
        let saved;
        if (existing?.id) {
          const { data, error } = await supabaseAdmin2.from("blog_posts").update(payload).eq("id", existing.id).select("*").maybeSingle();
          if (error) return json$1(500, { error: error.message });
          saved = data;
        } else {
          const { data, error } = await supabaseAdmin2.from("blog_posts").insert(payload).select("*").maybeSingle();
          if (error) return json$1(500, { error: error.message });
          saved = data;
        }
        if (saved) {
          await enqueueWebhook$1(saved.status === "published" ? "post.published" : "post.updated", saved);
        }
        return json$1(existing?.id ? 200 : 201, { post: saved });
      }
    }
  }
});
async function loadAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin2;
}
const listBiometricDevices = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("302f6e704602a0bc960bc3646298576a03e45bb96d2db403c236e75dda851298"));
const DeviceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  vendor: enumType(["zkteco", "generic", "suprema"]).default("zkteco"),
  device_serial: stringType().max(120).optional().nullable(),
  location: stringType().max(200).optional().nullable(),
  ip_address: stringType().max(80).optional().nullable(),
  is_active: booleanType().default(true),
  config: recordType(stringType(), anyType()).default({})
});
const upsertBiometricDevice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DeviceSchema.parse(d)).handler(createSsrRpc("e5b6f2526e7e83bc93fcd40da7735f0f0e4abc96dc6686bf9e80a4c585bacdbd"));
const rotateDeviceSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("72ac49f34ae0f396d86dcf00339e07d894bf0f94adf40f0a40e4769700c41094"));
const listMappings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5ee7a1a6fdd6b4770e1f0bb12069f066a47f7c7d5e41c670c1d92634b06dabca"));
const upsertMapping = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid(),
  raw_user_id: stringType().min(1).max(80),
  employee_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("98c6928dbdaf6f141a711aabb4b5f72168c66ff693d5f2d8b91caad47bb3d3a4"));
const listPunches = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid().optional(),
  employee_id: stringType().uuid().optional(),
  limit: numberType().int().positive().max(500).default(100)
}).parse(d)).handler(createSsrRpc("0c745e035e7c721c3e6e86e9dc94e8957f8abcaa2e88cde995c3ab455ca9a342"));
const PunchInputSchema = objectType({
  raw_user_id: stringType().min(1).max(80),
  punch_at: stringType(),
  punch_type: enumType(["in", "out", "break_in", "break_out", "unknown"]).default("unknown"),
  raw: recordType(stringType(), anyType()).default({})
});
async function ingestPunches(deviceId, source, punches) {
  const admin = await loadAdmin();
  const {
    data: device
  } = await admin.from("biometric_devices").select("*").eq("id", deviceId).single();
  if (!device || !device.is_active) throw new Error("Device not active");
  const {
    data: mappings
  } = await admin.from("biometric_user_mappings").select("raw_user_id,employee_id").eq("device_id", deviceId);
  const map = new Map((mappings ?? []).map((m) => [m.raw_user_id, m.employee_id]));
  const rows = punches.map((p) => ({
    tenant_id: device.tenant_id,
    device_id: device.id,
    raw_user_id: p.raw_user_id,
    employee_id: map.get(p.raw_user_id) ?? null,
    punch_at: p.punch_at,
    punch_type: p.punch_type,
    source,
    raw: p.raw
  }));
  let inserted = 0;
  if (rows.length) {
    const {
      error,
      count
    } = await admin.from("biometric_punches").upsert(rows, {
      onConflict: "device_id,raw_user_id,punch_at,punch_type",
      ignoreDuplicates: true,
      count: "exact"
    });
    if (error) throw error;
    inserted = count ?? 0;
  }
  const latest = punches.reduce((a, p) => p.punch_at > a ? p.punch_at : a, "");
  await admin.from("biometric_devices").update({
    last_sync_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_punch_at: latest || null
  }).eq("id", device.id);
  return {
    received: punches.length,
    inserted
  };
}
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid(),
  punches: arrayType(PunchInputSchema).min(1).max(2e3)
}).parse(d)).handler(createSsrRpc("8b08788657203cdc725d6efdc5bdb38374ed607e4289cb59249b44eaf9504caa"));
const PunchSchema = objectType({
  raw_user_id: stringType().min(1).max(80),
  punch_at: stringType(),
  punch_type: enumType(["in", "out", "break_in", "break_out", "unknown"]).default("unknown"),
  raw: recordType(stringType(), anyType()).default({})
});
const BodySchema = objectType({
  punches: arrayType(PunchSchema).min(1).max(2e3)
});
const Route$1 = createFileRoute("/api/public/biometric/$token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Device-Secret"
      } }),
      POST: async ({ request, params }) => {
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const { data: device } = await supabaseAdmin2.from("biometric_devices").select("id,shared_secret,is_active").eq("webhook_token", params.token).maybeSingle();
        if (!device || !device.is_active) return new Response("Not found", { status: 404 });
        const secret = request.headers.get("x-device-secret") ?? "";
        if (secret.length !== device.shared_secret.length) return new Response("Unauthorized", { status: 401 });
        let ok = 0;
        for (let i = 0; i < secret.length; i++) ok |= secret.charCodeAt(i) ^ device.shared_secret.charCodeAt(i);
        if (ok !== 0) return new Response("Unauthorized", { status: 401 });
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
        try {
          const result = await ingestPunches(device.id, "webhook", parsed.data.punches);
          return Response.json(result, { headers: { "Access-Control-Allow-Origin": "*" } });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      }
    }
  }
});
const PatchSchema = objectType({
  title: stringType().min(1).max(200).optional(),
  excerpt: stringType().max(400).optional().nullable(),
  content_md: stringType().max(2e5).optional(),
  cover_image_url: stringType().url().max(2048).optional().nullable(),
  tags: arrayType(stringType().min(1).max(40)).max(20).optional(),
  status: enumType(["draft", "scheduled", "published", "archived"]).optional(),
  scheduled_for: stringType().datetime().optional().nullable(),
  seo_title: stringType().max(200).optional().nullable(),
  seo_description: stringType().max(300).optional().nullable(),
  og_image_url: stringType().url().max(2048).optional().nullable(),
  canonical_url: stringType().url().max(2048).optional().nullable()
});
const jsonHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key"
});
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: jsonHeaders() });
async function authenticate(request, method, requiredScope) {
  const { authenticateBlogApi } = await import("./blog-api-auth.server-DDHkaLgf.mjs");
  return authenticateBlogApi(request, "/api/public/blog/posts/$slug", method, requiredScope);
}
async function enqueueWebhook(event, post) {
  const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
  const { data: hooks } = await supabaseAdmin2.from("blog_webhooks").select("id,events").eq("active", true);
  const matches = (hooks ?? []).filter((h) => h.events.includes(event));
  if (!matches.length) return;
  const payload = { event, occurred_at: (/* @__PURE__ */ new Date()).toISOString(), data: { post } };
  await supabaseAdmin2.from("blog_webhook_deliveries").insert(
    matches.map((h) => ({ webhook_id: h.id, event, payload, status: "pending", next_retry_at: (/* @__PURE__ */ new Date()).toISOString() }))
  );
}
const Route = createFileRoute("/api/public/blog/posts/$slug")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: jsonHeaders() }),
      GET: async ({ request, params }) => {
        const auth2 = await authenticate(request, "GET", "posts:read");
        if ("error" in auth2) return auth2.error;
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const { data } = await supabaseAdmin2.from("blog_posts").select("*").eq("slug", params.slug).maybeSingle();
        if (!data) return json(404, { error: "Not found" });
        return json(200, { post: data });
      },
      PATCH: async ({ request, params }) => {
        const auth2 = await authenticate(request, "PATCH", "posts:write");
        if ("error" in auth2) return auth2.error;
        let body;
        try {
          body = await request.json();
        } catch {
          return json(400, { error: "Invalid JSON" });
        }
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) return json(400, { error: "Validation failed", details: parsed.error.flatten() });
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const updates = { ...parsed.data };
        if (parsed.data.status === "published") updates.published_at = (/* @__PURE__ */ new Date()).toISOString();
        const { data, error } = await supabaseAdmin2.from("blog_posts").update(updates).eq("slug", params.slug).select("*").maybeSingle();
        if (error) return json(500, { error: error.message });
        if (!data) return json(404, { error: "Not found" });
        await enqueueWebhook(data.status === "published" ? "post.published" : "post.updated", data);
        return json(200, { post: data });
      },
      DELETE: async ({ request, params }) => {
        const auth2 = await authenticate(request, "DELETE", "posts:write");
        if ("error" in auth2) return auth2.error;
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.mjs");
        const { data: existing } = await supabaseAdmin2.from("blog_posts").select("*").eq("slug", params.slug).maybeSingle();
        if (!existing) return json(404, { error: "Not found" });
        await supabaseAdmin2.from("blog_posts").delete().eq("slug", params.slug);
        await enqueueWebhook("post.deleted", existing);
        return json(200, { ok: true });
      }
    }
  }
});
const WelcomeRoute = Route$31.update({
  id: "/welcome",
  path: "/welcome",
  getParentRoute: () => Route$32
});
const UnsubscribeRoute = Route$30.update({
  id: "/unsubscribe",
  path: "/unsubscribe",
  getParentRoute: () => Route$32
});
const TermsRoute = Route$2$.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$32
});
const TeamRoute = Route$2_.update({
  id: "/team",
  path: "/team",
  getParentRoute: () => Route$32
});
const SuspendedRoute = Route$2Z.update({
  id: "/suspended",
  path: "/suspended",
  getParentRoute: () => Route$32
});
const SitemapDotxmlRoute = Route$2Y.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$32
});
const SignupRoute = Route$2X.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$32
});
const ResetPasswordRoute = Route$2W.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$32
});
const RegionalRoute = Route$2V.update({
  id: "/regional",
  path: "/regional",
  getParentRoute: () => Route$32
});
const RecognitionRoute = Route$2U.update({
  id: "/recognition",
  path: "/recognition",
  getParentRoute: () => Route$32
});
const PrivacyRoute = Route$2T.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$32
});
const PricingRoute = Route$2S.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => Route$32
});
const PerformanceRoute = Route$2R.update({
  id: "/performance",
  path: "/performance",
  getParentRoute: () => Route$32
});
const OrgRoute = Route$2Q.update({
  id: "/org",
  path: "/org",
  getParentRoute: () => Route$32
});
const NotificationsRoute = Route$2P.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$32
});
const MyPayslipsRoute = Route$2O.update({
  id: "/my-payslips",
  path: "/my-payslips",
  getParentRoute: () => Route$32
});
const MeRoute = Route$2N.update({
  id: "/me",
  path: "/me",
  getParentRoute: () => Route$32
});
const McpRoute = Route$2M.update({
  id: "/mcp",
  path: "/mcp",
  getParentRoute: () => Route$32
});
const LeaveRoute = Route$2L.update({
  id: "/leave",
  path: "/leave",
  getParentRoute: () => Route$32
});
const ForgotPasswordRoute = Route$2K.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$32
});
const DevelopersRoute = Route$2J.update({
  id: "/developers",
  path: "/developers",
  getParentRoute: () => Route$32
});
const DevSessionRoute = Route$2I.update({
  id: "/dev-session",
  path: "/dev-session",
  getParentRoute: () => Route$32
});
const DashboardRoute = Route$2H.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$32
});
const ContactRoute = Route$2G.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => Route$32
});
const AuthRoute = Route$2F.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$32
});
const AttendanceRoute = Route$2E.update({
  id: "/attendance",
  path: "/attendance",
  getParentRoute: () => Route$32
});
const AdminRoute = Route$2D.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$32
});
const IndexRoute = Route$2C.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$32
});
const OrgIndexRoute = Route$2B.update({
  id: "/",
  path: "/",
  getParentRoute: () => OrgRoute
});
const OnboardingIndexRoute = Route$2A.update({
  id: "/onboarding/",
  path: "/onboarding/",
  getParentRoute: () => Route$32
});
const MeIndexRoute = Route$2z.update({
  id: "/",
  path: "/",
  getParentRoute: () => MeRoute
});
const HelpIndexRoute = Route$2y.update({
  id: "/help/",
  path: "/help/",
  getParentRoute: () => Route$32
});
const CareersIndexRoute = Route$2x.update({
  id: "/careers/",
  path: "/careers/",
  getParentRoute: () => Route$32
});
const BlogIndexRoute = Route$2w.update({
  id: "/blog/",
  path: "/blog/",
  getParentRoute: () => Route$32
});
const AdminIndexRoute = Route$2v.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const SignEnvelopeIdRoute = Route$2u.update({
  id: "/sign/$envelopeId",
  path: "/sign/$envelopeId",
  getParentRoute: () => Route$32
});
const SettingsProfileRoute = Route$2t.update({
  id: "/settings/profile",
  path: "/settings/profile",
  getParentRoute: () => Route$32
});
const SettingsOrganizationRoute = Route$2s.update({
  id: "/settings/organization",
  path: "/settings/organization",
  getParentRoute: () => Route$32
});
const SettingsNotificationsRoute = Route$2r.update({
  id: "/settings/notifications",
  path: "/settings/notifications",
  getParentRoute: () => Route$32
});
const SettingsBillingRoute = Route$2q.update({
  id: "/settings/billing",
  path: "/settings/billing",
  getParentRoute: () => Route$32
});
const SettingsAccountRoute = Route$2p.update({
  id: "/settings/account",
  path: "/settings/account",
  getParentRoute: () => Route$32
});
const PracticeTimeRoute = Route$2o.update({
  id: "/practice/time",
  path: "/practice/time",
  getParentRoute: () => Route$32
});
const PracticeProjectsRoute = Route$2n.update({
  id: "/practice/projects",
  path: "/practice/projects",
  getParentRoute: () => Route$32
});
const PracticeJobsRoute = Route$2m.update({
  id: "/practice/jobs",
  path: "/practice/jobs",
  getParentRoute: () => Route$32
});
const PracticeInvoicesRoute = Route$2l.update({
  id: "/practice/invoices",
  path: "/practice/invoices",
  getParentRoute: () => Route$32
});
const PracticeClientsRoute = Route$2k.update({
  id: "/practice/clients",
  path: "/practice/clients",
  getParentRoute: () => Route$32
});
const PlatformTenantsRoute = Route$2j.update({
  id: "/platform/tenants",
  path: "/platform/tenants",
  getParentRoute: () => Route$32
});
const PlatformLeadsRoute = Route$2i.update({
  id: "/platform/leads",
  path: "/platform/leads",
  getParentRoute: () => Route$32
});
const PlatformInvitationsRoute = Route$2h.update({
  id: "/platform/invitations",
  path: "/platform/invitations",
  getParentRoute: () => Route$32
});
const PlatformFxRoute = Route$2g.update({
  id: "/platform/fx",
  path: "/platform/fx",
  getParentRoute: () => Route$32
});
const OrgWhiteLabelRoute = Route$2f.update({
  id: "/white-label",
  path: "/white-label",
  getParentRoute: () => OrgRoute
});
const OrgTrainingRoute = Route$2e.update({
  id: "/training",
  path: "/training",
  getParentRoute: () => OrgRoute
});
const OrgTimesheetsRoute = Route$2d.update({
  id: "/timesheets",
  path: "/timesheets",
  getParentRoute: () => OrgRoute
});
const OrgTimesheetReviewRoute = Route$2c.update({
  id: "/timesheet-review",
  path: "/timesheet-review",
  getParentRoute: () => OrgRoute
});
const OrgSetupRoute = Route$2b.update({
  id: "/setup",
  path: "/setup",
  getParentRoute: () => OrgRoute
});
const OrgRolesRoute = Route$2a.update({
  id: "/roles",
  path: "/roles",
  getParentRoute: () => OrgRoute
});
const OrgReportsRoute = Route$29.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => OrgRoute
});
const OrgRecruitmentRoute = Route$28.update({
  id: "/recruitment",
  path: "/recruitment",
  getParentRoute: () => OrgRoute
});
const OrgPromotionsRoute = Route$27.update({
  id: "/promotions",
  path: "/promotions",
  getParentRoute: () => OrgRoute
});
const OrgPerformanceRoute = Route$26.update({
  id: "/performance",
  path: "/performance",
  getParentRoute: () => OrgRoute
});
const OrgPayrollRoute = Route$25.update({
  id: "/payroll",
  path: "/payroll",
  getParentRoute: () => OrgRoute
});
const OrgPayRatesRoute = Route$24.update({
  id: "/pay-rates",
  path: "/pay-rates",
  getParentRoute: () => OrgRoute
});
const OrgLeaveRoute = Route$23.update({
  id: "/leave",
  path: "/leave",
  getParentRoute: () => OrgRoute
});
const OrgInvitationsRoute = Route$22.update({
  id: "/invitations",
  path: "/invitations",
  getParentRoute: () => OrgRoute
});
const OrgExpensesRoute = Route$21.update({
  id: "/expenses",
  path: "/expenses",
  getParentRoute: () => OrgRoute
});
const OrgEmployeesRoute = Route$20.update({
  id: "/employees",
  path: "/employees",
  getParentRoute: () => OrgRoute
});
const OrgDocumentsRoute = Route$1$.update({
  id: "/documents",
  path: "/documents",
  getParentRoute: () => OrgRoute
});
const OrgDangerRoute = Route$1_.update({
  id: "/danger",
  path: "/danger",
  getParentRoute: () => OrgRoute
});
const OrgBranchesRoute = Route$1Z.update({
  id: "/branches",
  path: "/branches",
  getParentRoute: () => OrgRoute
});
const OrgAnalyticsRoute = Route$1Y.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => OrgRoute
});
const OnboardingProfileRoute = Route$1X.update({
  id: "/onboarding/profile",
  path: "/onboarding/profile",
  getParentRoute: () => Route$32
});
const MeTrainingRoute = Route$1W.update({
  id: "/training",
  path: "/training",
  getParentRoute: () => MeRoute
});
const MeToilRoute = Route$1V.update({
  id: "/toil",
  path: "/toil",
  getParentRoute: () => MeRoute
});
const MeTimelineRoute = Route$1U.update({
  id: "/timeline",
  path: "/timeline",
  getParentRoute: () => MeRoute
});
const MeSignaturesRoute = Route$1T.update({
  id: "/signatures",
  path: "/signatures",
  getParentRoute: () => MeRoute
});
const MeSecurityRoute = Route$1S.update({
  id: "/security",
  path: "/security",
  getParentRoute: () => MeRoute
});
const MeReviewsRoute = Route$1R.update({
  id: "/reviews",
  path: "/reviews",
  getParentRoute: () => MeRoute
});
const MeRequestsRoute = Route$1Q.update({
  id: "/requests",
  path: "/requests",
  getParentRoute: () => MeRoute
});
const MeGrievancesRoute = Route$1P.update({
  id: "/grievances",
  path: "/grievances",
  getParentRoute: () => MeRoute
});
const MeExpensesRoute = Route$1O.update({
  id: "/expenses",
  path: "/expenses",
  getParentRoute: () => MeRoute
});
const MeDutySelfReviewRoute = Route$1N.update({
  id: "/duty-self-review",
  path: "/duty-self-review",
  getParentRoute: () => MeRoute
});
const MeDutiesRoute = Route$1M.update({
  id: "/duties",
  path: "/duties",
  getParentRoute: () => MeRoute
});
const MeDocumentsRoute = Route$1L.update({
  id: "/documents",
  path: "/documents",
  getParentRoute: () => MeRoute
});
const MeDirectoryRoute = Route$1K.update({
  id: "/directory",
  path: "/directory",
  getParentRoute: () => MeRoute
});
const MeDashboardRoute = Route$1J.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => MeRoute
});
const MeContactRoute = Route$1I.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => MeRoute
});
const MeBankingTaxRoute = Route$1H.update({
  id: "/banking-tax",
  path: "/banking-tax",
  getParentRoute: () => MeRoute
});
const MeAssetsRoute = Route$1G.update({
  id: "/assets",
  path: "/assets",
  getParentRoute: () => MeRoute
});
const InviteTokenRoute = Route$1F.update({
  id: "/invite/$token",
  path: "/invite/$token",
  getParentRoute: () => Route$32
});
const HrVariationsRoute = Route$1E.update({
  id: "/hr/variations",
  path: "/hr/variations",
  getParentRoute: () => Route$32
});
const HelpGuideRoute = Route$1D.update({
  id: "/help/guide",
  path: "/help/guide",
  getParentRoute: () => Route$32
});
const HelpSlugRoute = Route$1C.update({
  id: "/help/$slug",
  path: "/help/$slug",
  getParentRoute: () => Route$32
});
const EmailUnsubscribeRoute = Route$1B.update({
  id: "/email/unsubscribe",
  path: "/email/unsubscribe",
  getParentRoute: () => Route$32
});
const DownloadsSplatRoute = Route$1A.update({
  id: "/downloads/$",
  path: "/downloads/$",
  getParentRoute: () => Route$32
});
const CareersSlugRoute = Route$1z.update({
  id: "/careers/$slug",
  path: "/careers/$slug",
  getParentRoute: () => Route$32
});
const BlogSlugRoute = Route$1y.update({
  id: "/blog/$slug",
  path: "/blog/$slug",
  getParentRoute: () => Route$32
});
const AdminTrainingRoute = Route$1x.update({
  id: "/training",
  path: "/training",
  getParentRoute: () => AdminRoute
});
const AdminToilRoute = Route$1w.update({
  id: "/toil",
  path: "/toil",
  getParentRoute: () => AdminRoute
});
const AdminTemplatesRoute = Route$1v.update({
  id: "/templates",
  path: "/templates",
  getParentRoute: () => AdminRoute
});
const AdminTeamsRoute = Route$1u.update({
  id: "/teams",
  path: "/teams",
  getParentRoute: () => AdminRoute
});
const AdminTeamAssignmentsRoute = Route$1t.update({
  id: "/team-assignments",
  path: "/team-assignments",
  getParentRoute: () => AdminRoute
});
const AdminSecurityFindingsRoute = Route$1s.update({
  id: "/security-findings",
  path: "/security-findings",
  getParentRoute: () => AdminRoute
});
const AdminSecurityRoute = Route$1r.update({
  id: "/security",
  path: "/security",
  getParentRoute: () => AdminRoute
});
const AdminReviewTemplatesRoute = Route$1q.update({
  id: "/review-templates",
  path: "/review-templates",
  getParentRoute: () => AdminRoute
});
const AdminReviewCyclesRoute = Route$1p.update({
  id: "/review-cycles",
  path: "/review-cycles",
  getParentRoute: () => AdminRoute
});
const AdminReviewAnalyticsRoute = Route$1o.update({
  id: "/review-analytics",
  path: "/review-analytics",
  getParentRoute: () => AdminRoute
});
const AdminRequestsRoute = Route$1n.update({
  id: "/requests",
  path: "/requests",
  getParentRoute: () => AdminRoute
});
const AdminPayslipTemplatesRoute = Route$1m.update({
  id: "/payslip-templates",
  path: "/payslip-templates",
  getParentRoute: () => AdminRoute
});
const AdminPayrollWizardRoute = Route$1l.update({
  id: "/payroll-wizard",
  path: "/payroll-wizard",
  getParentRoute: () => AdminRoute
});
const AdminPayrollSetupWizardRoute = Route$1k.update({
  id: "/payroll-setup-wizard",
  path: "/payroll-setup-wizard",
  getParentRoute: () => AdminRoute
});
const AdminPayrollSetupRoute = Route$1j.update({
  id: "/payroll-setup",
  path: "/payroll-setup",
  getParentRoute: () => AdminRoute
});
const AdminPayrollSettingsRoute = Route$1i.update({
  id: "/payroll-settings",
  path: "/payroll-settings",
  getParentRoute: () => AdminRoute
});
const AdminOvertimeSetupWizardRoute = Route$1h.update({
  id: "/overtime-setup-wizard",
  path: "/overtime-setup-wizard",
  getParentRoute: () => AdminRoute
});
const AdminOvertimeRatesRoute = Route$1g.update({
  id: "/overtime-rates",
  path: "/overtime-rates",
  getParentRoute: () => AdminRoute
});
const AdminOnboardingPacksRoute = Route$1f.update({
  id: "/onboarding-packs",
  path: "/onboarding-packs",
  getParentRoute: () => AdminRoute
});
const AdminOffboardingRoute = Route$1e.update({
  id: "/offboarding",
  path: "/offboarding",
  getParentRoute: () => AdminRoute
});
const AdminMedicalRoute = Route$1d.update({
  id: "/medical",
  path: "/medical",
  getParentRoute: () => AdminRoute
});
const AdminLeaveTypesRoute = Route$1c.update({
  id: "/leave-types",
  path: "/leave-types",
  getParentRoute: () => AdminRoute
});
const AdminLeaveSetupWizardRoute = Route$1b.update({
  id: "/leave-setup-wizard",
  path: "/leave-setup-wizard",
  getParentRoute: () => AdminRoute
});
const AdminKpiKraRoute = Route$1a.update({
  id: "/kpi-kra",
  path: "/kpi-kra",
  getParentRoute: () => AdminRoute
});
const AdminKnowledgeRoute = Route$19.update({
  id: "/knowledge",
  path: "/knowledge",
  getParentRoute: () => AdminRoute
});
const AdminIdRequestsRoute = Route$18.update({
  id: "/id-requests",
  path: "/id-requests",
  getParentRoute: () => AdminRoute
});
const AdminHolidaysRoute = Route$17.update({
  id: "/holidays",
  path: "/holidays",
  getParentRoute: () => AdminRoute
});
const AdminHolidayCategoriesRoute = Route$16.update({
  id: "/holiday-categories",
  path: "/holiday-categories",
  getParentRoute: () => AdminRoute
});
const AdminHolidayCalendarRoute = Route$15.update({
  id: "/holiday-calendar",
  path: "/holiday-calendar",
  getParentRoute: () => AdminRoute
});
const AdminGeofencesRoute = Route$14.update({
  id: "/geofences",
  path: "/geofences",
  getParentRoute: () => AdminRoute
});
const AdminFeedbackTemplatesRoute = Route$13.update({
  id: "/feedback-templates",
  path: "/feedback-templates",
  getParentRoute: () => AdminRoute
});
const AdminExpensesRoute = Route$12.update({
  id: "/expenses",
  path: "/expenses",
  getParentRoute: () => AdminRoute
});
const AdminEmployeeHolidaysRoute = Route$11.update({
  id: "/employee-holidays",
  path: "/employee-holidays",
  getParentRoute: () => AdminRoute
});
const AdminEmployeeDutiesRoute = Route$10.update({
  id: "/employee-duties",
  path: "/employee-duties",
  getParentRoute: () => AdminRoute
});
const AdminDutyReviewsRoute = Route$$.update({
  id: "/duty-reviews",
  path: "/duty-reviews",
  getParentRoute: () => AdminRoute
});
const AdminDisciplineRoute = Route$_.update({
  id: "/discipline",
  path: "/discipline",
  getParentRoute: () => AdminRoute
});
const AdminDiagnosticsRoute = Route$Z.update({
  id: "/diagnostics",
  path: "/diagnostics",
  getParentRoute: () => AdminRoute
});
const AdminDesignationsRoute = Route$Y.update({
  id: "/designations",
  path: "/designations",
  getParentRoute: () => AdminRoute
});
const AdminDepartmentsRoute = Route$X.update({
  id: "/departments",
  path: "/departments",
  getParentRoute: () => AdminRoute
});
const AdminBlogIntegrationsRoute = Route$W.update({
  id: "/blog-integrations",
  path: "/blog-integrations",
  getParentRoute: () => AdminRoute
});
const AdminBlogRoute = Route$V.update({
  id: "/blog",
  path: "/blog",
  getParentRoute: () => AdminRoute
});
const AdminBiometricRoute = Route$U.update({
  id: "/biometric",
  path: "/biometric",
  getParentRoute: () => AdminRoute
});
const AdminBillingOpsRoute = Route$T.update({
  id: "/billing-ops",
  path: "/billing-ops",
  getParentRoute: () => AdminRoute
});
const AdminBillingRoute = Route$S.update({
  id: "/billing",
  path: "/billing",
  getParentRoute: () => AdminRoute
});
const AdminAuditHistoryRoute = Route$R.update({
  id: "/audit-history",
  path: "/audit-history",
  getParentRoute: () => AdminRoute
});
const AdminAuStpAuditRoute = Route$Q.update({
  id: "/au-stp-audit",
  path: "/au-stp-audit",
  getParentRoute: () => AdminRoute
});
const AdminAssetsRoute = Route$P.update({
  id: "/assets",
  path: "/assets",
  getParentRoute: () => AdminRoute
});
const AdminApiDocsRoute = Route$O.update({
  id: "/api-docs",
  path: "/api-docs",
  getParentRoute: () => AdminRoute
});
const Char91DotwellKnownChar93OauthProtectedResourceRoute = Route$N.update({
  id: "/.well-known/oauth-protected-resource",
  path: "/.well-known/oauth-protected-resource",
  getParentRoute: () => Route$32
});
const Char91DotmcpChar93ListToolsRoute = Route$M.update({
  id: "/.mcp/list-tools",
  path: "/.mcp/list-tools",
  getParentRoute: () => Route$32
});
const OrgRecruitmentIndexRoute = Route$L.update({
  id: "/",
  path: "/",
  getParentRoute: () => OrgRecruitmentRoute
});
const OrgOnboardingIndexRoute = Route$K.update({
  id: "/onboarding/",
  path: "/onboarding/",
  getParentRoute: () => OrgRoute
});
const OrgDocumentsIndexRoute = Route$J.update({
  id: "/",
  path: "/",
  getParentRoute: () => OrgDocumentsRoute
});
const CareersTenantSlugIndexRoute = Route$I.update({
  id: "/careers/$tenantSlug/",
  path: "/careers/$tenantSlug/",
  getParentRoute: () => Route$32
});
const SignCertificateTokenRoute = Route$H.update({
  id: "/sign/certificate/$token",
  path: "/sign/certificate/$token",
  getParentRoute: () => Route$32
});
const OrgSettingsMfaPolicyRoute = Route$G.update({
  id: "/settings/mfa-policy",
  path: "/settings/mfa-policy",
  getParentRoute: () => OrgRoute
});
const OrgRecruitmentJobIdRoute = Route$F.update({
  id: "/$jobId",
  path: "/$jobId",
  getParentRoute: () => OrgRecruitmentRoute
});
const OrgOnboardingTrackerRoute = Route$E.update({
  id: "/onboarding/tracker",
  path: "/onboarding/tracker",
  getParentRoute: () => OrgRoute
});
const OrgDocumentsTemplatesRoute = Route$D.update({
  id: "/templates",
  path: "/templates",
  getParentRoute: () => OrgDocumentsRoute
});
const OrgDocumentsExpiringRoute = Route$C.update({
  id: "/expiring",
  path: "/expiring",
  getParentRoute: () => OrgDocumentsRoute
});
const OrgCareersSettingsRoute = Route$B.update({
  id: "/careers/settings",
  path: "/careers/settings",
  getParentRoute: () => OrgRoute
});
const LovableEmailSuppressionRoute = Route$A.update({
  id: "/lovable/email/suppression",
  path: "/lovable/email/suppression",
  getParentRoute: () => Route$32
});
const CareersTenantSlugJobSlugRoute = Route$z.update({
  id: "/careers/$tenantSlug/$jobSlug",
  path: "/careers/$tenantSlug/$jobSlug",
  getParentRoute: () => Route$32
});
const ApiV1OpenapiDotjsonRoute = Route$y.update({
  id: "/api/v1/openapi.json",
  path: "/api/v1/openapi.json",
  getParentRoute: () => Route$32
});
const ApiV1DocsRoute = Route$x.update({
  id: "/api/v1/docs",
  path: "/api/v1/docs",
  getParentRoute: () => Route$32
});
const AdminEmployeesEmployeeIdRoute = Route$w.update({
  id: "/employees/$employeeId",
  path: "/employees/$employeeId",
  getParentRoute: () => AdminRoute
});
const Char91DotmcpChar93InvokeToolToolRoute = Route$v.update({
  id: "/.mcp/invoke-tool/$tool",
  path: "/.mcp/invoke-tool/$tool",
  getParentRoute: () => Route$32
});
const DotlovableOauthConsentRoute = Route$u.update({
  id: "/.lovable/oauth/consent",
  path: "/.lovable/oauth/consent",
  getParentRoute: () => Route$32
});
const OrgOnboardingControlRoomIndexRoute = Route$t.update({
  id: "/onboarding/control-room/",
  path: "/onboarding/control-room/",
  getParentRoute: () => OrgRoute
});
const OrgRecruitmentCandidateCandidateIdRoute = Route$s.update({
  id: "/candidate/$candidateId",
  path: "/candidate/$candidateId",
  getParentRoute: () => OrgRecruitmentRoute
});
const OrgOnboardingControlRoomIdRoute = Route$r.update({
  id: "/onboarding/control-room/$id",
  path: "/onboarding/control-room/$id",
  getParentRoute: () => OrgRoute
});
const OrgDocumentsEnvelopeIdRoute = Route$q.update({
  id: "/envelope/$id",
  path: "/envelope/$id",
  getParentRoute: () => OrgDocumentsRoute
});
const LovableEmailTransactionalSendRoute = Route$p.update({
  id: "/lovable/email/transactional/send",
  path: "/lovable/email/transactional/send",
  getParentRoute: () => Route$32
});
const LovableEmailTransactionalPreviewRoute = Route$o.update({
  id: "/lovable/email/transactional/preview",
  path: "/lovable/email/transactional/preview",
  getParentRoute: () => Route$32
});
const LovableEmailQueueProcessRoute = Route$n.update({
  id: "/lovable/email/queue/process",
  path: "/lovable/email/queue/process",
  getParentRoute: () => Route$32
});
const ApiPublicHooksSuperSlaSweepRoute = Route$m.update({
  id: "/api/public/hooks/super-sla-sweep",
  path: "/api/public/hooks/super-sla-sweep",
  getParentRoute: () => Route$32
});
const ApiPublicHooksStripeWebhookRoute = Route$l.update({
  id: "/api/public/hooks/stripe-webhook",
  path: "/api/public/hooks/stripe-webhook",
  getParentRoute: () => Route$32
});
const ApiPublicHooksSecurityScanResultsRoute = Route$k.update({
  id: "/api/public/hooks/security-scan-results",
  path: "/api/public/hooks/security-scan-results",
  getParentRoute: () => Route$32
});
const ApiPublicHooksReviewRemindersRoute = Route$j.update({
  id: "/api/public/hooks/review-reminders",
  path: "/api/public/hooks/review-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksReviewInstanceRemindersRoute = Route$i.update({
  id: "/api/public/hooks/review-instance-reminders",
  path: "/api/public/hooks/review-instance-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksOnboardingTaskRemindersRoute = Route$h.update({
  id: "/api/public/hooks/onboarding-task-reminders",
  path: "/api/public/hooks/onboarding-task-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksOnboardingOverdueRemindersRoute = Route$g.update({
  id: "/api/public/hooks/onboarding-overdue-reminders",
  path: "/api/public/hooks/onboarding-overdue-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksOffboardingDueAlertsRoute = Route$f.update({
  id: "/api/public/hooks/offboarding-due-alerts",
  path: "/api/public/hooks/offboarding-due-alerts",
  getParentRoute: () => Route$32
});
const ApiPublicHooksMonthlyBillingCycleRoute = Route$e.update({
  id: "/api/public/hooks/monthly-billing-cycle",
  path: "/api/public/hooks/monthly-billing-cycle",
  getParentRoute: () => Route$32
});
const ApiPublicHooksLeaveCarryOverRoute = Route$d.update({
  id: "/api/public/hooks/leave-carry-over",
  path: "/api/public/hooks/leave-carry-over",
  getParentRoute: () => Route$32
});
const ApiPublicHooksLeaveAccrualRoute = Route$c.update({
  id: "/api/public/hooks/leave-accrual",
  path: "/api/public/hooks/leave-accrual",
  getParentRoute: () => Route$32
});
const ApiPublicHooksKpiCycleRemindersRoute = Route$b.update({
  id: "/api/public/hooks/kpi-cycle-reminders",
  path: "/api/public/hooks/kpi-cycle-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksIdRequestRetriesRoute = Route$a.update({
  id: "/api/public/hooks/id-request-retries",
  path: "/api/public/hooks/id-request-retries",
  getParentRoute: () => Route$32
});
const ApiPublicHooksGeofenceReconciliationRoute = Route$9.update({
  id: "/api/public/hooks/geofence-reconciliation",
  path: "/api/public/hooks/geofence-reconciliation",
  getParentRoute: () => Route$32
});
const ApiPublicHooksFeedbackRemindersRoute = Route$8.update({
  id: "/api/public/hooks/feedback-reminders",
  path: "/api/public/hooks/feedback-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksDisciplineDueAlertsRoute = Route$7.update({
  id: "/api/public/hooks/discipline-due-alerts",
  path: "/api/public/hooks/discipline-due-alerts",
  getParentRoute: () => Route$32
});
const ApiPublicHooksComplianceAttestationRemindersRoute = Route$6.update({
  id: "/api/public/hooks/compliance-attestation-reminders",
  path: "/api/public/hooks/compliance-attestation-reminders",
  getParentRoute: () => Route$32
});
const ApiPublicHooksBlogWebhookDeliveriesRoute = Route$5.update({
  id: "/api/public/hooks/blog-webhook-deliveries",
  path: "/api/public/hooks/blog-webhook-deliveries",
  getParentRoute: () => Route$32
});
const ApiPublicHooksAutoRetryAlertsRoute = Route$4.update({
  id: "/api/public/hooks/auto-retry-alerts",
  path: "/api/public/hooks/auto-retry-alerts",
  getParentRoute: () => Route$32
});
const ApiPublicHooksAuditRetentionRunRoute = Route$3.update({
  id: "/api/public/hooks/audit-retention-run",
  path: "/api/public/hooks/audit-retention-run",
  getParentRoute: () => Route$32
});
const ApiPublicBlogPostsRoute = Route$2.update({
  id: "/api/public/blog/posts",
  path: "/api/public/blog/posts",
  getParentRoute: () => Route$32
});
const ApiPublicBiometricTokenRoute = Route$1.update({
  id: "/api/public/biometric/$token",
  path: "/api/public/biometric/$token",
  getParentRoute: () => Route$32
});
const ApiPublicBlogPostsSlugRoute = Route.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => ApiPublicBlogPostsRoute
});
const AdminRouteChildren = {
  AdminApiDocsRoute,
  AdminAssetsRoute,
  AdminAuStpAuditRoute,
  AdminAuditHistoryRoute,
  AdminBillingRoute,
  AdminBillingOpsRoute,
  AdminBiometricRoute,
  AdminBlogRoute,
  AdminBlogIntegrationsRoute,
  AdminDepartmentsRoute,
  AdminDesignationsRoute,
  AdminDiagnosticsRoute,
  AdminDisciplineRoute,
  AdminDutyReviewsRoute,
  AdminEmployeeDutiesRoute,
  AdminEmployeeHolidaysRoute,
  AdminExpensesRoute,
  AdminFeedbackTemplatesRoute,
  AdminGeofencesRoute,
  AdminHolidayCalendarRoute,
  AdminHolidayCategoriesRoute,
  AdminHolidaysRoute,
  AdminIdRequestsRoute,
  AdminKnowledgeRoute,
  AdminKpiKraRoute,
  AdminLeaveSetupWizardRoute,
  AdminLeaveTypesRoute,
  AdminMedicalRoute,
  AdminOffboardingRoute,
  AdminOnboardingPacksRoute,
  AdminOvertimeRatesRoute,
  AdminOvertimeSetupWizardRoute,
  AdminPayrollSettingsRoute,
  AdminPayrollSetupRoute,
  AdminPayrollSetupWizardRoute,
  AdminPayrollWizardRoute,
  AdminPayslipTemplatesRoute,
  AdminRequestsRoute,
  AdminReviewAnalyticsRoute,
  AdminReviewCyclesRoute,
  AdminReviewTemplatesRoute,
  AdminSecurityRoute,
  AdminSecurityFindingsRoute,
  AdminTeamAssignmentsRoute,
  AdminTeamsRoute,
  AdminTemplatesRoute,
  AdminToilRoute,
  AdminTrainingRoute,
  AdminIndexRoute,
  AdminEmployeesEmployeeIdRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const MeRouteChildren = {
  MeAssetsRoute,
  MeBankingTaxRoute,
  MeContactRoute,
  MeDashboardRoute,
  MeDirectoryRoute,
  MeDocumentsRoute,
  MeDutiesRoute,
  MeDutySelfReviewRoute,
  MeExpensesRoute,
  MeGrievancesRoute,
  MeRequestsRoute,
  MeReviewsRoute,
  MeSecurityRoute,
  MeSignaturesRoute,
  MeTimelineRoute,
  MeToilRoute,
  MeTrainingRoute,
  MeIndexRoute
};
const MeRouteWithChildren = MeRoute._addFileChildren(MeRouteChildren);
const OrgDocumentsRouteChildren = {
  OrgDocumentsExpiringRoute,
  OrgDocumentsTemplatesRoute,
  OrgDocumentsIndexRoute,
  OrgDocumentsEnvelopeIdRoute
};
const OrgDocumentsRouteWithChildren = OrgDocumentsRoute._addFileChildren(
  OrgDocumentsRouteChildren
);
const OrgRecruitmentRouteChildren = {
  OrgRecruitmentJobIdRoute,
  OrgRecruitmentIndexRoute,
  OrgRecruitmentCandidateCandidateIdRoute
};
const OrgRecruitmentRouteWithChildren = OrgRecruitmentRoute._addFileChildren(
  OrgRecruitmentRouteChildren
);
const OrgRouteChildren = {
  OrgAnalyticsRoute,
  OrgBranchesRoute,
  OrgDangerRoute,
  OrgDocumentsRoute: OrgDocumentsRouteWithChildren,
  OrgEmployeesRoute,
  OrgExpensesRoute,
  OrgInvitationsRoute,
  OrgLeaveRoute,
  OrgPayRatesRoute,
  OrgPayrollRoute,
  OrgPerformanceRoute,
  OrgPromotionsRoute,
  OrgRecruitmentRoute: OrgRecruitmentRouteWithChildren,
  OrgReportsRoute,
  OrgRolesRoute,
  OrgSetupRoute,
  OrgTimesheetReviewRoute,
  OrgTimesheetsRoute,
  OrgTrainingRoute,
  OrgWhiteLabelRoute,
  OrgIndexRoute,
  OrgCareersSettingsRoute,
  OrgOnboardingTrackerRoute,
  OrgSettingsMfaPolicyRoute,
  OrgOnboardingIndexRoute,
  OrgOnboardingControlRoomIdRoute,
  OrgOnboardingControlRoomIndexRoute
};
const OrgRouteWithChildren = OrgRoute._addFileChildren(OrgRouteChildren);
const ApiPublicBlogPostsRouteChildren = {
  ApiPublicBlogPostsSlugRoute
};
const ApiPublicBlogPostsRouteWithChildren = ApiPublicBlogPostsRoute._addFileChildren(ApiPublicBlogPostsRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  AttendanceRoute,
  AuthRoute,
  ContactRoute,
  DashboardRoute,
  DevSessionRoute,
  DevelopersRoute,
  ForgotPasswordRoute,
  LeaveRoute,
  McpRoute,
  MeRoute: MeRouteWithChildren,
  MyPayslipsRoute,
  NotificationsRoute,
  OrgRoute: OrgRouteWithChildren,
  PerformanceRoute,
  PricingRoute,
  PrivacyRoute,
  RecognitionRoute,
  RegionalRoute,
  ResetPasswordRoute,
  SignupRoute,
  SitemapDotxmlRoute,
  SuspendedRoute,
  TeamRoute,
  TermsRoute,
  UnsubscribeRoute,
  WelcomeRoute,
  Char91DotmcpChar93ListToolsRoute,
  Char91DotwellKnownChar93OauthProtectedResourceRoute,
  BlogSlugRoute,
  CareersSlugRoute,
  DownloadsSplatRoute,
  EmailUnsubscribeRoute,
  HelpSlugRoute,
  HelpGuideRoute,
  HrVariationsRoute,
  InviteTokenRoute,
  OnboardingProfileRoute,
  PlatformFxRoute,
  PlatformInvitationsRoute,
  PlatformLeadsRoute,
  PlatformTenantsRoute,
  PracticeClientsRoute,
  PracticeInvoicesRoute,
  PracticeJobsRoute,
  PracticeProjectsRoute,
  PracticeTimeRoute,
  SettingsAccountRoute,
  SettingsBillingRoute,
  SettingsNotificationsRoute,
  SettingsOrganizationRoute,
  SettingsProfileRoute,
  SignEnvelopeIdRoute,
  BlogIndexRoute,
  CareersIndexRoute,
  HelpIndexRoute,
  OnboardingIndexRoute,
  DotlovableOauthConsentRoute,
  Char91DotmcpChar93InvokeToolToolRoute,
  ApiV1DocsRoute,
  ApiV1OpenapiDotjsonRoute,
  CareersTenantSlugJobSlugRoute,
  LovableEmailSuppressionRoute,
  SignCertificateTokenRoute,
  CareersTenantSlugIndexRoute,
  ApiPublicBiometricTokenRoute,
  ApiPublicBlogPostsRoute: ApiPublicBlogPostsRouteWithChildren,
  ApiPublicHooksAuditRetentionRunRoute,
  ApiPublicHooksAutoRetryAlertsRoute,
  ApiPublicHooksBlogWebhookDeliveriesRoute,
  ApiPublicHooksComplianceAttestationRemindersRoute,
  ApiPublicHooksDisciplineDueAlertsRoute,
  ApiPublicHooksFeedbackRemindersRoute,
  ApiPublicHooksGeofenceReconciliationRoute,
  ApiPublicHooksIdRequestRetriesRoute,
  ApiPublicHooksKpiCycleRemindersRoute,
  ApiPublicHooksLeaveAccrualRoute,
  ApiPublicHooksLeaveCarryOverRoute,
  ApiPublicHooksMonthlyBillingCycleRoute,
  ApiPublicHooksOffboardingDueAlertsRoute,
  ApiPublicHooksOnboardingOverdueRemindersRoute,
  ApiPublicHooksOnboardingTaskRemindersRoute,
  ApiPublicHooksReviewInstanceRemindersRoute,
  ApiPublicHooksReviewRemindersRoute,
  ApiPublicHooksSecurityScanResultsRoute,
  ApiPublicHooksStripeWebhookRoute,
  ApiPublicHooksSuperSlaSweepRoute,
  LovableEmailQueueProcessRoute,
  LovableEmailTransactionalPreviewRoute,
  LovableEmailTransactionalSendRoute
};
const routeTree = Route$32._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 6e4,
        // 1 min — avoid refetch storms while users navigate
        gcTime: 5 * 6e4,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 1e4,
    defaultPreloadDelay: 150,
    // Keep matches in memory long enough that browser back-nav restores the
    // previous view instantly instead of showing a blank loading screen.
    defaultGcTime: 10 * 6e4,
    defaultStaleTime: 3e4
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  listAllDocumentRequests as $,
  AuthRouteGate as A,
  Button as B,
  Card as C,
  setTotpEnrolled as D,
  startEmailMfa as E,
  verifyEmailMfa as F,
  isMfaSessionVerified as G,
  setMfaSessionVerified as H,
  listGrievances as I,
  fileGrievance as J,
  listCases as K,
  withdrawGrievance as L,
  GrievanceThread as M,
  GrievanceAttachments as N,
  listActions as O,
  Route$1F as P,
  postQuery as Q,
  Route$30 as R,
  Route$1y as S,
  Textarea as T,
  relatedQuery as U,
  listTeamMembers as V,
  listEmployeeRecord as W,
  requestMissingDocument as X,
  cancelDocumentRequest as Y,
  exportEmployeeHistoryCsv as Z,
  logBlogAccessAttempt as _,
  useServerFn as a,
  upsertRetryPolicy as a$,
  approveDocumentRequest as a0,
  resendDocumentRequest as a1,
  bulkApproveDocumentRequests as a2,
  bulkCancelDocumentRequests as a3,
  bulkResendDocumentRequests as a4,
  listRequestAudit as a5,
  listReconciliation as a6,
  resolveReconciliation as a7,
  runReconciliation as a8,
  listGrievanceAttachments as a9,
  listAdminPosts as aA,
  upsertPost as aB,
  deletePost as aC,
  getAdminPost as aD,
  listCategories as aE,
  listBiometricDevices as aF,
  upsertBiometricDevice as aG,
  rotateDeviceSecret as aH,
  listMappings as aI,
  upsertMapping as aJ,
  listPunches as aK,
  listBillingAlerts as aL,
  listTenantsBillingOverview as aM,
  listTenantsLite as aN,
  listReconciliationForMonth as aO,
  retryBillingAlert as aP,
  resolveBillingAlert as aQ,
  runReconciliationForMonth as aR,
  exportBillingForMonth as aS,
  listDiscrepancies as aT,
  exportDiscrepanciesCsv as aU,
  listBillingOpsAuditFiltered as aV,
  exportBillingOpsAuditCsv as aW,
  listAlertSuppressions as aX,
  upsertAlertSuppression as aY,
  deleteAlertSuppression as aZ,
  listRetryPolicies as a_,
  recordGrievanceAttachment as aa,
  deleteGrievanceAttachment as ab,
  getAttachmentDownloadUrl as ac,
  listGrievanceComments as ad,
  addGrievanceComment as ae,
  upsertCase as af,
  deleteCase as ag,
  listApprovals as ah,
  decideApproval as ai,
  updateGrievance as aj,
  assignCase as ak,
  transitionCaseStatus as al,
  listHrUsers as am,
  requestApproval as an,
  listCaseAttachments as ao,
  recordCaseAttachment as ap,
  deleteCaseAttachment as aq,
  addAction as ar,
  deleteAction as as,
  perfBus as at,
  listApiKeys as au,
  createApiKey as av,
  revokeApiKey as aw,
  listWebhooks as ax,
  upsertWebhook as ay,
  deleteWebhook as az,
  CardHeader as b,
  previewInvoiceImpact as b0,
  seedStripePrices as b1,
  Route$I as b2,
  getCareersByTenantSlug as b3,
  getCareersSettings as b4,
  updateCareersSettings as b5,
  updateJobPublication as b6,
  Route$z as b7,
  getJobBySlug as b8,
  Route$w as b9,
  Route$u as ba,
  oauthApi as bb,
  Route$r as bc,
  mfaSession as bd,
  router as be,
  CardTitle as c,
  CardDescription as d,
  CardContent as e,
  Badge as f,
  getMyOrgStatus as g,
  cn as h,
  getMyGateStatus as i,
  Route$2w as j,
  postsQuery as k,
  buttonVariants as l,
  Route$2m as m,
  createOrganization as n,
  markSetupStep as o,
  projectLeaveBalances as p,
  updateOrganizationProfile as q,
  resetMyOrgSetup as r,
  seedOrgDefaults as s,
  requestRoleRefresh as t,
  useAuth as u,
  requestOrgStatusRefresh as v,
  runMonthlyLeaveAccrual as w,
  runYearEndCarryOver as x,
  adjustLeaveBalance as y,
  getMfaStatus as z
};
