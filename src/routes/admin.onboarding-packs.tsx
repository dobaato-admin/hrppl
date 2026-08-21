import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Copy, Download, FileDown, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  listChecklistPacks,
  upsertChecklist,
  cloneChecklistPack,
  deleteChecklistPack,
  reorderChecklistPacks,
} from "@/lib/onboarding.functions";
import { downloadChecklistPdf } from "@/lib/checklist-pdf";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/onboarding-packs")({
  head: () => ({ meta: [{ title: "Onboarding & offboarding packs — hrppl" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <OnboardingPacksPage />
    </AdminGate>
  ),
});

const ANY = "__any__";
const EMP_TYPES = ["full_time", "part_time", "casual", "contractor", "intern", "fixed_term"];

interface Item { key: string; label: string; required: boolean; stage?: string | null }
interface Stage { key: string; label: string; order: number }
interface Pack {
  id: string;
  name: string;
  description: string | null;
  country_code: string | null;
  branch_id: string | null;
  department_id: string | null;
  employment_type: string | null;
  priority: number;
  is_default: boolean;
  is_system_seed: boolean;
  items: Item[];
  stages: Stage[];
  updated_at: string;
}

function OnboardingPacksPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");

  const listFn = useServerFn(listChecklistPacks);
  const save = useServerFn(upsertChecklist);
  const cloneFn = useServerFn(cloneChecklistPack);
  const delFn = useServerFn(deleteChecklistPack);
  const reorderFn = useServerFn(reorderChecklistPacks);

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [filterCountry, setFilterCountry] = useState<string>(ANY);
  const [filterBranch, setFilterBranch] = useState<string>(ANY);
  const [filterDept, setFilterDept] = useState<string>(ANY);
  const [filterEmp, setFilterEmp] = useState<string>(ANY);
  const [tenantName, setTenantName] = useState("hrppl");

  const [editorOpen, setEditorOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [cloneSource, setCloneSource] = useState<Pack | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneScope, setCloneScope] = useState<{ country?: string | null; branch?: string | null; dept?: string | null; emp?: string | null }>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Admin only"); navigate({ to: "/dashboard" });
    }
  }, [loading, user, rolesLoaded, canAccess, navigate]);

  useEffect(() => {
    (async () => {
      const [c, t] = await Promise.all([
        supabase.from("countries").select("code,name").order("name"),
        supabase.from("profiles").select("tenant_id").maybeSingle(),
      ]);
      setCountries((c.data ?? []) as any);
      const tid = (t.data as any)?.tenant_id;
      if (tid) {
        const { data } = await supabase.from("tenants").select("name").eq("id", tid).maybeSingle();
        if (data?.name) setTenantName(data.name);
      }
    })();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-packs"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });
  const packs: Pack[] = (data?.packs ?? []) as unknown as Pack[];
  const branches: { id: string; name: string; country_code: string | null }[] = (data?.branches ?? []) as any;
  const departments: { id: string; name: string }[] = (data?.departments ?? []) as any;
  const branchMap = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const deptMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);

  const filtered = useMemo(() => {
    return packs.filter((p) => {
      if (filterCountry !== ANY && (p.country_code ?? "") !== (filterCountry === "" ? "" : filterCountry)) return false;
      if (filterBranch !== ANY && (p.branch_id ?? "") !== (filterBranch === "" ? "" : filterBranch)) return false;
      if (filterDept !== ANY && (p.department_id ?? "") !== (filterDept === "" ? "" : filterDept)) return false;
      if (filterEmp !== ANY && (p.employment_type ?? "") !== (filterEmp === "" ? "" : filterEmp)) return false;
      return true;
    });
  }, [packs, filterCountry, filterBranch, filterDept, filterEmp]);

  function openNew() {
    setEditing({
      id: "", name: "New checklist", description: "",
      country_code: filterCountry === ANY ? null : filterCountry || null,
      branch_id: filterBranch === ANY ? null : filterBranch || null,
      department_id: filterDept === ANY ? null : filterDept || null,
      employment_type: filterEmp === ANY ? null : filterEmp || null,
      priority: 100, is_default: false, is_system_seed: false,
      items: [], stages: [], updated_at: "",
    });
    setEditorOpen(true);
  }
  function openEdit(p: Pack) { setEditing({ ...p, items: [...(p.items ?? [])], stages: [...(p.stages ?? [])] }); setEditorOpen(true); }
  function openClone(p: Pack) { setCloneSource(p); setCloneName(`${p.name} (override)`); setCloneScope({ country: p.country_code, branch: p.branch_id, dept: p.department_id, emp: p.employment_type }); setCloneOpen(true); }

  async function move(p: Pack, dir: -1 | 1) {
    const scope = filtered;
    const idx = scope.findIndex((x) => x.id === p.id);
    const swap = scope[idx + dir];
    if (!swap) return;
    try {
      await reorderFn({ data: { ordered: [
        { id: p.id, priority: swap.priority },
        { id: swap.id, priority: p.priority },
      ] } });
      qc.invalidateQueries({ queryKey: ["onboarding-packs"] });
    } catch (e: any) { toast.error(e?.message ?? "Reorder failed"); }
  }

  async function save_() {
    if (!editing) return;
    try {
      await save({ data: {
        id: editing.id || undefined,
        name: editing.name,
        description: editing.description,
        isDefault: editing.is_default,
        countryCode: editing.country_code,
        branchId: editing.branch_id,
        departmentId: editing.department_id,
        employmentType: editing.employment_type,
        priority: editing.priority,
        items: editing.items.map((it) => ({ key: it.key || it.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60) || "item", label: it.label, required: it.required ?? true, stage: it.stage ?? null })),
        stages: editing.stages,
      } });
      toast.success("Saved");
      setEditorOpen(false);
      qc.invalidateQueries({ queryKey: ["onboarding-packs"] });
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
  }

  async function doClone() {
    if (!cloneSource) return;
    try {
      await cloneFn({ data: {
        sourceId: cloneSource.id, name: cloneName,
        countryCode: cloneScope.country || null,
        branchId: cloneScope.branch || null,
        departmentId: cloneScope.dept || null,
        employmentType: cloneScope.emp || null,
        priority: 50,
      } });
      toast.success("Pack cloned as editable override");
      setCloneOpen(false);
      qc.invalidateQueries({ queryKey: ["onboarding-packs"] });
    } catch (e: any) { toast.error(e?.message ?? "Clone failed"); }
  }

  async function doDelete(p: Pack) {
    if (p.is_system_seed) { toast.error("Clone the seed first, then edit the override."); return; }
    if (!confirm(`Delete pack "${p.name}"?`)) return;
    try {
      await delFn({ data: { id: p.id } });
      qc.invalidateQueries({ queryKey: ["onboarding-packs"] });
    } catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  }

  function exportPdf(p: Pack) {
    downloadChecklistPdf({
      name: p.name,
      kind: "onboarding",
      description: p.description,
      country_code: p.country_code,
      branch_name: p.branch_id ? branchMap.get(p.branch_id) ?? null : null,
      department_name: p.department_id ? deptMap.get(p.department_id) ?? null : null,
      employment_type: p.employment_type,
      is_default: p.is_default,
      is_system_seed: p.is_system_seed,
      items: (p.items ?? []).map((it) => ({ label: it.label, required: it.required, stage: it.stage ?? null })),
    }, tenantName);
  }

  if (loading || (user && !rolesLoaded)) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    <AppShell title="Onboarding & offboarding packs" subtitle="Override and reorder pre-loaded country packs per branch, department, and employment type">
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Scope what you see and what new packs inherit by default.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div><Label className="text-xs">Country</Label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Branch</Label>
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Department</Label>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Employment type</Label>
              <Select value={filterEmp} onValueChange={setFilterEmp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {EMP_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={openNew} className="w-full"><Plus className="w-4 h-4 mr-1" /> New pack</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding packs</CardTitle>
            <CardDescription>
              {isLoading ? "Loading…" : `${filtered.length} pack${filtered.length === 1 ? "" : "s"} in current scope`}
              {" "}— lower priority appears first when matching employees.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-center">Steps</TableHead>
                  <TableHead className="text-center">Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No packs in this scope. Clone a system seed to create an override.</TableCell></TableRow>
                )}
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(p, -1)} aria-label="Move up"><ArrowUp className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" disabled={i === filtered.length - 1} onClick={() => move(p, 1)} aria-label="Move down"><ArrowDown className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">priority {p.priority}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">{p.country_code ?? "Any country"}</Badge>
                        {p.branch_id && <Badge variant="outline">{branchMap.get(p.branch_id) ?? "Branch"}</Badge>}
                        {p.department_id && <Badge variant="outline">{deptMap.get(p.department_id) ?? "Dept"}</Badge>}
                        {p.employment_type && <Badge variant="outline">{p.employment_type}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><Badge>{p.items?.length ?? 0}</Badge></TableCell>
                    <TableCell className="text-center text-xs space-x-1">
                      {p.is_default && <Badge>Default</Badge>}
                      {p.is_system_seed && <Badge variant="secondary">Seed</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => exportPdf(p)} title="Download PDF checklist"><FileDown className="w-3.5 h-3.5 mr-1" />PDF</Button>
                      <Button size="sm" variant="outline" onClick={() => openClone(p)} title="Clone as editable override"><Copy className="w-3.5 h-3.5 mr-1" />Clone</Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)} disabled={p.is_system_seed} title={p.is_system_seed ? "Clone seeds before editing" : "Edit"}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => doDelete(p)} disabled={p.is_system_seed} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Offboarding packs</CardTitle>
            <CardDescription>Per-country offboarding templates including comms-channel removal steps are managed in the offboarding admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate({ to: "/admin/offboarding" })}>Open offboarding templates →</Button>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit pack" : "New pack"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label className="text-xs">Priority</Label><Input type="number" value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) || 0 })} /></div>
                <div><Label className="text-xs">Country</Label>
                  <Select value={editing.country_code ?? ANY} onValueChange={(v) => setEditing({ ...editing, country_code: v === ANY ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>Any</SelectItem>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Branch</Label>
                  <Select value={editing.branch_id ?? ANY} onValueChange={(v) => setEditing({ ...editing, branch_id: v === ANY ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>Any</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Department</Label>
                  <Select value={editing.department_id ?? ANY} onValueChange={(v) => setEditing({ ...editing, department_id: v === ANY ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>Any</SelectItem>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Employment type</Label>
                  <Select value={editing.employment_type ?? ANY} onValueChange={(v) => setEditing({ ...editing, employment_type: v === ANY ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={ANY}>Any</SelectItem>{EMP_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.is_default} onCheckedChange={(v) => setEditing({ ...editing, is_default: v })} /><Label className="text-xs">Default pack for this scope</Label></div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Steps ({editing.items.length})</h4>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...editing, items: [...editing.items, { key: "", label: "New step", required: true, stage: null }] })}><Plus className="w-3.5 h-3.5 mr-1" />Add step</Button>
                </div>
                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
                  {editing.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border rounded">
                      <div className="flex flex-col">
                        <Button size="icon" variant="ghost" disabled={i === 0} aria-label="Move up" onClick={() => {
                          const a = [...editing.items]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setEditing({ ...editing, items: a });
                        }}><ArrowUp className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" disabled={i === editing.items.length - 1} aria-label="Move down" onClick={() => {
                          const a = [...editing.items]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; setEditing({ ...editing, items: a });
                        }}><ArrowDown className="w-3 h-3" /></Button>
                      </div>
                      <Input className="flex-1" value={it.label} onChange={(e) => { const a = [...editing.items]; a[i] = { ...a[i], label: e.target.value }; setEditing({ ...editing, items: a }); }} />
                      <Input className="w-32" placeholder="stage" value={it.stage ?? ""} onChange={(e) => { const a = [...editing.items]; a[i] = { ...a[i], stage: e.target.value || null }; setEditing({ ...editing, items: a }); }} />
                      <div className="flex items-center gap-1 text-xs"><Switch checked={it.required} onCheckedChange={(v) => { const a = [...editing.items]; a[i] = { ...a[i], required: v }; setEditing({ ...editing, items: a }); }} />Req</div>
                      <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => { const a = [...editing.items]; a.splice(i, 1); setEditing({ ...editing, items: a }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={save_}>Save</Button>
            {editing?.id && <Button variant="outline" onClick={() => editing && exportPdf(editing as any)}><Download className="w-3.5 h-3.5 mr-1" />PDF</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone */}
      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Clone as override</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">New name</Label><Input value={cloneName} onChange={(e) => setCloneName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Country</Label>
                <Select value={cloneScope.country ?? ANY} onValueChange={(v) => setCloneScope({ ...cloneScope, country: v === ANY ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ANY}>Any</SelectItem>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Branch</Label>
                <Select value={cloneScope.branch ?? ANY} onValueChange={(v) => setCloneScope({ ...cloneScope, branch: v === ANY ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ANY}>Any</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Department</Label>
                <Select value={cloneScope.dept ?? ANY} onValueChange={(v) => setCloneScope({ ...cloneScope, dept: v === ANY ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ANY}>Any</SelectItem>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Employment type</Label>
                <Select value={cloneScope.emp ?? ANY} onValueChange={(v) => setCloneScope({ ...cloneScope, emp: v === ANY ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ANY}>Any</SelectItem>{EMP_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>Cancel</Button>
            <Button onClick={doClone}>Create override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
