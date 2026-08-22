import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { ba as Route$u, bb as oauthApi } from "./_ssr/router-CLxirH5A.mjs";
import "./_libs/sonner.mjs";
import "./_libs/seroval.mjs";
import "./_libs/lovable.dev__mcp-js.mjs";
import "./_libs/modelcontextprotocol__sdk.mjs";
import "./_libs/zod-to-json-schema.mjs";
import "./_libs/ajv-formats.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "./_libs/isbot.mjs";
import "./_ssr/client-BLUqAwhM.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_ssr/createSsrRpc-CRedQJGY.mjs";
import "./_ssr/server-BOi2EjMN.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_ssr/auth-guard-CkYFJuQL.mjs";
import "./_ssr/createMiddleware-BvN2ghIY.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/lovable.dev__webhooks-js.mjs";
import "./_libs/react-email__render.mjs";
import "./_libs/prettier.mjs";
import "./_libs/html-to-text.mjs";
import "./_libs/selderee__plugin-htmlparser2.mjs";
import "./_libs/selderee.mjs";
import "./_libs/parseley.mjs";
import "./_libs/leac.mjs";
import "./_libs/peberminta.mjs";
import "./_libs/domhandler.mjs";
import "./_libs/domelementtype.mjs";
import "./_libs/htmlparser2.mjs";
import "./_libs/entities.mjs";
import "./_libs/deepmerge.mjs";
import "./_libs/dom-serializer.mjs";
import "./_ssr/registry-Y5CZHtkF.mjs";
import "./_libs/react-email__text.mjs";
import "./_libs/react-email__section.mjs";
import "./_libs/react-email__button.mjs";
import "./_libs/react-email__html.mjs";
import "./_libs/react-email__head.mjs";
import "./_libs/react-email__preview.mjs";
import "./_libs/react-email__body.mjs";
import "./_libs/react-email__container.mjs";
import "./_libs/react-email__heading.mjs";
import "./_libs/lovable.dev__email-js.mjs";
import "./_ssr/send-internal.server-9cG3k97B.mjs";
import "./_ssr/client.server-D5ro3rAQ.mjs";
import "./_ssr/geofences.functions-C8KvPefL.mjs";
import "./_libs/zod.mjs";
import "./_libs/lucide-react.mjs";
import "./_libs/jose.mjs";
import "./_libs/ajv.mjs";
import "./_libs/fast-deep-equal.mjs";
import "./_libs/json-schema-traverse.mjs";
import "./_libs/fast-uri.mjs";
function Consent() {
  const details = Route$u.useLoaderData();
  const {
    authorization_id
  } = Route$u.useSearch();
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const clientName = details?.client?.name ?? "an app";
  async function decide(approve) {
    setBusy(true);
    setError(null);
    const {
      data,
      error: error2
    } = approve ? await oauthApi().approveAuthorization(authorization_id) : await oauthApi().denyAuthorization(authorization_id);
    if (error2) {
      setBusy(false);
      setError(error2.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-semibold text-foreground", children: [
      "Connect ",
      clientName,
      " to hrppl"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      clientName,
      " is requesting access to act as you in hrppl. It will be able to call hrppl's MCP tools with your permissions — reading only the data your account can already see."
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: () => decide(true), className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60", children: busy ? "Working…" : "Approve" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: () => decide(false), className: "inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60", children: "Deny" })
    ] })
  ] }) });
}
export {
  Consent as component
};
