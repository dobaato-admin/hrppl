import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Paperclip, Upload, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listEmployeesForAdmin } from "@/lib/timeline.functions";
import {
  listMedicalIncidents,
  recordMedicalIncident,
  listMedicalAttachments,
  recordMedicalAttachment,
  deleteMedicalAttachment,
  getMedicalAttachmentUrl,
} from "@/lib/medical.functions";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/medical")({
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><MedicalPage /></AdminGate>),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button onClick={() => { reset(); router.invalidate(); }}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

function MedicalPage() {
  const qc = useQueryClient();
  const fetchEmps = useServerFn(listEmployeesForAdmin);
  const fetchList = useServerFn(listMedicalIncidents);
  const record = useServerFn(recordMedicalIncident);

  const empsQ = useQuery({ queryKey: ["emps-admin"], queryFn: () => fetchEmps() });
  const listQ = useQuery({
    queryKey: ["medical-incidents"],
    queryFn: () => fetchList({ data: {} }),
  });

  const [form, setForm] = useState({
    employeeId: "",
    incidentType: "",
    severity: "low" as "low" | "medium" | "high" | "critical",
    location: "",
    description: "",
    treatmentNotes: "",
    requiresCase: false,
    reportedToAuthority: false,
    confidential: true,
  });

  const m = useMutation({
    mutationFn: () => record({ data: form }),
    onSuccess: () => {
      toast.success("Medical incident recorded");
      qc.invalidateQueries({ queryKey: ["medical-incidents"] });
      setForm({
        ...form,
        incidentType: "",
        location: "",
        description: "",
        treatmentNotes: "",
        requiresCase: false,
      });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AppShell title="Medical incidents" subtitle="Workplace medical events. High-severity events open a confidential case automatically.">
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record incident</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {(empsQ.data?.employees ?? []).map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} — {e.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Incident type</Label>
                <Input value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })} placeholder="e.g. Slip, Cut, Allergic reaction" />
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Treatment notes</Label>
              <Textarea rows={2} value={form.treatmentNotes} onChange={(e) => setForm({ ...form, treatmentNotes: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded border p-2">
              <Label>Requires case file</Label>
              <Switch checked={form.requiresCase} onCheckedChange={(v) => setForm({ ...form, requiresCase: v })} />
            </div>
            <div className="flex items-center justify-between rounded border p-2">
              <Label>Reported to authority</Label>
              <Switch checked={form.reportedToAuthority} onCheckedChange={(v) => setForm({ ...form, reportedToAuthority: v })} />
            </div>
            <div className="flex items-center justify-between rounded border p-2">
              <Label>Confidential (HR-only)</Label>
              <Switch checked={form.confidential} onCheckedChange={(v) => setForm({ ...form, confidential: v })} />
            </div>
            <Button
              disabled={!form.employeeId || !form.incidentType || !form.description || m.isPending}
              onClick={() => m.mutate()}
              className="w-full"
            >
              {m.isPending ? "Saving…" : "Record incident"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {listQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (listQ.data?.incidents ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents recorded.</p>
            ) : (
              (listQ.data?.incidents ?? []).map((i: any) => {
                const emp = (empsQ.data?.employees ?? []).find((e: any) => e.id === i.employee_id);
                return (
                  <div key={i.id} className="rounded border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{i.incident_type}</span>
                      <Badge variant="outline" className="capitalize">{i.severity}</Badge>
                      {i.confidential && <Badge variant="outline">Confidential</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(i.occurred_at).toLocaleString()}
                      </span>
                    </div>
                    {emp && (
                      <Link
                        to="/admin/employees/$employeeId"
                        params={{ employeeId: i.employee_id }}
                        className="text-xs text-primary hover:underline"
                      >
                        {emp.first_name} {emp.last_name}
                      </Link>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
                    <MedicalAttachments incident={i} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function MedicalAttachments({ incident }: { incident: any }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMedicalAttachments);
  const recordFn = useServerFn(recordMedicalAttachment);
  const delFn = useServerFn(deleteMedicalAttachment);
  const urlFn = useServerFn(getMedicalAttachmentUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["medical-attachments", incident.id],
    queryFn: () => listFn({ data: { incident_id: incident.id } }),
  });
  const items = data?.attachments ?? [];

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const path = `${incident.tenant_id}/${incident.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("medical-files")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      await recordFn({
        data: {
          incident_id: incident.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        },
      });
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["medical-attachments", incident.id] });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function download(p: string) {
    try {
      const { url } = await urlFn({ data: { storage_path: p } });
      window.open(url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate link");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this attachment?")) return;
    try {
      await delFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["medical-attachments", incident.id] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <div className="mt-2 rounded border bg-muted/30 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5" /> Attachments ({items.length})
        </div>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1 h-3.5 w-3.5" /> {busy ? "Uploading…" : "Upload"}
        </Button>
        <input ref={fileRef} type="file" className="hidden" onChange={upload} />
      </div>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((a: any) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded bg-card px-2 py-1 text-xs">
              <span className="truncate" title={a.file_name}>{a.file_name}</span>
              <span className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => download(a.storage_path)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
