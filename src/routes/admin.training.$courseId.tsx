import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  BookOpen,
  FileText,
  Link2,
  ListChecks,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { QuizEditor } from "@/components/training/QuizEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { listCourses } from "@/lib/training.functions";
import {
  listLessons,
  upsertLesson,
  deleteLesson,
  reorderLessons,
  updateCourseContentSettings,
  createLessonUploadUrl,
} from "@/lib/training-lessons.functions";

export const Route = createFileRoute("/admin/training/$courseId")({
  head: () => ({ meta: [{ title: "Course builder — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.trainingCatalog">
      <CourseBuilderPage />
    </AdminGate>
  ),
});

const CONTENT_TYPES = [
  {
    value: "rich_text",
    label: "Text",
    icon: FileText,
    hint: "Written material, rendered as markdown",
  },
  { value: "video", label: "Video", icon: Video, hint: "An uploaded mp4, webm or mov" },
  { value: "document", label: "Document", icon: BookOpen, hint: "An uploaded PDF, deck or doc" },
  { value: "external_link", label: "Link", icon: Link2, hint: "Somewhere else on the web" },
] as const;

type LessonForm = {
  id?: string;
  title: string;
  content_type: (typeof CONTENT_TYPES)[number]["value"];
  body: string;
  content_url: string;
  duration_minutes: string;
  is_required: boolean;
};

const BLANK: LessonForm = {
  title: "",
  content_type: "rich_text",
  body: "",
  content_url: "",
  duration_minutes: "",
  is_required: true,
};

function CourseBuilderPage() {
  const { courseId } = useParams({ from: "/admin/training/$courseId" });
  const qc = useQueryClient();
  const coursesFn = useServerFn(listCourses);
  const lessonsFn = useServerFn(listLessons);
  const saveLessonFn = useServerFn(upsertLesson);
  const deleteLessonFn = useServerFn(deleteLesson);
  const reorderFn = useServerFn(reorderLessons);
  const settingsFn = useServerFn(updateCourseContentSettings);
  const uploadUrlFn = useServerFn(createLessonUploadUrl);

  const [editing, setEditing] = useState<LessonForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["training-courses"],
    queryFn: () => coursesFn(),
    // Reference data for an authoring screen: it does not change while you
    // are typing, and this page mounts on every course you open.
    staleTime: 60_000,
  });
  const { data: lessonData, isLoading: lessonsLoading } = useQuery({
    queryKey: ["training-lessons", courseId],
    queryFn: () => lessonsFn({ data: { course_id: courseId } }),
  });

  const course = useMemo(
    () => (coursesData?.courses ?? []).find((c: any) => c.id === courseId),
    [coursesData, courseId],
  );
  const lessons: any[] = lessonData?.lessons ?? [];

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["training-lessons", courseId] });
    qc.invalidateQueries({ queryKey: ["training-courses"] });
  }

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      await saveLessonFn({
        data: {
          id: editing.id,
          course_id: courseId,
          title: editing.title,
          content_type: editing.content_type,
          body: editing.body || null,
          content_url: editing.content_url || null,
          duration_minutes: editing.duration_minutes ? Number(editing.duration_minutes) : null,
          is_required: editing.is_required,
        },
      });
      toast.success(editing.id ? "Lesson updated" : "Lesson added");
      setEditing(null);
      invalidate();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save the lesson");
    } finally {
      setBusy(false);
    }
  }

  async function removeLesson(id: string, title: string) {
    if (!confirm(`Delete "${title}"? Learner progress on it is deleted too.`)) return;
    try {
      await deleteLessonFn({ data: { id } });
      invalidate();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not delete the lesson");
    }
  }

  async function move(index: number, delta: number) {
    const next = [...lessons];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderFn({ data: { course_id: courseId, lesson_ids: next.map((l) => l.id) } });
      invalidate();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not reorder");
    }
  }

  /**
   * Uploads go straight from the browser to storage through a signed URL the
   * server mints after checking the caller may author this course — the file
   * never passes through a server function, which has a body-size limit a
   * 200MB training video would blow straight past.
   */
  async function uploadFile(file: File) {
    if (!editing) return;
    setUploading(true);
    try {
      const { path, token } = await uploadUrlFn({
        data: { course_id: courseId, filename: file.name },
      });
      const { error } = await supabase.storage
        .from("training-content")
        .uploadToSignedUrl(path, token, file);
      if (error) throw error;
      setEditing({ ...editing, content_url: path });
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveSettings(patch: Record<string, unknown>) {
    try {
      await settingsFn({
        data: {
          course_id: courseId,
          content_mode: course?.content_mode ?? "external",
          require_lessons_before_quiz: course?.require_lessons_before_quiz ?? true,
          ...patch,
        } as any,
      });
      toast.success("Saved");
      invalidate();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save");
    }
  }

  if (coursesLoading) {
    return (
      <AppShell title="Course builder">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <SkeletonRows rows={6} />
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell title="Course builder">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <EmptyState
            icon={BookOpen}
            tone="pending"
            title="This course is not in your catalogue"
            description="It may have been deleted, or it belongs to another tenant."
            action={
              <Button asChild variant="outline">
                <Link to="/admin/training">Back to the catalogue</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const requiredCount = lessons.filter((l) => l.is_required).length;

  return (
    <AppShell
      title={course.title}
      subtitle="Lessons, quiz and completion rules for this course"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/training">
            <ArrowLeft className="mr-1 h-4 w-4" /> Catalogue
          </Link>
        </Button>
      }
    >
      <section className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <Tabs defaultValue="lessons">
          <TabsList>
            <TabsTrigger value="lessons">
              <BookOpen className="mr-1 h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <ListChecks className="mr-1 h-4 w-4" /> Quiz
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings2 className="mr-1 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------ LESSONS ---- */}
          <TabsContent value="lessons" className="mt-4">
            <SectionCard
              title="Lessons"
              description={
                course.content_mode === "lessons"
                  ? `${lessons.length} lesson(s), ${requiredCount} required`
                  : "This course still sends learners to an external link. Add lessons, then switch it to hosted content in Settings."
              }
              actions={
                <Button size="sm" onClick={() => setEditing({ ...BLANK })}>
                  <Plus className="mr-1 h-4 w-4" /> Add lesson
                </Button>
              }
            >
              {lessonsLoading ? (
                <SkeletonRows rows={3} />
              ) : lessons.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No lessons yet"
                  description="A lesson can be written text, an uploaded video or document, or a link out. Learners work through them in order."
                  action={
                    <Button onClick={() => setEditing({ ...BLANK })}>
                      <Plus className="mr-1 h-4 w-4" /> Add the first lesson
                    </Button>
                  }
                />
              ) : (
                <ol className="space-y-2">
                  {lessons.map((l, i) => {
                    const meta = CONTENT_TYPES.find((t) => t.value === l.content_type);
                    const Icon = meta?.icon ?? FileText;
                    return (
                      <li
                        key={l.id}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/40"
                      >
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            disabled={i === 0}
                            aria-label={`Move ${l.title} up`}
                            onClick={() => move(i, -1)}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            disabled={i === lessons.length - 1}
                            aria-label={`Move ${l.title} down`}
                            onClick={() => move(i, 1)}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Icon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {i + 1}. {l.title}
                            </span>
                            {l.is_required ? (
                              <Badge variant="outline">Required</Badge>
                            ) : (
                              <Badge variant="secondary">Optional</Badge>
                            )}
                            {l.duration_minutes ? (
                              <span className="text-xs text-muted-foreground">
                                {l.duration_minutes} min
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground">{meta?.label}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Edit ${l.title}`}
                            onClick={() =>
                              setEditing({
                                id: l.id,
                                title: l.title,
                                content_type: l.content_type,
                                body: l.body ?? "",
                                content_url: l.content_url ?? "",
                                duration_minutes: l.duration_minutes?.toString() ?? "",
                                is_required: l.is_required,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Delete ${l.title}`}
                            onClick={() => removeLesson(l.id, l.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </SectionCard>
          </TabsContent>

          {/* --------------------------------------------------- QUIZ ---- */}
          <TabsContent value="quiz" className="mt-4">
            <SectionCard
              title="Question bank"
              description="Multiple choice. A learner passes at the pass score set under Settings."
            >
              <QuizEditor course={course} courses={coursesData?.courses ?? []} />
            </SectionCard>
          </TabsContent>

          {/* ----------------------------------------------- SETTINGS ---- */}
          <TabsContent value="settings" className="mt-4 space-y-4">
            <SectionCard title="Content" description="Where the learning actually happens.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content source</Label>
                  <Select
                    value={course.content_mode ?? "external"}
                    onValueChange={(v) => saveSettings({ content_mode: v })}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">External link only</SelectItem>
                      <SelectItem value="lessons">Lessons hosted here</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Switching to hosted content needs at least one lesson. Existing courses stay on
                    the external link until you change this, so nothing you already assigned changes
                    underneath a learner.
                  </p>
                </div>

                <label className="flex max-w-lg items-start gap-2">
                  <Checkbox
                    checked={course.require_lessons_before_quiz ?? true}
                    onCheckedChange={(c) => saveSettings({ require_lessons_before_quiz: !!c })}
                  />
                  <span className="text-sm">
                    Require every required lesson before the quiz opens
                    <span className="block text-xs text-muted-foreground">
                      Only applies to hosted courses. With this off, a learner can sit the quiz
                      without opening a lesson.
                    </span>
                  </span>
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Completion" description="What counts as passing, and for how long.">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pass">Pass score (%)</Label>
                  <Input
                    id="pass"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={course.pass_score ?? 70}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (v !== Number(course.pass_score ?? 70)) saveSettings({ pass_score: v });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attempts">Max attempts</Label>
                  <Input
                    id="attempts"
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Unlimited"
                    defaultValue={course.max_attempts ?? ""}
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      const v = raw === "" ? null : Number(raw);
                      if (v !== (course.max_attempts ?? null)) saveSettings({ max_attempts: v });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity">Certificate validity (months)</Label>
                  <Input
                    id="validity"
                    type="number"
                    min={1}
                    max={600}
                    placeholder="No expiry"
                    defaultValue={course.validity_months ?? ""}
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      const v = raw === "" ? null : Number(raw);
                      if (v !== (course.validity_months ?? null))
                        saveSettings({ validity_months: v });
                    }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Passing the quiz completes the enrollment and, when a validity period is set, issues
                a certificate that expires accordingly.
              </p>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </section>

      {/* ------------------------------------------------ LESSON EDITOR ---- */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit lesson" : "New lesson"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveLesson} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Title*</Label>
                <Input
                  id="lesson-title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CONTENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = editing.content_type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        title={t.hint}
                        onClick={() => setEditing({ ...editing, content_type: t.value })}
                        className={
                          "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition " +
                          (active
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted")
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editing.content_type === "rich_text" ? (
                <div className="space-y-2">
                  <Label htmlFor="lesson-body">Content* (markdown)</Label>
                  <Textarea
                    id="lesson-body"
                    rows={8}
                    value={editing.body}
                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                    placeholder={"## Heading\n\nWrite the lesson here."}
                  />
                </div>
              ) : editing.content_type === "external_link" ? (
                <div className="space-y-2">
                  <Label htmlFor="lesson-url">Link*</Label>
                  <Input
                    id="lesson-url"
                    type="url"
                    value={editing.content_url}
                    onChange={(e) => setEditing({ ...editing, content_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>File*</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      {uploading ? "Uploading…" : editing.content_url ? "Replace file" : "Upload"}
                    </Button>
                    {editing.content_url && <StatusChip tone="done">Attached</StatusChip>}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept={
                      editing.content_type === "video"
                        ? "video/mp4,video/webm,video/quicktime"
                        : ".pdf,.docx,.pptx,image/*"
                    }
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Stored privately. Learners reach it through a short-lived signed link, never a
                    public URL.
                  </p>
                </div>
              )}

              {editing.content_type !== "rich_text" && (
                <div className="space-y-2">
                  <Label htmlFor="lesson-notes">Notes shown alongside (optional)</Label>
                  <Textarea
                    id="lesson-notes"
                    rows={3}
                    value={editing.body}
                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lesson-minutes">Duration (minutes)</Label>
                  <Input
                    id="lesson-minutes"
                    type="number"
                    min={0}
                    value={editing.duration_minutes}
                    onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Checkbox
                    checked={editing.is_required}
                    onCheckedChange={(c) => setEditing({ ...editing, is_required: !!c })}
                  />
                  Required for completion
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || uploading}>
                  {busy ? "Saving…" : "Save lesson"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
