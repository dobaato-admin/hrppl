/**
 * The two request questions a dashboard should answer without a click:
 * what am I waiting on, and what is waiting on me.
 *
 * Both were previously invisible from the dashboard. Approvals in particular
 * were only discoverable by knowing which of `/org/leave`, `/admin/wfh`,
 * `/admin/expenses` and `/admin/support` to visit — so a work-from-home request
 * could sit pending for days simply because nobody thought to look, which
 * defeats the point of same-day remote work.
 *
 * Deliberately a summary, not a control surface. Deciding a request happens on
 * the page that owns its rules; this only says there is something to decide and
 * points at it.
 */
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Inbox, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  listMyRequests,
  listApprovalQueue,
  REQUEST_KIND_LABELS,
  type InboxRow,
  type RequestKind,
} from "@/lib/requests-inbox.functions";

/** Shared with the widget and the inbox: long enough to survive navigation. */
const STALE_MS = 60_000;

function byKind(rows: InboxRow[]): [RequestKind, number][] {
  const m = new Map<RequestKind, number>();
  for (const r of rows) m.set(r.kind, (m.get(r.kind) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function RequestsSummary() {
  const { user } = useAuth();
  const fnMine = useServerFn(listMyRequests);
  const fnQueue = useServerFn(listApprovalQueue);

  const mine = useQuery({
    queryKey: ["requests-inbox-mine", user?.id],
    queryFn: () => fnMine({ data: undefined }),
    staleTime: STALE_MS,
    retry: false,
  });
  const queue = useQuery({
    queryKey: ["requests-inbox-queue", user?.id],
    queryFn: () => fnQueue({ data: { group: "pending" } }),
    staleTime: STALE_MS,
    retry: false,
  });

  const myOpen = useMemo(
    () => (mine.data?.rows ?? []).filter((r) => r.group === "pending"),
    [mine.data],
  );
  const toApprove = queue.data?.rows ?? [];
  const canApprove = queue.data?.canApprove === true && !queue.data?.noTenantScope;

  // Nothing to say and no queue to show: stay off the dashboard entirely
  // rather than adding an empty card to a page that already has plenty.
  if (!mine.data && !queue.data) return null;
  if (myOpen.length === 0 && !canApprove) return null;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="h-4 w-4" /> My open requests
          </CardTitle>
          <CardDescription>Asked for, not yet decided.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {myOpen.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Nothing outstanding.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {byKind(myOpen).map(([kind, n]) => (
                <Badge key={kind} variant="secondary">
                  {n} {REQUEST_KIND_LABELS[kind].toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
          <Button asChild size="sm" variant="ghost" className="px-0">
            <Link to="/me/requests">
              Open inbox <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {canApprove && (
        <Card className={toApprove.length > 0 ? "border-amber-500/40" : undefined}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4" /> Waiting on you
              {toApprove.length > 0 && <Badge variant="destructive">{toApprove.length}</Badge>}
            </CardTitle>
            <CardDescription>Requests across your organisation needing a decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {toApprove.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Queue is clear.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {byKind(toApprove).map(([kind, n]) => (
                  <Badge key={kind} variant="outline">
                    {n} {REQUEST_KIND_LABELS[kind].toLowerCase()}
                  </Badge>
                ))}
              </div>
            )}
            <Button asChild size="sm" variant="ghost" className="px-0">
              <Link to="/me/requests">
                Review queue <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
