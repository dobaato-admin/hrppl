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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { upsertGoal, deleteGoal, submitSelfReview, acknowledgeReview } from "@/lib/performance.functions";
import { requestFeedback360, submitFeedback360, declineFeedback360 } from "@/lib/feedback360.functions";
import { AppShell } from "@/components/AppShell";
import { KpiTile } from "@/components/monday";
import { Target, MessagesSquare, Inbox, Trophy } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "My performance — hrppl" }] }),
  component: PerformancePage,
});

interface Goal { id: string; title: string; description: string | null; weight: number; progress: number; status: string; due_date: string | null; cycle_id: string | null }
interface Cycle { id: string; name: string; status: string; period_start: string; period_end: string }
interface Review { id: string; cycle_id: string; self_rating: number | null; manager_rating: number | null; self_comments: string | null; manager_comments: string | null; status: string; tenant_id: string; calibrated_rating: number | null; acknowledged_at: string | null; acknowledgment_comments: string | null; template_id: string | null; self_responses: any; manager_responses: any }
interface FeedbackReq { id: string; review_id: string; subject_employee_id: string; requester_id: string; requested_user_id: string; kind: string; status: string; message: string | null; created_at: string; template_id: string | null; due_date: string | null; reminder_count: number | null }
interface Feedback { id: string; review_id: string; author_id: string; kind: string; text: string; created_at: string; avg_rating: number | null; responses: any }
interface Coworker { id: string; user_id: string | null; first_name: string; last_name: string; employee_number: string }
interface FbTemplate { id: string; name: string; is_default: boolean; questions: Array<{ id: string; label: string; type: "rating" | "text"; required: boolean; scaleMin?: number; scaleMax?: number; scaleLabels?: string[] }> }
interface ReviewTemplate { id: string; name: string; scale_min: number; scale_max: number; scale_labels: string[]; competencies: { id: string; label: string; description?: string; type: "rating" | "text"; required: boolean }[] }

function PerformancePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [empId, setEmpId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [myRequests, setMyRequests] = useState<FeedbackReq[]>([]);
  const [requestsForMyReviews, setRequestsForMyReviews] = useState<FeedbackReq[]>([]);
  const [feedbackByReview, setFeedbackByReview] = useState<Record<string, Feedback[]>>({});
  const [templates, setTemplates] = useState<FbTemplate[]>([]);
  const [reviewTemplates, setReviewTemplates] = useState<ReviewTemplate[]>([]);
  const [busy, setBusy] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", weight: 0, dueDate: "", cycleId: "" });

  const fnUpsert = useServerFn(upsertGoal);
  const fnDelete = useServerFn(deleteGoal);
  const fnSubmitSelf = useServerFn(submitSelfReview);
  const fnRequest = useServerFn(requestFeedback360);
  const fnSubmitFb = useServerFn(submitFeedback360);
  const fnDeclineFb = useServerFn(declineFeedback360);
  const fnAck = useServerFn(acknowledgeReview);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: emp } = await supabase.from("employees").select("id,tenant_id").eq("user_id", user.id).maybeSingle();
      if (emp?.id) { setEmpId(emp.id); setTenantId(emp.tenant_id); }
    })();
  }, [user]);

  async function load() {
    if (!empId || !tenantId || !user) return;
    const [cRes, gRes, rRes, coRes, reqMine, reqMyRev, tRes, rtRes] = await Promise.all([
      supabase.from("review_cycles").select("*").order("period_start", { ascending: false }),
      supabase.from("performance_goals").select("*").eq("employee_id", empId).order("created_at", { ascending: false }),
      supabase.from("performance_reviews").select("*").eq("employee_id", empId),
      supabase.from("employees").select("id,user_id,first_name,last_name,employee_number").eq("tenant_id", tenantId).eq("status", "active"),
      supabase.from("review_feedback_requests").select("*").eq("requested_user_id", user.id).eq("status", "pending"),
      supabase.from("review_feedback_requests").select("*").eq("subject_employee_id", empId).order("created_at", { ascending: false }),
      supabase.from("feedback_question_templates").select("*").eq("tenant_id", tenantId),
      supabase.from("review_templates" as any).select("*").eq("tenant_id", tenantId).eq("is_current", true),
    ]);
    setCycles((cRes.data ?? []) as Cycle[]);
    setGoals((gRes.data ?? []) as Goal[]);
    const rev = ((rRes.data ?? []) as unknown) as Review[];
    setReviews(rev);
    setCoworkers((coRes.data ?? []) as Coworker[]);
    setMyRequests((reqMine.data ?? []) as unknown as FeedbackReq[]);
    setRequestsForMyReviews((reqMyRev.data ?? []) as unknown as FeedbackReq[]);
    setTemplates((tRes.data ?? []) as unknown as FbTemplate[]);
    setReviewTemplates((rtRes.data ?? []) as unknown as ReviewTemplate[]);

    const finalizedIds = rev.filter((r) => r.status === "finalized" || r.status === "acknowledged").map((r) => r.id);
    if (finalizedIds.length) {
      const { data: fbs } = await supabase.from("review_feedback").select("*").in("review_id", finalizedIds);
      const grouped: Record<string, Feedback[]> = {};
      (fbs ?? []).forEach((f: any) => { (grouped[f.review_id] ||= []).push(f); });
      setFeedbackByReview(grouped);
    } else {
      setFeedbackByReview({});
    }
  }
  useEffect(() => { load(); }, [empId, tenantId]);

  const cycleMap = useMemo(() => Object.fromEntries(cycles.map((c) => [c.id, c])), [cycles]);

  async function addGoal() {
    if (!newGoal.title.trim()) return;
    setBusy(true);
    try {
      await fnUpsert({ data: {
        title: newGoal.title, description: newGoal.description || undefined,
        weight: Number(newGoal.weight) || 0, progress: 0, status: "not_started",
        dueDate: newGoal.dueDate || undefined, cycleId: newGoal.cycleId || undefined,
      } });
      setNewGoal({ title: "", description: "", weight: 0, dueDate: "", cycleId: "" });
      toast.success("Goal added"); await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function updateGoal(g: Goal, patch: Partial<Goal>) {
    setBusy(true);
    try {
      await fnUpsert({ data: {
        id: g.id, title: patch.title ?? g.title, description: g.description ?? undefined,
        weight: Number(patch.weight ?? g.weight), progress: Number(patch.progress ?? g.progress),
        status: (patch.status ?? g.status) as any, dueDate: g.due_date ?? undefined,
        cycleId: g.cycle_id ?? undefined,
      } });
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function removeGoal(id: string) {
    setBusy(true);
    try { await fnDelete({ data: { id } }); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!empId) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">No employee record linked.</main>;

  const activeGoals = goals.filter((g) => g.status !== "completed" && g.status !== "cancelled").length;
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + Number(g.progress || 0), 0) / goals.length) : 0;
  const openReviews = reviews.filter((r) => r.status === "draft" || r.status === "finalized").length;

  return (
    <AppShell title="My performance" subtitle="Track goals, reviews, and 360-degree feedback.">

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Active goals" value={activeGoals} tone="primary" icon={Target} hint={`${goals.length} total`} />
          <KpiTile label="Avg progress" value={`${avgProgress}%`} tone={avgProgress >= 70 ? "done" : avgProgress >= 30 ? "working" : "pending"} icon={Trophy} />
          <KpiTile label="Open reviews" value={openReviews} tone={openReviews > 0 ? "working" : "done"} icon={Inbox} />
          <KpiTile label="Feedback requests" value={myRequests.length} tone={myRequests.length > 0 ? "info" : "done"} icon={MessagesSquare} hint="For you" />
        </section>

        {myRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback requests for you</CardTitle>
              <CardDescription>Colleagues have asked for your input on their reviews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRequests.map((req) => (
                <PendingRequestCard
                  key={req.id}
                  req={{ ...req, template: templates.find((t) => t.id === req.template_id) }}
                  onSubmit={async (text, responses) => {
                    setBusy(true);
                    try { await fnSubmitFb({ data: { requestId: req.id, text: text || undefined, responses } }); toast.success("Feedback submitted"); await load(); }
                    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
                  }}
                  onDecline={async () => {
                    setBusy(true);
                    try { await fnDeclineFb({ data: { requestId: req.id } }); toast.success("Declined"); await load(); }
                    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
                  }}
                  busy={busy}
                />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a goal</CardTitle>
            <CardDescription>Define what you're working towards this cycle.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2"><Label>Title</Label><Input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} /></div>
            <div><Label>Weight %</Label><Input type="number" min={0} max={100} value={newGoal.weight} onChange={(e) => setNewGoal({ ...newGoal, weight: Number(e.target.value) })} /></div>
            <div><Label>Due date</Label><Input type="date" value={newGoal.dueDate} onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })} /></div>
            <div><Label>Cycle</Label>
              <Select value={newGoal.cycleId} onValueChange={(v) => setNewGoal({ ...newGoal, cycleId: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{cycles.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-5"><Label>Description</Label><Textarea rows={2} value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} /></div>
            <div className="md:col-span-5 text-right"><Button onClick={addGoal} disabled={busy || !newGoal.title.trim()}>Add goal</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">My goals</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Cycle</TableHead><TableHead>Weight</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {goals.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <div className="font-medium">{g.title}</div>
                      {g.description && <div className="text-xs text-muted-foreground line-clamp-2">{g.description}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{g.cycle_id ? cycleMap[g.cycle_id]?.name ?? "—" : "—"}</TableCell>
                    <TableCell>{Number(g.weight)}%</TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={100} defaultValue={Number(g.progress)} className="w-20"
                        onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(g.progress)) updateGoal(g, { progress: v }); }} />
                    </TableCell>
                    <TableCell>
                      <Select value={g.status} onValueChange={(v) => updateGoal(g, { status: v as any })}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not started</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => removeGoal(g.id)}>Delete</Button></TableCell>
                  </TableRow>
                ))}
                {goals.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No goals yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">My reviews</CardTitle><CardDescription>Submit your self-assessment and request 360-degree feedback.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                cycle={cycleMap[r.cycle_id]}
                coworkers={coworkers.filter((c) => c.user_id && c.user_id !== user.id)}
                requestsForReview={requestsForMyReviews.filter((q) => q.review_id === r.id)}
                feedback={feedbackByReview[r.id] ?? []}
                templates={templates}
                reviewTemplate={reviewTemplates.find((t) => t.id === r.template_id)}
                onSubmit={async (rating, comments, responses) => {
                  setBusy(true);
                  try { await fnSubmitSelf({ data: { reviewId: r.id, selfRating: rating, selfComments: comments, responses } }); toast.success("Self-review submitted"); await load(); }
                  catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
                }}
                onAcknowledge={async (comments) => {
                  setBusy(true);
                  try { await fnAck({ data: { reviewId: r.id, comments: comments || undefined } }); toast.success("Acknowledged"); await load(); }
                  catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
                }}
                onRequest={async (userIds, kind, message, templateId, dueDate) => {
                  setBusy(true);
                  try {
                    const res = await fnRequest({ data: {
                      reviewId: r.id, requestedUserIds: userIds, kind,
                      message: message || undefined,
                      templateId: templateId || undefined,
                      dueDate: dueDate || undefined,
                    } });
                    toast.success(`Requested feedback from ${res.inserted} colleague(s)`);
                    await load();
                  } catch (e: any) { toast.error(e.message); }
                  finally { setBusy(false); }
                }}
                busy={busy}
              />
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. An admin must activate a cycle first.</p>}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function PendingRequestCard({ req, onSubmit, onDecline, busy }: { req: FeedbackReq & { template?: FbTemplate }; onSubmit: (text: string, responses: Array<{ questionId: string; rating?: number | null; text?: string | null }>) => void; onDecline: () => void; busy: boolean }) {
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Record<string, { rating?: number; text?: string }>>({});
  const template = req.template;
  const overdue = req.due_date && req.due_date < new Date().toISOString().slice(0, 10);
  function setAns(qid: string, patch: { rating?: number; text?: string }) {
    setAnswers((a) => ({ ...a, [qid]: { ...a[qid], ...patch } }));
  }
  function canSubmit() {
    if (template) {
      for (const q of template.questions) {
        if (!q.required) continue;
        const a = answers[q.id];
        if (q.type === "rating" && (a?.rating == null)) return false;
        if (q.type === "text" && !(a?.text ?? "").trim()) return false;
      }
      return true;
    }
    return text.trim().length > 0;
  }
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Badge variant="secondary" className="mr-2">{req.kind}</Badge>
          <span className="text-muted-foreground">Requested {new Date(req.created_at).toLocaleDateString()}</span>
        </div>
        {req.due_date && (
          <Badge variant={overdue ? "destructive" : "outline"}>
            Due {req.due_date}{(req.reminder_count ?? 0) > 0 ? ` · ${req.reminder_count} reminder${req.reminder_count === 1 ? "" : "s"}` : ""}
          </Badge>
        )}
      </div>
      {req.message && <div className="rounded bg-muted p-2 text-xs italic">"{req.message}"</div>}
      {template ? (
        <div className="space-y-3">
          {template.questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <Label className="text-sm">{q.label}{q.required && <span className="text-destructive"> *</span>}</Label>
              {q.type === "rating" ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }, (_, i) => (q.scaleMin ?? 1) + i).map((n) => (
                    <Button key={n} size="sm" type="button"
                      variant={answers[q.id]?.rating === n ? "default" : "outline"}
                      onClick={() => setAns(q.id, { rating: n })}>{n}</Button>
                  ))}
                  {q.scaleLabels && q.scaleLabels.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">{q.scaleLabels.join(" → ")}</span>
                  )}
                </div>
              ) : (
                <Textarea rows={2} value={answers[q.id]?.text ?? ""} onChange={(e) => setAns(q.id, { text: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <Textarea rows={3} placeholder="Share constructive feedback…" value={text} onChange={(e) => setText(e.target.value)} />
      )}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onDecline} disabled={busy}>Decline</Button>
        <Button size="sm" disabled={busy || !canSubmit()} onClick={() => {
          const responses = template ? template.questions.map((q) => ({ questionId: q.id, rating: answers[q.id]?.rating ?? null, text: answers[q.id]?.text ?? null })) : [];
          onSubmit(text, responses);
        }}>Submit feedback</Button>
      </div>
    </div>
  );
}

function ReviewCard({
  review, cycle, coworkers, requestsForReview, feedback, templates, reviewTemplate, onSubmit, onAcknowledge, onRequest, busy,
}: {
  review: Review;
  cycle?: Cycle;
  coworkers: Coworker[];
  requestsForReview: FeedbackReq[];
  feedback: Feedback[];
  templates: FbTemplate[];
  reviewTemplate?: ReviewTemplate;
  onSubmit: (rating: number, comments: string, responses?: Array<{ questionId: string; rating?: number | null; text?: string | null }>) => void;
  onAcknowledge: (comments: string) => void;
  onRequest: (userIds: string[], kind: "peer" | "upward", message: string, templateId: string, dueDate: string) => void;
  busy: boolean;
}) {
  const scaleMin = reviewTemplate?.scale_min ?? 1, scaleMax = reviewTemplate?.scale_max ?? 5;
  const [rating, setRating] = useState(review.self_rating ?? Math.round((scaleMin + scaleMax) / 2));
  const [comments, setComments] = useState(review.self_comments ?? "");
  const [selfAnswers, setSelfAnswers] = useState<Record<string, { rating?: number; text?: string }>>(() => {
    const init: Record<string, { rating?: number; text?: string }> = {};
    if (Array.isArray(review.self_responses)) {
      for (const x of review.self_responses as any[]) init[x.questionId] = { rating: x.rating ?? undefined, text: x.text ?? undefined };
    }
    return init;
  });
  const [ackComments, setAckComments] = useState("");
  const [reqOpen, setReqOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [kind, setKind] = useState<"peer" | "upward">("peer");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState<string>(() => templates.find((t) => t.is_default)?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const locked = review.status !== "draft" && review.status !== "self_submitted";
  const canAcknowledge = review.status === "finalized";

  function toggle(uid: string) {
    setSelectedIds((s) => {
      const next = new Set(s);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }
  function canSubmit() {
    if (!reviewTemplate) return true;
    for (const c of reviewTemplate.competencies) {
      if (!c.required) continue;
      const a = selfAnswers[c.id];
      if (c.type === "rating" && a?.rating == null) return false;
      if (c.type === "text" && !(a?.text ?? "").trim()) return false;
    }
    return true;
  }
  function submit() {
    const responses = reviewTemplate ? reviewTemplate.competencies.map((c) => ({
      questionId: c.id, rating: selfAnswers[c.id]?.rating ?? null, text: selfAnswers[c.id]?.text ?? null,
    })) : undefined;
    onSubmit(rating, comments, responses);
  }

  const finalRating = review.calibrated_rating ?? review.manager_rating;

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{cycle?.name ?? "Cycle"}</div>
          <div className="text-xs text-muted-foreground">{cycle?.period_start} → {cycle?.period_end}</div>
        </div>
        <Badge variant={review.status === "acknowledged" || review.status === "finalized" ? "default" : "secondary"}>{review.status.replace("_", " ")}</Badge>
      </div>
      {reviewTemplate && !locked && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="text-sm font-medium">{reviewTemplate.name}</div>
          {reviewTemplate.competencies.map((c) => (
            <div key={c.id} className="space-y-1">
              <Label className="text-sm">{c.label}{c.required && <span className="text-destructive"> *</span>}</Label>
              {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
              {c.type === "rating" ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i).map((n) => (
                    <Button key={n} size="sm" type="button"
                      variant={selfAnswers[c.id]?.rating === n ? "default" : "outline"}
                      onClick={() => setSelfAnswers((s) => ({ ...s, [c.id]: { ...s[c.id], rating: n } }))}>{n}</Button>
                  ))}
                  {reviewTemplate.scale_labels?.length > 0 && <span className="text-xs text-muted-foreground ml-2">{reviewTemplate.scale_labels.join(" → ")}</span>}
                </div>
              ) : (
                <Textarea rows={2} value={selfAnswers[c.id]?.text ?? ""} onChange={(e) => setSelfAnswers((s) => ({ ...s, [c.id]: { ...s[c.id], text: e.target.value } }))} />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label>Self-rating ({scaleMin}–{scaleMax})</Label>
          <Input type="number" min={scaleMin} max={scaleMax} value={rating} disabled={locked} onChange={(e) => setRating(Number(e.target.value))} />
        </div>
        <div>
          <Label>Manager rating</Label>
          <Input value={review.manager_rating ?? "—"} disabled />
        </div>
        <div>
          <Label>Final rating</Label>
          <Input value={finalRating ?? "—"} disabled />
        </div>
      </div>
      <div>
        <Label>Self comments</Label>
        <Textarea rows={3} disabled={locked} value={comments} onChange={(e) => setComments(e.target.value)} />
      </div>
      {review.manager_comments && (
        <div>
          <Label>Manager feedback</Label>
          <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">{review.manager_comments}</div>
        </div>
      )}
      {canAcknowledge && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
          <div className="text-sm font-medium">Acknowledge your review</div>
          <p className="text-xs text-muted-foreground">Confirm you've read your manager's feedback. You can add optional comments.</p>
          <Textarea rows={2} value={ackComments} onChange={(e) => setAckComments(e.target.value)} placeholder="Optional comments…" />
          <div className="text-right"><Button size="sm" onClick={() => onAcknowledge(ackComments)} disabled={busy}>Acknowledge</Button></div>
        </div>
      )}
      {review.acknowledged_at && (
        <div className="text-xs text-muted-foreground">Acknowledged {new Date(review.acknowledged_at).toLocaleString()}</div>
      )}

      {/* 360 feedback panel */}
      <div className="rounded-md border-t pt-3 mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">360° feedback</div>
            <div className="text-xs text-muted-foreground">
              {(review.status === "finalized" || review.status === "acknowledged")
                ? "Final feedback visible below."
                : "Your colleagues' feedback stays hidden from you until your review is finalized."}
            </div>
          </div>
          {(review.status !== "finalized" && review.status !== "acknowledged") && (
            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={busy || coworkers.length === 0}>Request feedback</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Request 360° feedback</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peer">Peer feedback</SelectItem>
                        <SelectItem value="upward">Upward feedback (about my manager)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Question template</Label>
                      <Select value={templateId || "none"} onValueChange={(v) => setTemplateId(v === "none" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Free-form" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Free-form text</SelectItem>
                          {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}{t.is_default ? " (default)" : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due date</Label>
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Optional message</Label>
                    <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like them to focus on?" />
                  </div>
                  <div>
                    <Label>Colleagues</Label>
                    <div className="max-h-56 overflow-auto rounded border divide-y">
                      {coworkers.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                          <Checkbox checked={selectedIds.has(c.user_id!)} onCheckedChange={() => toggle(c.user_id!)} />
                          <span className="flex-1">{c.first_name} {c.last_name}</span>
                          <span className="text-xs text-muted-foreground">{c.employee_number}</span>
                        </label>
                      ))}
                      {coworkers.length === 0 && <div className="px-3 py-3 text-xs text-muted-foreground">No eligible colleagues.</div>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={busy || selectedIds.size === 0} onClick={() => {
                    onRequest(Array.from(selectedIds), kind, message, templateId, dueDate);
                    setReqOpen(false); setSelectedIds(new Set()); setMessage(""); setDueDate("");
                  }}>Send requests</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {requestsForReview.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Requests sent: {requestsForReview.filter((q) => q.status === "submitted").length} submitted,{" "}
            {requestsForReview.filter((q) => q.status === "pending").length} pending,{" "}
            {requestsForReview.filter((q) => q.status === "declined").length} declined.
          </div>
        )}

        {(review.status === "finalized" || review.status === "acknowledged") && (
          feedback.length > 0 ? (
            <div className="space-y-2">
              {feedback.map((f) => (
                <div key={f.id} className="rounded-md bg-muted p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{f.kind}</Badge>
                    <span className="text-xs text-muted-foreground">Anonymous</span>
                    {f.avg_rating != null && <Badge variant="secondary">Avg {Number(f.avg_rating).toFixed(1)}</Badge>}
                  </div>
                  {Array.isArray(f.responses) && f.responses.length > 0 ? (
                    <div className="space-y-1">
                      {f.responses.map((r: any, i: number) => (
                        <div key={i} className="text-xs">
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
          ) : (
            <p className="text-xs text-muted-foreground">No 360° feedback was submitted.</p>
          )
        )}
      </div>

      {!locked && (
        <div className="text-right">
          <Button onClick={submit} disabled={busy || !canSubmit()}>Submit self-review</Button>
        </div>
      )}
    </div>
  );
}
