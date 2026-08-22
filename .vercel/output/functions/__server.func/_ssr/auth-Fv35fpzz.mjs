import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, f as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { l as lovable } from "./index-C7ZRg4Jn.mjs";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button } from "./router-CLxirH5A.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { r as readOAuthErrorFromUrl, b as buildGoogleRedirectUri, d as describeOAuthError, a as describePasswordSignInError } from "./oauth-config-B7YbiyVz.mjs";
import { A as Alert, a as AlertDescription } from "./alert-CfSGBoj2.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
function AuthPage() {
  const navigate = useNavigate();
  const {
    redirect = "/dashboard"
  } = useSearch({
    from: "/auth"
  });
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [signInError, setSignInError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const info = readOAuthErrorFromUrl();
    if (info) {
      toast.error(info.title, {
        description: info.message
      });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  async function signIn(e) {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setLoading(false);
    if (error) {
      const info = describePasswordSignInError(error);
      setSignInError(info);
      return toast.error(info.title, {
        description: info.message
      });
    }
    setSignInError(null);
    toast.success("Signed in");
    navigate({
      to: redirect
    });
  }
  async function signInGoogle() {
    const {
      redirectUri,
      validation
    } = buildGoogleRedirectUri(redirect);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description: `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. Open the app from an approved URL, or ask your administrator to add it. Details have been logged to the console.`
      });
      return;
    }
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: {
          prompt: "select_account"
        }
      });
      if (result.redirected) return;
      setLoading(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        return toast.error(info.title, {
          description: info.message
        });
      }
      navigate({
        to: redirect
      });
    } catch (err) {
      setLoading(false);
      const info = describeOAuthError(err);
      toast.error(info.title, {
        description: info.message
      });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "sr-only", children: "Sign in to hrppl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "hrppl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Sign in to your existing account, or create one to get started." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "signin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signin", children: "Sign In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Sign Up" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signin", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "For existing users only. New here? Switch to the Sign Up tab." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: signInGoogle, disabled: loading, children: "Continue with Google" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "or sign in with email" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: signIn, className: "space-y-4", children: [
          signInError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: signInError.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: signInError.message }),
            signInError.code && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-70", children: [
              "Reference: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: signInError.code })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email-in", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email-in", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-in", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "text-xs font-medium text-primary hover:underline", children: "Forgot password?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw-in", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in…" : "Sign In" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Choose how you want to get started:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Create a new organisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Set up a workspace for your company. You'll become the admin and can invite your team." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", search: {
            redirect: "/org/setup"
          }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", className: "w-full", children: "Create organisation" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Join an existing organisation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You need an invitation from your organisation admin. Open the invitation link from your email — it will sign you in and add you to the team. We don't accept individual employee signups without an invitation." })
        ] })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AuthPage as component
};
