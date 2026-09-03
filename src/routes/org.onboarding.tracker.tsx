import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { listOnboardingTrackerRows } from "@/lib/onboarding-tracker.functions";
import { exportOnboardingTrackerAuditCsv } from "@/lib/audit-explorer.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/org/onboarding/tracker")({
  head: () => ({ meta: [{ title: "Onboarding tracker — hrppl" }] }),
  component: Page,
});

function Page() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.onboardingAdmin", roles);
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const fetchRows = useServerFn(listOnboardingTrackerRows);
  const [status, setStatus] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [q, setQ] = useState("");

  const rowsQ = useQuery({
    queryKey: ["onb-tracker", status, country, onlyOverdue],
    queryFn: () =>
      fetchRows({
        data: { status: status || undefined, country: country || undefined, onlyOverdue },
      }),
    enabled: canAccess,
  });
  const rows = (rowsQ.data?.rows ?? []).filter((r: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    const e = r.employee ?? {};
    return [e.first_name, e.last_name, e.employee_number, e.job_title]
      .filter(Boolean)
      .some((v: string) => String(v).toLowerCase().includes(s));
  });

  return (
    <AppShell
      title="Onboarding tracker"
      subtitle="Cross-employee assignment, attestation, and evidence status"
    >
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
            <CardDescription>Filter by status, country, search, or overdue items.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div>
              <Label className="text-xs">Search</Label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, number, title"
              />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={status || "all"}
                onValueChange={(v) => setStatus(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Country</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                placeholder="AU, NP, …"
                maxLength={3}
              />
            </div>
            <div className="flex items-end gap-2">
              <Switch id="overdue" checked={onlyOverdue} onCheckedChange={setOnlyOverdue} />
              <Label htmlFor="overdue" className="text-xs">
                Overdue only
              </Label>
            </div>
            <div className="flex items-end text-xs text-muted-foreground gap-2">
              <span>
                {rows.length} of {rowsQ.data?.rows?.length ?? 0} rows
              </span>
              <ExportAuditButton />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="text-right">Missing attestation</TableHead>
                  <TableHead className="text-right">Missing evidence</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowsQ.isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!rowsQ.isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No assignments match.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((r: any) => {
                  const e = r.employee ?? {};
                  const pct = r.stats.total ? Math.round((r.stats.done / r.stats.total) * 100) : 0;
                  const warn = r.stats.overdue > 0 || r.stats.missingAttest > 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">
                          {e.first_name} {e.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.employee_number ?? "—"} · {e.job_title ?? ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.stats.done}/{r.stats.total} ({pct}%)
                      </TableCell>
                      <TableCell className="text-right">
                        {r.stats.overdue > 0 ? (
                          <span className="text-destructive font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {r.stats.overdue}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{r.stats.missingAttest}</TableCell>
                      <TableCell className="text-right">{r.stats.missingEvidence}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          to="/org/onboarding/control-room/$id"
                          params={{ id: r.id }}
                          className="text-primary text-xs hover:underline"
                        >
                          {warn ? (
                            "Resolve →"
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Open
                            </span>
                          )}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function ExportAuditButton() {
  const f = useServerFn(exportOnboardingTrackerAuditCsv);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          const res = await f({ data: {} });
          const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `onboarding-audit-${Date.now()}.csv`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast.success(`Exported ${res.rowCount} rows`);
        } catch (e: any) {
          toast.error(e?.message ?? "Export failed");
        }
      }}
    >
      <Download className="h-3 w-3 mr-1" /> Audit CSV
    </Button>
  );
}
