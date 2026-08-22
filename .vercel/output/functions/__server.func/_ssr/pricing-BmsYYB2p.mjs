import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a5 as Check } from "../_libs/lucide-react.mjs";
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
const TIERS = [{
  name: "Starter",
  price: "$4",
  per: "per employee / month",
  features: ["Up to 25 employees", "Single-country payroll", "Self-serve onboarding", "Email support"]
}, {
  name: "Growth",
  price: "$8",
  per: "per employee / month",
  features: ["Unlimited employees", "Multi-country payroll", "Performance & reviews", "Priority support"]
}, {
  name: "Enterprise",
  price: "Custom",
  per: "Talk to sales",
  features: ["SAML SSO & SCIM", "Dedicated CSM", "Custom integrations", "99.95% SLA"]
}];
function PricingPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-5xl px-6 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl md:text-5xl", children: "Pricing built for global teams" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-2xl", children: "One platform for HR, payroll and practice management. Pay only for active employees." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: TIERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-muted-foreground", children: t.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-semibold", children: t.price }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.per }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-2 text-sm", children: t.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mt-0.5 text-primary" }),
        f
      ] }, f)) })
    ] }, t.name)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-10 text-sm text-muted-foreground", children: [
      "Questions? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", className: "underline", children: "Contact our team" }),
      "."
    ] })
  ] }) });
}
export {
  PricingPage as component
};
