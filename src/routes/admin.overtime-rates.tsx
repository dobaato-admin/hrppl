import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { PLATFORM_OR_ORG_ADMIN } from "@/lib/rbac";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/overtime-rates")({
  head: () => ({ meta: [{ title: "Overtime & penalty rates — WorldPay HRMS" }] }),
  component: () => (
    <AdminGate allow={PLATFORM_OR_ORG_ADMIN}>
      <OvertimeRatesAdmin />
    </AdminGate>
  ),
});

interface Country { code: string; name: string }
interface Rate {
  id: string; country_code: string; code: string; name: string;
  applies_to: "overtime" | "penalty"; rate_multiplier: number;
  description: string | null; effective_from: string; effective_to: string | null; is_active: boolean;
}

function OvertimeRatesAdmin() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");
  const canManage = isSuper || isRegional || isOrg;

  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<string>("");
  const [rows, setRows] = useState<Rate[]>([]);
  const [form, setForm] = useState({
    code: "", name: "", applies_to: "overtime" as "overtime" | "penalty",
    rate_multiplier: 1.5, description: "",
    effective_from: new Date().toISOString().slice(0, 10), effective_to: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canManage) { toast.error("Admin access required"); navigate({ to: "/dashboard" }); }
  }, [loading, user, canManage, navigate]);

  useEffect(() => {
    if (!canManage || !user) return;
    (async () => {
      if (isSuper) {
        const { data } = await supabase.from("countries").select("code,name").order("name");
        setCountries((data ?? []) as Country[]);
      } else if (isOrg) {
        const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
        if (!prof?.tenant_id) return;
        const { data: tenant } = await supabase.from("tenants").select("country_code").eq("id", prof.tenant_id).maybeSingle();
        if (!tenant?.country_code) return;
        const { data } = await supabase.from("countries").select("code,name").eq("code", tenant.country_code).order("name");
        setCountries((data ?? []) as Country[]);
      } else {
        const { data: scope } = await supabase.from("role_scope").select("country_code").eq("user_id", user.id);
        const codes = (scope ?? []).map((s) => s.country_code as string);
        if (!codes.length) return;
        const { data } = await supabase.from("countries").select("code,name").in("code", codes).order("name");
        setCountries((data ?? []) as Country[]);
      }
    })();
  }, [canManage, isOrg, isSuper, user]);

  useEffect(() => { if (countries.length && !country) setCountry(countries[0].code); }, [countries, country]);

  async function load() {
    if (!country) return;
    const { data } = await supabase.from("overtime_penalty_rates").select("*")
      .eq("country_code", country).order("applies_to").order("effective_from", { ascending: false });
    setRows((data ?? []) as Rate[]);
  }
  useEffect(() => { load(); }, [country]);

  async function addRate(e: React.FormEvent) {
    e.preventDefault();
    if (!country) return;
    setBusy(true);
    const { error } = await supabase.from("overtime_penalty_rates").insert({
      country_code: country,
      code: form.code, name: form.name, applies_to: form.applies_to,
      rate_multiplier: form.rate_multiplier,
      description: form.description || null,
      effective_from: form.effective_from,
      effective_to: form.effective_to || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Rate added");
    setForm({ ...form, code: "", name: "", description: "" });
    load();
  }

  async function patch(id: string, changes: Partial<Rate>) {
    const { error } = await supabase.from("overtime_penalty_rates").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.map((r) => r.id === id ? { ...r, ...changes } : r));
  }

  async function remove(id: string) {
    if (!confirm("Delete this rate?")) return;
    const { error } = await supabase.from("overtime_penalty_rates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.filter((r) => r.id !== id));
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Overtime & Penalty Rates</h1>
            <p className="text-xs text-muted-foreground">Country-level multipliers used by payroll</p>
          </div>
          <Link to="/dashboard"><Button size="sm" variant="outline">Back to dashboard</Button></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Add rate</CardTitle>
            <CardDescription>e.g. weekday overtime ×1.5, Sunday penalty ×2.0</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addRate} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.applies_to} onValueChange={(v: "overtime" | "penalty") => setForm({ ...form, applies_to: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overtime">Overtime</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Multiplier</Label>
                <Input type="number" step="0.01" min={0} value={form.rate_multiplier}
                  onChange={(e) => setForm({ ...form, rate_multiplier: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="OT_WEEKDAY" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekday overtime" required />
              </div>
              <div className="space-y-2">
                <Label>Effective from</Label>
                <Input type="date" value={form.effective_from} onChange={(e) => setForm({ ...form, effective_from: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Effective to (optional)</Label>
                <Input type="date" value={form.effective_to} onChange={(e) => setForm({ ...form, effective_to: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={busy || !country}>Add rate</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rates ({rows.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead><TableHead>Code</TableHead>
                  <TableHead>Name</TableHead><TableHead>×</TableHead>
                  <TableHead>From</TableHead><TableHead>To</TableHead>
                  <TableHead>Active</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-muted-foreground">No rates yet.</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant={r.applies_to === "overtime" ? "default" : "secondary"}>{r.applies_to}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="font-mono">{Number(r.rate_multiplier).toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs">{r.effective_from}</TableCell>
                    <TableCell className="font-mono text-xs">{r.effective_to ?? "—"}</TableCell>
                    <TableCell><Switch checked={r.is_active} onCheckedChange={(v) => patch(r.id, { is_active: v })} /></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => remove(r.id)}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      </main>
    </AppShell>
  );
}
