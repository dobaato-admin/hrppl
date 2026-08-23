/**
 * The requests inbox — everything you have asked for, and everything waiting on
 * you, in one place.
 *
 * This page used to show support tickets only, which meant "what did I ask for
 * and where did it get to?" was answered by visiting `/leave`, `/me/wfh`,
 * `/me/expenses`, `/me/toil` and `/me/grievances` in turn and remembering which
 * of them existed. Six tables model the same idea — somebody asked, somebody
 * decides — so they are listed together here, normalised by
 * `requests-inbox.functions.ts`.
 *
 * Approvers get a second tab rather than a second page. The queue is the same
 * shape, filtered to what is outstanding, and it deep-links into each domain's
 * own screen to actually decide — the decision rules live there, and
 * duplicating them into a generic list is how they drift apart.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/monday";
import { PlatformAccountNotice } from "@/components/PlatformAccountNotice";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Inbox,
  Plus,
  CalendarDays,
  House,
  Receipt,
  LifeBuoy,
  Clock,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { createSupportTicket } from "@/lib/support-tickets.functions";
import {
  listMyRequests,
  listApprovalQueue,
  REQUEST_KIND_LABELS,
  type InboxRow,
  type RequestKind,
  type StatusGroup,
} from "@/lib/requests-inbox.functions";

export const Route = createFileRoute("/me/requests")({
  head: () => ({ meta: [{ title: "Requests — hrppl" }] }),
  component: RequestsInboxPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{String(error)}</div>
  ),
});

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

const CATEGORY_LABELS: Record<string, string> = {
  stationery: "Stationery",
  equipment: "Equipment",
  shift_swap: "Shift swap",
  time_in_lieu: "Time in lieu",
  overtime_payment: "Overtime payment",
  expense_reimbursement: "Expense reimbursement",
  api_access_request: "API access",
  other: "Other",
};

function RequestList({ rows, showWho }: { rows: InboxRow[]; showWho?: boolean }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nothing here"
        description="Requests matching this filter will appear here."
      />
    );
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
function KindSummary({ rows }: { rows: InboxRow[] }) {
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

function IncompleteNotice({ kinds }: { kinds: RequestKind[] }) {
  if (kinds.length === 0) return null;
  // Saying so beats a silently short list: an inbox you cannot trust to be
  // complete is worse than no inbox.
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

function RequestsInboxPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fnMine = useServerFn(listMyRequests);
  const fnQueue = useServerFn(listApprovalQueue);
  const fnCreate = useServerFn(createSupportTicket);

  const [kindFilter, setKindFilter] = useState<RequestKind | "all">("all");
  const [groupFilter, setGroupFilter] = useState<StatusGroup | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const mine = useQuery({
    queryKey: ["requests-inbox-mine", user?.id],
    queryFn: () => fnMine({ data: undefined }),
  });
  const queue = useQuery({
    queryKey: ["requests-inbox-queue", user?.id],
    queryFn: () => fnQueue({ data: { group: "pending" } }),
  });

  const [form, setForm] = useState({
    category: "stationery",
    subject: "",
    description: "",
    priority: "normal",
    requested_amount: "",
    requested_for_date: "",
  });

  const create = useMutation({
    mutationFn: async () =>
      fnCreate({
        data: {
          category: form.category as never,
          subject: form.subject,
          description: form.description,
          priority: form.priority as never,
          requested_amount: form.requested_amount ? Number(form.requested_amount) : null,
          requested_for_date: form.requested_for_date || null,
        },
      }),
    onSuccess: () => {
      toast.success("Request submitted");
      setForm({
        category: "stationery",
        subject: "",
        description: "",
        priority: "normal",
        requested_amount: "",
        requested_for_date: "",
      });
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["requests-inbox-mine", user?.id] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not submit request"),
  });

  const myRows = mine.data?.rows ?? [];
  const filtered = myRows.filter(
    (r) =>
      (kindFilter === "all" || r.kind === kindFilter) &&
      (groupFilter === "all" || r.group === groupFilter),
  );
  const openCount = myRows.filter((r) => r.group === "pending").length;
  const queueRows = queue.data?.rows ?? [];
  const canApprove = queue.data?.canApprove === true;

  const showAmount = ["overtime_payment", "expense_reimbursement"].includes(form.category);
  const showDate = ["shift_swap", "time_in_lieu", "overtime_payment"].includes(form.category);

  return (
    <AppShell
      title="Requests"
      subtitle="Everything you have asked for, and anything waiting on you."
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> New request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New request</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                For leave, remote work or expenses use their own forms —{" "}
                <Link to="/leave" className="underline">
                  leave
                </Link>
                ,{" "}
                <Link to="/me/wfh" className="underline">
                  work from home
                </Link>
                ,{" "}
                <Link to="/me/expenses" className="underline">
                  expenses
                </Link>
                . Everything else starts here.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="req-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="req-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="req-subject">Subject</Label>
                <Input
                  id="req-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="req-desc">Description</Label>
                <Textarea
                  id="req-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {showAmount && (
                <div className="space-y-1.5">
                  <Label htmlFor="req-amount">Amount</Label>
                  <Input
                    id="req-amount"
                    type="number"
                    value={form.requested_amount}
                    onChange={(e) => setForm({ ...form, requested_amount: e.target.value })}
                  />
                </div>
              )}
              {showDate && (
                <div className="space-y-1.5">
                  <Label htmlFor="req-date">For date</Label>
                  <Input
                    id="req-date"
                    type="date"
                    value={form.requested_for_date}
                    onChange={(e) => setForm({ ...form, requested_for_date: e.target.value })}
                  />
                </div>
              )}
              <Button
                className="w-full"
                disabled={create.isPending || !form.subject.trim()}
                onClick={() => create.mutate()}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <section className="mx-auto max-w-5xl space-y-4 px-6 py-8">
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">
              Mine{openCount > 0 ? ` (${openCount} open)` : ""}
            </TabsTrigger>
            {canApprove && (
              <TabsTrigger value="approve">
                To approve{queueRows.length > 0 ? ` (${queueRows.length})` : ""}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="mine" className="space-y-3 pt-4">
            {mine.data && "hasEmployee" in mine.data && !mine.data.hasEmployee ? (
              <PlatformAccountNotice subject="Personal requests" />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={kindFilter}
                    onValueChange={(v) => setKindFilter(v as RequestKind | "all")}
                  >
                    <SelectTrigger className="h-8 w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {(Object.keys(REQUEST_KIND_LABELS) as RequestKind[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {REQUEST_KIND_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={groupFilter}
                    onValueChange={(v) => setGroupFilter(v as StatusGroup | "all")}
                  >
                    <SelectTrigger className="h-8 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any status</SelectItem>
                      <SelectItem value="pending">Awaiting a decision</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Declined</SelectItem>
                      <SelectItem value="cancelled">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <KindSummary rows={filtered} />
                </div>
                <IncompleteNotice kinds={mine.data?.incomplete ?? []} />
                {mine.isLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <RequestList rows={filtered} />
                )}
              </>
            )}
          </TabsContent>

          {canApprove && (
            <TabsContent value="approve" className="space-y-3 pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Waiting on you</CardTitle>
                  <CardDescription>
                    Outstanding requests across your organisation. Your own requests are never
                    listed here — someone else decides them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {queue.data?.noTenantScope ? (
                    <PlatformAccountNotice subject="Approval queues" />
                  ) : (
                    <>
                      <KindSummary rows={queueRows} />
                      <IncompleteNotice kinds={queue.data?.incomplete ?? []} />
                      {queue.isLoading ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
                      ) : (
                        <RequestList rows={queueRows} showWho />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </AppShell>
  );
}
