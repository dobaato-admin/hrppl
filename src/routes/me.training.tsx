import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, GraduationCap, BadgeCheck, ExternalLink, Trash2, ListChecks } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  listEnrollments, updateEnrollment,
  listCertifications, upsertCertification, deleteCertification,
  listQuestions, submitQuizAttempt, listAttempts,
} from "@/lib/training.functions";

export const Route = createFileRoute("/me/training")({
  head: () => ({ meta: [{ title: "My training — hrppl" }] }),
  component: MyTrainingPage,
});

function MyTrainingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const enrollsFn = useServerFn(listEnrollments);
  const updateFn = useServerFn(updateEnrollment);
  const certsFn = useServerFn(listCertifications);
  const saveCertFn = useServerFn(upsertCertification);
  const delCertFn = useServerFn(deleteCertification);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({ name: "" });
  const [quizEnrollment, setQuizEnrollment] = useState<any>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data: enrollData } = useQuery({ queryKey: ["me-training"], queryFn: () => enrollsFn({ data: { scope: "me" } }), enabled: !!user });
  const { data: certsData } = useQuery({ queryKey: ["me-certs"], queryFn: () => certsFn({ data: { scope: "me" } }), enabled: !!user });

  async function setStatus(id: string, status: string) {
    try { await updateFn({ data: { id, status: status as any } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["me-training"] }); qc.invalidateQueries({ queryKey: ["me-certs"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  function startNewCert() { setForm({ name: "" }); setOpen(true); }
  function startEditCert(c: any) { setForm({ ...c }); setOpen(true); }

  async function saveCert(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await saveCertFn({ data: { ...form, file_url: form.file_url || null } });
      toast.success("Saved"); setOpen(false);
      qc.invalidateQueries({ queryKey: ["me-certs"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  async function removeCert(id: string) {
    if (!confirm("Delete this certification?")) return;
    try { await delCertFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["me-certs"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    <AppShell title="My training" subtitle="Your assigned courses and personal certifications">
      <section className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses"><GraduationCap className="mr-1 h-4 w-4" /> Courses</TabsTrigger>
            <TabsTrigger value="certs"><BadgeCheck className="mr-1 h-4 w-4" /> Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader><CardTitle>Assigned courses</CardTitle><CardDescription>Mark progress as you go. Completion auto-issues a certificate when the course has a validity period.</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Category</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Quiz</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(enrollData?.enrollments ?? []).length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nothing assigned yet.</TableCell></TableRow>
                    ) : enrollData!.enrollments.map((en: any) => (
                      <TableRow key={en.id}>
                        <TableCell className="font-medium">{en.training_courses?.title}{en.training_courses?.is_mandatory && <Badge variant="outline" className="ml-2">Mandatory</Badge>}
                          {en.score != null && <div className="text-xs text-muted-foreground">Last score: {en.score}%</div>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{en.training_courses?.category ?? "—"}</TableCell>
                        <TableCell className="text-xs">{en.due_date ?? "—"}</TableCell>
                        <TableCell>
                          <Select value={en.status} onValueChange={(v) => setStatus(en.id, v)}>
                            <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assigned">Not started</SelectItem>
                              <SelectItem value="in_progress">In progress</SelectItem>
                              <SelectItem value="completed" disabled>Completed (via quiz)</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setQuizEnrollment(en)}>
                            <ListChecks className="mr-1 h-4 w-4" /> {en.status === "completed" ? "Review" : "Take quiz"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="certs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>My certifications</CardTitle><CardDescription>Add external certifications with expiry tracking.</CardDescription></div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button size="sm" onClick={startNewCert}><Plus className="mr-1 h-4 w-4" /> Add certification</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} certification</DialogTitle></DialogHeader>
                    <form onSubmit={saveCert} className="space-y-3">
                      <div className="space-y-2"><Label>Name*</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label>Issuer</Label><Input value={form.issuer ?? ""} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Credential ID</Label><Input value={form.credential_id ?? ""} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label>Issued on</Label><Input type="date" value={form.issued_on ?? ""} onChange={(e) => setForm({ ...form, issued_on: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Expires on</Label><Input type="date" value={form.expires_on ?? ""} onChange={(e) => setForm({ ...form, expires_on: e.target.value })} /></div>
                      </div>
                      <div className="space-y-2"><Label>Certificate URL</Label><Input type="url" value={form.file_url ?? ""} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://…" /></div>
                      <DialogFooter><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Issuer</TableHead><TableHead>Issued</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(certsData?.certifications ?? []).length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-muted-foreground">No certifications yet.</TableCell></TableRow>
                    ) : certsData!.certifications.map((c: any) => {
                      const days = c.expires_on ? Math.ceil((new Date(c.expires_on).getTime() - Date.now()) / 86400000) : null;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}{c.credential_id && <div className="text-xs text-muted-foreground">{c.credential_id}</div>}</TableCell>
                          <TableCell>{c.issuer ?? "—"}</TableCell>
                          <TableCell className="text-xs">{c.issued_on ?? "—"}</TableCell>
                          <TableCell>
                            {c.expires_on ? (
                              <Badge variant={days !== null && days < 0 ? "destructive" : days !== null && days < 30 ? "secondary" : "outline"}>
                                {c.expires_on}{days !== null && ` (${days < 0 ? `${-days}d ago` : `in ${days}d`})`}
                              </Badge>
                            ) : <span className="text-xs text-muted-foreground">No expiry</span>}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {c.file_url && <Button asChild size="sm" variant="ghost"><a href={c.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                            <Button size="sm" variant="ghost" onClick={() => startEditCert(c)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => removeCert(c.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      <QuizTaker enrollment={quizEnrollment} onClose={() => { setQuizEnrollment(null); qc.invalidateQueries({ queryKey: ["me-training"] }); qc.invalidateQueries({ queryKey: ["me-certs"] }); }} />
    </AppShell>
  );
}

function QuizTaker({ enrollment, onClose }: { enrollment: any; onClose: () => void }) {
  const open = !!enrollment;
  const qFn = useServerFn(listQuestions);
  const submitFn = useServerFn(submitQuizAttempt);
  const attemptsFn = useServerFn(listAttempts);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: qData } = useQuery({
    queryKey: ["quiz-take", enrollment?.course_id],
    queryFn: () => qFn({ data: { course_id: enrollment.course_id, include_answers: false, for_attempt: true } }),
    enabled: open,
  });
  const { data: aData, refetch: refetchAttempts } = useQuery({
    queryKey: ["quiz-attempts", enrollment?.id],
    queryFn: () => attemptsFn({ data: { enrollment_id: enrollment.id, scope: "me" } }),
    enabled: open,
  });

  const questions = qData?.questions ?? [];
  const course = enrollment?.training_courses;
  const passScore = course?.pass_score ?? 70;
  const priorAttempts = aData?.attempts ?? [];
  const maxAttempts = course?.max_attempts as number | undefined;
  const exhausted = maxAttempts ? priorAttempts.length >= maxAttempts : false;

  async function submit() {
    if (questions.length === 0) { toast.error("No quiz available for this course"); return; }
    const payload = questions
      .filter((q: any) => answers[q.id] != null)
      .map((q: any) => ({ question_id: q.id, selected_index: answers[q.id] }));
    if (payload.length < questions.length) { toast.error("Answer all questions"); return; }
    setSubmitting(true);
    try {
      const res = await submitFn({ data: { enrollment_id: enrollment.id, answers: payload } });
      setResult(res);
      refetchAttempts();
      if (res.passed) toast.success(`Passed with ${res.percentage}%`); else toast.error(`Failed — ${res.percentage}% (need ${passScore}%)`);
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setAnswers({}); setResult(null); onClose(); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course?.title}</DialogTitle>
          <CardDescription>Pass score {passScore}%. Attempts {priorAttempts.length}{maxAttempts ? ` / ${maxAttempts}` : ""}.</CardDescription>
        </DialogHeader>

        {priorAttempts.length > 0 && !result && (
          <div className="rounded border p-2 text-xs">
            <div className="mb-1 font-medium">Past attempts</div>
            {priorAttempts.map((a: any) => (
              <div key={a.id} className="flex justify-between">
                <span>#{a.attempt_number} · {new Date(a.attempted_at).toLocaleString()}</span>
                <span className={a.passed ? "text-primary" : "text-destructive"}>{a.percentage}% {a.passed ? "PASS" : "FAIL"}</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className={`rounded-md border p-4 text-center ${result.passed ? "border-primary" : "border-destructive"}`}>
            <div className="text-2xl font-bold">{result.percentage}%</div>
            <div className="text-sm">{result.score} / {result.max_score} points</div>
            <Badge variant={result.passed ? "default" : "destructive"} className="mt-2">{result.passed ? "Passed" : "Failed"}</Badge>
          </div>
        )}

        {!result && questions.length === 0 && <p className="text-sm text-muted-foreground">No quiz questions have been set for this course yet.</p>}

        {!result && questions.length > 0 && !exhausted && (
          <div className="max-h-[50vh] space-y-4 overflow-auto">
            {questions.map((q: any, i: number) => (
              <div key={q.id} className="space-y-2">
                <Label>{i + 1}. {q.question}</Label>
                {(q.choices as string[]).map((c, idx) => (
                  <label key={idx} className="flex items-center gap-2 rounded border p-2 text-sm hover:bg-muted cursor-pointer">
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === idx} onChange={() => setAnswers({ ...answers, [q.id]: idx })} />
                    <span>{String.fromCharCode(65 + idx)}. {c}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        {exhausted && !result && <p className="text-sm text-destructive">You have used all {maxAttempts} attempts.</p>}

        <DialogFooter>
          {result ? (
            <Button onClick={() => { setResult(null); setAnswers({}); onClose(); }}>Close</Button>
          ) : (
            <Button onClick={submit} disabled={submitting || exhausted || questions.length === 0}>{submitting ? "Submitting…" : "Submit quiz"}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
