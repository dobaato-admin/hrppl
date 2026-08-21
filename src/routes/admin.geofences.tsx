import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listGeofences, upsertGeofence, deleteGeofence, distanceMeters } from "@/lib/geofences.functions";
import { listGeofenceAudit, logGeofenceEvent } from "@/lib/geofence-audit.functions";
import { listSimTraces, saveSimTrace, deleteSimTrace } from "@/lib/geofence-simulation.functions";
import { listReconciliation, resolveReconciliation, runReconciliation } from "@/lib/geofence-reconciliation.functions";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, MapPin, ShieldAlert, RefreshCw, Play, Square, Download, FileText, FlaskConical, ClipboardList } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";
import { GoogleMapPicker } from "@/components/maps/GoogleMapPicker";
import { DeviceLocationPicker } from "@/components/maps/DeviceLocationPicker";
import { TroubleshootButton } from "@/components/maps/GeofenceTroubleshootWizard";

const HAS_GMAPS_KEY = !!import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;

export const Route = createFileRoute("/admin/geofences")({
  head: () => ({ meta: [{ title: "Signing geofences — hrppl" }] }),
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><GeofencePage /></AdminGate>),
});

const blank = () => ({
  name: "", latitude: 0, longitude: 0, radius_meters: 150,
  is_active: true, notes: "",
  background_tracking_enabled: false, min_accuracy_meters: 100,
} as any);

function GeofencePage() {
  const list = useServerFn(listGeofences);
  const up = useServerFn(upsertGeofence);
  const del = useServerFn(deleteGeofence);
  const audit = useServerFn(logGeofenceEvent);
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(blank());

  async function refresh() { const r = await list(); setRows(r.geofences); }
  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!editing.name.trim()) return toast.error("Name required");
    if (!editing.latitude || !editing.longitude) return toast.error("Set a location");
    try {
      const isNew = !editing.id;
      const { geofence } = await up({ data: {
        ...editing,
        latitude: Number(editing.latitude),
        longitude: Number(editing.longitude),
        radius_meters: Number(editing.radius_meters),
        min_accuracy_meters: Number(editing.min_accuracy_meters) || 100,
        background_tracking_enabled: !!editing.background_tracking_enabled,
      }});
      audit({ data: {
        geofence_id: geofence?.id ?? null,
        action: isNew ? "create" : "update",
        source: "manual",
        latitude: Number(editing.latitude),
        longitude: Number(editing.longitude),
        metadata: { radius_meters: Number(editing.radius_meters), background: !!editing.background_tracking_enabled },
      }}).catch(() => {});
      toast.success("Saved");
      setOpen(false); setEditing(blank());
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(r: any) {
    await del({ data: { id: r.id } });
    audit({ data: { geofence_id: r.id, action: "delete", source: "manual" } }).catch(() => {});
    refresh();
  }

  return (
    <AppShell
      title="Signing geofences"
      subtitle="Hard-enforced locations for in-person e-signatures"
      actions={<Button onClick={() => { setEditing(blank()); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add geofence</Button>}
    >
      <div className="p-4 md:p-6 space-y-4 max-w-6xl">
        <Tabs defaultValue="fences">
          <TabsList>
            <TabsTrigger value="fences">Locations</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
            <TabsTrigger value="simulator"><FlaskConical className="h-3.5 w-3.5 mr-1" /> Simulator</TabsTrigger>
            <TabsTrigger value="reconciliation"><ClipboardList className="h-3.5 w-3.5 mr-1" /> Reconciliation</TabsTrigger>
          </TabsList>

          <TabsContent value="fences" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved signing locations</CardTitle>
                <CardDescription>When an envelope requires geofencing, signers must be within one of these circles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Name</TableHead><TableHead>Coordinates</TableHead><TableHead>Radius</TableHead>
                    <TableHead>Min accuracy</TableHead><TableHead>Background</TableHead>
                    <TableHead>Active</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No geofences yet</TableCell></TableRow>}
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{r.name}</TableCell>
                        <TableCell className="font-mono text-xs">{Number(r.latitude).toFixed(5)}, {Number(r.longitude).toFixed(5)}</TableCell>
                        <TableCell>{r.radius_meters}m</TableCell>
                        <TableCell>±{r.min_accuracy_meters ?? 100}m</TableCell>
                        <TableCell>{r.background_tracking_enabled ? <Badge>On</Badge> : <span className="text-xs text-muted-foreground">Off</span>}</TableCell>
                        <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing({
                            ...r, notes: r.notes ?? "",
                            min_accuracy_meters: r.min_accuracy_meters ?? 100,
                            background_tracking_enabled: !!r.background_tracking_enabled,
                          }); setOpen(true); }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="pt-4">
            <AuditPanel geofences={rows} />
          </TabsContent>

          <TabsContent value="simulator" className="pt-4">
            <SimulatorPanel geofences={rows} />
          </TabsContent>

          <TabsContent value="reconciliation" className="pt-4">
            <ReconciliationPanel geofences={rows} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? "Edit geofence" : "New geofence"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Sydney HQ" />
            </div>

            {(() => {
              const pickerValue = { lat: Number(editing.latitude) || 0, lng: Number(editing.longitude) || 0 };
              const pickerRadius = Number(editing.radius_meters) || 150;
              const onPick = (n: { lat: number; lng: number; radiusMeters: number }) =>
                setEditing((e: any) => ({
                  ...e,
                  latitude: Number(n.lat.toFixed(6)),
                  longitude: Number(n.lng.toFixed(6)),
                  radius_meters: n.radiusMeters,
                }));
              return (
                <Tabs defaultValue={HAS_GMAPS_KEY ? "map" : "device"}>
                  <TabsList>
                    <TabsTrigger value="device">Device location (free)</TabsTrigger>
                    <TabsTrigger value="map" disabled={!HAS_GMAPS_KEY}>Map picker</TabsTrigger>
                  </TabsList>
                  <TabsContent value="device" className="pt-2">
                    <DeviceLocationPicker
                      value={pickerValue} radiusMeters={pickerRadius} onChange={onPick}
                      geofenceId={editing.id ?? null}
                      minAccuracyMeters={Number(editing.min_accuracy_meters) || 100}
                    />
                  </TabsContent>
                  <TabsContent value="map" className="pt-2">
                    {HAS_GMAPS_KEY && (
                      <GoogleMapPicker value={pickerValue} radiusMeters={pickerRadius} onChange={onPick} />
                    )}
                  </TabsContent>
                </Tabs>
              );
            })()}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Minimum GPS accuracy (m)</Label>
                <Input type="number" min={5} max={2000}
                  value={editing.min_accuracy_meters ?? 100}
                  onChange={(e) => setEditing({ ...editing, min_accuracy_meters: Number(e.target.value) || 100 })} />
                <p className="text-[11px] text-muted-foreground mt-1">Captures worse than this are flagged in the audit log.</p>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    checked={!!editing.background_tracking_enabled}
                    onCheckedChange={(v) => setEditing({ ...editing, background_tracking_enabled: !!v })}
                  />
                  <div className="flex-1">
                    <Label className="text-xs">Background tracking</Label>
                    <p className="text-[11px] text-muted-foreground">Keeps watching while the tab/PWA stays open.</p>
                  </div>
                  {!!editing.background_tracking_enabled && <TroubleshootButton />}
                </div>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: !!v })} /> Active
            </label>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ----------------------------- Audit panel ----------------------------- */

