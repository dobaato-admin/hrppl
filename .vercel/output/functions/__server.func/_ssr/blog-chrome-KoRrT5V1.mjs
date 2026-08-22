import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
function BlogNav() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 h-16 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "font-display font-bold text-lg", children: "hrppl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-6 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/blog", className: "text-foreground hover:text-primary", children: "Blog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers", className: "text-muted-foreground hover:text-foreground", children: "Developers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-muted-foreground hover:text-foreground", children: "Sign in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium", children: "Start free" })
    ] })
  ] }) });
}
function BlogFooter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border py-10 mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " hrppl. Global HRMS, payroll & practice management."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/blog", children: "Blog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers", children: "API" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Home" })
    ] })
  ] }) });
}
export {
  BlogNav as B,
  BlogFooter as a
};
