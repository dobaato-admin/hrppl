import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { C as Card, e as CardContent, b as CardHeader, c as CardTitle, d as CardDescription, B as Button } from "./router-CLxirH5A.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
async function applyRecoveryFromUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return "That doesn't look like a link. Paste the whole URL, starting with https://";
  }
  const hash = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const search = url.searchParams;
  const hashError = hash.get("error_description") || hash.get("error");
  if (hashError) {
    return hash.get("error_code") === "otp_expired" ? "This reset link has expired. Please request a new one." : decodeURIComponent(hashError).replace(/\+/g, " ");
  }
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const {
      error
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    return error ? "This reset link is invalid or has expired. Please request a new one." : null;
  }
  const tokenHash = search.get("token_hash") || hash.get("token_hash");
  if (tokenHash) {
    const {
      error
    } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery"
    });
    return error ? error.message : null;
  }
  const code = search.get("code");
  if (code) {
    const {
      error
    } = await supabase.auth.exchangeCodeForSession(code);
    return error ? "This reset link has expired or is invalid. Please request a new one." : null;
  }
  return "No reset token found in that link.";
}
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = reactExports.useState("");
  const [pastedLink, setPastedLink] = reactExports.useState("");
  const [redeeming, setRedeeming] = reactExports.useState(false);
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [verifying, setVerifying] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    async function verifyLink() {
      const message = await applyRecoveryFromUrl(window.location.href);
      if (message) {
        const {
          data
        } = await supabase.auth.getSession();
        if (!data.session) setError(message);
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
      setVerifying(false);
    }
    verifyLink();
  }, []);
  async function redeemPastedLink() {
    if (!pastedLink.trim()) return;
    setRedeeming(true);
    const message = await applyRecoveryFromUrl(pastedLink);
    setRedeeming(false);
    if (message) return toast.error(message);
    setError(null);
    setPastedLink("");
    toast.success("Link accepted — choose a new password.");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    setLoading(true);
    const {
      error: updateError
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (updateError) return toast.error(updateError.message);
    toast.success("Password updated successfully!");
    navigate({
      to: "/dashboard"
    });
  }
  if (verifying) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Verifying your reset link…" }) }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: "Link expired" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", children: "Request new link" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border border-border bg-muted/30 p-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paste-link", className: "text-xs font-medium", children: "Landed on the wrong site? Paste the link here" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "paste-link", value: pastedLink, onChange: (e) => setPastedLink(e.target.value), placeholder: "https://…/reset-password#access_token=…", autoComplete: "off", spellCheck: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Copy the whole address from your browser after opening the email link, including everything after the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "#" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: redeemPastedLink, disabled: redeeming || !pastedLink.trim(), children: redeeming ? "Checking…" : "Use this link" })
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-bold", children: "h" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: "Choose a new password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Make sure it’s at least 8 characters." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmPassword", children: "Confirm password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirmPassword", type: "password", placeholder: "••••••••", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Updating…" : "Reset password" })
    ] }) })
  ] }) });
}
export {
  ResetPasswordPage as component
};
