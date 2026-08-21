import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/leave-types")({
  head: () => ({ meta: [{ title: "Leave types — WorldPay HRMS" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <LeaveTypesAdmin />
    </AdminGate>
  ),
});

interface LeaveType {
  id: string; tenant_id: string; code: string; name: string; color: string;
  annual_quota_days: number; accrual_per_month: number; requires_approval: boolean;
  is_paid: boolean; allow_half_day: boolean; is_active: boolean;
  allow_carry_over: boolean; max_carry_over_days: number;
  branch_id: string | null;
}

const PRESET_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];

function LeaveTypesAdmin() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<{ code: string; name: string; color: string; annual_quota_days: number; accrual_per_month: number; requires_approval: boolean; is_paid: boolean; allow_half_day: boolean; allow_carry_over: boolean; max_carry_over_days: number; branch_id: string | null }>({ code: "", name: "", color: "#3b82f6", annual_quota_days: 0, accrual_per_month: 0, requires_approval: true, is_paid: true, allow_half_day: true, allow_carry_over: true, max_carry_over_days: 0, branch_id: null });
  const [busy, setBusy] = useState(false);

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (data?.tenant_id) setTenantId(data.tenant_id);
    })();
  }, [user]);

  async function load() {
    if (!tenantId) return;
    const { data } = await supabase.from("leave_types").select("*").eq("tenant_id", tenantId).order("name");
    setTypes((data ?? []) as LeaveType[]);
  }
  useEffect(() => { load(); }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    supabase.from("tenant_branches").select("id, name").eq("tenant_id", tenantId).eq("status", "active").order("name").then(({ data }) => {
      setBranches((data ?? []) as { id: string; name: string }[]);
    });
  }, [tenantId]);

  async function onCreate() {
    if (!tenantId) return;
    if (!form.code || !form.name) { toast.error("Code and name are required"); return; }
    setBusy(true);
    const { error } = await supabase.from("leave_types").insert({ tenant_id: tenantId, ...form });
    setBusy(false);
    if (error) { toast.error("Failed to create leave type."); console.error(error); return; }
    toast.success("Leave type created");
    setCreateOpen(false);
    setForm({ code: "", name: "", color: "#3b82f6", annual_quota_days: 0, accrual_per_month: 0, requires_approval: true, is_paid: true, allow_half_day: true, allow_carry_over: true, max_carry_over_days: 0, branch_id: null });
    await load();
  }

  async function patch(id: string, changes: Partial<LeaveType>) {
    const { error } = await supabase.from("leave_types").update(changes).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    setTypes((p) => p.map((t) => t.id === id ? { ...t, ...changes } : t));
  }

  if (loading || (user && !rolesLoaded)) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    <AppShell>
      <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Leave types</h1>
            <p className="text-xs text-muted-foreground">Configure leave categories your employees can request.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/org/leave"><Button variant="outline" size="sm">Back</Button></Link>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild><Button size="sm">New leave type</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create leave type</DialogTitle>
                  <DialogDescription>Define a leave category for your organization.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ANNUAL" /></div>
                    <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Annual leave" /></div>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="mt-1 flex gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                          className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                          style={{ background: c, borderColor: form.color === c ? "hsl(var(--foreground))" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Annual quota (days)</Label><Input type="number" step="0.5" value={form.annual_quota_days} onChange={(e) => setForm({ ...form, annual_quota_days: Number(e.target.value) })} /></div>
                    <div><Label>Monthly accrual</Label><Input type="number" step="0.01" value={form.accrual_per_month} onChange={(e) => setForm({ ...form, accrual_per_month: Number(e.target.value) })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between"><Label>Allow carry-over</Label><Switch checked={form.allow_carry_over} onCheckedChange={(v) => setForm({ ...form, allow_carry_over: v })} /></div>
                    <div><Label>Max carry-over days (0 = no cap)</Label><Input type="number" step="0.5" value={form.max_carry_over_days} onChange={(e) => setForm({ ...form, max_carry_over_days: Number(e.target.value) })} /></div>
                  </div>
                  <div className="flex items-center justify-between"><Label>Paid leave</Label><Switch checked={form.is_paid} onCheckedChange={(v) => setForm({ ...form, is_paid: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Requires approval</Label><Switch checked={form.requires_approval} onCheckedChange={(v) => setForm({ ...form, requires_approval: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Allow half-day</Label><Switch checked={form.allow_half_day} onCheckedChange={(v) => setForm({ ...form, allow_half_day: v })} /></div>
                  <div>
                    <Label>Branch scope</Label>
                    <Select value={form.branch_id ?? "__all"} onValueChange={(v) => setForm({ ...form, branch_id: v === "__all" ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all">All branches (organisation-wide)</SelectItem>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">Limit this leave type to a specific branch, or leave it open to everyone.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={onCreate} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Configured types</CardTitle><CardDescription>{types.length} type(s)</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead></TableHead><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Branch</TableHead><TableHead>Quota</TableHead><TableHead>Monthly</TableHead><TableHead>Carry-over</TableHead><TableHead>Paid</TableHead><TableHead>Approval</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell><span className="inline-block h-4 w-4 rounded-full" style={{ background: t.color }} /></TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell className="text-xs">{t.branch_id ? (branches.find((b) => b.id === t.branch_id)?.name ?? "—") : <span className="text-muted-foreground">All</span>}</TableCell>
                    <TableCell>{Number(t.annual_quota_days).toFixed(1)} d</TableCell>
                    <TableCell>{Number(t.accrual_per_month).toFixed(2)} d/mo</TableCell>
                    <TableCell>
                      {t.allow_carry_over
                        ? <Badge variant="outline">{Number(t.max_carry_over_days) > 0 ? `${t.max_carry_over_days}d cap` : "no cap"}</Badge>
                        : <Badge variant="secondary">off</Badge>}
                    </TableCell>
                    <TableCell><Switch checked={t.is_paid} onCheckedChange={(v) => patch(t.id, { is_paid: v })} /></TableCell>
                    <TableCell><Switch checked={t.requires_approval} onCheckedChange={(v) => patch(t.id, { requires_approval: v })} /></TableCell>
                    <TableCell><Switch checked={t.is_active} onCheckedChange={(v) => patch(t.id, { is_active: v })} /></TableCell>
                  </TableRow>
                ))}
                {types.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No leave types yet. Create one to get started.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      </main>
    </AppShell>
  );
}