function csvCell(v: any) {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

function AuditPanel({ geofences }: { geofences: any[] }) {
  const list = useServerFn(listGeofenceAudit);
  const [rows, setRows] = useState<any[]>([]);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [geofenceId, setGeofenceId] = useState<string>("all");
  const [actor, setActor] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const r = await list({ data: {
        limit: 500,
        suspicious_only: suspiciousOnly || undefined,
        geofence_id: geofenceId !== "all" ? geofenceId : undefined,
        actor_user_id: /^[0-9a-f-]{36}$/i.test(actor) ? actor : undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      } });
      setRows(r.rows);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [suspiciousOnly, geofenceId]);

  function exportCsv() {
    const headers = ["created_at","action","source","geofence_id","actor_user_id","latitude","longitude","accuracy_m","is_suspicious","suspicious_reason"];
    const lines = [headers.join(",")].concat(rows.map((r) =>
      headers.map((h) => csvCell((r as any)[h])).join(",")));
    downloadBlob(`geofence-audit-${Date.now()}.csv`, lines.join("\n"), "text/csv");
  }

  function exportPdf() {
    const w = window.open("", "_blank");
    if (!w) return toast.error("Pop-up blocked");
    const css = `body{font:12px system-ui;margin:24px;color:#111}h1{font-size:16px;margin:0 0 12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:4px 6px;text-align:left;font-size:11px}th{background:#f3f3f3}tr.sus{background:#fff5f5}`;
    const fname = geofences.find((g) => g.id === geofenceId)?.name ?? "All geofences";
    const html = `<!doctype html><html><head><title>Geofence audit</title><style>${css}</style></head><body>
      <h1>Geofence audit log — ${fname}</h1>
      <p>Generated ${new Date().toLocaleString()} · ${rows.length} rows · Filters: ${suspiciousOnly ? "suspicious only · " : ""}${from || "—"} → ${to || "—"}</p>
      <table><thead><tr><th>When</th><th>Action</th><th>Source</th><th>Coords</th><th>Acc</th><th>Actor</th><th>Flag</th></tr></thead>
      <tbody>${rows.map((r) => `<tr class="${r.is_suspicious ? "sus" : ""}">
        <td>${new Date(r.created_at).toLocaleString()}</td><td>${r.action}</td><td>${r.source ?? ""}</td>
        <td>${r.latitude != null ? Number(r.latitude).toFixed(5)+", "+Number(r.longitude).toFixed(5) : ""}</td>
        <td>${r.accuracy_m != null ? "±"+Math.round(r.accuracy_m)+"m" : ""}</td>
        <td>${(r.actor_user_id ?? "").slice(0,8)}</td>
        <td>${r.is_suspicious ? (r.suspicious_reason ?? "Flagged") : ""}</td>
      </tr>`).join("")}</tbody></table>
      <script>window.onload=()=>setTimeout(()=>window.print(),200)</script></body></html>`;
    w.document.write(html); w.document.close();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geofence audit log</CardTitle>
        <CardDescription>Every capture, manual edit, permission event, and suspicious flag.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs">Geofence</Label>
            <Select value={geofenceId} onValueChange={setGeofenceId}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {geofences.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Actor (user id)</Label>
            <Input className="h-9 w-[280px] font-mono text-xs" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="uuid" />
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="datetime-local" className="h-9" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="datetime-local" className="h-9" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={suspiciousOnly} onCheckedChange={(v) => setSuspiciousOnly(!!v)} /> Suspicious only
          </label>
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Apply
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportPdf}>
            <FileText className="h-3.5 w-3.5 mr-1" /> PDF
          </Button>
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>When</TableHead><TableHead>Action</TableHead>
            <TableHead>Source</TableHead><TableHead>Coords</TableHead>
            <TableHead>Accuracy</TableHead><TableHead>Actor</TableHead>
            <TableHead>Flag</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No events</TableCell></TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id} className={r.is_suspicious ? "bg-status-stuck/5" : ""}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-xs font-medium">{r.action}</TableCell>
                <TableCell className="text-xs">{r.source ?? "—"}</TableCell>
                <TableCell className="font-mono text-[11px]">
                  {r.latitude != null ? `${Number(r.latitude).toFixed(5)}, ${Number(r.longitude).toFixed(5)}` : "—"}
                </TableCell>
                <TableCell className="text-xs">{r.accuracy_m != null ? `±${Math.round(r.accuracy_m)}m` : "—"}</TableCell>
                <TableCell className="text-[11px] font-mono">{r.actor_user_id?.slice(0, 8) ?? "—"}</TableCell>
                <TableCell>
                  {r.is_suspicious && (
                    <span className="flex items-center gap-1 text-xs text-status-stuck">
                      <ShieldAlert className="h-3.5 w-3.5" /> {r.suspicious_reason ?? "Flagged"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- Simulator ----------------------------- */

function SimulatorPanel({ geofences }: { geofences: any[] }) {
  const list = useServerFn(listSimTraces);
  const save = useServerFn(saveSimTrace);
  const del = useServerFn(deleteSimTrace);
  const audit = useServerFn(logGeofenceEvent);
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<string>("");
  const [fenceId, setFenceId] = useState<string>(geofences[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "", pointsText: "" });

  async function refresh() { setTraces((await list()).traces); }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (!fenceId && geofences[0]) setFenceId(geofences[0].id); }, [geofences, fenceId]);

  const fence = useMemo(() => geofences.find((g) => g.id === fenceId), [geofences, fenceId]);
  const trace = useMemo(() => traces.find((t) => t.id === selectedTrace), [traces, selectedTrace]);

  async function saveTrace() {
    try {
      const points = draft.pointsText.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        const [lat, lng, acc] = l.split(/[,\s]+/).map(Number);
        return { lat, lng, accuracy_m: acc || 20, t_offset_ms: 0 };
      });
      if (!points.length) return toast.error("Add at least one point");
      await save({ data: { name: draft.name || "Untitled trace", description: draft.description, points } });
      toast.success("Trace saved");
      setOpen(false); setDraft({ name: "", description: "", pointsText: "" });
      refresh();
    } catch (e: any) { toast.error(e.message); }
  }

  async function runSim() {
    if (!fence || !trace) return toast.error("Pick a geofence and trace");
    setRunning(true); setLog([]);
    let inside = false;
    audit({ data: { geofence_id: fence.id, action: "simulation_run", source: "simulation", metadata: { trace_id: trace.id, points: trace.points.length } } }).catch(() => {});
    for (let i = 0; i < trace.points.length; i++) {
      const p = trace.points[i];
      const dist = distanceMeters(p.lat, p.lng, Number(fence.latitude), Number(fence.longitude));
      const wasInside = inside;
      inside = dist <= Number(fence.radius_meters);
      const event = !wasInside && inside ? "ENTER" : wasInside && !inside ? "EXIT" : "—";
      const flagged = p.accuracy_m && p.accuracy_m > (fence.min_accuracy_meters ?? 100);
      setLog((l) => [...l, `#${i + 1} d=${Math.round(dist)}m acc=±${p.accuracy_m ?? "?"}m ${event}${flagged ? " ⚠ low-acc" : ""}`]);
      audit({ data: {
        geofence_id: fence.id, action: "simulation_point", source: "simulation",
        latitude: p.lat, longitude: p.lng, accuracy_m: p.accuracy_m,
        is_suspicious: !!flagged,
        suspicious_reason: flagged ? "Simulated low-accuracy fix" : null,
        metadata: { event, distance_m: Math.round(dist), index: i },
      } }).catch(() => {});
      await new Promise((r) => setTimeout(r, 150));
    }
    setRunning(false);
    toast.success(`Simulation complete (${trace.points.length} points)`);
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stored traces</CardTitle>
            <CardDescription>Replay these against a fence — your real GPS is untouched.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> New trace</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Points</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {traces.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No saved traces</TableCell></TableRow>}
              {traces.map((t) => (
                <TableRow key={t.id} className={selectedTrace === t.id ? "bg-muted/50" : ""}>
                  <TableCell className="cursor-pointer" onClick={() => setSelectedTrace(t.id)}>{t.name}</TableCell>
                  <TableCell>{t.points?.length ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedTrace(t.id)}>Pick</Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await del({ data: { id: t.id } }); refresh(); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run simulation</CardTitle>
          <CardDescription>Drive enter/exit logic against any fence, with audit entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Geofence</Label>
              <Select value={fenceId} onValueChange={setFenceId}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Pick fence" /></SelectTrigger>
                <SelectContent>
                  {geofences.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Trace</Label>
              <Select value={selectedTrace} onValueChange={setSelectedTrace}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Pick trace" /></SelectTrigger>
                <SelectContent>
                  {traces.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={runSim} disabled={running || !fence || !trace}>
              {running ? <Square className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
              {running ? "Running…" : "Run"}
            </Button>
          </div>
          <div className="rounded border bg-muted/30 p-3 font-mono text-[11px] min-h-[160px] max-h-[280px] overflow-auto">
            {log.length === 0 ? <span className="text-muted-foreground">No output yet</span> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New simulation trace</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div>
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div>
              <Label>Points (one per line: <code>lat, lng, accuracy_m</code>)</Label>
              <Textarea rows={8} className="font-mono text-xs"
                placeholder="-33.8688, 151.2093, 15&#10;-33.8690, 151.2095, 18"
                value={draft.pointsText} onChange={(e) => setDraft({ ...draft, pointsText: e.target.value })} />
            </div>
          </div>
          <DialogFooter><Button onClick={saveTrace}>Save trace</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------------------- Reconciliation ----------------------------- */

function ReconciliationPanel({ geofences }: { geofences: any[] }) {
  const list = useServerFn(listReconciliation);
  const resolve = useServerFn(resolveReconciliation);
  const run = useServerFn(runReconciliation);
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<"open" | "reviewed" | "resolved" | "dismissed" | "all">("open");
  const [busy, setBusy] = useState(false);

  const fenceName = (id?: string | null) => geofences.find((g) => g.id === id)?.name ?? "—";

  async function refresh() {
    setRows((await list({ data: { status } })).rows);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [status]);

  async function runJob() {
    setBusy(true);
    try {
      const r = await run({ data: { lookback_hours: 72 } });
      toast.success(`Scanned ${r.scanned}, created ${r.created}`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function act(id: string, st: "reviewed" | "resolved" | "dismissed") {
    await resolve({ data: { id, status: st } });
    refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Geofence reconciliation</CardTitle>
          <CardDescription>Mismatches between geofence captures and attendance punches.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["open","reviewed","resolved","dismissed","all"].map((s) =>
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={runJob} disabled={busy}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${busy ? "animate-spin" : ""}`} /> Run now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>When</TableHead><TableHead>Type</TableHead><TableHead>Geofence</TableHead>
            <TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nothing in queue</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(r.event_time).toLocaleString()}</TableCell>
                <TableCell className="text-xs font-medium">{r.mismatch_type}</TableCell>
                <TableCell className="text-xs">{fenceName(r.geofence_id)}</TableCell>
                <TableCell className="text-[11px] font-mono">{JSON.stringify(r.details ?? {})}</TableCell>
                <TableCell><Badge variant={r.status === "open" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  {r.status === "open" && <>
                    <Button size="sm" variant="ghost" onClick={() => act(r.id, "reviewed")}>Review</Button>
                    <Button size="sm" variant="ghost" onClick={() => act(r.id, "resolved")}>Resolve</Button>
                    <Button size="sm" variant="ghost" onClick={() => act(r.id, "dismissed")}>Dismiss</Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
