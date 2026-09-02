import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ExternalLink, RefreshCw } from "lucide-react";
import {
  listSecurityFindings,
  updateSecurityFindingStatus,
} from "@/lib/security-findings.functions";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/security-findings")({
  head: () => ({
    meta: [
      { title: "Security findings — hrppl" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <SuperAdminGuard title="Security findings" route="/admin/security-findings">
      <SecurityFindingsPage />
    </SuperAdminGuard>
  ),
});

type Finding = {
  id: string;
  scanner_name: string;
  internal_id: string;
  title: string;
  severity: "error" | "warn" | "info";
  status: "open" | "fixed" | "ignored" | "accepted_risk";
  description?: string | null;
  remediation?: string | null;
  ticket_url?: string | null;
  fixed_in_commit?: string | null;
  scanned_at: string;
  resolved_at?: string | null;
  resolved_by_name?: string | null;
  recorded_by_name?: string | null;
};

const sevColor: Record<string, string> = {
  error: "bg-destructive text-destructive-foreground",
  warn: "bg-amber-500 text-white",
  info: "bg-muted text-foreground",
};
const statusColor: Record<string, string> = {
  open: "bg-destructive text-destructive-foreground",
  fixed: "bg-emerald-600 text-white",
  ignored: "bg-muted text-foreground",
  accepted_risk: "bg-amber-500 text-white",
};

function SecurityFindingsPage() {
  const fetchList = useServerFn(listSecurityFindings);
  const updateFn = useServerFn(updateSecurityFindingStatus);
  const [rows, setRows] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scannerFilter, setScannerFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Finding | null>(null);
  const [form, setForm] = useState({
    status: "open",
    ticket_url: "",
    fixed_in_commit: "",
    remediation: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await fetchList({});
      setRows(res.findings ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load findings");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const scanners = useMemo(
    () => Array.from(new Set(rows.map((r) => r.scanner_name))).sort(),
    [rows],
  );
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (scannerFilter !== "all" && r.scanner_name !== scannerFilter) return false;
      if (search && !`${r.title} ${r.internal_id}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [rows, statusFilter, scannerFilter, search]);

  const counts = useMemo(() => {
    const c = {
      total: rows.length,
      open: 0,
      fixed: 0,
      ignored: 0,
      accepted_risk: 0,
      error_open: 0,
    };
    for (const r of rows) {
      (c as any)[r.status]++;
      if (r.status === "open" && r.severity === "error") c.error_open++;
    }
    return c;
  }, [rows]);

  const openEdit = (f: Finding) => {
    setEditing(f);
    setForm({
      status: f.status,
      ticket_url: f.ticket_url ?? "",
      fixed_in_commit: f.fixed_in_commit ?? "",
      remediation: f.remediation ?? "",
    });
  };

  const save = async () => {
    if (!editing) return;
    try {
      await updateFn({
        data: {
          id: editing.id,
          status: form.status as any,
          ticket_url: form.ticket_url || undefined,
          fixed_in_commit: form.fixed_in_commit || undefined,
          remediation: form.remediation || undefined,
        },
      });
      toast.success("Finding updated");
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  return (
    // Wrapped in AppShell to restore the sidebar and top bar; admin.tsx is a
    // bare <Outlet /> by design. No title passed — the page has its own header.
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Security findings</h1>
            <p className="text-sm text-muted-foreground">
              All scan results over time across Wiz, Supabase linter, dependency audit, CodeQL and
              connectors.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="size-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              ["Total", counts.total, ""],
              ["Open", counts.open, "text-destructive"],
              ["Open high/critical", counts.error_open, "text-destructive"],
              ["Fixed", counts.fixed, "text-emerald-600"],
              ["Accepted / ignored", counts.ignored + counts.accepted_risk, ""],
            ] as const
          ).map(([label, n, cls]) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent className={`text-2xl font-semibold ${cls}`}>{n}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center gap-3">
            <Input
              placeholder="Search title or id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
                <SelectItem value="accepted_risk">Accepted risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scannerFilter} onValueChange={setScannerFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scanners</SelectItem>
                {scanners.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scanned</TableHead>
                  <TableHead>Scanner</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Fixed by</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {loading ? "Loading…" : "No findings match these filters."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.scanned_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{r.scanner_name}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.internal_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={sevColor[r.severity]}>{r.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor[r.status]}>{r.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.ticket_url ? (
                        <a
                          href={r.ticket_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs"
                        >
                          ticket <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.status === "fixed" ||
                      r.status === "ignored" ||
                      r.status === "accepted_risk" ? (
                        <div>
                          <div>{r.resolved_by_name ?? "—"}</div>
                          {r.resolved_at && (
                            <div className="text-muted-foreground">
                              {new Date(r.resolved_at).toLocaleDateString()}
                            </div>
                          )}
                          {r.fixed_in_commit && (
                            <a
                              href={
                                r.fixed_in_commit.startsWith("http")
                                  ? r.fixed_in_commit
                                  : `#${r.fixed_in_commit}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary font-mono"
                            >
                              {r.fixed_in_commit.slice(0, 10)}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.title}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                {editing.description && (
                  <div className="text-sm text-muted-foreground">{editing.description}</div>
                )}
                <div>
                  <label className="text-xs font-medium">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="ignored">Ignored (not applicable)</SelectItem>
                      <SelectItem value="accepted_risk">Accepted risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Ticket URL</label>
                  <Input
                    value={form.ticket_url}
                    onChange={(e) => setForm((f) => ({ ...f, ticket_url: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Fixed in commit / PR</label>
                  <Input
                    value={form.fixed_in_commit}
                    onChange={(e) => setForm((f) => ({ ...f, fixed_in_commit: e.target.value }))}
                    placeholder="commit SHA or PR URL"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Remediation notes</label>
                  <Textarea
                    value={form.remediation}
                    onChange={(e) => setForm((f) => ({ ...f, remediation: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
