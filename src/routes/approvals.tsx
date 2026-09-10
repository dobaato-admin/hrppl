import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Clock,
  History,
  Receipt,
  ShieldAlert,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listActionItems,
  listMyRecentDecisions,
  getLeaveDecisionContext,
} from "@/lib/approvals.functions";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/leave.functions";
import { decideExpenseClaim } from "@/lib/expenses.functions";
import { approveTimesheet, rejectTimesheet } from "@/lib/timesheet-workflow.functions";
import { LeaveBalancePanel } from "@/components/approvals/LeaveBalancePanel";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.approvals">
      <ApprovalsPage />
    </AdminGate>
  ),
});

const KIND_LABEL = { leave: "Leave", expense: "Expense claims", timesheet: "Timesheets" } as const;
const KIND_ICON = { leave: ClipboardList, expense: Receipt, timesheet: Clock } as const;

type Kind = "leave" | "expense" | "timesheet";

function ApprovalsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listActionItems);
  const recentFn = useServerFn(listMyRecentDecisions);

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [decision, setDecision] = useState<{ item: any; action: "approve" | "reject" } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["action-items", from, to],
    queryFn: () => listFn({ data: { from: from || null, to: to || null } }),
    // Short: this is a work queue, and a stale one sends two people to the same
    // request. Long enough that switching tabs does not refetch three times.
    staleTime: 15_000,
  });

  const { data: recent } = useQuery({
    queryKey: ["my-recent-decisions"],
    queryFn: () => recentFn({ data: { days: 30 } }),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const counts = data?.counts ?? { leave: 0, expense: 0, timesheet: 0 };
  const scopes: any = data?.scopes ?? {};

  const visible = useMemo(() => {
    const needle = employeeFilter.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (i: any) =>
        i.employeeName.toLowerCase().includes(needle) ||
        (i.employeeNumber ?? "").toLowerCase().includes(needle),
    );
  }, [items, employeeFilter]);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["action-items"] });
    qc.invalidateQueries({ queryKey: ["my-recent-decisions"] });
  }

  return (
    <AppShell
      title="Approvals"
      subtitle="Everything waiting on you, across leave, expenses and timesheets"
    >
      <section className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        {/* A kind that failed to load says so. An approvals queue that draws an
            empty tab when the query broke is the one place that must not. */}
        {(data?.incomplete ?? []).length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">This queue is incomplete.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data!.incomplete.join(" · ")} — some items may be missing, so do not treat an empty
              tab as nothing pending.
            </p>
          </div>
        )}

        <SectionCard title="Filters" className="p-0">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-emp" className="text-xs">
                Employee
              </Label>
              <Input
                id="f-emp"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                placeholder="Name or number"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-from" className="text-xs">
                From
              </Label>
              <Input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-to" className="text-xs">
                To
              </Label>
              <Input id="f-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <Tabs defaultValue="leave">
          <TabsList>
            {(["leave", "expense", "timesheet"] as Kind[]).map((k) => {
              const Icon = KIND_ICON[k];
              return (
                <TabsTrigger key={k} value={k}>
                  <Icon className="mr-1 h-4 w-4" />
                  {KIND_LABEL[k]}
                  {counts[k] > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {counts[k]}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="recent">
              <History className="mr-1 h-4 w-4" /> Recently actioned
            </TabsTrigger>
          </TabsList>

          {(["leave", "expense", "timesheet"] as Kind[]).map((k) => (
            <TabsContent key={k} value={k} className="mt-4">
              <QueueTable
                kind={k}
                rows={visible.filter((i: any) => i.kind === k)}
                loading={isLoading}
                scope={scopes[k]}
                onDecide={(item, action) => setDecision({ item, action })}
              />
            </TabsContent>
          ))}

          <TabsContent value="recent" className="mt-4">
            <RecentDecisions rows={recent?.decisions ?? []} />
          </TabsContent>
        </Tabs>
      </section>

      <DecisionDialog
        state={decision}
        onClose={() => setDecision(null)}
        onDone={() => {
          setDecision(null);
          refresh();
        }}
      />
    </AppShell>
  );
}

function QueueTable({
  kind,
  rows,
  loading,
  scope,
  onDecide,
}: {
  kind: Kind;
  rows: any[];
  loading: boolean;
  scope?: { canApprove: boolean; scope: string; roleUsed: string | null };
  onDecide: (item: any, action: "approve" | "reject") => void;
}) {
  if (loading) return <SkeletonRows rows={4} />;

  // "Your role cannot action these" and "nothing is pending" are different
  // answers, and a queue that shows the same empty box for both teaches people
  // to distrust it.
  if (scope && !scope.canApprove) {
    return (
      <EmptyState
        icon={ShieldAlert}
        tone="pending"
        title={`You do not approve ${KIND_LABEL[kind].toLowerCase()}`}
        description="Your roles do not include this kind of approval, so nothing will ever appear here."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Check}
        tone="done"
        title="Nothing waiting"
        description={
          scope?.scope === "reports"
            ? "None of your direct reports has anything pending."
            : scope?.scope === "branch"
              ? "Nothing pending in the branches you administer."
              : "Nothing pending across the organisation."
        }
      />
    );
  }

  return (
    <SectionCard
      title={KIND_LABEL[kind]}
      description={`${rows.length} awaiting your decision · oldest first`}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>{kind === "expense" ? "Claim" : "Period"}</TableHead>
            <TableHead className="text-right">{kind === "expense" ? "Amount" : kind === "timesheet" ? "Hours" : "Days"}</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Waiting</TableHead>
            <TableHead className="text-right">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.kind}-${r.id}`}>
              <TableCell className="font-medium">
                {r.employeeName}
                <div className="text-xs text-muted-foreground">{r.employeeNumber ?? "—"}</div>
                {r.escalated && (
                  <Badge variant="outline" className="mt-1 gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Escalated — {r.escalationReason}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">{r.period}</TableCell>
              <TableCell className="text-right tabular-nums">{r.amount}</TableCell>
              <TableCell className="text-xs">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-right">
                {r.daysPending != null ? (
                  <StatusChip tone={r.daysPending >= 5 ? "stuck" : r.daysPending >= 2 ? "pending" : "info"}>
                    {r.daysPending}d
                  </StatusChip>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button size="sm" variant="outline" onClick={() => onDecide(r, "approve")}>
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDecide(r, "reject")}>
                  <X className="mr-1 h-3.5 w-3.5" /> Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}

function RecentDecisions({ rows }: { rows: any[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nothing actioned in the last 30 days"
        description="Decisions you make appear here, read-only. Reversing one is a separate flow."
      />
    );
  }
  return (
    <SectionCard
      title="Recently actioned"
      description="Your own decisions, last 30 days. Read-only."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>As</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                {r.employees
                  ? `${r.employees.first_name ?? ""} ${r.employees.last_name ?? ""}`.trim()
                  : "—"}
              </TableCell>
              <TableCell className="text-xs capitalize">{r.item_type}</TableCell>
              <TableCell>
                <StatusChip tone={r.action === "approved" ? "done" : r.action === "rejected" ? "stuck" : "pending"}>
                  {r.action}
                </StatusChip>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.approver_role}</TableCell>
              <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
              <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                {r.reason ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}

function DecisionDialog({
  state,
  onClose,
  onDone,
}: {
  state: { item: any; action: "approve" | "reject" } | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const approveLeave = useServerFn(approveLeaveRequest);
  const rejectLeave = useServerFn(rejectLeaveRequest);
  const decideExpense = useServerFn(decideExpenseClaim);
  const approveSheet = useServerFn(approveTimesheet);
  const rejectSheet = useServerFn(rejectTimesheet);

  const open = !!state;
  const item = state?.item;
  const isReject = state?.action === "reject";

  async function submit() {
    if (!state) return;
    // T2/T4/T5 · A rejection reason is required everywhere. The submitter has to
    // know what to change, and it is the field the audit is read for.
    if (isReject && note.trim().length === 0) {
      toast.error("A reason is required when rejecting");
      return;
    }
    setBusy(true);
    try {
      const { item: it, action } = state;
      if (it.kind === "leave") {
        if (action === "approve") await approveLeave({ data: { requestId: it.id, comment: note.trim() || undefined } });
        else await rejectLeave({ data: { requestId: it.id, reason: note.trim() } });
      } else if (it.kind === "expense") {
        await decideExpense({ data: { id: it.id, action: action === "approve" ? "approve" : "reject", comment: note.trim() || undefined } });
      } else {
        if (action === "approve") await approveSheet({ data: { id: it.id, comment: note.trim() || undefined } });
        else await rejectSheet({ data: { id: it.id, reason: note.trim() } });
      }
      toast.success(action === "approve" ? "Approved" : "Rejected");
      setNote("");
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not record the decision", { duration: 8000 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setNote("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Reject" : "Approve"} — {item?.employeeName}
          </DialogTitle>
          <DialogDescription>
            {item?.period} · {item?.amount}
            {item?.escalated && ` · escalated because ${item.escalationReason}`}
          </DialogDescription>
        </DialogHeader>

        {/* T3 · The approver's whole reason for leaving this screen was to look
            up a balance. It is here instead. */}
        {item?.kind === "leave" && <LeaveBalancePanel requestId={item.id} />}

        <div className="space-y-2">
          <Label htmlFor="decision-note">
            {isReject ? "Reason" : "Comment"}
            {isReject && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
          <Textarea
            id="decision-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-invalid={isReject && note.trim().length === 0 ? true : undefined}
            placeholder={
              isReject
                ? "What does this person need to change before resubmitting?"
                : "Optional — visible to the submitter"
            }
          />
          <p className="text-xs text-muted-foreground">
            Shown to {item?.employeeName ?? "the submitter"} and kept in the approval history.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={isReject ? "destructive" : "default"} onClick={submit} disabled={busy}>
            {busy ? "Saving…" : isReject ? "Reject" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
