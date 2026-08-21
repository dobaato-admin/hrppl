import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createReviewCycle, activateReviewCycle, closeReviewCycle, submitManagerReview, updateReviewCycleTemplate, calibrateReview, getCycleProgress, getReviewAuditTrail, updateReviewCycleReminders, previewReviewReminderSchedule } from "@/lib/performance.functions";
import { sendFeedbackReminders, getFeedback360Analytics, getFeedback360AuditTrail } from "@/lib/feedback360.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/org/performance")({
  head: () => ({ meta: [{ title: "Performance — WorldPay HRMS" }] }),
  component: OrgPerformance,
});

interface Cycle { id: string; name: string; status: string; period_start: string; period_end: string; template_id: string | null; template_version: number | null; reminders_enabled?: boolean; reminder_interval_days?: number; reminder_start_offset_days?: number; reminder_business_days_only?: boolean; reminder_max_count?: number | null }
interface Review { id: string; employee_id: string; cycle_id: string; self_rating: number | null; manager_rating: number | null; self_comments: string | null; manager_comments: string | null; status: string; calibrated_rating: number | null; calibration_notes: string | null; acknowledged_at: string | null; acknowledgment_comments: string | null; template_id: string | null; self_responses: any; manager_responses: any }
interface Emp { id: string; first_name: string; last_name: string; employee_number: string; manager_id: string | null }
interface ReviewTemplate { id: string; name: string; scale_min: number; scale_max: number; scale_labels: string[]; competencies: { id: string; label: string; description?: string; type: "rating" | "text"; required: boolean }[]; is_default: boolean }

