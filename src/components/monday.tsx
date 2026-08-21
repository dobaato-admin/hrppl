import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "done" | "working" | "stuck" | "pending" | "info" | "primary";

export const TONE: Record<StatusTone, { chip: string; dot: string; ring: string; soft: string; text: string }> = {
  done:    { chip: "bg-status-done text-status-done-foreground",       dot: "bg-status-done",    ring: "ring-status-done/30",    soft: "bg-status-done/10",    text: "text-status-done" },
  working: { chip: "bg-status-working text-status-working-foreground", dot: "bg-status-working", ring: "ring-status-working/30", soft: "bg-status-working/10", text: "text-status-working" },
  stuck:   { chip: "bg-status-stuck text-status-stuck-foreground",     dot: "bg-status-stuck",   ring: "ring-status-stuck/30",   soft: "bg-status-stuck/10",   text: "text-status-stuck" },
  pending: { chip: "bg-status-pending text-status-pending-foreground", dot: "bg-status-pending", ring: "ring-status-pending/40", soft: "bg-status-pending/30", text: "text-status-pending-foreground" },
  info:    { chip: "bg-status-info text-status-info-foreground",       dot: "bg-status-info",    ring: "ring-status-info/30",    soft: "bg-status-info/10",    text: "text-status-info" },
  primary: { chip: "bg-primary text-primary-foreground",               dot: "bg-primary",        ring: "ring-primary/30",        soft: "bg-primary/10",        text: "text-primary" },
};

export function KpiTile({
  label,
  value,
  tone = "primary",
  to,
  icon: Icon,
  hint,
  delta,
}: {
  label: string;
  value: ReactNode;
  tone?: StatusTone;
  to?: string;
  icon?: LucideIcon;
  hint?: string;
  delta?: { value: string; positive?: boolean };
}) {
  const t = TONE[tone];
  const body = (
    <Card
      className={cn(
        "relative overflow-hidden border bg-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        "ring-1",
        t.ring,
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1", t.dot)} />
      <div className={cn("pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-40", t.soft)} />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </span>
          {Icon && (
            <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm", t.dot)}>
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="font-display text-3xl font-bold tracking-tight tabular-nums">{value}</span>
          {to && <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />}
        </div>
        {(hint || delta) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {delta && (
              <span className={cn("font-medium", delta.positive ? "text-status-done" : "text-status-stuck")}>
                {delta.value}
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="group block">{body}</Link> : <div className="group">{body}</div>;
}

export function StatusChip({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <Badge className={cn("border-0 font-medium", TONE[tone].chip)}>{children}</Badge>;
}

/** Top-of-card colored rail (Monday board header strip). Place inside Card before CardHeader. */
export function CardRail({ tone = "primary" }: { tone?: StatusTone }) {
  return <div className={cn("h-1.5 w-full", TONE[tone].dot)} />;
}

/** Premium page header with optional eyebrow, title, subtitle, and action slot. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  tone = "primary",
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  tone?: StatusTone;
  children?: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-sm)]">
      <div className="bg-gradient-hero">
        <div className={cn("h-1 w-full", t.dot)} />
        <div className="flex flex-wrap items-end justify-between gap-4 p-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children && <div className="border-t bg-card/40 px-6 py-3 backdrop-blur-sm">{children}</div>}
      </div>
    </section>
  );
}

/** Beautiful empty state with optional CTA. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  tone = "info",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: StatusTone;
}) {
  const t = TONE[tone];
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
      <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ring-4 ring-background", t.soft)}>
        <Icon className={cn("h-5 w-5", t.text)} />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Card with optional rail, header title, description, and actions. */
export function SectionCard({
  title,
  description,
  tone,
  actions,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  tone?: StatusTone;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {tone && <CardRail tone={tone} />}
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
          <div className="min-w-0">
            {title && <div className="font-display text-base font-semibold tracking-tight">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5 pt-2">{children}</div>
    </Card>
  );
}

/** Skeleton row group used while data loads. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 w-full animate-pulse rounded-md bg-muted/70" />
      ))}
    </div>
  );
}

/** Map common request/assignment statuses to a tone + label. */
export function statusTone(status: string): { tone: StatusTone; label: string } {
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
