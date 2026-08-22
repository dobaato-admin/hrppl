import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, B as Button } from "./router-CLxirH5A.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as getMeOverview } from "./me.functions-DY4fpk4D.mjs";
import { a as SkeletonRows, E as EmptyState, b as SectionCard, K as KpiTile, s as statusTone, S as StatusChip } from "./monday-Dpwrcz0o.mjs";
import { P as Progress } from "./progress-0PXrlkmq.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { a7 as ArrowUpRight, i as CalendarDays, w as ListChecks, ai as FolderOpen, R as Receipt, aa as Plus } from "../_libs/lucide-react.mjs";
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
import "./client-BLUqAwhM.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function fmtMoney(n, c) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: c || "USD"
    }).format(Number(n));
  } catch {
    return `${n} ${c ?? ""}`.trim();
  }
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(void 0, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function MeOverview() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  const fn = useServerFn(getMeOverview);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["me-overview"],
    queryFn: () => fn({}),
    enabled: !!user
  });
  if (isLoading || !data) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRows, { rows: 6 });
  if (!data.employee) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No employee record yet", description: "Once your organization links your account to an employee profile, your self-service hub will appear here." });
  }
  const e = data.employee;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { tone: "primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold uppercase tracking-widest text-primary", children: [
            "Employee #",
            e.employee_number
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold tracking-tight", children: [
            e.first_name,
            " ",
            e.last_name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            e.job_title ?? "—",
            data.department ? ` · ${data.department.name}` : "",
            " · Hired ",
            fmtDate(e.hire_date)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            e.email,
            e.phone ? ` · ${e.phone}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Manager" }),
          data.manager ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
            data.manager.first_name,
            " ",
            data.manager.last_name
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No manager set" }),
          data.manager?.job_title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: data.manager.job_title })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Profile completeness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium tabular-nums", children: [
            data.profileCompleteness,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: data.profileCompleteness }),
        data.profileCompleteness < 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/me/contact", children: [
            "Update contact ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "ml-1 h-3 w-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/me/banking-tax", children: [
            "Banking & tax ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "ml-1 h-3 w-3" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Leave pending", value: data.pendingLeaveCount, tone: "working", to: "/leave", icon: CalendarDays }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Open tasks", value: data.openTaskCount, tone: "pending", to: "/onboarding", icon: ListChecks }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Documents", value: data.documentCount, tone: "info", to: "/me/documents", icon: FolderOpen }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Payslips", value: data.recentPayslips.length, tone: "primary", to: "/my-payslips", icon: Receipt })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Leave balances", description: "Days available across leave types", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/leave", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
        " Request"
      ] }) }), children: data.leaveBalances.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No leave types configured", description: "Ask your admin to set up leave types." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: data.leaveBalances.map((b, i) => {
        const available = Number(b.accrued_days ?? 0) + Number(b.carried_over_days ?? 0) - Number(b.used_days ?? 0) - Number(b.pending_days ?? 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: b.leave_type?.name ?? "Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              Number(b.used_days).toFixed(1),
              " used · ",
              Number(b.pending_days).toFixed(1),
              " pending"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums font-semibold", children: [
            available.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "days" })
          ] })
        ] }, i);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Recent leave", description: "Your last 5 requests", children: data.recentLeave.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No leave requests yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: data.recentLeave.map((r) => {
        const st = statusTone(r.status);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.leave_type?.name ?? "Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              fmtDate(r.start_date),
              " → ",
              fmtDate(r.end_date),
              " · ",
              Number(r.days).toFixed(1),
              " days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { tone: st.tone, children: st.label })
        ] }, r.id);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Recent payslips", description: "Latest 3 pay periods", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/my-payslips", children: "All payslips" }) }), children: data.recentPayslips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No payslips yet", description: "Once your first pay run is approved, payslips will appear here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: data.recentPayslips.map((p) => {
      const st = statusTone(p.run?.status ?? "pending");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
            fmtDate(p.run?.period_start),
            " → ",
            fmtDate(p.run?.period_end)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Pay date ",
            fmtDate(p.run?.pay_date)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-semibold tabular-nums", children: fmtMoney(p.net_pay, p.currency_code) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { tone: st.tone, children: st.label })
        ] })
      ] }, p.id);
    }) }) })
  ] });
}
export {
  MeOverview as component
};
