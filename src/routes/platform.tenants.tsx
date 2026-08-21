import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllTenants, upsertTenantGovernance } from "@/lib/super-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/tenants")({
  head: () => ({ meta: [{ title: "Tenants — Platform" }] }),
  component: PlatformTenantsPage,
});

const TONE: Record<string, string> = {
  healthy: "bg-status-done text-status-done-foreground",
  warning: "bg-status-pending text-status-pending-foreground",
  at_risk: "bg-status-working text-status-working-foreground",
  suspended: "bg-destructive text-destructive-foreground",
};

function PlatformTenantsPage() {
  const fetchData = useServerFn(listAllTenants);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-tenants"],
    queryFn: () => fetchData({}),
    retry: false,
  });

  if (error) {
    return <AppShell title="Tenants"><div className="p-6"><Card><CardContent className="p-6 text-sm text-destructive">Forbidden — super-admin only.</CardContent></Card></div></AppShell>;
  }

  const govByTenant = new Map((data?.governance ?? []).map((g: any) => [g.tenant_id, g]));

  return (
    <AppShell title="Tenants" subtitle="Platform-wide organization governance">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader><CardTitle>All tenants</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Country</TableHead>
                    <TableHead>Plan</TableHead><TableHead>Status</TableHead>
                    <TableHead>Health</TableHead><TableHead>Risk</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.tenants.map((t: any) => {
                    const g = govByTenant.get(t.id) as any;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.country_code} · {t.currency_code}</TableCell>
                        <TableCell>{t.plan}</TableCell>
                        <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                        <TableCell><Badge className={TONE[g?.health_status ?? "healthy"]}>{g?.health_status ?? "healthy"}</Badge></TableCell>
                        <TableCell>{g?.risk_score ?? 0}</TableCell>
                        <TableCell>
                          <GovDialog tenant={t} existing={g} onSaved={() => qc.invalidateQueries({ queryKey: ["platform-tenants"] })} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function GovDialog({ tenant, existing, onSaved }: { tenant: any; existing: any; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const save = useServerFn(upsertTenantGovernance);
  const [form, setForm] = useState({
    tenant_id: tenant.id,
    health_status: (existing?.health_status ?? "healthy") as "healthy" | "warning" | "at_risk" | "suspended",
    internal_notes: existing?.internal_notes ?? "",
    risk_score: existing?.risk_score ?? 0,
  });
  async function submit() {
    try {
      await save({ data: { ...form, risk_score: Number(form.risk_score) } });
      toast.success("Updated"); setOpen(false); onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Manage</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{tenant.name} — governance</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Health</Label>
            <Select value={form.health_status} onValueChange={(v: any) => setForm({ ...form, health_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="at_risk">At risk</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {/* Two different things are called "suspended" in this product.
                This one is an internal account-management label and grants or
                revokes nothing. */}
            <p className="mt-1.5 text-xs text-muted-foreground">
              Internal health label only — it does not block access. To actually
              cut off an organisation, set its status on the{" "}
              <Link to="/admin" className="underline underline-offset-2">admin console</Link>.
            </p>
          </div>
          <div><Label>Risk score (0-100)</Label><Input type="number" value={form.risk_score} onChange={(e) => setForm({ ...form, risk_score: Number(e.target.value) })} /></div>
          <div><Label>Internal notes</Label><Textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
