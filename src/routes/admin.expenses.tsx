import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listExpenseCategories,
  upsertExpenseCategory,
  deleteExpenseCategory,
  listApprovalRules,
  upsertApprovalRule,
  deleteApprovalRule,
} from "@/lib/expenses.functions";
import { listEmployeesForAdmin } from "@/lib/timeline.functions";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/expenses")({
  head: () => ({ meta: [{ title: "Expense settings — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.expenseSettings">
      <AdminExpensesPage />
    </AdminGate>
  ),
});

function AdminExpensesPage() {
  return (
    <AppShell title="Expense settings" subtitle="Categories, tax handling and approval routing">
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const [tab, setTab] = useState("categories");
  return (
    <div className="p-4 md:p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories &amp; tax</TabsTrigger>
          <TabsTrigger value="rules">Approval rules</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <RulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------- Categories ----------------
function CategoriesTab() {
  const list = useServerFn(listExpenseCategories);
  const save = useServerFn(upsertExpenseCategory);
  const del = useServerFn(deleteExpenseCategory);
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(blankCategory());

  function blankCategory() {
    return {
      id: undefined,
      name: "",
      code: "",
      description: "",
      requires_receipt: true,
      is_active: true,
      max_amount: "",
      daily_limit: "",
      monthly_limit: "",
      tax_rate: "",
      tax_code: "",
    };
  }

  async function refresh() {
    const r = await list();
    setRows(r.categories);
  }
  useEffect(() => {
    refresh();
  }, []);

  function openNew() {
    setForm(blankCategory());
    setOpen(true);
  }
  function openEdit(c: any) {
    setForm({
      ...c,
      max_amount: c.max_amount ?? "",
      daily_limit: c.daily_limit ?? "",
      monthly_limit: c.monthly_limit ?? "",
      tax_rate: c.tax_rate ?? "",
      tax_code: c.tax_code ?? "",
      code: c.code ?? "",
      description: c.description ?? "",
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.name.trim()) return toast.error("Name required");
    const payload: any = {
      id: form.id,
      name: form.name.trim(),
      code: form.code || null,
      description: form.description || null,
      requires_receipt: !!form.requires_receipt,
      is_active: !!form.is_active,
      max_amount: form.max_amount === "" ? null : Number(form.max_amount),
      daily_limit: form.daily_limit === "" ? null : Number(form.daily_limit),
      monthly_limit: form.monthly_limit === "" ? null : Number(form.monthly_limit),
      tax_rate: form.tax_rate === "" ? 0 : Number(form.tax_rate),
      tax_code: form.tax_code || null,
    };
    try {
      await save({ data: payload });
      toast.success(form.id ? "Updated" : "Created");
      setOpen(false);
      await refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Deactivate this category? Existing claims keep their reference.")) return;
    try {
      await del({ data: { id } });
      await refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Expense categories</CardTitle>
          <CardDescription>
            Per-tenant categories, receipt rules, spending caps and tax rates.
          </CardDescription>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> New category
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Per-line limit</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  No categories yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.code ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {c.tax_rate
                      ? `${(Number(c.tax_rate) * 100).toFixed(2)}%${c.tax_code ? ` (${c.tax_code})` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.max_amount != null ? Number(c.max_amount).toFixed(2) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.requires_receipt ? "default" : "secondary"}>
                      {c.requires_receipt ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {c.is_active ? (
                      <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                maxLength={120}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                maxLength={40}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Tax code</Label>
              <Input
                value={form.tax_code}
                placeholder="GST / VAT / SST…"
                maxLength={40}
                onChange={(e) => setForm({ ...form, tax_code: e.target.value })}
              />
            </div>
            <div>
              <Label>Tax rate</Label>
              <Input
                type="number"
                step="0.0001"
                min={0}
                max={1}
                placeholder="0.10 = 10%"
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
              />
            </div>
            <div>
              <Label>Per-line limit</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.max_amount}
                onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Daily limit</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.daily_limit}
                onChange={(e) => setForm({ ...form, daily_limit: e.target.value })}
              />
            </div>
            <div>
              <Label>Monthly limit</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.monthly_limit}
                onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                maxLength={500}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.requires_receipt}
                onCheckedChange={(v) => setForm({ ...form, requires_receipt: v })}
              />
              <Label>Receipt required</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{form.id ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------- Approval rules ----------------
function RulesTab() {
  const list = useServerFn(listApprovalRules);
  const save = useServerFn(upsertApprovalRule);
  const del = useServerFn(deleteApprovalRule);
  const fEmps = useServerFn(listEmployeesForAdmin);
  const [rows, setRows] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(blank());

  function blank() {
    return {
      id: undefined,
      department_id: null,
      min_amount: "0",
      max_amount: "",
      approver_id: "",
      priority: 100,
      is_active: true,
      notes: "",
    };
  }

  async function refresh() {
    // The approver list comes from listEmployeesForAdmin: tenant-scoped, active
    // only, and with the caller removed. The direct query it replaces had no
    // tenant filter, so a super_admin could route approvals to someone in
    // another organisation — and could name themselves as their own approver.
    // See src/lib/tenant-scope.ts.
    const [r, d, e] = await Promise.all([
      list(),
      supabase.from("departments").select("id,name").order("name"),
      fEmps(),
    ]);
    setRows(r.rules);
    setDepartments(d.data ?? []);
    setEmployees(e.employees ?? []);
  }
  useEffect(() => {
    refresh();
  }, []);

  function openNew() {
    setForm(blank());
    setOpen(true);
  }
  function openEdit(r: any) {
    setForm({
      ...r,
      min_amount: String(r.min_amount ?? 0),
      max_amount: r.max_amount == null ? "" : String(r.max_amount),
      notes: r.notes ?? "",
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.approver_id) return toast.error("Pick an approver");
    const payload: any = {
      id: form.id,
      department_id: form.department_id || null,
      min_amount: Number(form.min_amount) || 0,
      max_amount: form.max_amount === "" ? null : Number(form.max_amount),
      approver_id: form.approver_id,
      priority: Number(form.priority) || 100,
      is_active: !!form.is_active,
      notes: form.notes || null,
    };
    try {
      await save({ data: payload });
      toast.success("Saved");
      setOpen(false);
      await refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this rule?")) return;
    try {
      await del({ data: { id } });
      await refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Approval routing</CardTitle>
          <CardDescription>
            On submit, claims route to the highest-priority active rule whose department and amount
            band match. Multiple matches mean multiple approvers can act.
          </CardDescription>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> New rule
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Amount band</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No rules yet — without a rule, claims are visible only to org admins.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const approver = employees.find((e) => e.id === r.approver_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.priority}</TableCell>
                    <TableCell>
                      {r.departments?.name ?? <span className="text-muted-foreground">All</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {Number(r.min_amount).toFixed(2)} –{" "}
                      {r.max_amount == null ? "∞" : Number(r.max_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {approver ? (
                        `${approver.first_name} ${approver.last_name}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_active ? "default" : "secondary"}>
                        {r.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit rule" : "New approval rule"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Department (optional)</Label>
              <Select
                value={form.department_id ?? "__all"}
                onValueChange={(v) => setForm({ ...form, department_id: v === "__all" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min amount</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Max amount (blank = ∞)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.max_amount}
                onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Approver</Label>
              <Select
                value={form.approver_id}
                onValueChange={(v) => setForm({ ...form, approver_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick approver" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} {e.job_title ? `· ${e.job_title}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority (lower = runs first)</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                maxLength={500}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{form.id ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
