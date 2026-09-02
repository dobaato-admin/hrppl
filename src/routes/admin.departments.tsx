import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listDepartments, upsertDepartment, deleteDepartment } from "@/lib/departments.functions";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.departments">
      <DepartmentsPage />
    </AdminGate>
  ),
});

interface Dept {
  id: string;
  name: string;
  parent_id: string | null;
  manager_id: string | null;
  headcount: number;
}

function DepartmentsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listDepartments);
  const saveFn = useServerFn(upsertDepartment);
  const delFn = useServerFn(deleteDepartment);
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ id?: string; name: string; parent_id: string | null }>({
    name: "",
    parent_id: null,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Admin only");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["departments-admin"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });
  const departments: Dept[] = (data?.departments ?? []) as Dept[];

  function startNew() {
    setForm({ name: "", parent_id: null });
    setOpen(true);
  }
  function startEdit(d: Dept) {
    setForm({ id: d.id, name: d.name, parent_id: d.parent_id });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveFn({ data: { id: form.id, name: form.name, parent_id: form.parent_id } });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["departments-admin"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: Dept) {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    try {
      await delFn({ data: { id: d.id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["departments-admin"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell title="Departments" subtitle="Teams and reporting structure">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Used across employees, payroll, leave, and onboarding.
          </div>
          <div className="flex gap-2">
            <Link to="/org/employees">
              <Button variant="outline" size="sm">
                View employees
              </Button>
            </Link>
            <Button size="sm" onClick={startNew} data-testid="add-department">
              Add department
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Departments</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading…"
                : `${departments.length} department${departments.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No departments yet. Add one to start grouping employees.
                    </TableCell>
                  </TableRow>
                )}
                {departments.map((d) => {
                  const parent = departments.find((x) => x.id === d.parent_id)?.name ?? "—";
                  return (
                    <TableRow key={d.id} data-testid="department-row">
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">{parent}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.headcount}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(d)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(d)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit department" : "Add department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Engineering"
                required
                data-testid="department-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Parent department (optional)</Label>
              <Select
                value={form.parent_id ?? "none"}
                onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {departments
                    .filter((d) => d.id !== form.id)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy} data-testid="department-save">
                {busy ? "Saving…" : form.id ? "Save changes" : "Add department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
