import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Pencil, Plus, ShieldCheck, Trash2, UserCheck, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { supabase } from "@/integrations/supabase/client";
import { useMyTenantId } from "@/hooks/use-tenant";
import {
  listPolicyDocuments,
  upsertPolicyDocument,
  deletePolicyDocument,
  assignPolicyAcknowledgements,
  listPolicyCompliance,
  POLICY_CATEGORIES,
} from "@/lib/policies.functions";

export const Route = createFileRoute("/admin/policies")({
  head: () => ({ meta: [{ title: "HR policies — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.policies">
      <PoliciesPage />
    </AdminGate>
  ),
});

const CATEGORY_LABELS: Record<string, string> = {
  conduct: "Code of conduct",
  grievance: "Grievance",
  whistleblower: "Whistleblower",
  health_safety: "Health & safety",
  it_usage: "IT usage",
  privacy: "Privacy",
  general: "General",
};

type Form = {
  id?: string;
  title: string;
  category: string;
  summary: string;
  body_md: string;
  requires_acknowledgement: boolean;
  is_active: boolean;
  effective_from: string;
  bumpVersion: boolean;
};

const BLANK: Form = {
  title: "",
  category: "conduct",
  summary: "",
  body_md: "",
  requires_acknowledgement: true,
  is_active: true,
  effective_from: "",
  bumpVersion: false,
};

function PoliciesPage() {
  const qc = useQueryClient();
  const { tenantId } = useMyTenantId();
  const listFn = useServerFn(listPolicyDocuments);
  const saveFn = useServerFn(upsertPolicyDocument);
  const delFn = useServerFn(deletePolicyDocument);
  const assignFn = useServerFn(assignPolicyAcknowledgements);
  const complianceFn = useServerFn(listPolicyCompliance);

  const [editing, setEditing] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["policy-documents"],
    queryFn: () => listFn({ data: { includeInactive: true } }),
  });
  const { data: compliance } = useQuery({
    queryKey: ["policy-compliance"],
    queryFn: () => complianceFn({ data: {} }),
    staleTime: 30_000,
  });

  const policies: any[] = data?.policies ?? [];
  const rows: any[] = compliance?.rows ?? [];

  const outstanding = useMemo(() => rows.filter((r) => !r.acknowledged_at), [rows]);

  async function openAssign() {
    if (!tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow `employees` for a
    // super_admin, so an unfiltered read here would list every tenant's staff.
    const { data: emps } = await supabase
      .from("employees")
      .select("id,first_name,last_name,job_title")
      .eq("tenant_id", tenantId)
      .order("first_name");
    setEmployees(emps ?? []);
    setSelected([]);
    setAssignOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      await saveFn({
        data: {
          ...editing,
          category: editing.category as never,
          summary: editing.summary || null,
          effective_from: editing.effective_from || null,
        },
      });
      toast.success(editing.id ? "Policy updated" : "Policy published");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["policy-documents"] });
      qc.invalidateQueries({ queryKey: ["setup-guide"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save the policy");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: any) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      const res = await delFn({ data: { id: p.id } });
      toast.success(
        res.retired
          ? `Retired instead of deleted — ${res.acknowledgements} people have signed it.`
          : "Policy deleted",
      );
      qc.invalidateQueries({ queryKey: ["policy-documents"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not delete");
    }
  }

  async function assign() {
    if (selected.length === 0) return toast.error("Pick at least one person");
    setBusy(true);
    try {
      const res = await assignFn({
        data: { employee_ids: selected, due_date: dueDate || null },
      });
      toast.success(`${res.count} acknowledgement(s) assigned`);
      setAssignOpen(false);
      qc.invalidateQueries({ queryKey: ["policy-compliance"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not assign");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="HR policies"
      subtitle="The documents every employee reads and signs, and who has signed them"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openAssign}>
            <Users className="mr-1 h-4 w-4" /> Assign to staff
          </Button>
          <Button size="sm" onClick={() => setEditing({ ...BLANK })}>
            <Plus className="mr-1 h-4 w-4" /> New policy
          </Button>
        </div>
      }
    >
      <section className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">
              <FileText className="mr-1 h-4 w-4" /> Library
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <ShieldCheck className="mr-1 h-4 w-4" /> Who has signed
              {outstanding.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {outstanding.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <SectionCard
              title="Policy library"
              description="Written in markdown. Bump the version when the wording changes materially — everyone is asked to read it again."
            >
              {isLoading ? (
                <SkeletonRows rows={4} />
              ) : policies.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No policies yet"
                  description="Publish a code of conduct, a grievance policy and a whistleblower policy — the three the guided setup checks for."
                  action={
                    <Button onClick={() => setEditing({ ...BLANK })}>
                      <Plus className="mr-1 h-4 w-4" /> Write the first one
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Signing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.title}
                          {p.summary && (
                            <div className="text-xs text-muted-foreground">{p.summary}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">v{p.version}</TableCell>
                        <TableCell>
                          {p.requires_acknowledgement ? (
                            <StatusChip tone="working">Must sign</StatusChip>
                          ) : (
                            <span className="text-xs text-muted-foreground">Reference only</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.is_active ? "default" : "outline"}>
                            {p.is_active ? "active" : "retired"}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Edit ${p.title}`}
                            onClick={() =>
                              setEditing({
                                id: p.id,
                                title: p.title,
                                category: p.category,
                                summary: p.summary ?? "",
                                body_md: p.body_md ?? "",
                                requires_acknowledgement: p.requires_acknowledgement,
                                is_active: p.is_active,
                                effective_from: p.effective_from ?? "",
                                bumpVersion: false,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Delete ${p.title}`}
                            onClick={() => remove(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <SectionCard
              title="Acknowledgements"
              description="A row exists once the obligation is assigned; it is discharged when the person signs."
            >
              {rows.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  title="Nothing assigned yet"
                  description="Assign policies to staff, or let Phase 3 provisioning do it for new starters."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Signed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.employees?.first_name} {r.employees?.last_name}
                          <div className="text-xs text-muted-foreground">
                            {r.employees?.job_title}
                          </div>
                        </TableCell>
                        <TableCell>{r.policy_documents?.title}</TableCell>
                        <TableCell className="text-xs tabular-nums">v{r.policy_version}</TableCell>
                        <TableCell className="text-xs">{r.due_date ?? "—"}</TableCell>
                        <TableCell>
                          {r.acknowledged_at ? (
                            <StatusChip tone="done">
                              {new Date(r.acknowledged_at).toLocaleDateString()}
                            </StatusChip>
                          ) : (
                            <StatusChip tone="pending">Outstanding</StatusChip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>
      </section>

      {/* ------------------------------------------------------ editor ---- */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit policy" : "New policy"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pol-title">Title*</Label>
                  <Input
                    id="pol-title"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editing.category}
                    onValueChange={(v) => setEditing({ ...editing, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POLICY_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORY_LABELS[c] ?? c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pol-summary">One-line summary</Label>
                <Input
                  id="pol-summary"
                  value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pol-body">Policy text (markdown)</Label>
                <Textarea
                  id="pol-body"
                  rows={10}
                  value={editing.body_md}
                  onChange={(e) => setEditing({ ...editing, body_md: e.target.value })}
                  placeholder={"## Purpose\n\nWhat this policy covers and who it applies to."}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pol-from">Effective from</Label>
                  <Input
                    id="pol-from"
                    type="date"
                    value={editing.effective_from}
                    onChange={(e) => setEditing({ ...editing, effective_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2 pt-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={editing.requires_acknowledgement}
                      onCheckedChange={(c) =>
                        setEditing({ ...editing, requires_acknowledgement: !!c })
                      }
                    />
                    Employees must read and sign this
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={editing.is_active}
                      onCheckedChange={(c) => setEditing({ ...editing, is_active: !!c })}
                    />
                    Active
                  </label>
                </div>
              </div>

              {editing.id && (
                <label className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
                  <Checkbox
                    checked={editing.bumpVersion}
                    onCheckedChange={(c) => setEditing({ ...editing, bumpVersion: !!c })}
                  />
                  <span>
                    The wording changed materially — publish as a new version
                    <span className="block text-xs text-muted-foreground">
                      Everyone who signed the previous version is asked to read and sign again.
                      Leave this off for a typo.
                    </span>
                  </span>
                </label>
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save policy"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------ assign ---- */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign every signable policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Assigns all active policies marked &quot;must sign&quot;. Anyone who already has the
              current version is skipped.
            </p>
            <div className="space-y-2">
              <Label htmlFor="assign-due">Due date</Label>
              <Input
                id="assign-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Employees ({selected.length} selected)</Label>
              <div className="max-h-64 space-y-1 overflow-auto rounded border p-2">
                {employees.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={selected.includes(e.id)}
                      onCheckedChange={(c) =>
                        setSelected((s) => (c ? [...s, e.id] : s.filter((x) => x !== e.id)))
                      }
                    />
                    <span>
                      {e.first_name} {e.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{e.job_title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assign} disabled={busy}>
              {busy ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
