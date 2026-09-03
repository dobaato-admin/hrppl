import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AuditExportButtons } from "@/components/audit/AuditExportButtons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/hooks/use-auth";
import {
  getControlRoom,
  upsertControlRoomTask,
  completeControlRoomTask,
  deleteControlRoomTask,
  listControlRoomAudit,
} from "@/lib/onboarding-control-room.functions";
import {
  attestControlRoomTask,
  toggleTaskAttestationRequired,
  acknowledgeCountryMerge,
} from "@/lib/onboarding-tracker.functions";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CheckCircle2, Circle, Trash2, Plus } from "lucide-react";

const LANES = ["hr", "it", "manager", "employee", "finance"] as const;
const STATUSES = ["pending", "in_progress", "completed", "blocked", "skipped"] as const;

export const Route = createFileRoute("/org/onboarding/control-room/$id")({
  head: () => ({ meta: [{ title: "Onboarding control room — hrppl" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  // W5 · Derived from this page's nav feature key rather than a
  // hand-rolled list, so the sidebar and the page cannot give different
  // answers to "who may be here".
  const canAccess = can("org.onboardingAdmin", roles);
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const qc = useQueryClient();
  const getFn = useServerFn(getControlRoom);
  const upsertFn = useServerFn(upsertControlRoomTask);
  const completeFn = useServerFn(completeControlRoomTask);
  const deleteFn = useServerFn(deleteControlRoomTask);

  const { data, isLoading } = useQuery({
    queryKey: ["control-room", id],
    queryFn: () => getFn({ data: { assignment_id: id } }),
    enabled: canAccess,
  });

  const auditFn = useServerFn(listControlRoomAudit);
  const { data: auditData } = useQuery({
    queryKey: ["control-room-audit", id],
    queryFn: () => auditFn({ data: { assignment_id: id } }),
    enabled: canAccess,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    owner_role: "hr",
  });

  function openNew(role: string) {
    setEditing(null);
    setForm({ title: "", description: "", due_date: "", owner_role: role });
    setOpen(true);
  }

  function openEdit(t: any) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      due_date: t.due_date ?? "",
      owner_role: t.owner_role,
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          id: editing?.id,
          assignment_id: id,
          owner_role: form.owner_role as any,
          title: form.title,
          description: form.description || null,
          due_date: form.due_date || null,
          sort_order: 0,
        },
      }),
    onSuccess: () => {
      toast.success("Task saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["control-room", id] });
      qc.invalidateQueries({ queryKey: ["control-room-audit", id] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: any }) => completeFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["control-room", id] });
      qc.invalidateQueries({ queryKey: ["control-room-audit", id] });
    },
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => deleteFn({ data: { id: taskId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["control-room", id] });
      qc.invalidateQueries({ queryKey: ["control-room-audit", id] });
    },
  });

  if (isLoading) {
    return (
      <AppShell title="Onboarding">
        <div className="p-4 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const emp = data?.assignment?.employee ?? {};
  const tasks = data?.tasks ?? [];
  const docs = data?.documents ?? [];

  return (
    <AppShell
      title={`${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || "Onboarding"}
      subtitle={`${emp.job_title ?? ""} · Hire date ${emp.hire_date ?? "—"}`}
    >
      <div className="p-4 space-y-4">
        <CountryMergeBanner
          assignment={data?.assignment}
          onAck={() => qc.invalidateQueries({ queryKey: ["control-room", id] })}
        />
        <div className="grid gap-3 md:grid-cols-5">
          {LANES.map((lane) => {
            const laneTasks = tasks.filter((t: any) => t.owner_role === lane);
            const done = laneTasks.filter(
              (t: any) => t.status === "completed" || t.status === "skipped",
            ).length;
            return (
              <Card key={lane} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{lane}</CardTitle>
                    <Badge variant="outline">
                      {done}/{laneTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 flex-1">
                  {laneTasks.map((t: any) => (
                    <div
                      key={t.id}
                      className="border rounded-md p-2 text-xs space-y-1 group hover:bg-muted/40 cursor-pointer"
                      onClick={() => openEdit(t)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{t.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remove.mutate(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {t.due_date && <div className="text-muted-foreground">Due {t.due_date}</div>}
                      <Select
                        value={t.status}
                        onValueChange={(v) => setStatus.mutate({ id: t.id, status: v })}
                      >
                        <SelectTrigger className="h-6 text-xs" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => openNew(lane)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add task
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documents ({docs.length})</CardTitle>
            <CardDescription>Files uploaded by or for this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {docs.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            )}
            {docs.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between text-sm border-b py-1.5">
                <span>{d.document_name}</span>
                <Badge variant={d.verification_status === "verified" ? "default" : "outline"}>
                  {d.verification_status ?? "pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Audit log</CardTitle>
              <CardDescription>Every action recorded for this onboarding case</CardDescription>
            </div>
            <AuditExportButtons
              source="onboarding"
              scopeId={id}
              scopeLabel={
                data?.assignment?.employee?.first_name
                  ? `${data.assignment.employee.first_name} ${data.assignment.employee.last_name ?? ""}`.trim()
                  : undefined
              }
            />
          </CardHeader>
          <CardContent className="space-y-1 max-h-96 overflow-y-auto">
            {(!auditData?.entries || auditData.entries.length === 0) && (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            )}
            {(auditData?.entries ?? []).map((a: any) => (
              <div
                key={a.id}
                className="flex items-start justify-between text-xs border-b py-1.5 gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-medium">{a.action.replace(/_/g, " ")}</div>
                  {a.details?.title && (
                    <div className="text-muted-foreground">{a.details.title}</div>
                  )}
                  {a.details?.reason && (
                    <div className="text-muted-foreground">Reason: {a.details.reason}</div>
                  )}
                </div>
                <div className="text-right text-muted-foreground whitespace-nowrap">
                  <div>{a.actor_name ?? a.actor_email ?? "System"}</div>
                  <div>{new Date(a.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Owner</Label>
              <Select
                value={form.owner_role}
                onValueChange={(v) => setForm((f) => ({ ...f, owner_role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANES.map((l) => (
                    <SelectItem key={l} value={l} className="capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Due date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              />
            </div>
            {editing && (
              <AttestationBlock
                task={editing}
                onSaved={() => {
                  qc.invalidateQueries({ queryKey: ["control-room", id] });
                  qc.invalidateQueries({ queryKey: ["control-room-audit", id] });
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={!form.title || save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function CountryMergeBanner({ assignment, onAck }: { assignment: any; onAck: () => void }) {
  const meta = assignment?.metadata ?? {};
  const ackFn = useServerFn(acknowledgeCountryMerge);
  if (!meta.country_merged_at || meta.country_merge_acknowledged_at) return null;
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm flex items-start justify-between gap-3">
      <div>
        <div className="font-medium text-amber-900">Country change detected — checklist merged</div>
        <div className="text-amber-800 text-xs mt-0.5">
          {meta.from_country ?? "previous country"} → {meta.to_country ?? "new country"}.
          Newly-added statutory steps are highlighted in the lanes below.
        </div>
        {Array.isArray(meta.added_steps) && meta.added_steps.length > 0 && (
          <ul className="text-xs text-amber-900 mt-1 list-disc list-inside">
            {meta.added_steps.slice(0, 8).map((s: string) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => ackFn({ data: { assignment_id: assignment.id } }).then(onAck)}
      >
        Acknowledge
      </Button>
    </div>
  );
}

function AttestationBlock({ task, onSaved }: { task: any; onSaved: () => void }) {
  const [signature, setSignature] = useState(task.attestation_signature ?? "");
  const [evidence, setEvidence] = useState(task.evidence_url ?? "");
  const [notes, setNotes] = useState(task.verifier_notes ?? "");
  const [required, setRequired] = useState<boolean>(!!task.attestation_required);
  const attestFn = useServerFn(attestControlRoomTask);
  const toggleFn = useServerFn(toggleTaskAttestationRequired);

  return (
    <div className="border-t pt-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Attestation required</Label>
        <Switch
          checked={required}
          onCheckedChange={(v) => {
            setRequired(v);
            toggleFn({ data: { id: task.id, required: v } }).then(onSaved);
          }}
        />
      </div>
      {required && (
        <>
          <div>
            <Label className="text-xs">Evidence URL (screenshot, system log)</Label>
            <Input
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div>
            <Label className="text-xs">Verifier notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Attestation signature (type name + role)</Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Jane Doe, HR Lead"
            />
          </div>
          <Button
            size="sm"
            disabled={!signature.trim()}
            onClick={() =>
              attestFn({
                data: {
                  id: task.id,
                  signature: signature.trim(),
                  evidence_url: evidence || null,
                  notes: notes || null,
                },
              }).then(() => {
                onSaved();
              })
            }
          >
            {task.attested_at ? "Re-attest" : "Submit attestation"}
          </Button>
          {task.attested_at && (
            <div className="text-xs text-emerald-700">
              Attested {new Date(task.attested_at).toLocaleString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
