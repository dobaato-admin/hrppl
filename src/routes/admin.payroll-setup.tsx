import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  getPayrollSetup,
  upsertPayrollSettings,
  upsertPayrollComponent,
  togglePayrollComponent,
  deletePayrollComponent,
} from "@/lib/payroll-setup.functions";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/payroll-setup")({
  head: () => ({ meta: [{ title: "Payroll Setup — HRPPL" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <PayrollSetupPage />
    </AdminGate>
  ),
});

type ComponentRow = {
  id: string; code: string; label: string; kind: string;
  calc_type: string; rate: number; is_taxable: boolean;
  show_on_payslip: boolean; is_active: boolean; sort_order: number;
  department_id: string | null; notes: string | null;
};
type Dept = { id: string; name: string };

function PayrollSetupPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const qc = useQueryClient();
  const fetchSetup = useServerFn(getPayrollSetup);
  const { data, isLoading } = useQuery({
    queryKey: ["payroll-setup"],
    queryFn: () => fetchSetup(),
    enabled: !!user && rolesLoaded && canAccess,
  });

  if (loading || (user && !rolesLoaded) || isLoading) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  if (!user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  const settings = data?.settings;
  const components = (data?.components ?? []) as ComponentRow[];
  const departments = (data?.departments ?? []) as Dept[];

  return (
    <AppShell
      title="Payroll setup"
      subtitle="Pay period, hours, breaks, and component lines"
      actions={
        <div className="flex gap-2">
          <Link to="/admin/payroll-wizard"><Button variant="default" size="sm">Open setup wizard</Button></Link>
          <Link to="/dashboard"><Button variant="outline" size="sm">Back to dashboard</Button></Link>
        </div>
      }
    >
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Tabs defaultValue="periods">
          <TabsList>
            <TabsTrigger value="periods">Pay period & hours</TabsTrigger>
            <TabsTrigger value="components">Components ({components.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="periods">
            <SettingsForm
              initial={settings}
              onSaved={() => qc.invalidateQueries({ queryKey: ["payroll-setup"] })}
            />
          </TabsContent>

          <TabsContent value="components">
            <ComponentsPanel
              components={components}
              departments={departments}
              onChanged={() => qc.invalidateQueries({ queryKey: ["payroll-setup"] })}
            />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

const DEFAULT_SETTINGS = {
  pay_period: "monthly" as const,
  standard_hours_per_day: 8,
  standard_days_per_week: 5,
  meal_break_minutes: 30,
  rest_break_minutes: 15,
  notes: "" as string | null,
};

function SettingsForm({ initial, onSaved }: { initial: any; onSaved: () => void }) {
  const save = useServerFn(upsertPayrollSettings);
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS, ...(initial ?? {}) });
  useEffect(() => { if (initial) setForm({ ...DEFAULT_SETTINGS, ...initial }); }, [initial]);

  const mut = useMutation({
    mutationFn: () => save({ data: {
      pay_period: form.pay_period,
      standard_hours_per_day: Number(form.standard_hours_per_day),
      standard_days_per_week: Number(form.standard_days_per_week),
      meal_break_minutes: Number(form.meal_break_minutes),
      rest_break_minutes: Number(form.rest_break_minutes),
      notes: form.notes || null,
    } }),
    onSuccess: () => { toast.success("Settings saved"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay period & working hours</CardTitle>
        <CardDescription>Applies to this organisation. Used by payroll runs and payslips.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
          <div className="space-y-1.5">
            <Label className="text-xs">Pay period</Label>
            <Select value={form.pay_period} onValueChange={(v) => setForm({ ...form, pay_period: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Standard hours / day</Label>
            <Input type="number" step="0.25" min={0} max={24} value={form.standard_hours_per_day}
              onChange={(e) => setForm({ ...form, standard_hours_per_day: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Standard days / week</Label>
            <Input type="number" step="0.5" min={0} max={7} value={form.standard_days_per_week}
              onChange={(e) => setForm({ ...form, standard_days_per_week: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Meal break (minutes)</Label>
            <Input type="number" min={0} max={240} value={form.meal_break_minutes}
              onChange={(e) => setForm({ ...form, meal_break_minutes: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Rest break (minutes)</Label>
            <Input type="number" min={0} max={240} value={form.rest_break_minutes}
              onChange={(e) => setForm({ ...form, rest_break_minutes: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={mut.isPending} data-testid="save-payroll-settings">
              {mut.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const EMPTY_COMPONENT = {
  code: "",
  label: "",
  kind: "allowance" as const,
  calc_type: "flat" as const,
  rate: 0,
  is_taxable: false,
  show_on_payslip: true,
  is_active: true,
  sort_order: 100,
  department_id: null as string | null,
  notes: null as string | null,
};

function ComponentsPanel({
  components, departments, onChanged,
}: { components: ComponentRow[]; departments: Dept[]; onChanged: () => void }) {
  const upsert = useServerFn(upsertPayrollComponent);
  const toggle = useServerFn(togglePayrollComponent);
  const del = useServerFn(deletePayrollComponent);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: (payload: any) => upsert({ data: payload }),
    onSuccess: () => { toast.success("Saved"); setOpen(false); setEditing(null); onChanged(); },
    onError: (e: any) => toast.error(e.message),
  });

  function openNew() { setEditing({ ...EMPTY_COMPONENT }); setOpen(true); }
  function openEdit(c: ComponentRow) { setEditing({ ...c }); setOpen(true); }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Payroll components</CardTitle>
          <CardDescription>Tax, PF, retirement, allowances, deductions. Toggle off to exclude from a payrun without deleting.</CardDescription>
        </div>
        <Button onClick={openNew} data-testid="add-component">Add component</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Calc</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>On payslip</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No components yet. Add tax, PF or allowance lines to drive payslips.
              </TableCell></TableRow>
            )}
            {components.map((c) => (
              <TableRow key={c.id} data-testid="component-row">
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell>{c.label}</TableCell>
                <TableCell><Badge variant="outline">{c.kind}</Badge></TableCell>
                <TableCell className="text-xs">{c.calc_type}</TableCell>
                <TableCell>{c.calc_type === "flat" ? c.rate : `${c.rate}%`}</TableCell>
                <TableCell className="text-xs">
                  {c.department_id ? (departments.find((d) => d.id === c.department_id)?.name ?? "—") : "All"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.show_on_payslip ? "default" : "secondary"}>{c.show_on_payslip ? "yes" : "no"}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={async (v) => {
                      try { await toggle({ data: { id: c.id, is_active: v } }); onChanged(); }
                      catch (e: any) { toast.error(e.message); }
                    }}
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm("Delete this component?")) return;
                    try { await del({ data: { id: c.id } }); toast.success("Deleted"); onChanged(); }
                    catch (e: any) { toast.error(e.message); }
                  }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit component" : "Add component"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={(e) => {
              e.preventDefault();
              save.mutate({
                id: editing.id,
                code: editing.code,
                label: editing.label,
                kind: editing.kind,
                calc_type: editing.calc_type,
                rate: Number(editing.rate),
                is_taxable: !!editing.is_taxable,
                show_on_payslip: !!editing.show_on_payslip,
                is_active: !!editing.is_active,
                sort_order: Number(editing.sort_order ?? 100),
                department_id: editing.department_id || null,
                notes: editing.notes || null,
              });
            }}>
              <div className="space-y-1.5">
                <Label className="text-xs">Code</Label>
                <Input value={editing.code} required maxLength={40}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Label</Label>
                <Input value={editing.label} required onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kind</Label>
                <Select value={editing.kind} onValueChange={(v) => setEditing({ ...editing, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax">Tax</SelectItem>
                    <SelectItem value="pf">Provident fund</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="allowance">Allowance</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Calculation</Label>
                <Select value={editing.calc_type} onValueChange={(v) => setEditing({ ...editing, calc_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat amount</SelectItem>
                    <SelectItem value="pct_of_basic">% of basic</SelectItem>
                    <SelectItem value="pct_of_gross">% of gross</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rate {editing.calc_type === "flat" ? "(amount)" : "(percent)"}</Label>
                <Input type="number" step="0.01" min={0} value={editing.rate}
                  onChange={(e) => setEditing({ ...editing, rate: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department scope</Label>
                <Select
                  value={editing.department_id ?? "__all__"}
                  onValueChange={(v) => setEditing({ ...editing, department_id: v === "__all__" ? null : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All departments</SelectItem>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sort order</Label>
                <Input type="number" min={0} max={9999} value={editing.sort_order ?? 100}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!editing.is_taxable} onCheckedChange={(v) => setEditing({ ...editing, is_taxable: v })} />
                <Label className="text-xs">Taxable</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!editing.show_on_payslip} onCheckedChange={(v) => setEditing({ ...editing, show_on_payslip: v })} />
                <Label className="text-xs">Show on payslip</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <Label className="text-xs">Active</Label>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>
              <DialogFooter className="md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={save.isPending} data-testid="save-component">
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
