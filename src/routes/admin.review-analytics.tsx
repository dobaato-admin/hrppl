import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  reviewDashboardSummary,
  exportReviewInstances,
  reviewReviewInstance,
} from "@/lib/review-instances.functions";
import { toCSV } from "@/lib/csv";
import { useMyTenantId } from "@/hooks/use-tenant";
import { ORG_ADMIN_OR_MANAGER } from "@/lib/rbac";

export const Route = createFileRoute("/admin/review-analytics")({
  head: () => ({ meta: [{ title: "Review analytics — hrppl" }] }),
  // AdminGate was imported but never used — this page had no route gate at
  // all, unlike every other page under /admin. The underlying server fns
  // (reviewDashboardSummary, exportReviewInstances, reviewReviewInstance) all
  // reject non-admins on their own, so this was a broken-page gap rather than
  // a data leak, but it's the same class of bug tests/admin-gate-role-sets.test.ts
  // exists to catch. ORG_ADMIN_OR_MANAGER matches requireAdmin's role check
  // in review-instances.functions.ts exactly.
  component: () => (
    <AdminGate feature="org.reviewAnalytics">
      <ReviewAnalyticsPage />
    </AdminGate>
  ),
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIso(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function ReviewAnalyticsPage() {
  const { tenantId } = useMyTenantId();
  const summaryFn = useServerFn(reviewDashboardSummary);
  const exportFn = useServerFn(exportReviewInstances);
  const decideFn = useServerFn(reviewReviewInstance);
  const [from, setFrom] = useState(daysAgoIso(90));
  const [to, setTo] = useState(todayIso());
  const [templateId, setTemplateId] = useState<string>("all");
  const [employeeId, setEmployeeId] = useState<string>("all");
  const [summary, setSummary] = useState<any>(null);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [awaitingReview, setAwaitingReview] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!tenantId) return;
      // Tenant-scoped explicitly: RLS does not narrow this for super_admin
      // (its policy on employees has no tenant predicate), so the unfiltered
      // version listed every tenant. See src/hooks/use-tenant.ts.
      const [{ data: t }, { data: e }] = await Promise.all([
        supabase
          .from("review_templates" as any)
          .select("id,name")
          .eq("tenant_id", tenantId)
          .order("name"),
        supabase
          .from("employees")
          .select("id,first_name,last_name")
          .eq("tenant_id", tenantId)
          .order("first_name"),
      ]);
      setTemplates((t ?? []) as any);
      setEmployees(
        ((e ?? []) as any[]).map((x) => ({
          id: x.id,
          name: `${x.first_name ?? ""} ${x.last_name ?? ""}`.trim() || x.id,
        })),
      );
    })();
  }, [tenantId]);

  async function fetchRows() {
    const r = await exportFn({
      data: {
        from,
        to,
        templateId: templateId === "all" ? undefined : templateId,
        employeeId: employeeId === "all" ? undefined : employeeId,
      },
    });
    return r.rows as any[];
  }

  async function load() {
    setBusy(true);
    try {
      const [r, rows] = await Promise.all([
        summaryFn({
          data: { from, to, templateId: templateId === "all" ? undefined : templateId },
        }),
        fetchRows(),
      ]);
      setSummary(r);
      // reviewReviewInstance (the manager-review step) had zero callers before
      // this page grew a decision queue — approvers were notified and sent
      // here, and there was nothing to act on.
      setAwaitingReview(rows.filter((row) => row.status === "submitted"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  async function decide(instanceId: string, decision: "approved" | "rejected") {
    setDecidingId(instanceId);
    try {
      await decideFn({ data: { id: instanceId, decision } });
      toast.success(decision === "approved" ? "Approved" : "Rejected");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to record decision");
    } finally {
      setDecidingId(null);
    }
  }

  async function downloadCSV() {
    try {
      const rows = await fetchRows();
      if (!rows.length) return toast.info("No instances in range");
      const header = Object.keys(rows[0]);
      const csv = toCSV([header, ...rows.map((r) => header.map((h) => (r as any)[h]))]);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `review-instances-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} rows`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function downloadPDF() {
    try {
      const rows = await fetchRows();
      if (!rows.length) return toast.info("No instances in range");
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableMod as any).default;
      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
      doc.setFontSize(14);
      doc.text(`Review instances — ${from} to ${to}`, 40, 40);
      doc.setFontSize(9);
      doc.text(
        `Template filter: ${templateId === "all" ? "All" : (templates.find((t) => t.id === templateId)?.name ?? templateId)}` +
          `  •  Employee filter: ${employeeId === "all" ? "All" : (employees.find((e) => e.id === employeeId)?.name ?? employeeId)}` +
          `  •  Generated ${new Date().toLocaleString()}`,
        40,
        56,
      );
      autoTable(doc, {
        startY: 70,
        head: [
          ["Employee", "Template", "Item", "Period", "Due", "Status", "v", "Score", "Evidence"],
        ],
        body: rows.map((r) => [
          r.employee_name,
          r.template,
          r.item,
          r.period,
          r.due_date,
          r.status,
          r.version,
          String(r.score ?? ""),
          `${r.evidence_count} (${r.evidence_types})`,
        ]),
        styles: { fontSize: 7, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 60] },
      });
      doc.save(`review-instances-${from}-to-${to}.pdf`);
      toast.success(`Exported ${rows.length} rows`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const completionPct =
    summary?.completionRate != null ? Math.round(summary.completionRate * 100) : 0;
  const evidencePct =
    summary?.evidenceCompliance != null ? Math.round(summary.evidenceCompliance * 100) : null;

  const sortedItems = useMemo(() => (summary?.byItem ?? []) as any[], [summary]);

  return (
    <AppShell title="Review analytics" subtitle="Completion, scores, and evidence compliance">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Pick a date range, template, and employee — applies to summary and exports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All templates</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Employee (export only)</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} disabled={busy}>
              {busy ? "Loading…" : "Apply"}
            </Button>
            <Button onClick={downloadCSV} variant="outline">
              CSV
            </Button>
            <Button onClick={downloadPDF} variant="outline">
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Awaiting your review ({awaitingReview.length})
          </CardTitle>
          <CardDescription>
            Submitted scorecards in the selected date range — approve or send back for revision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {awaitingReview.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing awaiting review in this range.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaitingReview.map((r: any) => (
                  <TableRow key={r.instance_id}>
                    <TableCell className="font-medium">{r.employee_name}</TableCell>
                    <TableCell>{r.template}</TableCell>
                    <TableCell>{r.item}</TableCell>
                    <TableCell className="text-xs">{r.period}</TableCell>
                    <TableCell>{r.score || "—"}</TableCell>
                    <TableCell className="text-xs">{r.evidence_count || 0}</TableCell>
                    <TableCell className="text-xs">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        disabled={decidingId === r.instance_id}
                        onClick={() => decide(r.instance_id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={decidingId === r.instance_id}
                        onClick={() => decide(r.instance_id, "rejected")}
                      >
                        Send back
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <StatCard label="Total instances" value={summary.total} />
          <StatCard
            label="Completion"
            value={`${completionPct}%`}
            sub={`${summary.byStatus.approved} approved / ${summary.byStatus.submitted} submitted`}
          >
            <Progress value={completionPct} className="mt-2 h-1.5" />
          </StatCard>
          <StatCard
            label="Pending / Rejected"
            value={`${summary.byStatus.pending} / ${summary.byStatus.rejected}`}
            sub={summary.overdueCount ? `${summary.overdueCount} overdue` : "None overdue"}
          />
          <StatCard
            label="Evidence compliance"
            value={evidencePct == null ? "—" : `${evidencePct}%`}
            sub={
              evidencePct == null
                ? "No evidence-required items"
                : `${summary.evidenceCompliantTotal} of ${summary.evidenceRequiredTotal} valid`
            }
          >
            {evidencePct != null && <Progress value={evidencePct} className="mt-2 h-1.5" />}
          </StatCard>
        </div>
      )}

      {summary && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">By template</CardTitle>
            <CardDescription>
              Status mix and average numeric score within the selected range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Avg score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.byTemplate.map((t: any) => (
                  <TableRow key={t.templateId}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.total}</TableCell>
                    <TableCell>{t.approved}</TableCell>
                    <TableCell>{t.submitted}</TableCell>
                    <TableCell>{t.pending}</TableCell>
                    <TableCell>
                      <Badge variant={t.rejected ? "destructive" : "outline"}>{t.rejected}</Badge>
                    </TableCell>
                    <TableCell>{t.avgScore == null ? "—" : t.avgScore.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {summary && sortedItems.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">By KPI / KRA item</CardTitle>
            <CardDescription>
              Top items by volume — average score and evidence compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Avg score</TableHead>
                  <TableHead>Evidence compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((i: any) => (
                  <TableRow key={`${i.templateId}:${i.itemId}`}>
                    <TableCell className="font-medium">{i.label}</TableCell>
                    <TableCell>{i.total}</TableCell>
                    <TableCell>{i.approved}</TableCell>
                    <TableCell>{i.avgScore == null ? "—" : i.avgScore.toFixed(2)}</TableCell>
                    <TableCell>
                      {i.evidenceRequired
                        ? `${i.evidenceCompliant} / ${i.evidenceRequired}`
                        : "n/a"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: any;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
