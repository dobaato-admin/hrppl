import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Plus, Download, History } from "lucide-react";
import { toast } from "sonner";
import { listCommsRemoval, updateCommsRemoval, addCustomCommsChannel, exportCommsRemovalCsv, listCommsAudit } from "@/lib/offboarding-comms.functions";
import { validateEvidenceUrlClient, EVIDENCE_ALLOWED_EXTENSIONS, EVIDENCE_MAX_BYTES } from "@/lib/evidence-validation";

function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CommsRemovalPanel({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const fList = useServerFn(listCommsRemoval);
  const fUpdate = useServerFn(updateCommsRemoval);
  const fAdd = useServerFn(addCustomCommsChannel);
  const fExport = useServerFn(exportCommsRemovalCsv);
  const fAudit = useServerFn(listCommsAudit);
  const q = useQuery({ queryKey: ["comms-removal", caseId], queryFn: () => fList({ data: { caseId } }) });
  const [showAudit, setShowAudit] = useState(false);
  const [auditFilters, setAuditFilters] = useState<{ channel?: string; actorSearch?: string; startDate?: string; endDate?: string; includeArchive?: boolean }>({});
  const audit = useQuery({ queryKey: ["comms-audit", caseId, auditFilters], queryFn: () => fAudit({ data: { caseId, ...auditFilters } }), enabled: showAudit });

  const upd = useMutation({
    mutationFn: (v: any) => fUpdate({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["comms-removal", caseId] }); qc.invalidateQueries({ queryKey: ["comms-audit", caseId] }); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const [newCh, setNewCh] = useState({ channel: "", label: "" });
  const addM = useMutation({
    mutationFn: () => fAdd({ data: { caseId, channel: newCh.channel, label: newCh.label } }),
    onSuccess: () => { setNewCh({ channel: "", label: "" }); qc.invalidateQueries({ queryKey: ["comms-removal", caseId] }); toast.success("Channel added"); },
    onError: (e: any) => toast.error(e?.message ?? "Add failed"),
  });

  const exportM = useMutation({
    mutationFn: (scope: "all" | "gaps") => fExport({ data: { scope, caseId } }),
    onSuccess: (res, scope) => { downloadCsv(`comms-removal-${scope}-${caseId.slice(0,8)}.csv`, res.csv); toast.success(`Exported ${res.rowCount} rows`); },
    onError: (e: any) => toast.error(e?.message ?? "Export failed"),
  });

  const rows = (q.data?.rows ?? []) as any[];
  const complete = q.data?.complete;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle className="text-sm">Communication channel removal &amp; attestation</CardTitle>
          <CardDescription>Verify the staff member has been removed from every channel before closing the case.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {complete
            ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" />All verified</Badge>
            : <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />{q.data?.verified ?? 0}/{q.data?.total ?? 0} verified</Badge>}
          <Button size="sm" variant="outline" onClick={() => exportM.mutate("all")} disabled={exportM.isPending}>
            <Download className="h-3 w-3 mr-1" />All
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportM.mutate("gaps")} disabled={exportM.isPending}>
            <Download className="h-3 w-3 mr-1" />Gaps
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAudit((v) => !v)}>
            <History className="h-3 w-3 mr-1" />Audit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {q.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {rows.map((r) => (
          <div key={r.id} className="border rounded-md p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`rm-${r.id}`} checked={r.removed}
                  onCheckedChange={(v) => upd.mutate({ id: r.id, removed: !!v, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes })}
                />
                <div>
                  <Label htmlFor={`rm-${r.id}`} className="font-medium text-sm">{r.channel_label}</Label>
                  {r.is_mandatory && <span className="ml-2 text-[10px] uppercase text-muted-foreground">required</span>}
                  {r.attested_at && <div className="text-xs text-emerald-700">Attested {new Date(r.attested_at).toLocaleString()} by {r.attestation_signature}</div>}
                  {r.last_reminder_at && <div className="text-[11px] text-muted-foreground">Last reminder {new Date(r.last_reminder_at).toLocaleDateString()} · sent {r.reminder_count ?? 0}×</div>}
                </div>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-3 pl-6">
              <div>
                <Label className="text-[11px]">Due date</Label>
                <Input type="date" defaultValue={r.due_date ?? ""}
                  onBlur={(e) => { const v = e.target.value || null; if (v !== (r.due_date ?? null)) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, due_date: v }); }} />
              </div>
              <div>
                <Label className="text-[11px]">Remind every (days)</Label>
                <Input type="number" min={1} max={30} defaultValue={r.reminder_interval_days ?? 1}
                  onBlur={(e) => { const v = Number(e.target.value); if (v && v !== r.reminder_interval_days) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, reminder_interval_days: v }); }} />
              </div>
              <div>
                <Label className="text-[11px]">Escalate after (days)</Label>
                <Input type="number" min={1} max={60} defaultValue={r.escalate_after_days ?? 3}
                  onBlur={(e) => { const v = Number(e.target.value); if (v && v !== r.escalate_after_days) upd.mutate({ id: r.id, removed: r.removed, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: r.notes, escalate_after_days: v }); }} />
              </div>
            </div>
            {r.removed && (
              <div className="grid gap-2 md:grid-cols-2 pl-6">
                <div>
                  <Label className="text-xs">Evidence URL (screenshot, audit log link)</Label>
                  <EvidenceUrlInput
                    initialValue={r.evidence_url ?? ""}
                    onCommit={(v) => upd.mutate({ id: r.id, removed: true, evidence_url: v || null, attestation_signature: r.attestation_signature, notes: r.notes })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Attestation signature (type your name)</Label>
                  <Input
                    defaultValue={r.attestation_signature ?? ""} placeholder="e.g. Jane Doe, IT Lead"
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== (r.attestation_signature ?? "")) upd.mutate({ id: r.id, removed: true, evidence_url: r.evidence_url, attestation_signature: v, notes: r.notes }); }}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Notes</Label>
                  <Input
                    defaultValue={r.notes ?? ""} placeholder="Optional: groups left, handover owner, etc."
                    onBlur={(e) => { const v = e.target.value.trim(); if (v !== (r.notes ?? "")) upd.mutate({ id: r.id, removed: true, evidence_url: r.evidence_url, attestation_signature: r.attestation_signature, notes: v || null }); }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="border-t pt-3">
          <div className="text-xs font-medium mb-1">Add custom channel</div>
          <div className="flex gap-2">
            <Input placeholder="key (e.g. notion)" value={newCh.channel} onChange={(e) => setNewCh((s) => ({ ...s, channel: e.target.value }))} />
            <Input placeholder="Label shown to verifiers" value={newCh.label} onChange={(e) => setNewCh((s) => ({ ...s, label: e.target.value }))} />
            <Button size="sm" variant="outline" onClick={() => addM.mutate()} disabled={!newCh.channel || !newCh.label || addM.isPending}>
              <Plus className="h-3 w-3 mr-1" />Add
            </Button>
          </div>
        </div>

        {showAudit && (
          <div className="border-t pt-3">
            <div className="text-xs font-medium mb-2">Immutable audit trail</div>
            <div className="grid gap-2 md:grid-cols-5 mb-2">
              <Input placeholder="Channel (slack…)" className="h-8 text-xs" value={auditFilters.channel ?? ""} onChange={(e) => setAuditFilters((s) => ({ ...s, channel: e.target.value || undefined }))} />
              <Input placeholder="Actor name/email" className="h-8 text-xs" value={auditFilters.actorSearch ?? ""} onChange={(e) => setAuditFilters((s) => ({ ...s, actorSearch: e.target.value || undefined }))} />
              <Input type="date" className="h-8 text-xs" value={auditFilters.startDate ?? ""} onChange={(e) => setAuditFilters((s) => ({ ...s, startDate: e.target.value || undefined }))} />
              <Input type="date" className="h-8 text-xs" value={auditFilters.endDate ?? ""} onChange={(e) => setAuditFilters((s) => ({ ...s, endDate: e.target.value || undefined }))} />
              <label className="flex items-center gap-1 text-[11px]">
                <Checkbox checked={!!auditFilters.includeArchive} onCheckedChange={(v) => setAuditFilters((s) => ({ ...s, includeArchive: !!v }))} />
                Include archive
              </label>
            </div>
            {audit.isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
            <div className="max-h-64 overflow-auto text-xs space-y-1">
              {(audit.data?.rows ?? []).map((r: any) => (
                <div key={r.id} className="flex justify-between gap-2 border-b py-1">
                  <div>
                    <span className="font-medium">{r.action}</span> · {r.channel}
                    <div className="text-[11px] text-muted-foreground">{r.actor_name ?? r.actor_email ?? "system"} · {new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground max-w-[50%] truncate" title={JSON.stringify(r.after)}>
                    {r.after?.evidence_url && <a href={r.after.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">evidence</a>}
                    {r.after?.attestation_signature && <span> · {r.after.attestation_signature}</span>}
                  </div>
                </div>
              ))}
              {!audit.isLoading && (audit.data?.rows ?? []).length === 0 && <div className="text-muted-foreground">No events match these filters.</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceUrlInput({ initialValue, onCommit }: { initialValue: string; onCommit: (v: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const validate = (v: string) => {
    const r = validateEvidenceUrlClient(v);
    setError(r.ok ? null : r.reason);
    return r.ok;
  };
  return (
    <div>
      <Input
        value={value}
        placeholder="https://… (PDF, PNG, JPG, DOCX — max 10 MB)"
        onChange={(e) => { setValue(e.target.value); if (error) validate(e.target.value); }}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v === initialValue) return;
          if (!validate(v)) { toast.error(error ?? "Invalid evidence link"); return; }
          onCommit(v);
        }}
        aria-invalid={!!error}
        className={error ? "border-destructive" : ""}
      />
      {error && <div className="text-[11px] text-destructive mt-1">{error}</div>}
      {!error && (
        <div className="text-[10px] text-muted-foreground mt-1">
          Allowed file types: {EVIDENCE_ALLOWED_EXTENSIONS.join(", ")} · max {EVIDENCE_MAX_BYTES / 1024 / 1024} MB.
        </div>
      )}
    </div>
  );
}
