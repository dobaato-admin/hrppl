import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
function Developers() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground", children: "API v1 · OpenAPI 3.1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-semibold tracking-tight sm:text-5xl", children: "hrppl Developer Portal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl text-lg text-muted-foreground", children: "Global HRMS & Payroll suite with a fully API-first surface. Every UI action has a matching REST endpoint, every domain change emits a signed webhook." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/api/v1/docs", className: "inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90", children: "Open Swagger UI →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/api/v1/openapi.json", className: "inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted", children: "Download openapi.json" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/api/v1/health", className: "inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted", children: "Health check" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted", children: "Sign in →" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: [{
      title: "REST + OpenAPI 3.1",
      body: "Cursor pagination, sparse fieldsets, filtering, expansion, idempotent writes, ETag concurrency."
    }, {
      title: "OAuth 2.0 + PATs + API keys",
      body: "Authorization Code + PKCE, Client Credentials, personal access tokens, tenant-scoped keys."
    }, {
      title: "Signed Webhooks",
      body: "HMAC-SHA256 events for every domain change, exponential-backoff retries, delivery replay."
    }, {
      title: "Multi-currency Payroll",
      body: "Configurable tax rules, holidays, leave types, OT and penalty rates per country."
    }, {
      title: "SCIM 2.0 + SSO",
      body: "Provision users from Okta / Azure AD / Google. SAML & OIDC for login."
    }, {
      title: "Bulk + Async Jobs",
      body: "CSV import/export, payroll runs, bank-file generation tracked via /jobs/{id}."
    }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-lg border border-border bg-card p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold", children: c.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: c.body })
    ] }, c.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-border pt-6 text-sm text-muted-foreground", children: [
      "Base URL · ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: "/api/v1" }),
      "  |  Spec · hrppl API v1.0.0"
    ] })
  ] }) });
}
export {
  Developers as component
};
