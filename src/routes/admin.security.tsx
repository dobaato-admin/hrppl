import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { listSecurityFindings, updateSecurityFindingStatus } from "@/lib/security-findings.functions";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/security")({
  head: () => ({ meta: [{ title: "Security Findings — hrppl" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SecurityFindingsPage,
});

type Finding = {
  id: string;
  scanned_at: string;
  scanner_name: string;
  internal_id: string;
  title: string;
  severity: "error" | "warn" | "info";
  status: "open" | "fixed" | "ignored" | "accepted_risk";
  description: string | null;
  remediation: string | null;
  resolved_at: string | null;
};

function statusBadge(status: Finding["status"]) {
  switch (status) {
    case "open": return <Badge variant="destructive">Open</Badge>;
    case "fixed": return <Badge className="bg-emerald-600 hover:bg-emerald-600">Fixed</Badge>;
    case "ignored": return <Badge variant="secondary">Ignored</Badge>;
    case "accepted_risk": return <Badge variant="outline">Accepted risk</Badge>;
  }
}

function severityBadge(s: Finding["severity"]) {
  return <Badge variant={s === "error" ? "destructive" : s === "warn" ? "secondary" : "outline"}>{s}</Badge>;
}

function SecurityFindingsPage() {
  const { user, roles, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const isSuper = roles.includes("super_admin");
  const list = useServerFn(listSecurityFindings);
  const update = useServerFn(updateSecurityFindingStatus);
  const [rows, setRows] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Finding | null>(null);
  const [editStatus, setEditStatus] = useState<Finding["status"]>("fixed");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    if (!rolesLoaded) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isSuper) { toast.error("Super admin only"); navigate({ to: "/dashboard" }); return; }
    (async () => {
      try {
        const r = await list();
        setRows((r.findings ?? []) as Finding[]);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load findings");
      } finally {
        setLoading(false);
      }
    })();
  }, [rolesLoaded, user, isSuper, navigate, list]);

  const filtered = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
  const counts = useMemo(() => ({
    open: rows.filter((r) => r.status === "open").length,
    fixed: rows.filter((r) => r.status === "fixed").length,
    ignored: rows.filter((r) => r.status === "ignored").length,
    accepted_risk: rows.filter((r) => r.status === "accepted_risk").length,
  }), [rows]);

  async function saveEdit() {
    if (!editing) return;
    try {
      await update({ data: { id: editing.id, status: editStatus, remediation: editNote || undefined } });
      const r = await list();
      setRows((r.findings ?? []) as Finding[]);
      toast.success("Updated");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    }
  }

  if (!rolesLoaded || loading) {
    return <main className="p-6 text-muted-foreground">Loading security findings…</main>;
  }

  return (
    // Wrapped in AppShell to restore the sidebar and top bar; admin.tsx is a
    // bare <Outlet /> by design. This page hid the problem: it redirects
    // non-super-admins to /dashboard, so a spot-check as an org_admin measured
    // the dashboard's chrome and looked fine.
    <AppShell>
      <main className="container mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Security findings</h1>
        <p className="text-sm text-muted-foreground">
          Audit log of every scan finding, its current status, and the exact remediation applied.
          Findings are seeded from each security scan and curated here by super admins.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Open</CardDescription><CardTitle className="text-2xl">{counts.open}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Fixed</CardDescription><CardTitle className="text-2xl">{counts.fixed}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Ignored</CardDescription><CardTitle className="text-2xl">{counts.ignored}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Accepted risk</CardDescription><CardTitle className="text-2xl">{counts.accepted_risk}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>All findings</CardTitle>
            <CardDescription>Newest scan first</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
              <SelectItem value="accepted_risk">Accepted risk</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Scanner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(f.scanned_at).toLocaleString()}</TableCell>
                  <TableCell>{severityBadge(f.severity)}</TableCell>
                  <TableCell className="font-mono text-xs">{f.scanner_name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="font-medium">{f.title}</div>
                    {f.remediation && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.remediation}</div>}
                  </TableCell>
                  <TableCell>{statusBadge(f.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(f); setEditStatus(f.status); setEditNote(f.remediation ?? ""); }}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No findings.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.title}</DialogTitle>
            <DialogDescription className="font-mono text-xs">{editing?.scanner_name} · {editing?.internal_id}</DialogDescription>
          </DialogHeader>
          {editing?.description && <p className="rounded-md bg-muted p-3 text-sm">{editing.description}</p>}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Finding["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                  <SelectItem value="accepted_risk">Accepted risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Remediation / rationale</label>
              <Textarea rows={5} value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Describe what was changed in code/DB or why this is accepted." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </AppShell>
  );
}
