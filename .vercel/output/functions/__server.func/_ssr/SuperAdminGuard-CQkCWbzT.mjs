import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, _ as logBlogAccessAttempt, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, B as Button } from "./router-CLxirH5A.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { r as ShieldAlert } from "../_libs/lucide-react.mjs";
function SuperAdminGuard({ title, route, children }) {
  const { user, roles, loading } = useAuth();
  const isSuper = roles.includes("super_admin");
  const logFn = useServerFn(logBlogAccessAttempt);
  const logged = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (loading) return;
    if (user && !isSuper && !logged.current) {
      logged.current = true;
      void logFn({ data: { route, reason: "non_super_admin_ui_access" } }).catch(() => {
      });
    }
  }, [loading, user, isSuper, route, logFn]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Checking access…" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Sign in required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "You must be signed in to view this page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: "Go to sign in" }) }) })
    ] }) });
  }
  if (!isSuper) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-destructive/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Super admin only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "The Blog CMS, API keys and webhook management are restricted to super administrators." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Your access attempt to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: route }),
          " has been recorded. If you believe you should have access, contact a super administrator."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: "Back to dashboard" }) }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  SuperAdminGuard as S
};
