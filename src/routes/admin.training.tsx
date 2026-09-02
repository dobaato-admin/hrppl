import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/admin/training")({
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
  const canAccess =
    roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({
    title: "",
    is_mandatory: false,
    is_active: true,
    pass_score: 70,
  });
  const [quizCourse, setQuizCourse] = useState<any>(null);
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
              Manage quizzes via the <ListChecks className="inline h-3 w-3" /> button. Completion
              requires a passing score when a quiz is set.
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
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Manage quiz"
                            onClick={() => setQuizCourse(c)}
                          >
                            <ListChecks className="h-4 w-4" />
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

      <QuizManager
        course={quizCourse}
        courses={data?.courses ?? []}
        onClose={() => setQuizCourse(null)}
      />
    </AppShell>
  );
}

function QuizManager({
  course,
  courses,
  onClose,
}: {
  course: any;
  courses: any[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const qFn = useServerFn(listQuestions);
  const saveQ = useServerFn(upsertQuestion);
  const delQ = useServerFn(deleteQuestion);
  const copyFn = useServerFn(copyQuestions);
  const importFn = useServerFn(importQuestions);
  const open = !!course;
  const [editing, setEditing] = useState<any>(null);
  const [copySource, setCopySource] = useState<string>("");
  const [importPreview, setImportPreview] = useState<{
    questions: any[];
    errors: string[];
    filename: string;
  } | null>(null);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importBusy, setImportBusy] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["quiz-questions", course?.id],
    queryFn: () => qFn({ data: { course_id: course.id, include_answers: true } }),
    enabled: open,
  });

  async function saveOne(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      const choices = (editing.choices as string[]).map((c) => c.trim()).filter(Boolean);
      if (choices.length < 2) {
        toast.error("At least 2 choices required");
        return;
      }
      if (editing.correct_index >= choices.length) {
        toast.error("Correct choice index invalid");
        return;
      }
      await saveQ({
        data: {
          id: editing.id,
          course_id: course.id,
          sort_order: Number(editing.sort_order ?? 0),
          question: editing.question,
          choices,
          correct_index: Number(editing.correct_index),
          points: Number(editing.points ?? 1),
          explanation: editing.explanation || null,
        },
      });
      toast.success("Saved");
      setEditing(null);
      refetch();
      qc.invalidateQueries({ queryKey: ["quiz-questions", course.id] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function removeOne(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await delQ({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (!open) return null;
  const questions = data?.questions ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setEditing(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quiz — {course.title}</DialogTitle>
          <CardDescription>
            Pass score {course.pass_score ?? 70}%. {questions.length} question(s).
          </CardDescription>
        </DialogHeader>

        {!editing && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {courses.filter((c) => c.id !== course.id).length > 0 && (
                <div className="flex items-center gap-1">
                  <select
                    className="h-8 rounded border bg-background px-2 text-xs"
                    value={copySource}
                    onChange={(e) => setCopySource(e.target.value)}
                  >
                    <option value="">Copy from…</option>
                    {courses
                      .filter((c) => c.id !== course.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!copySource}
                    onClick={async () => {
                      try {
                        const res = await copyFn({
                          data: { source_course_id: copySource, target_course_id: course.id },
                        });
                        toast.success(`Copied ${res.count} question(s)`);
                        setCopySource("");
                        refetch();
                        qc.invalidateQueries({ queryKey: ["quiz-questions", course.id] });
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed");
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                title="Download CSV template"
                onClick={() => downloadCsv("quiz-template.csv", QUIZ_CSV_HEADER.join(",") + "\n")}
              >
                <FileText className="mr-1 h-4 w-4" /> Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!questions.length}
                onClick={() => {
                  const safe = (course.title || "quiz")
                    .replace(/[^a-z0-9-_]+/gi, "_")
                    .toLowerCase();
                  downloadCsv(`${safe}-questions.csv`, questionsToCsv(questions));
                }}
              >
                <Download className="mr-1 h-4 w-4" /> Export CSV
              </Button>
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const text = String(reader.result ?? "");
                      const parsed = csvToQuestions(text);
                      setImportPreview({ ...parsed, filename: file.name });
                    };
                    reader.readAsText(file);
                    e.target.value = "";
                  }}
                />
                <Button asChild size="sm" variant="outline">
                  <span>
                    <Upload className="mr-1 h-4 w-4" /> Import CSV
                  </span>
                </Button>
              </label>
              <Button
                size="sm"
                onClick={() =>
                  setEditing({
                    question: "",
                    choices: ["", ""],
                    correct_index: 0,
                    points: 1,
                    sort_order: questions.length,
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Add question
              </Button>
            </div>

            {importPreview && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-medium">Import preview — {importPreview.filename}</div>
                    <div className="text-xs text-muted-foreground">
                      {importPreview.questions.length} valid question(s)
                      {importPreview.errors.length
                        ? `, ${importPreview.errors.length} issue(s)`
                        : ""}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setImportPreview(null)}>
                    Cancel
                  </Button>
                </div>
                {importPreview.errors.length > 0 && (
                  <ul className="max-h-24 overflow-auto text-xs text-destructive">
                    {importPreview.errors.slice(0, 10).map((er, i) => (
                      <li key={i}>• {er}</li>
                    ))}
                    {importPreview.errors.length > 10 && (
                      <li>…and {importPreview.errors.length - 10} more</li>
                    )}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                    />{" "}
                    Append to existing
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                    />{" "}
                    Replace entire bank
                  </label>
                  <Button
                    size="sm"
                    disabled={!importPreview.questions.length || importBusy}
                    onClick={async () => {
                      setImportBusy(true);
                      try {
                        const res = await importFn({
                          data: {
                            course_id: course.id,
                            mode: importMode,
                            questions: importPreview.questions,
                          },
                        });
                        toast.success(`Imported ${res.count} question(s)`);
                        setImportPreview(null);
                        refetch();
                        qc.invalidateQueries({ queryKey: ["quiz-questions", course.id] });
                      } catch (e: any) {
                        toast.error(e?.message ?? "Import failed");
                      } finally {
                        setImportBusy(false);
                      }
                    }}
                  >
                    {importBusy ? "Importing…" : `Import ${importPreview.questions.length}`}
                  </Button>
                </div>
              </div>
            )}

            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions in this bank yet. Add some, or copy from another course above.
              </p>
            ) : (
              questions.map((q: any, i: number) => (
                <div key={q.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium">
                      {i + 1}. {q.question}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing({ ...q })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeOne(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs">
                    {(q.choices as string[]).map((c, idx) => (
                      <li
                        key={idx}
                        className={
                          idx === q.correct_index
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {String.fromCharCode(65 + idx)}. {c} {idx === q.correct_index && "✓"}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {editing && (
          <form onSubmit={saveOne} className="space-y-3">
            <div className="space-y-2">
              <Label>Question*</Label>
              <Textarea
                rows={2}
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Choices* (mark correct one)</Label>
              {(editing.choices as string[]).map((c: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={editing.correct_index === i}
                    onChange={() => setEditing({ ...editing, correct_index: i })}
                  />
                  <Input
                    value={c}
                    onChange={(e) => {
                      const next = [...editing.choices];
                      next[i] = e.target.value;
                      setEditing({ ...editing, choices: next });
                    }}
                    placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                  />
                  {editing.choices.length > 2 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const next = (editing.choices as string[]).filter((_, idx) => idx !== i);
                        setEditing({
                          ...editing,
                          choices: next,
                          correct_index: Math.min(editing.correct_index, next.length - 1),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {editing.choices.length < 8 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing({ ...editing, choices: [...editing.choices, ""] })}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add choice
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editing.points ?? 1}
                  onChange={(e) => setEditing({ ...editing, points: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                rows={2}
                value={editing.explanation ?? ""}
                onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save question</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
