import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  ListChecks,
  Download,
  Upload,
  FileText,
  Sparkles,
  BellRing,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  listCourses,
  upsertCourse,
  deleteCourse,
  listQuestions,
  upsertQuestion,
  deleteQuestion,
  copyQuestions,
  importQuestions,
  seedTrainingPreset,
  sendOverdueTrainingReminders,
} from "@/lib/training.functions";
import { TRAINING_PRESETS } from "@/lib/training-presets";
import { questionsToCsv, csvToQuestions, downloadCsv, QUIZ_CSV_HEADER } from "@/lib/quiz-csv";
import { AdminGate } from "@/components/AdminGate";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/admin/training/")({
  head: () => ({ meta: [{ title: "Training catalog — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.trainingCatalog">
      <TrainingCatalogPage />
    </AdminGate>
  ),
});

function TrainingCatalogPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listCourses);
  const saveFn = useServerFn(upsertCourse);
  const delFn = useServerFn(deleteCourse);
  const seedFn = useServerFn(seedTrainingPreset);
  const remindFn = useServerFn(sendOverdueTrainingReminders);
  // W5 · Derived from the SAME feature key the route gate quotes, so this
  // page has one answer to "who may be here" instead of two. It previously
  // hand-rolled its own role list, which meant widening the route gate left
  // this check still rejecting — AdminGate let the user in and the page
  // bounced them a moment later.
  const canAccess = can("org.trainingCatalog", roles);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({
    title: "",
    is_mandatory: false,
    is_active: true,
    pass_score: 70,
  });
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetKey, setPresetKey] = useState(TRAINING_PRESETS[0].key);
  const [reminding, setReminding] = useState(false);

  async function applyPreset() {
    const g = TRAINING_PRESETS.find((p) => p.key === presetKey);
    if (!g) return;
    setBusy(true);
    try {
      const res = await seedFn({ data: { courses: g.courses } });
      const parts = [
        `${res.inserted} added`,
        `${res.updated ?? 0} refreshed`,
        `${res.questionsSeeded ?? 0} quiz questions refreshed`,
      ];
      toast.success(parts.join(" · "));
      setPresetOpen(false);
      qc.invalidateQueries({ queryKey: ["training-courses"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not apply preset");
    } finally {
      setBusy(false);
    }
  }

  async function sendReminders() {
    setReminding(true);
    try {
      const res = await remindFn({ data: {} });
      if (res.sent === 0) toast.info("No overdue enrollments to remind.");
      else toast.success(`Sent ${res.sent} overdue reminder${res.sent === 1 ? "" : "s"}.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setReminding(false);
    }
  }

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Manager+ required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["training-courses"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });

  function startNew() {
    setForm({ title: "", is_mandatory: false, is_active: true, pass_score: 70 });
    setOpen(true);
  }
  function startEdit(c: any) {
    setForm({ ...c });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
        validity_months: form.validity_months ? Number(form.validity_months) : null,
        pass_score:
          form.pass_score === "" || form.pass_score == null ? 70 : Number(form.pass_score),
        max_attempts: form.max_attempts ? Number(form.max_attempts) : null,
        questions_per_attempt: form.questions_per_attempt
          ? Number(form.questions_per_attempt)
          : null,
        shuffle_questions: !!form.shuffle_questions,
        external_url: form.external_url || null,
      };
      await saveFn({ data: payload });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["training-courses"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this course? Enrollments will be removed too.")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["training-courses"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
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

  return (
    <AppShell
      title="Training catalog"
      subtitle="Courses, quizzes, certifications and validity periods"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={sendReminders} disabled={reminding}>
            <BellRing className="mr-1 h-4 w-4" />{" "}
            {reminding ? "Sending…" : "Send overdue reminders"}
          </Button>
          <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Sparkles className="mr-1 h-4 w-4" /> Use a preset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Refresh training courses from a preset</DialogTitle>
                <DialogDescription>
                  Pick a category — matching courses are refreshed, missing courses are added, and
                  preset quiz questions are replaced.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Preset</Label>
                  <Select value={presetKey} onValueChange={setPresetKey}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_PRESETS.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(() => {
                  const g = TRAINING_PRESETS.find((p) => p.key === presetKey);
                  if (!g) return null;
                  return (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                      <div className="mt-2 max-h-56 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Hrs</TableHead>
                              <TableHead>Validity</TableHead>
                              <TableHead>Pass</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {g.courses.map((c) => (
                              <TableRow key={c.title}>
                                <TableCell className="text-xs font-medium">
                                  {c.title}
                                  {c.is_mandatory && (
                                    <Badge variant="outline" className="ml-2 text-[10px]">
                                      mand.
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs">{c.duration_hours ?? "—"}</TableCell>
                                <TableCell className="text-xs">
                                  {c.validity_months ? `${c.validity_months} mo` : "—"}
                                </TableCell>
                                <TableCell className="text-xs">{c.pass_score ?? 70}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })()}
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
                <Plus className="mr-1 h-4 w-4" /> New course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit" : "New"} course</DialogTitle>
              </DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div className="space-y-2">
                  <Label>Title*</Label>
                  <Input
                    value={form.title ?? ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      value={form.provider ?? ""}
                      onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={form.category ?? ""}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Compliance, Tech, Soft skills…"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={form.duration_hours ?? ""}
                      onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Certificate validity (months)</Label>
                    <Input
                      type="number"
                      value={form.validity_months ?? ""}
                      onChange={(e) => setForm({ ...form, validity_months: e.target.value })}
                      placeholder="Leave blank for no expiry"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Pass score (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.pass_score ?? 70}
                      onChange={(e) => setForm({ ...form, pass_score: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max attempts</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={form.max_attempts ?? ""}
                      onChange={(e) => setForm({ ...form, max_attempts: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Questions per attempt</Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={form.questions_per_attempt ?? ""}
                      onChange={(e) => setForm({ ...form, questions_per_attempt: e.target.value })}
                      placeholder="All from bank"
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!form.shuffle_questions}
                        onCheckedChange={(c) => setForm({ ...form, shuffle_questions: !!c })}
                      />{" "}
                      Shuffle questions each attempt
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>External link</Label>
                  <Input
                    type="url"
                    value={form.external_url ?? ""}
                    onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!form.is_mandatory}
                      onCheckedChange={(c) => setForm({ ...form, is_mandatory: !!c })}
                    />{" "}
                    Mandatory
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.is_active !== false}
                      onCheckedChange={(c) => setForm({ ...form, is_active: !!c })}
                    />{" "}
                    Active
                  </label>
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
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Courses</CardTitle>
            </div>
            <CardDescription>
              Open the <ListChecks className="inline h-3 w-3" /> course builder to add lessons and
              quiz questions. Completion requires a passing score when a quiz is set.
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
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Pass</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.courses ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        No courses yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data!.courses.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {c.title}
                          <div className="text-xs text-muted-foreground">
                            {c.provider ?? ""}
                            {c.is_mandatory && (
                              <Badge variant="outline" className="ml-2">
                                Mandatory
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{c.category ?? "—"}</TableCell>
                        <TableCell>{c.duration_hours ? `${c.duration_hours}h` : "—"}</TableCell>
                        <TableCell>{c.validity_months ? `${c.validity_months} mo` : "—"}</TableCell>
                        <TableCell className="text-xs">
                          {c.pass_score ?? 70}%{c.max_attempts ? ` · ${c.max_attempts}x` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.is_active ? "default" : "outline"}>
                            {c.is_active ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button asChild size="sm" variant="ghost" title="Open course builder">
                            <Link to="/admin/training/$courseId" params={{ courseId: c.id }}>
                              <ListChecks className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
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
