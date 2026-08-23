/**
 * Shared presentation for a normalised request list.
 *
 * Used by both the personal inbox (`/me/requests`) and the organisation-wide
 * repository (`/admin/requests`). One component so the two cannot drift into
 * showing the same row differently — the whole point of normalising six tables
 * was that a leave request and a work-from-home request should read the same
 * way once they are side by side.
 */
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/monday";
import {
  Inbox,
  CalendarDays,
  House,
  Receipt,
  LifeBuoy,
  Clock,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  REQUEST_KIND_LABELS,
  type InboxRow,
  type RequestKind,
  type StatusGroup,
} from "@/lib/requests-inbox.functions";

const KIND_ICON: Record<RequestKind, typeof Inbox> = {
  leave: CalendarDays,
  wfh: House,
  expense: Receipt,
  ticket: LifeBuoy,
  toil: Clock,
  grievance: ShieldAlert,
};

const GROUP_VARIANT: Record<StatusGroup, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export function RequestList({
  rows,
  showWho,
  emptyTitle = "Nothing here",
  emptyDescription = "Requests matching this filter will appear here.",
}: {
  rows: InboxRow[];
  /** Show the requester's name — only meaningful in an organisation-wide list. */
  showWho?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <ul className="divide-y rounded-lg border">
      {rows.map((r) => {
        const Icon = KIND_ICON[r.kind];
        return (
          <li key={`${r.kind}:${r.id}`} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {REQUEST_KIND_LABELS[r.kind]}
                </span>
                <Badge variant={GROUP_VARIANT[r.group]} className="capitalize">
                  {r.status.replace(/_/g, " ")}
                </Badge>
                {r.period ? (
                  <span className="text-xs text-muted-foreground">{r.period}</span>
                ) : null}
              </div>
              <p className="truncate text-sm font-medium">
                {showWho && r.employeeName ? `${r.employeeName} — ` : ""}
                {r.title}
              </p>
              {r.detail ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{r.detail}</p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Raised {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button asChild size="sm" variant="ghost" className="shrink-0">
              <Link to={r.href}>
                Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/** "3 leave · 1 work from home" — what the current filter actually contains. */
export function KindSummary({ rows }: { rows: InboxRow[] }) {
  const counts = useMemo(() => {
    const m = new Map<RequestKind, number>();
    for (const r of rows) m.set(r.kind, (m.get(r.kind) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  if (counts.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {counts.map(([k, n]) => `${n} ${REQUEST_KIND_LABELS[k].toLowerCase()}`).join(" · ")}
    </p>
  );
}

/**
 * Say when the list is short because something failed to load.
 *
 * A silently incomplete inbox is worse than no inbox — you would trust it and
 * be wrong. Naming the missing source lets someone judge whether what they are
 * looking at is enough to act on.
 */
export function IncompleteNotice({ kinds }: { kinds: RequestKind[] }) {
  if (kinds.length === 0) return null;
  return (
    <p className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Could not load {kinds.map((k) => REQUEST_KIND_LABELS[k].toLowerCase()).join(", ")} requests.
        This list is incomplete.
      </span>
    </p>
  );
}
