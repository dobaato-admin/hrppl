import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

export const Route = createFileRoute("/admin/holidays")({
  head: () => ({ meta: [{ title: "Public holidays — WorldPay HRMS" }] }),
  component: () => (
    <AdminGate allow={PLATFORM_OR_ORG_ADMIN}>
      <HolidaysAdmin />
    </AdminGate>
  ),
});

interface Country { code: string; name: string }
interface Holiday {
  id: string; country_code: string; holiday_date: string; name: string;
  is_paid: boolean; is_recurring: boolean; notes: string | null;
  pay_multiplier: number | null;
}

function HolidaysAdmin() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");
  const canManage = isSuper || isRegional || isOrg;

  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<string>("");
  const [rows, setRows] = useState<Holiday[]>([]);
  const [form, setForm] = useState({ holiday_date: "", name: "", is_paid: true, is_recurring: false, notes: "" });
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
    const { data } = await supabase.from("public_holidays").select("*")
      .eq("country_code", country).order("holiday_date");
    setRows((data ?? []) as Holiday[]);
  }
  useEffect(() => { load(); }, [country]);

  async function addHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!country || !form.holiday_date || !form.name) return toast.error("Fill in date and name");
    setBusy(true);
    const { error } = await supabase.from("public_holidays").insert({
      country_code: country, ...form, notes: form.notes || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Holiday added");
    setForm({ holiday_date: "", name: "", is_paid: true, is_recurring: false, notes: "" });
    load();
  }

  async function patch(id: string, changes: Partial<Holiday>) {
    const { error } = await supabase.from("public_holidays").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.map((r) => r.id === id ? { ...r, ...changes } : r));
  }

  async function remove(id: string) {
    if (!confirm("Delete this holiday?")) return;
    const { error } = await supabase.from("public_holidays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.filter((r) => r.id !== id));
  }

  const yearGroups = useMemo(() => {
    const m = new Map<string, Holiday[]>();
    for (const r of rows) {
      const y = r.holiday_date.slice(0, 4);
      const list = m.get(y) ?? [];
      list.push(r); m.set(y, list);
    }
    return Array.from(m.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

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
            <h1 className="text-xl font-semibold">Public Holidays</h1>
            <p className="text-xs text-muted-foreground">Country-level holiday calendar</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/holiday-calendar"><Button size="sm">Annual calendar</Button></Link>
            <Link to="/dashboard"><Button size="sm" variant="outline">Back to dashboard</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Add holiday</CardTitle>
            <CardDescription>Holidays are visible to everyone in tenants for the selected country.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addHoliday} className="grid gap-4 md:grid-cols-[200px_1fr_200px_auto] md:items-end">
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
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.holiday_date} onChange={(e) => setForm({ ...form, holiday_date: e.target.value })} required />
              </div>
              <Button type="submit" disabled={busy || !country}>Add</Button>
              <div className="flex items-center gap-2 md:col-span-2">
                <Switch checked={form.is_paid} onCheckedChange={(v) => setForm({ ...form, is_paid: v })} />
                <Label className="text-sm">Paid</Label>
                <Switch className="ml-4" checked={form.is_recurring} onCheckedChange={(v) => setForm({ ...form, is_recurring: v })} />
                <Label className="text-sm">Recurs yearly</Label>
              </div>
              <div className="space-y-2 md:col-span-4">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
              </div>
            </form>
          </CardContent>
        </Card>

        {yearGroups.map(([year, list]) => (
          <Card key={year}>
            <CardHeader><CardTitle>{year} ({list.length})</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Name</TableHead>
                    <TableHead>Paid</TableHead><TableHead>Recurring</TableHead>
                    <TableHead className="w-[140px]">Pay multiplier</TableHead>
                    <TableHead>Notes</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.holiday_date}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell><Switch checked={r.is_paid} onCheckedChange={(v) => patch(r.id, { is_paid: v })} /></TableCell>
                      <TableCell><Switch checked={r.is_recurring} onCheckedChange={(v) => patch(r.id, { is_recurring: v })} /></TableCell>
                      <TableCell>
                        <Input
                          type="number" step="0.05" min={1} max={10}
                          placeholder="Country default"
                          value={r.pay_multiplier ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            patch(r.id, { pay_multiplier: v === "" ? null : Number(v) });
                          }}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.notes ?? "—"}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => remove(r.id)}>Delete</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && country && (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No holidays yet for this country.</CardContent></Card>
        )}
      </section>
      </main>
    </AppShell>
  );
}
