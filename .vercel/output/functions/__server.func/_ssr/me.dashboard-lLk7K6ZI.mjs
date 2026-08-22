import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useServerFn, B as Button, f as Badge } from "./router-CLxirH5A.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as SkeletonRows, E as EmptyState, b as SectionCard, K as KpiTile } from "./monday-Dpwrcz0o.mjs";
import "../_libs/sonner.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { aV as FileExclamationPoint, i as CalendarDays, e as ClipboardList, G as GraduationCap, o as FilePenLine, j as ClipboardCheck, R as Receipt, l as Sparkles, c as Users, Y as TriangleAlert, g as DollarSign, u as Briefcase, B as Building2, J as MapPin, aW as IdCard, x as BadgeCheck, I as Inbox, W as Wallet } from "../_libs/lucide-react.mjs";
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
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
const getDashboardSnapshot = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("60c5af065f2e24e05251b8b13c57837f280fae8daf2d36b7aa7b8c24ec18e1af"));
function fmtName(p) {
  if (!p) return "—";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—";
}
function AnomalyList({
  title,
  items,
  icon: Icon,
  cta,
  render,
  emptyHint
}) {
  const count = items?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
    " ",
    title,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: count > 0 ? "destructive" : "secondary", className: "ml-1", children: count })
  ] }), tone: count > 0 ? "stuck" : "done", children: count === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "All clear", description: emptyHint ?? "Nothing needs attention here." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    items.slice(0, 8).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm", children: render(e) }, e.id ?? i)),
    items.length > 8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pt-1 text-xs text-muted-foreground", children: [
      "+ ",
      items.length - 8,
      " more"
    ] }),
    cta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: cta.to, children: cta.label }) }) })
  ] }) });
}
function Dashboard() {
  const fn = useServerFn(getDashboardSnapshot);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => fn({})
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRows, { rows: 8 });
  if (!data) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No data" });
  const me = data.me;
  const mgr = data.manager;
  const hr = data.hr;
  const fin = data.finance;
  const personalAnomalies = (me?.pendingLeaveCount ?? 0) + (me?.onboardingOpenCount ?? 0) + (me?.trainingDueCount ?? 0) + (me?.signaturesPendingCount ?? 0) + (me?.draftTimesheetCount ?? 0) + ((me?.completeness ?? 100) < 80 ? 1 : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "My snapshot", tone: personalAnomalies > 0 ? "stuck" : "done", description: personalAnomalies === 0 ? "You're all caught up." : `${personalAnomalies} item${personalAnomalies === 1 ? "" : "s"} need your attention.`, children: [
      me ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Profile complete", value: `${me.completeness}%`, tone: me.completeness < 80 ? "stuck" : "done", icon: FileExclamationPoint, hint: me.completeness < 80 ? `${me.missingProfileFields.length} fields to fill` : "Looking good" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Pending leave", value: me.pendingLeaveCount, tone: me.pendingLeaveCount > 0 ? "working" : "info", icon: CalendarDays, hint: me.pendingLeaveCount > 0 ? "Awaiting approval" : "Nothing pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Onboarding tasks", value: me.onboardingOpenCount, tone: me.onboardingOpenCount > 0 ? "working" : "info", icon: ClipboardList }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Training due", value: me.trainingDueCount, tone: me.trainingDueCount > 0 ? "working" : "info", icon: GraduationCap }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Docs to sign", value: me.signaturesPendingCount, tone: me.signaturesPendingCount > 0 ? "stuck" : "info", icon: FilePenLine }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Draft timesheet", value: me.draftTimesheetCount, tone: me.draftTimesheetCount > 0 ? "working" : "info", icon: ClipboardCheck })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No employee record", description: "Ask HR to link your account." }),
      me?.nextHoliday && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-md border bg-accent/30 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Next public holiday: " }),
        me.nextHoliday.name,
        " — ",
        me.nextHoliday.holiday_date
      ] }),
      me?.latestPayslip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-md border bg-card px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Latest payslip: " }),
        me.latestPayslip.currency_code,
        " ",
        Number(me.latestPayslip.net_pay).toLocaleString(),
        " —",
        " ",
        me.latestPayslip.run?.pay_date ?? "n/a"
      ] })
    ] }),
    mgr && mgr.reportsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
        " Team approvals"
      ] }), tone: "primary", description: `Across ${mgr.reportsCount} direct report${mgr.reportsCount === 1 ? "" : "s"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Pending leave", value: mgr.pendingLeave.length, tone: mgr.pendingLeave.length ? "stuck" : "done", icon: CalendarDays }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Pending expenses", value: mgr.pendingExpense.length, tone: mgr.pendingExpense.length ? "stuck" : "done", icon: Receipt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Submitted timesheets", value: mgr.pendingTimesheets.length, tone: mgr.pendingTimesheets.length ? "working" : "done", icon: ClipboardCheck }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Reviews to action", value: mgr.overdueReviews.length, tone: mgr.overdueReviews.length ? "working" : "done", icon: Sparkles })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Leave awaiting your decision", items: mgr.pendingLeave, icon: CalendarDays, cta: {
          label: "Open leave",
          to: "/leave"
        }, render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            fmtName(r.employee),
            " · ",
            r.leave_type?.name ?? "leave",
            " · ",
            r.days,
            "d"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            r.start_date,
            " → ",
            r.end_date
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Expenses to approve", items: mgr.pendingExpense, icon: Receipt, cta: {
          label: "Open expenses",
          to: "/expenses"
        }, render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            fmtName(r.employee),
            " · ",
            r.title
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", children: [
            r.currency,
            " ",
            Number(r.total_amount).toLocaleString()
          ] })
        ] }) })
      ] })
    ] }),
    hr && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4" }),
        " Org-wide setup health"
      ] }), tone: hr.missingPay.length + hr.missingDesignation.length + hr.missingDepartment.length + hr.missingBranch.length + hr.missingProfile.length + hr.missingOpeningBalance.length > 0 ? "stuck" : "done", description: `${hr.activeEmployeeCount} active employees · ${hr.leaveTypesConfigured} leave types configured`, children: [
        hr.leaveTypesConfigured === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "No leave types configured" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Staff cannot request leave until at least one type exists." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/leave-types", children: "Set up" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Missing pay rate", value: hr.missingPay.length, tone: hr.missingPay.length ? "stuck" : "done", icon: DollarSign }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Missing designation", value: hr.missingDesignation.length, tone: hr.missingDesignation.length ? "stuck" : "done", icon: Briefcase }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Missing department", value: hr.missingDepartment.length, tone: hr.missingDepartment.length ? "stuck" : "done", icon: Building2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Missing branch / office", value: hr.missingBranch.length, tone: hr.missingBranch.length ? "stuck" : "done", icon: MapPin }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Incomplete personal profile", value: hr.missingProfile.length, tone: hr.missingProfile.length ? "stuck" : "done", icon: IdCard }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "No opening leave balance", value: hr.missingOpeningBalance.length, tone: hr.missingOpeningBalance.length ? "stuck" : "done", icon: CalendarDays })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Employees missing pay rate", items: hr.missingPay, icon: DollarSign, cta: {
          label: "Open pay rates",
          to: "/org/pay-rates"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: e.job_title ?? "no role" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Employees missing designation / role", items: hr.missingDesignation, icon: Briefcase, cta: {
          label: "Manage designations",
          to: "/admin/designations"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "no job title set" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Employees missing department", items: hr.missingDepartment, icon: Building2, cta: {
          label: "Manage departments",
          to: "/admin/departments"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: e.job_title ?? "—" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Employees missing branch / office", items: hr.missingBranch, icon: MapPin, cta: {
          label: "Manage branches",
          to: "/org"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: e.job_title ?? "—" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Incomplete personal profiles", items: hr.missingProfile, icon: IdCard, cta: {
          label: "View employees",
          to: "/admin"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "missing: ",
            (e.missing ?? []).join(", ")
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Missing opening leave balance", items: hr.missingOpeningBalance, icon: CalendarDays, cta: {
          label: "Open leave types",
          to: "/admin/leave-types"
        }, render: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: fmtName(e) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            e.missing_leave_type_ids?.length ?? 0,
            " type(s) unset"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnomalyList, { title: "Certifications expiring (60d)", items: hr.expiringCertifications, icon: BadgeCheck, render: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            fmtName(c.employee),
            " · ",
            c.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: c.expiry_date })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-4 w-4" }),
          " Onboarding in flight"
        ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            hr.pendingOnboardingCount,
            " assignment",
            hr.pendingOnboardingCount === 1 ? "" : "s",
            " in progress"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding", children: "Open" }) })
        ] }) })
      ] })
    ] }),
    fin && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }),
      " Finance queue"
    ] }), tone: fin.draftRuns.length || fin.pendingExpenseClaims || fin.fxStale ? "working" : "done", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Payroll runs in progress", value: fin.draftRuns.length, tone: fin.draftRuns.length ? "working" : "done", icon: DollarSign }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "Expense claims to review", value: fin.pendingExpenseClaims, tone: fin.pendingExpenseClaims ? "stuck" : "done", icon: Receipt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiTile, { label: "FX rate age", value: fin.fxAgeDays === null ? "—" : `${fin.fxAgeDays}d`, tone: fin.fxStale ? "stuck" : "done", icon: TriangleAlert, hint: fin.fxStale ? "Refresh FX" : "Recent" })
      ] }),
      fin.draftRuns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1.5", children: fin.draftRuns.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          r.period_start,
          " → ",
          r.period_end,
          " · pay ",
          r.pay_date
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.status })
      ] }, r.id)) }),
      (fin.pendingExpenseList ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "Expense claims awaiting approval" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/expenses", children: "Review all" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: (fin.pendingExpenseList ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/org/expenses", className: "flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.title }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "· ",
              fmtName(c.employee),
              c.submitted_at ? ` · ${new Date(c.submitted_at).toLocaleDateString()}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            Number(c.total_amount ?? 0).toFixed(2),
            " ",
            c.currency ?? ""
          ] })
        ] }, c.id)) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
