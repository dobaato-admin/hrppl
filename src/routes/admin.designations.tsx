import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BadgeCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listDesignations,
  upsertDesignation,
  deleteDesignation,
  seedDesignationPreset,
} from "@/lib/hr-extras.functions";
import { DESIGNATION_PRESETS } from "@/lib/designation-presets";
import { AdminGate } from "@/components/AdminGate";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/admin/designations")({
  head: () => ({ meta: [{ title: "Designations — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.designations">
      <DesignationsPage />
    </AdminGate>
  ),
});

interface Department {
  id: string;
  name: string;
}

function DesignationsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listDesignations);
  const saveFn = useServerFn(upsertDesignation);
  const delFn = useServerFn(deleteDesignation);
  const seedFn = useServerFn(seedDesignationPreset);
  // W5 · Derived from the SAME feature key the route gate quotes, so this
  // page has one answer to "who may be here" instead of two. It previously
  // hand-rolled its own role list, which meant widening the route gate left
  // this check still rejecting — AdminGate let the user in and the page
  // bounced them a moment later.
  const canAccess = can("org.designations", roles);
  const [open, setOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetKey, setPresetKey] = useState<string>(DESIGNATION_PRESETS[0].key);
  const [presetCurrency, setPresetCurrency] = useState("USD");
  const [presetDept, setPresetDept] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<any>({
    title: "",
    grade: "",
    currency_code: "USD",
    is_active: true,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Admin only");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  useEffect(() => {
    if (!canAccess) return;
    supabase
      .from("departments")
      .select("id,name")
      .order("name")
      .then(({ data }) => setDepartments((data ?? []) as Department[]));
  }, [canAccess]);

  const { data, isLoading } = useQuery({
    queryKey: ["designations"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });

  function startNew() {
    setForm({ title: "", grade: "", currency_code: "USD", is_active: true });
    setOpen(true);
  }
  function startEdit(d: any) {
    setForm({ ...d });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        min_salary: form.min_salary ? Number(form.min_salary) : null,
        max_salary: form.max_salary ? Number(form.max_salary) : null,
      };
      await saveFn({ data: payload });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["designations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this designation?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["designations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function applyPreset() {
    const preset = DESIGNATION_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    setBusy(true);
    try {
      const res = await seedFn({
        data: {
          currency_code: presetCurrency.toUpperCase(),
          department_id: presetDept || null,
          designations: preset.designations,
        },
      });
      toast.success(
        `Added ${res.inserted} designation${res.inserted === 1 ? "" : "s"}${res.skipped ? ` (${res.skipped} skipped, already exist)` : ""}`,
      );
      setPresetOpen(false);
      qc.invalidateQueries({ queryKey: ["designations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not apply preset");
    } finally {
      setBusy(false);
    }
  }

  if (loading || (user && !rolesLoaded))
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  const activePreset = DESIGNATION_PRESETS.find((p) => p.key === presetKey);

  return (
    <AppShell
      title="Designations"
      subtitle="Manage job titles, grades and salary bands"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Sparkles className="mr-1 h-4 w-4" /> Use a preset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Seed designations from a preset</DialogTitle>
                <DialogDescription>
                  Pick an industry template — we'll create the ladder for you. Titles that already
                  exist will be skipped.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Industry</Label>
                    <Select value={presetKey} onValueChange={setPresetKey}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGNATION_PRESETS.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      maxLength={3}
                      value={presetCurrency}
                      onChange={(e) => setPresetCurrency(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department (optional)</Label>
                    <Select
                      value={presetDept || "__none__"}
                      onValueChange={(v) => setPresetDept(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {activePreset && (
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">{activePreset.description}</p>
                    <div className="mt-2 max-h-56 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right">Band</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activePreset.designations.map((d) => (
                            <TableRow key={d.title}>
                              <TableCell className="text-xs">{d.grade}</TableCell>
                              <TableCell className="text-xs font-medium">{d.title}</TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">
                                {d.min_salary?.toLocaleString()} – {d.max_salary?.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPresetOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button onClick={applyPreset} disabled={busy}>
                  {busy ? "Applying…" : "Apply preset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={startNew}>
                <Plus className="mr-1 h-4 w-4" /> New designation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit" : "New"} designation</DialogTitle>
              </DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Title*</Label>
                    <Input
                      value={form.title ?? ""}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input
                      value={form.grade ?? ""}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      value={form.code ?? ""}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={form.department_id ?? ""}
                      onValueChange={(v) => setForm({ ...form, department_id: v || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Min salary</Label>
                    <Input
                      type="number"
                      value={form.min_salary ?? ""}
                      onChange={(e) => setForm({ ...form, min_salary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max salary</Label>
                    <Input
                      type="number"
                      value={form.max_salary ?? ""}
                      onChange={(e) => setForm({ ...form, max_salary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      maxLength={3}
                      value={form.currency_code ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, currency_code: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <CardTitle>Catalog</CardTitle>
            </div>
            <CardDescription>
              Used by promotions, pay rates, and recruitment offers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary band</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.designations ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No designations yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data!.designations.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          {d.title}
                          {d.code && <div className="text-xs text-muted-foreground">{d.code}</div>}
                        </TableCell>
                        <TableCell>{d.grade ?? "—"}</TableCell>
                        <TableCell>{d.departments?.name ?? "—"}</TableCell>
                        <TableCell className="text-xs">
                          {d.min_salary || d.max_salary
                            ? `${d.currency_code ?? ""} ${d.min_salary ?? "—"} – ${d.max_salary ?? "—"}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.is_active ? "default" : "outline"}>
                            {d.is_active ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(d)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
