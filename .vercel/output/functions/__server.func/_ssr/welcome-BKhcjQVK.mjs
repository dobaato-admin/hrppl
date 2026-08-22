import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, g as getMyOrgStatus, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button } from "./router-CLxirH5A.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { a as acceptInvitation, g as getInvitationByToken } from "./staff-invitations.functions-CbtTdlva.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { L as LoaderCircle, a as UserPlus, B as Building2, b as LogOut } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
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
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./geofences.functions-C8KvPefL.mjs";
import "../_libs/zod.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
function WelcomePage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getMyOrgStatus);
  const acceptFn = useServerFn(acceptInvitation);
  const lookupFn = useServerFn(getInvitationByToken);
  const [busy, setBusy] = reactExports.useState(false);
  const [token, setToken] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  const {
    data: status,
    isLoading
  } = useQuery({
    queryKey: ["my-org-status"],
    queryFn: () => fetchStatus({}),
    enabled: !!user
  });
  reactExports.useEffect(() => {
    if (!status) return;
    if (status.tenantId) {
      if (status.employee && !status.onboardingProfile?.submitted_at) {
        navigate({
          to: "/onboarding/profile"
        });
      } else if (status.roles.includes("org_admin") && !status.setupProgress?.completed_at) {
        navigate({
          to: "/org/setup"
        });
      } else {
        navigate({
          to: "/dashboard"
        });
      }
    } else if (status.pendingTrialInvitation) {
      navigate({
        to: "/org/setup"
      });
    }
  }, [status, navigate]);
  async function acceptPending() {
    if (!status?.pendingInvitation) return;
    setBusy(true);
    try {
      await acceptFn({
        data: {
          token: status.pendingInvitation.token
        }
      });
      toast.success("Welcome aboard!");
      navigate({
        to: "/onboarding/profile"
      });
    } catch (e) {
      toast.error(e?.message ?? "Could not accept invitation");
    } finally {
      setBusy(false);
    }
  }
  async function acceptByToken(e) {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    setBusy(true);
    try {
      const lookup = await lookupFn({
        data: {
          token: t
        }
      });
      if (!lookup.invitation || lookup.invitation.status !== "pending") {
        throw new Error("Invitation link is invalid or no longer active.");
      }
      await acceptFn({
        data: {
          token: t
        }
      });
      toast.success("Welcome aboard!");
      navigate({
        to: "/onboarding/profile"
      });
    } catch (e2) {
      toast.error(e2?.message ?? "Could not accept invitation");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    await supabase.auth.signOut();
    navigate({
      to: "/auth"
    });
  }
  if (loading || isLoading || !status) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Welcome to WorldPay HRMS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
        "Hi ",
        user?.email,
        ". Let's get you set up. Are you joining an existing organization, or starting a new one?"
      ] })
    ] }),
    status.pendingInvitation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-primary/40 bg-primary/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "You have a pending invitation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          status.pendingInvitation.first_name ? `${status.pendingInvitation.first_name}, you've` : "You've",
          " been invited",
          status.pendingInvitation.job_title ? ` as ${status.pendingInvitation.job_title}` : "",
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: acceptPending, disabled: busy, children: busy ? "Joining…" : "Accept invitation" }) })
    ] }),
    status.pendingTrialInvitation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-primary/40 bg-primary/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Your trial workspace is ready to set up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: status.pendingTrialInvitation.org_name ? `Finish setting up ${status.pendingTrialInvitation.org_name} to activate your trial.` : "Finish setting up your organization to activate your trial." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
        to: "/org/setup"
      }), disabled: busy, children: "Continue setup" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/10 p-2 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Join an organization" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Paste the invitation code from your email." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: acceptByToken, className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm", placeholder: "Invitation code or token", value: token, onChange: (e) => setToken(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "outline", className: "w-full", disabled: busy || !token.trim(), children: busy ? "Joining…" : "Join organization" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-accent/20 p-2 text-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Create a new organization" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "You'll become the organization administrator and walk through a short setup." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/setup", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", children: "Get started" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: signOut, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-2 h-4 w-4" }),
      " Sign out"
    ] }) })
  ] }) });
}
export {
  WelcomePage as component
};
