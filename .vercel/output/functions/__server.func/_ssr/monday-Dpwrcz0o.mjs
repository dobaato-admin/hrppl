import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { h as cn, C as Card, e as CardContent, f as Badge } from "./router-CLxirH5A.mjs";
import { a7 as ArrowUpRight, I as Inbox } from "../_libs/lucide-react.mjs";
const TONE = {
  done: { chip: "bg-status-done text-status-done-foreground", dot: "bg-status-done", ring: "ring-status-done/30", soft: "bg-status-done/10", text: "text-status-done" },
  working: { chip: "bg-status-working text-status-working-foreground", dot: "bg-status-working", ring: "ring-status-working/30", soft: "bg-status-working/10", text: "text-status-working" },
  stuck: { chip: "bg-status-stuck text-status-stuck-foreground", dot: "bg-status-stuck", ring: "ring-status-stuck/30", soft: "bg-status-stuck/10", text: "text-status-stuck" },
  pending: { chip: "bg-status-pending text-status-pending-foreground", dot: "bg-status-pending", ring: "ring-status-pending/40", soft: "bg-status-pending/30", text: "text-status-pending-foreground" },
  info: { chip: "bg-status-info text-status-info-foreground", dot: "bg-status-info", ring: "ring-status-info/30", soft: "bg-status-info/10", text: "text-status-info" },
  primary: { chip: "bg-primary text-primary-foreground", dot: "bg-primary", ring: "ring-primary/30", soft: "bg-primary/10", text: "text-primary" }
};
function KpiTile({
  label,
  value,
  tone = "primary",
  to,
  icon: Icon,
  hint,
  delta
}) {
  const t = TONE[tone];
  const body = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: cn(
        "relative overflow-hidden border bg-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        "ring-1",
        t.ring
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute left-0 top-0 h-full w-1", t.dot) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-40", t.soft) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "relative p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: label }),
            Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm", t.dot), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-end justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl font-bold tracking-tight tabular-nums", children: value }),
            to && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" })
          ] }),
          (hint || delta) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs", children: [
            delta && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-medium", delta.positive ? "text-status-done" : "text-status-stuck"), children: delta.value }),
            hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: hint })
          ] })
        ] })
      ]
    }
  );
  return to ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "group block", children: body }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group", children: body });
}
function StatusChip({ tone, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn("border-0 font-medium", TONE[tone].chip), children });
}
function CardRail({ tone = "primary" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-1.5 w-full", TONE[tone].dot) });
}
function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  tone = "primary",
  children
}) {
  const t = TONE[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-sm)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-hero", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-1 w-full", t.dot) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        eyebrow && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary", children: eyebrow }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold tracking-tight md:text-3xl", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 max-w-2xl text-sm text-muted-foreground", children: subtitle })
      ] }),
      actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
    ] }),
    children && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t bg-card/40 px-6 py-3 backdrop-blur-sm", children })
  ] }) });
}
function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  tone = "info"
}) {
  const t = TONE[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ring-4 ring-background", t.soft), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("h-5 w-5", t.text) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-semibold", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: description }),
    action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: action })
  ] });
}
function SectionCard({
  title,
  description,
  tone,
  actions,
  className,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: cn("overflow-hidden", className), children: [
    tone && /* @__PURE__ */ jsxRuntimeExports.jsx(CardRail, { tone }),
    (title || description || actions) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 p-5 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold tracking-tight", children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-muted-foreground", children: description })
      ] }),
      actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-2", children: actions })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 pt-2", children })
  ] });
}
function SkeletonRows({ rows = 4, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("space-y-2", className), children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-full animate-pulse rounded-md bg-muted/70" }, i)) });
}
function statusTone(status) {
  switch (status) {
    case "approved":
    case "signed_off":
    case "acknowledged":
    case "finalized":
    case "paid":
      return { tone: "done", label: status.replace("_", " ") };
    case "pending":
    case "draft":
    case "in_progress":
    case "submitted":
      return { tone: "working", label: status.replace("_", " ") };
    case "rejected":
    case "cancelled":
    case "failed":
    case "overdue":
      return { tone: "stuck", label: status };
    default:
      return { tone: "info", label: status };
  }
}
export {
  CardRail as C,
  EmptyState as E,
  KpiTile as K,
  PageHeader as P,
  StatusChip as S,
  TONE as T,
  SkeletonRows as a,
  SectionCard as b,
  statusTone as s
};
