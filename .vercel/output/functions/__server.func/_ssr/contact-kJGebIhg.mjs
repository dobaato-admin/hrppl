import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { an as Mail, ao as MessageSquare, O as Earth } from "../_libs/lucide-react.mjs";
function ContactPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-6 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl", children: "Contact us" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "We typically reply within one business day." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "mailto:sales@hrppl.io", className: "rounded-xl border bg-card p-5 hover:border-primary transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-medium", children: "Sales" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "sales@hrppl.io" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "mailto:support@hrppl.io", className: "rounded-xl border bg-card p-5 hover:border-primary transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-medium", children: "Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "support@hrppl.io" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "mailto:partners@hrppl.io", className: "rounded-xl border bg-card p-5 hover:border-primary transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-medium", children: "Partners" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "partners@hrppl.io" })
      ] })
    ] })
  ] }) });
}
export {
  ContactPage as component
};
