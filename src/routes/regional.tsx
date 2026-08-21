import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/regional")({
  head: () => ({ meta: [{ title: "Regional Admin — WorldPay HRMS" }] }),
  component: RegionalPage,
});

interface Country { code: string; name: string; currency_code: string }
interface Tenant { id: string; name: string; slug: string; country_code: string; currency_code: string; status: string; contact_email: string; plan: string }

function RegionalPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [working, setWorking] = useState(false);

  const [form, setForm] = useState({ name: "", slug: "", country_code: "", contact_email: "", plan: "starter" });

  const canAccess = roles.includes("regional_admin") || roles.includes("super_admin");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) { toast.error("Regional Admin access required"); navigate({ to: "/dashboard" }); }
  }, [loading, user, canAccess, navigate]);

  async function refresh() {
    if (!user) return;
    const scope = await supabase.from("role_scope").select("country_code").eq("user_id", user.id);
    const codes = (scope.data ?? []).map((s) => s.country_code as string);

    const cq = roles.includes("super_admin")
      ? supabase.from("countries").select("code,name,currency_code").order("name")
      : supabase.from("countries").select("code,name,currency_code").in("code", codes.length ? codes : ["__none__"]);

    const tq = supabase.from("tenants").select("*").order("created_at", { ascending: false });

    const [c, t] = await Promise.all([cq, tq]);
    if (c.data) setCountries(c.data as Country[]);
    if (t.data) setTenants(t.data as Tenant[]);
  }
  useEffect(() => { if (canAccess) refresh(); }, [canAccess, user]);

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setWorking(true);
    const country = countries.find((c) => c.code === form.country_code);
    if (!country) { setWorking(false); return toast.error("Pick a country in your scope"); }
    const { error } = await supabase.from("tenants").insert({
      name: form.name,
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      country_code: country.code,
      currency_code: country.currency_code,
      contact_email: form.contact_email,
      plan: form.plan,
      status: "pending",
      created_by: user!.id,
    });
    setWorking(false);
    if (error) return toast.error(error.message);
    toast.success("Tenant created (pending). Confirm subscription to activate.");
    setForm({ name: "", slug: "", country_code: "", contact_email: "", plan: "starter" });
    refresh();
  }

  if (loading || !canAccess) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  return (
    <AppShell
      title="Regional Admin"
      subtitle="Onboard organizations and confirm payments"
      actions={
        <div className="hidden md:flex items-center gap-2">
          <Link to="/admin/holidays"><Button size="sm" variant="outline">Holidays</Button></Link>
          <Link to="/admin/overtime-rates"><Button size="sm" variant="outline">Overtime / Penalty</Button></Link>
        </div>
      }
    >
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Organization (Tenant)</CardTitle>
            <CardDescription>
              New tenants start as <strong>pending</strong>. Confirm a payment to activate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTenant} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Organization name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>URL slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="acme-corp" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={form.country_code} onValueChange={(v) => setForm({ ...form, country_code: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.currency_code})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact email</Label>
                <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={working} className="w-full md:w-auto">Create Tenant</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tenants in your scope ({tenants.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Country</TableHead>
                  <TableHead>Plan</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-muted-foreground">No tenants yet.</TableCell></TableRow>
                ) : tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}<div className="text-xs text-muted-foreground">{t.contact_email}</div></TableCell>
                    <TableCell>{t.country_code} · {t.currency_code}</TableCell>
                    <TableCell>{t.plan}</TableCell>
                    <TableCell><Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge></TableCell>
                    <TableCell className="text-right"><ConfirmPaymentDialog tenant={t} onDone={refresh} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function ConfirmPaymentDialog({ tenant, onDone }: { tenant: Tenant; onDone: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error: insErr } = await supabase.from("subscription_confirmations").insert({
      tenant_id: tenant.id,
      amount: Number(amount),
      currency_code: tenant.currency_code,
      bank_reference: ref,
      period_start: start,
      period_end: end,
      confirmed_by: user.id,
      notes,
    });
    if (insErr) { setBusy(false); return toast.error(insErr.message); }
    const { error: upErr } = await supabase.from("tenants")
      .update({ status: "active", approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("id", tenant.id);
    setBusy(false);
    if (upErr) return toast.error(upErr.message);
    toast.success("Subscription confirmed; tenant activated");
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={tenant.status === "active" ? "outline" : "default"}>
          {tenant.status === "active" ? "Record payment" : "Confirm & activate"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm payment — {tenant.name}</DialogTitle>
          <DialogDescription>Manually record bank transfer. Activates pending tenants.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Amount ({tenant.currency_code})</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Bank reference</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Period start</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Period end</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <DialogFooter><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Confirm"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
