import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, ScrollText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listApprovalActivity } from "@/lib/approvals.functions";

export const Route = createFileRoute("/org/approval-activity")({
  head: () => ({ meta: [{ title: "Approval activity — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.approvalActivity">
      <ApprovalActivityPage />
    </AdminGate>
  ),
});

/**
 * T11 — every decision in the caller's scope, not only their own.
 *
 * The dashboard's "recently actioned" tab is personal. With four roles able to
 * approve the same item, "who signed this off, and could they have?" is a
 * question only a wider view can answer — and it is the question an audit asks
 * first.
 *
 * Narrower roles are not refused: a manager sees their own reports' history,
 * which is the same scope they can already act on. Showing them an empty
 * org-wide page instead would be a worse answer than a smaller true one.
 */
function ApprovalActivityPage() {
  const listFn = useServerFn(listApprovalActivity);
  const [kind, setKind] = useState<"all" | "leave" | "expense" | "timesheet">("all");
  const [outcome, setOutcome] = useState<"all" | "approved" | "rejected" | "escalated">("all");
  const [days, setDays] = useState(90);

  const { data, isLoading } = useQuery({
    queryKey: ["approval-activity", kind, outcome, days],
    queryFn: () => listFn({ data: { kind, outcome, days } }),
    staleTime: 60_000,
  });

  const rows: any[] = data?.rows ?? [];

  function exportCsv() {
    const header = [
      "when", "employee", "item_type", "item_id", "outcome", "approver", "role_used", "reason",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.created_at,
          r.employees ? `${r.employees.first_name ?? ""} ${r.employees.last_name ?? ""}`.trim() : "",
          r.item_type,
          r.item_id,
          r.action,
          r.approverName,
          r.approver_role,
          r.reason ?? "",
        ].map(esc).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `approval-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title="Approval activity"
      subtitle="Who decided what, under which role"
      actions={
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      }
    >
      <section className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <SectionCard title="Filters">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Item type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="expense">Expense claims</SelectItem>
                  <SelectItem value="timesheet">Timesheets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Outcome</Label>
              <Select value={outcome} onValueChange={(v) => setOutcome(v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All outcomes</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="730">Last 2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Decisions"
          description={
            data?.scope === "tenant"
              ? "Everyone in the organisation."
              : data?.scope === "branch"
                ? "Employees in the branches you administer."
                : "Your direct reports."
          }
        >
          {isLoading ? (
            <SkeletonRows rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No decisions in this period"
              description="Widen the period or clear the filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Acting as</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      {r.employees
                        ? `${r.employees.first_name ?? ""} ${r.employees.last_name ?? ""}`.trim()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs capitalize">{r.item_type}</TableCell>
                    <TableCell>
                      <StatusChip
                        tone={r.action === "approved" ? "done" : r.action === "rejected" ? "stuck" : "pending"}
                      >
                        {r.action}
                      </StatusChip>
                    </TableCell>
                    <TableCell className="text-xs">{r.approverName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.approver_role}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {r.reason ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </section>
    </AppShell>
  );
}