function OrgPerformance() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emps, setEmps] = useState<Record<string, Emp>>({});
  const [busy, setBusy] = useState(false);
  const [openCycle, setOpenCycle] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: "", periodStart: "", periodEnd: "", templateId: "" });
  const [editing, setEditing] = useState<Review | null>(null);
  const [mRating, setMRating] = useState(3);
  const [mComments, setMComments] = useState("");
  const [mResponses, setMResponses] = useState<Record<string, { rating?: number; text?: string }>>({});
  const [calRating, setCalRating] = useState<string>("");
  const [calNotes, setCalNotes] = useState("");
  const [editingFeedback, setEditingFeedback] = useState<{ id: string; kind: string; text: string; author_id: string; avg_rating: number | null; responses: any }[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [reviewTemplates, setReviewTemplates] = useState<ReviewTemplate[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [reviewAudit, setReviewAudit] = useState<any[]>([]);

  const fnCreate = useServerFn(createReviewCycle);
  const fnActivate = useServerFn(activateReviewCycle);
  const fnClose = useServerFn(closeReviewCycle);
  const fnSubmitMgr = useServerFn(submitManagerReview);
  const fnReminders = useServerFn(sendFeedbackReminders);
  const fnAnalytics = useServerFn(getFeedback360Analytics);
  const fnAudit = useServerFn(getFeedback360AuditTrail);
  const fnUpdateCycleTpl = useServerFn(updateReviewCycleTemplate);
  const fnCalibrate = useServerFn(calibrateReview);
  const fnProgress = useServerFn(getCycleProgress);
  const fnReviewAudit = useServerFn(getReviewAuditTrail);
  const fnUpdateReminders = useServerFn(updateReviewCycleReminders);
  const fnPreviewSchedule = useServerFn(previewReviewReminderSchedule);

  const canAccess = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (data?.tenant_id) setTenantId(data.tenant_id);
    })();
  }, [user]);

  async function load() {
    if (!tenantId) return;
    const [cRes, eRes, tRes] = await Promise.all([
      supabase.from("review_cycles").select("*").eq("tenant_id", tenantId).order("period_start", { ascending: false }),
      supabase.from("employees").select("id,first_name,last_name,employee_number,manager_id").eq("tenant_id", tenantId),
      supabase.from("review_templates" as any).select("*").eq("tenant_id", tenantId).eq("is_current", true),
    ]);
    const cs = (cRes.data ?? []) as unknown as Cycle[];
    setCycles(cs);
    if (!activeCycle && cs.length) setActiveCycle(cs.find((c) => c.status === "active")?.id ?? cs[0].id);
    const m: Record<string, Emp> = {};
    (eRes.data ?? []).forEach((e: any) => { m[e.id] = e; });
    setEmps(m);
    setReviewTemplates(((tRes.data ?? []) as unknown) as ReviewTemplate[]);
  }
  useEffect(() => { load(); }, [tenantId]);

  useEffect(() => {
    if (!activeCycle) { setReviews([]); setProgress(null); setReviewAudit([]); return; }
    supabase.from("performance_reviews").select("*").eq("cycle_id", activeCycle).then(({ data }) => setReviews(((data ?? []) as unknown) as Review[]));
    fnProgress({ data: { cycleId: activeCycle } }).then(setProgress).catch(() => setProgress(null));
    fnReviewAudit({ data: { cycleId: activeCycle, limit: 100 } }).then((r) => setReviewAudit(r.entries ?? [])).catch(() => setReviewAudit([]));
  }, [activeCycle, busy]);

  async function createCycle() {
    setBusy(true);
    try {
      await fnCreate({ data: { name: newCycle.name, periodStart: newCycle.periodStart, periodEnd: newCycle.periodEnd } });
      toast.success("Cycle created");
      // If a template was selected, attach it to the newly created cycle (find it by name)
      if (newCycle.templateId && tenantId) {
        const { data: created } = await supabase.from("review_cycles").select("id").eq("tenant_id", tenantId).eq("name", newCycle.name).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (created?.id) await fnUpdateCycleTpl({ data: { cycleId: created.id, templateId: newCycle.templateId } });
      }
      setOpenCycle(false);
      setNewCycle({ name: "", periodStart: "", periodEnd: "", templateId: "" });
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function setCycleTemplate(cycleId: string, templateId: string | null) {
    setBusy(true);
    try { await fnUpdateCycleTpl({ data: { cycleId, templateId } }); toast.success("Template updated"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function activate(id: string) {
    setBusy(true);
    try { await fnActivate({ data: { cycleId: id } }); toast.success("Activated"); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function close(id: string) {
    setBusy(true);
    try { await fnClose({ data: { cycleId: id } }); toast.success("Closed"); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  const [remindersFor, setRemindersFor] = useState<Cycle | null>(null);
  const [remForm, setRemForm] = useState({ enabled: true, intervalDays: 3, startOffsetDays: 0, businessDaysOnly: false, maxCount: "" });
  const [previewHorizon, setPreviewHorizon] = useState<30 | 60>(30);
  const [preview, setPreview] = useState<{ countryCode: string | null; days: { date: string; status: string; reason?: string }[]; scheduledCount: number } | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  function openReminders(c: Cycle) {
    setRemindersFor(c);
    setRemForm({
      enabled: c.reminders_enabled ?? true,
      intervalDays: c.reminder_interval_days ?? 3,
      startOffsetDays: c.reminder_start_offset_days ?? 0,
      businessDaysOnly: c.reminder_business_days_only ?? false,
      maxCount: c.reminder_max_count != null ? String(c.reminder_max_count) : "",
    });
    setPreview(null);
  }
  useEffect(() => {
    if (!remindersFor) return;
    const maxCountNum = remForm.maxCount.trim() === "" ? null : Math.max(1, Math.min(50, parseInt(remForm.maxCount, 10) || 1));
    setPreviewBusy(true);
    const t = setTimeout(() => {
      fnPreviewSchedule({ data: {
        cycleId: remindersFor.id,
        horizonDays: previewHorizon,
        overrides: {
          remindersEnabled: remForm.enabled,
          intervalDays: Math.max(1, Math.min(60, remForm.intervalDays)),
          startOffsetDays: Math.max(0, Math.min(365, remForm.startOffsetDays)),
          businessDaysOnly: remForm.businessDaysOnly,
          maxCount: maxCountNum,
        },
      } })
        .then((r: any) => setPreview(r))
        .catch(() => setPreview(null))
        .finally(() => setPreviewBusy(false));
    }, 250);
    return () => clearTimeout(t);
  }, [remindersFor, remForm, previewHorizon, fnPreviewSchedule]);
  async function saveReminders() {
    if (!remindersFor) return;
    setBusy(true);
    try {
      const maxCountNum = remForm.maxCount.trim() === "" ? null : Math.max(1, Math.min(50, parseInt(remForm.maxCount, 10) || 1));
      await fnUpdateReminders({ data: {
        cycleId: remindersFor.id,
        remindersEnabled: remForm.enabled,
        intervalDays: Math.max(1, Math.min(60, remForm.intervalDays)),
        startOffsetDays: Math.max(0, Math.min(365, remForm.startOffsetDays)),
        businessDaysOnly: remForm.businessDaysOnly,
        maxCount: maxCountNum,
      } });
      toast.success("Reminder settings saved");
      setRemindersFor(null);
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function saveMgr(finalize: boolean) {
    if (!editing) return;
    setBusy(true);
    try {
      const tpl = reviewTemplates.find((t) => t.id === editing.template_id);
      const responses = tpl ? tpl.competencies.map((c) => ({
        questionId: c.id, rating: mResponses[c.id]?.rating ?? null, text: mResponses[c.id]?.text ?? null,
      })) : undefined;
      await fnSubmitMgr({ data: { reviewId: editing.id, managerRating: mRating, managerComments: mComments, finalize, responses } });
      toast.success(finalize ? "Finalized" : "Saved");
      setEditing(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function saveCalibration() {
    if (!editing) return;
    setBusy(true);
    try {
      const v = calRating.trim() === "" ? null : Number(calRating);
      await fnCalibrate({ data: { reviewId: editing.id, calibratedRating: v, notes: calNotes || undefined } });
      toast.success("Calibration saved");
      setEditing(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function loadAnalytics() {
    setBusy(true);
    try {
      const [a, t] = await Promise.all([
        fnAnalytics({ data: { cycleId: activeCycle || undefined } }),
        fnAudit({ data: { limit: 100 } }),
      ]);
      setAnalytics(a);
      setAuditTrail(t.entries ?? []);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function runReminders() {
    setBusy(true);
    try {
      const res = await fnReminders();
      toast.success(`Sent ${res.reminded} reminder${res.reminded === 1 ? "" : "s"}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!canAccess) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Forbidden.</main>;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Performance</h1>
            <p className="text-xs text-muted-foreground">Manage cycles and finalize reviews.</p>
          </div>
          <Link to="/org"><Button variant="outline" size="sm">Back</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <Tabs defaultValue="cycles">
          <TabsList>
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="feedback360" onClick={() => { if (!analytics) loadAnalytics(); }}>360° Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="cycles">
            <CycleFiltersAndTable
              cycles={cycles}
              reviewTemplates={reviewTemplates}
              isAdmin={isAdmin}
              busy={busy}
              openCycle={openCycle}
              setOpenCycle={setOpenCycle}
              newCycle={newCycle}
              setNewCycle={setNewCycle}
              createCycle={createCycle}
              setCycleTemplate={setCycleTemplate}
              activate={activate}
              close={close}
              openReminders={openReminders}
            />


            <Dialog open={!!remindersFor} onOpenChange={(o) => { if (!o) setRemindersFor(null); }}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

                <DialogHeader><DialogTitle>Reminder cadence — {remindersFor?.name}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable reminders</Label>
                      <p className="text-xs text-muted-foreground">Pauses all email and in-app nudges for this cycle when off.</p>
                    </div>
                    <input type="checkbox" checked={remForm.enabled} onChange={(e) => setRemForm({ ...remForm, enabled: e.target.checked })} className="h-4 w-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Interval (days)</Label>
                      <Input type="number" min={1} max={60} value={remForm.intervalDays} onChange={(e) => setRemForm({ ...remForm, intervalDays: parseInt(e.target.value, 10) || 1 })} />
                      <p className="text-xs text-muted-foreground mt-1">Minimum days between nudges per review.</p>
                    </div>
                    <div>
                      <Label className="text-sm">Start offset (T+N days)</Label>
                      <Input type="number" min={0} max={365} value={remForm.startOffsetDays} onChange={(e) => setRemForm({ ...remForm, startOffsetDays: parseInt(e.target.value, 10) || 0 })} />
                      <p className="text-xs text-muted-foreground mt-1">Days after cycle start before reminders begin.</p>
                    </div>
                    <div className="flex items-center justify-between col-span-2">
                      <div>
                        <Label className="text-sm">Business days only</Label>
                        <p className="text-xs text-muted-foreground">Skip Saturdays and Sundays (UTC).</p>
                      </div>
                      <input type="checkbox" checked={remForm.businessDaysOnly} onChange={(e) => setRemForm({ ...remForm, businessDaysOnly: e.target.checked })} className="h-4 w-4" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm">Max reminders per review</Label>
                      <Input type="number" min={1} max={50} placeholder="No limit" value={remForm.maxCount} onChange={(e) => setRemForm({ ...remForm, maxCount: e.target.value })} />
                      <p className="text-xs text-muted-foreground mt-1">Leave blank for unlimited.</p>
                  </div>

                  <div className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Schedule preview</Label>
                        <p className="text-xs text-muted-foreground">
                          {preview?.countryCode
                            ? `Skips weekends + ${preview.countryCode} public holidays when business-days-only is on.`
                            : "Tenant has no country set — holidays cannot be applied."}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant={previewHorizon === 30 ? "default" : "outline"} onClick={() => setPreviewHorizon(30)}>30d</Button>
                        <Button size="sm" variant={previewHorizon === 60 ? "default" : "outline"} onClick={() => setPreviewHorizon(60)}>60d</Button>
                      </div>
                    </div>
                    {previewBusy && !preview ? (
                      <p className="text-xs text-muted-foreground">Computing…</p>
                    ) : preview ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {preview.scheduledCount} reminder day{preview.scheduledCount === 1 ? "" : "s"} would fire in the next {previewHorizon} days.
                        </p>
                        <div className="grid grid-cols-7 gap-1 text-[10px]">
                          {preview.days.map((d) => {
                            const dt = new Date(d.date + "T00:00:00Z");
                            const dom = dt.getUTCDate();
                            const cls =
                              d.status === "scheduled" ? "bg-primary text-primary-foreground"
                              : d.status === "weekend" ? "bg-muted text-muted-foreground"
                              : d.status === "holiday" ? "bg-destructive/15 text-destructive"
                              : d.status === "disabled" ? "bg-muted/50 text-muted-foreground line-through"
                              : d.status === "max-reached" ? "bg-muted/50 text-muted-foreground"
                              : "bg-background text-muted-foreground border-dashed";
                            const title = `${d.date} — ${d.status}${d.reason ? ` (${d.reason})` : ""}`;
                            return (
                              <div key={d.date} title={title}
                                className={`rounded border px-1 py-1 text-center ${cls}`}>
                                <div className="font-mono">{dom}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                          <LegendDot className="bg-primary" label="Scheduled" />
                          <LegendDot className="bg-muted" label="Weekend" />
                          <LegendDot className="bg-destructive/40" label="Holiday" />
                          <LegendDot className="bg-background border" label="Skipped (interval / before start)" />
                        </div>
                        {preview.days.some((d) => d.status === "holiday") && (
                          <div className="text-xs">
                            <div className="font-medium mb-1">Holidays in window</div>
                            <ul className="space-y-0.5 text-muted-foreground">
                              {preview.days.filter((d) => d.status === "holiday").map((d) => (
                                <li key={d.date}><span className="font-mono">{d.date}</span> — {d.reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No preview available.</p>
                    )}
                  </div>
                </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRemindersFor(null)}>Cancel</Button>
                  <Button onClick={saveReminders} disabled={busy}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>




          <TabsContent value="reviews" className="space-y-4">
            {progress && (
              <Card>
                <CardHeader><CardTitle className="text-base">Cycle progress</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-6">
                    <Stat label="Total" value={progress.total} />
                    <Stat label="Draft" value={progress.counts.draft} />
                    <Stat label="Self sub." value={progress.counts.self_submitted} />
                    <Stat label="Mgr sub." value={progress.counts.manager_submitted} />
                    <Stat label="Finalized" value={progress.counts.finalized} />
                    <Stat label="Acknowledged" value={progress.counts.acknowledged} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Stat label="Completion" value={`${progress.completionPct}%`} />
                    <Stat label="Avg final rating" value={progress.avgFinalRating == null ? "—" : progress.avgFinalRating} />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reviews</CardTitle>
                <CardDescription>
                  <select className="border rounded px-2 py-1 bg-background text-sm" value={activeCycle} onChange={(e) => setActiveCycle(e.target.value)}>
                    {cycles.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.status}</option>)}
                  </select>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Self</TableHead><TableHead>Manager</TableHead><TableHead>Calibrated</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {reviews.map((r) => {
                      const e = emps[r.employee_id];
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{e ? `${e.first_name} ${e.last_name}` : "—"}</div>
                            <div className="text-xs text-muted-foreground">{e?.employee_number}</div>
                          </TableCell>
                          <TableCell>{r.self_rating ?? "—"}</TableCell>
                          <TableCell>{r.manager_rating ?? "—"}</TableCell>
                          <TableCell>{r.calibrated_rating != null ? <Badge variant="secondary">{r.calibrated_rating}</Badge> : "—"}</TableCell>
                          <TableCell><Badge variant={r.status === "acknowledged" ? "default" : r.status === "finalized" ? "default" : "secondary"}>{r.status.replace("_", " ")}</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={async () => {
                              setEditing(r); setMRating(r.manager_rating ?? 3); setMComments(r.manager_comments ?? "");
                              setCalRating(r.calibrated_rating == null ? "" : String(r.calibrated_rating));
                              setCalNotes(r.calibration_notes ?? "");
                              const init: Record<string, { rating?: number; text?: string }> = {};
                              if (Array.isArray(r.manager_responses)) {
                                for (const x of r.manager_responses) init[x.questionId] = { rating: x.rating ?? undefined, text: x.text ?? undefined };
                              }
                              setMResponses(init);
                              const { data: fb } = await supabase.from("review_feedback").select("id,kind,text,author_id,avg_rating,responses").eq("review_id", r.id);
                              setEditingFeedback((fb ?? []) as any);
                            }}>Review</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reviews.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No reviews for this cycle.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {reviewAudit.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Review audit trail</CardTitle><CardDescription>Latest status changes and calibrations for this cycle.</CardDescription></CardHeader>
                <CardContent>
                  <div className="rounded-md border divide-y max-h-72 overflow-auto text-xs">
                    {reviewAudit.map((row) => {
                      const e = row.metadata?.employee_id ? emps[row.metadata.employee_id] : null;
                      return (
                        <div key={row.id} className="p-2 flex items-center gap-3">
                          <Badge variant="outline">{row.action.replace("review_", "")}</Badge>
                          <span className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
                          <span>{e ? `${e.first_name} ${e.last_name}` : ""}</span>
                          {row.metadata?.from && <span className="text-muted-foreground">{row.metadata.from} → {row.metadata.to}</span>}
                          {row.metadata?.before != null && <span className="text-muted-foreground">{row.metadata.before} → {row.metadata.after}</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="feedback360">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">360° feedback analytics</CardTitle>
                  <CardDescription>Response rates, ratings, and audit trail for this tenant.</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={loadAnalytics} disabled={busy}>Refresh</Button>
                  <Button size="sm" onClick={runReminders} disabled={busy}>Send reminders</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!analytics ? (
                  <p className="text-sm text-muted-foreground">Loading analytics…</p>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-5">
                      <Stat label="Requested" value={analytics.totals.requested} />
                      <Stat label="Submitted" value={analytics.totals.submitted} />
                      <Stat label="Pending" value={analytics.totals.pending} />
                      <Stat label="Overdue" value={analytics.totals.overdue} tone="warn" />
                      <Stat label="Declined" value={analytics.totals.declined} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Stat label="Response rate" value={analytics.responseRate == null ? "—" : `${Math.round(analytics.responseRate * 100)}%`} />
                      <Stat label="Avg rating" value={analytics.avgRating == null ? "—" : Number(analytics.avgRating).toFixed(2)} />
                      <Stat label="Peer / Upward" value={`${analytics.byKind.peer} / ${analytics.byKind.upward}`} />
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Per employee</div>
                      <Table>
                        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Submitted</TableHead><TableHead>Pending</TableHead><TableHead>Declined</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {analytics.perEmployee.map((row: any) => {
                            const e = emps[row.employeeId];
                            return (
                              <TableRow key={row.employeeId}>
                                <TableCell>{e ? `${e.first_name} ${e.last_name}` : row.employeeId.slice(0, 8)}</TableCell>
                                <TableCell>{row.submitted}</TableCell>
                                <TableCell>{row.pending}</TableCell>
                                <TableCell>{row.declined}</TableCell>
                              </TableRow>
                            );
                          })}
                          {analytics.perEmployee.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No feedback activity yet.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Audit trail (last 100 events)</div>
                      <div className="rounded-md border divide-y max-h-80 overflow-auto text-xs">
                        {auditTrail.length === 0 && <div className="p-3 text-muted-foreground">No events.</div>}
                        {auditTrail.map((row) => (
                          <div key={row.id} className="p-2 flex items-center gap-3">
                            <Badge variant="outline">{row.action.replace("feedback360_", "")}</Badge>
                            <span className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
                            <span className="truncate text-muted-foreground">{JSON.stringify(row.metadata)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Manager review</DialogTitle></DialogHeader>
          {editing && (() => {
            const tpl = reviewTemplates.find((t) => t.id === editing.template_id);
            const scaleMin = tpl?.scale_min ?? 1, scaleMax = tpl?.scale_max ?? 5;
            const finalized = editing.status === "finalized" || editing.status === "acknowledged";
            return (
              <div className="space-y-3 max-h-[70vh] overflow-auto">
                {editing.self_comments && (
                  <div>
                    <Label>Employee self-comments</Label>
                    <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">{editing.self_comments}</div>
                  </div>
                )}
                {tpl && Array.isArray(editing.self_responses) && editing.self_responses.length > 0 && (
                  <div>
                    <Label>Employee self-assessment</Label>
                    <div className="rounded-md bg-muted p-3 text-xs space-y-1">
                      {tpl.competencies.map((c) => {
                        const ans = (editing.self_responses as any[]).find((x) => x.questionId === c.id);
                        if (!ans) return null;
                        return (
                          <div key={c.id}><span className="text-muted-foreground">{c.label}:</span>{" "}
                            {ans.rating != null && <Badge variant="outline" className="mr-1">{ans.rating}</Badge>}
                            {ans.text && <span className="whitespace-pre-wrap">{ans.text}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tpl ? (
                  <div className="space-y-3 border-t pt-3">
                    <div className="text-sm font-medium">Competencies ({tpl.name})</div>
                    {tpl.competencies.map((c) => (
                      <div key={c.id} className="space-y-1">
                        <Label className="text-sm">{c.label}{c.required && <span className="text-destructive"> *</span>}</Label>
                        {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                        {c.type === "rating" ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i).map((n) => (
                              <Button key={n} size="sm" type="button" disabled={finalized}
                                variant={mResponses[c.id]?.rating === n ? "default" : "outline"}
                                onClick={() => setMResponses((s) => ({ ...s, [c.id]: { ...s[c.id], rating: n } }))}>{n}</Button>
                            ))}
                            {tpl.scale_labels?.length > 0 && <span className="text-xs text-muted-foreground ml-2">{tpl.scale_labels.join(" → ")}</span>}
                          </div>
                        ) : (
                          <Textarea rows={2} disabled={finalized} value={mResponses[c.id]?.text ?? ""} onChange={(e) => setMResponses((s) => ({ ...s, [c.id]: { ...s[c.id], text: e.target.value } }))} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div><Label>Overall manager rating ({scaleMin}–{scaleMax})</Label><Input type="number" min={scaleMin} max={scaleMax} disabled={finalized} value={mRating} onChange={(e) => setMRating(Number(e.target.value))} /></div>
                <div><Label>Manager comments</Label><Textarea rows={4} disabled={finalized} value={mComments} onChange={(e) => setMComments(e.target.value)} /></div>

                {isAdmin && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="text-sm font-medium">Calibration <span className="text-xs text-muted-foreground">(admin override)</span></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Calibrated rating</Label><Input type="number" step="0.1" min={scaleMin} max={scaleMax} value={calRating} onChange={(e) => setCalRating(e.target.value)} placeholder="empty = use manager rating" /></div>
                      <div className="flex items-end"><Button variant="outline" size="sm" onClick={saveCalibration} disabled={busy}>Save calibration</Button></div>
                    </div>
                    <div><Label>Calibration notes</Label><Textarea rows={2} value={calNotes} onChange={(e) => setCalNotes(e.target.value)} /></div>
                  </div>
                )}

                {editing.acknowledged_at && (
                  <div className="border-t pt-3">
                    <Label>Employee acknowledgement</Label>
                    <div className="text-xs text-muted-foreground">Acknowledged {new Date(editing.acknowledged_at).toLocaleString()}</div>
                    {editing.acknowledgment_comments && <div className="rounded-md bg-muted p-2 text-sm whitespace-pre-wrap mt-1">{editing.acknowledgment_comments}</div>}
                  </div>
                )}

                <div>
                  <Label>360° feedback ({editingFeedback.length})</Label>
                  {editingFeedback.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No peer or upward feedback submitted.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {editingFeedback.map((f) => (
                        <div key={f.id} className="rounded-md bg-muted p-2 text-sm">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="outline">{f.kind}</Badge>
                            {f.avg_rating != null && <Badge variant="secondary">Avg {Number(f.avg_rating).toFixed(1)}</Badge>}
                          </div>
                          {Array.isArray(f.responses) && f.responses.length > 0 ? (
                            <div className="space-y-1 text-xs">
                              {f.responses.map((r: any, i: number) => (
                                <div key={i}>
                                  <span className="text-muted-foreground">Q{i + 1}:</span>{" "}
                                  {r.rating != null && <Badge variant="outline" className="mr-1">{r.rating}</Badge>}
                                  {r.text && <span className="whitespace-pre-wrap">{r.text}</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{f.text}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            {editing && editing.status !== "finalized" && editing.status !== "acknowledged" && (
              <>
                <Button variant="outline" onClick={() => saveMgr(false)} disabled={busy}>Save draft</Button>
                <Button onClick={() => saveMgr(true)} disabled={busy}>Finalize</Button>
              </>
            )}
            {editing && (editing.status === "finalized" || editing.status === "acknowledged") && (
              <Button variant="outline" onClick={() => setEditing(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


function Stat({ label, value, tone }: { label: string; value: any; tone?: "warn" }) {
  return (
    <div className={`rounded-md border p-3 ${tone === "warn" ? "bg-destructive/10 border-destructive/30" : "bg-muted"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

function CycleFiltersAndTable({
  cycles, reviewTemplates, isAdmin, busy, openCycle, setOpenCycle, newCycle, setNewCycle,
  createCycle, setCycleTemplate, activate, close, openReminders,
}: {
  cycles: Cycle[];
  reviewTemplates: ReviewTemplate[];
  isAdmin: boolean;
  busy: boolean;
  openCycle: boolean;
  setOpenCycle: (v: boolean) => void;
  newCycle: { name: string; periodStart: string; periodEnd: string; templateId: string };
  setNewCycle: (v: any) => void;
  createCycle: () => void;
  setCycleTemplate: (id: string, tid: string | null) => void;
  activate: (id: string) => void;
  close: (id: string) => void;
  openReminders: (c: Cycle) => void;
}) {
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const filtered = useMemo(() => {
    return cycles.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (from && c.period_end < from) return false;
      if (to && c.period_start > to) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cycles, status, from, to, q]);

  const tiles = [
    { label: "Total", value: filtered.length, tone: "bg-muted" },
    { label: "Draft", value: filtered.filter((c) => c.status === "draft").length, tone: "bg-secondary/40" },
    { label: "Active", value: filtered.filter((c) => c.status === "active").length, tone: "bg-primary/10 text-primary" },
    { label: "Closed", value: filtered.filter((c) => c.status === "closed").length, tone: "bg-muted/50" },
  ];

  return (
    <>
      <Card className="mb-4">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_180px_auto]">
          <div>
            <Label htmlFor="cyc-q" className="text-xs">Search name</Label>
            <Input id="cyc-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Q1 2026" />
          </div>
          <div>
            <Label htmlFor="cyc-status" className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="cyc-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cyc-from" className="text-xs">From</Label>
            <Input id="cyc-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cyc-to" className="text-xs">To</Label>
            <Input id="cyc-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setStatus("all"); setFrom(""); setTo(""); setQ(""); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`min-w-0 rounded-lg border p-3 ${t.tone}`}
            role="status"
            aria-live="polite"
            aria-label={`${t.label}: ${t.value} cycle${t.value === 1 ? "" : "s"}`}
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</div>
            <div className="text-2xl font-semibold tabular-nums">{t.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Review cycles</CardTitle>
            <CardDescription>
              Showing {filtered.length} of {cycles.length}. Configure templates in{" "}
              <Link to="/admin/review-templates" className="underline">Review templates</Link>.
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={openCycle} onOpenChange={setOpenCycle}>
              <DialogTrigger asChild><Button size="sm">New cycle</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New review cycle</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newCycle.name} onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })} placeholder="Q1 2026" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Start</Label><Input type="date" value={newCycle.periodStart} onChange={(e) => setNewCycle({ ...newCycle, periodStart: e.target.value })} /></div>
                    <div><Label>End</Label><Input type="date" value={newCycle.periodEnd} onChange={(e) => setNewCycle({ ...newCycle, periodEnd: e.target.value })} /></div>
                  </div>
                  <div><Label>Review template</Label>
                    <Select value={newCycle.templateId || "none"} onValueChange={(v) => setNewCycle({ ...newCycle, templateId: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (free-form rating only)</SelectItem>
                        {reviewTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}{t.is_default ? " (default)" : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button onClick={createCycle} disabled={busy}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Period</TableHead><TableHead>Template</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const tpl = reviewTemplates.find((t) => t.id === c.template_id);
                return (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.period_start} → {c.period_end}</TableCell>
                    <TableCell>
                      {isAdmin && c.status === "draft" ? (
                        <Select value={c.template_id ?? "none"} onValueChange={(v) => setCycleTemplate(c.id, v === "none" ? null : v)}>
                          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {reviewTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : tpl ? <span className="text-sm">{tpl.name}{c.template_version ? <span className="text-xs text-muted-foreground"> v{c.template_version}</span> : null}</span> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Badge variant={c.status === "active" ? "default" : c.status === "closed" ? "outline" : "secondary"}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {isAdmin && c.status !== "closed" && (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => openReminders(c)}>Reminders</Button>
                      )}
                      {isAdmin && c.status === "draft" && <Button size="sm" disabled={busy} onClick={() => activate(c.id)}>Activate</Button>}
                      {isAdmin && c.status === "active" && <Button size="sm" variant="outline" disabled={busy} onClick={() => close(c.id)}>Close</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No cycles match the filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
