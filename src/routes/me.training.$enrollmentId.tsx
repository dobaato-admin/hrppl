import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CircleCheck,
  ExternalLink,
  FileText,
  ListChecks,
  Lock,
  Video,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { QuizTaker } from "@/components/training/QuizTaker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { renderMarkdown } from "@/lib/markdown";
import {
  getCoursePlayer,
  markLessonProgress,
  getLessonMediaUrl,
} from "@/lib/training-lessons.functions";

export const Route = createFileRoute("/me/training/$enrollmentId")({
  head: () => ({ meta: [{ title: "Course — hrppl" }] }),
  component: CoursePlayerPage,
});

const ICONS: Record<string, typeof FileText> = {
  rich_text: FileText,
  video: Video,
  document: BookOpen,
  external_link: ExternalLink,
};

function CoursePlayerPage() {
  const { enrollmentId } = useParams({ from: "/me/training/$enrollmentId" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const playerFn = useServerFn(getCoursePlayer);
  const progressFn = useServerFn(markLessonProgress);
  const mediaFn = useServerFn(getLessonMediaUrl);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-player", enrollmentId],
    queryFn: () => playerFn({ data: { enrollment_id: enrollmentId } }),
    retry: false,
  });

  const lessons: any[] = data?.lessons ?? [];
  const completed = useMemo(
    () =>
      new Set(
        (data?.progress ?? []).filter((p: any) => p.completed_at).map((p: any) => p.lesson_id),
      ),
    [data],
  );

  // Resume where the learner left off: the first lesson they have not
  // finished, or the last one if they have finished them all.
  useEffect(() => {
    if (activeId || lessons.length === 0) return;
    const next = lessons.find((l) => !completed.has(l.id)) ?? lessons[lessons.length - 1];
    setActiveId(next.id);
  }, [lessons, completed, activeId]);

  const active = lessons.find((l) => l.id === activeId) ?? null;

  // Media is signed on demand and expires in ten minutes, so it is fetched per
  // lesson rather than up front for the whole course.
  useEffect(() => {
    setMediaUrl(null);
    setMediaError(null);
    if (!active || active.content_type === "rich_text") return;
    let cancelled = false;
    mediaFn({ data: { lesson_id: active.id } })
      .then((r) => !cancelled && setMediaUrl(r.url))
      .catch((e: any) => !cancelled && setMediaError(e?.message ?? "Could not open this file"));
    return () => {
      cancelled = true;
    };
  }, [active?.id]);

  async function toggleComplete(lessonId: string, done: boolean) {
    try {
      await progressFn({ data: { lesson_id: lessonId, completed: done } });
      await qc.invalidateQueries({ queryKey: ["course-player", enrollmentId] });
      qc.invalidateQueries({ queryKey: ["me-training"] });
      if (done) {
        const idx = lessons.findIndex((l) => l.id === lessonId);
        if (idx >= 0 && idx < lessons.length - 1) setActiveId(lessons[idx + 1].id);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save your progress");
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Course">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <SkeletonRows rows={6} />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Course">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <EmptyState
            icon={Lock}
            tone="pending"
            title="This course is not open to you"
            description="It may have been unassigned, or the link belongs to someone else."
            action={
              <Button asChild variant="outline">
                <Link to="/me/training">Back to my training</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const { course, enrollment, requiredTotal, requiredDone, quizUnlocked, questionCount } = data;
  const pct = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 0;
  const isDone = enrollment.status === "completed";

  return (
    <AppShell
      title={course.title}
      subtitle={course.description ?? "Work through the lessons, then take the quiz"}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/me/training">
            <ArrowLeft className="mr-1 h-4 w-4" /> My training
          </Link>
        </Button>
      }
    >
      <section className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <SectionCard
          tone={isDone ? "done" : "primary"}
          title={isDone ? "Completed" : "Your progress"}
          description={
            requiredTotal > 0
              ? `${requiredDone} of ${requiredTotal} required lesson(s) done`
              : "This course has no hosted lessons — take the quiz when you are ready."
          }
          actions={
            enrollment.due_date ? (
              <StatusChip tone={isDone ? "done" : "pending"}>Due {enrollment.due_date}</StatusChip>
            ) : undefined
          }
        >
          {requiredTotal > 0 && <Progress value={pct} className="h-2" />}
          {enrollment.score != null && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last quiz score: {enrollment.score}%
            </p>
          )}
        </SectionCard>

        {lessons.length === 0 ? (
          <SectionCard title="Course material">
            {course.external_url ? (
              <EmptyState
                icon={ExternalLink}
                title="This course is delivered elsewhere"
                description="Open the provider's material, then come back and take the quiz."
                action={
                  <Button asChild>
                    <a href={course.external_url} target="_blank" rel="noreferrer">
                      Open course <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No lessons published yet"
                description="Your administrator has not added the course material. The quiz may still be available."
              />
            )}
          </SectionCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
            {/* --------------------------------------------- lesson list -- */}
            <SectionCard title="Lessons" className="h-fit">
              <ol className="space-y-1">
                {lessons.map((l, i) => {
                  const Icon = ICONS[l.content_type] ?? FileText;
                  const done = completed.has(l.id);
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(l.id)}
                        aria-current={l.id === activeId}
                        className={
                          "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition " +
                          (l.id === activeId
                            ? "bg-primary/10 font-medium text-primary"
                            : "hover:bg-muted")
                        }
                      >
                        <span className="mt-0.5 shrink-0">
                          {done ? (
                            <CircleCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">
                            {i + 1}. {l.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {l.duration_minutes ? `${l.duration_minutes} min` : null}
                            {!l.is_required && (l.duration_minutes ? " · optional" : "optional")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </SectionCard>

            {/* ------------------------------------------- content pane -- */}
            <SectionCard
              title={active?.title ?? "Select a lesson"}
              description={active?.is_required === false ? "Optional" : undefined}
              actions={
                active ? (
                  <Button
                    size="sm"
                    variant={completed.has(active.id) ? "outline" : "default"}
                    onClick={() => toggleComplete(active.id, !completed.has(active.id))}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    {completed.has(active.id) ? "Mark not done" : "Mark complete"}
                  </Button>
                ) : undefined
              }
            >
              {!active ? (
                <p className="text-sm text-muted-foreground">Pick a lesson from the list.</p>
              ) : (
                <div className="space-y-4">
                  {active.content_type === "rich_text" ? (
                    <div
                      className="prose-sm max-w-none"
                      // renderMarkdown escapes before converting — see src/lib/markdown.ts.
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(active.body ?? "") }}
                    />
                  ) : mediaError ? (
                    <p className="text-sm text-destructive">{mediaError}</p>
                  ) : !mediaUrl ? (
                    <SkeletonRows rows={3} />
                  ) : active.content_type === "video" ? (
                    <video src={mediaUrl} controls className="w-full rounded-lg border" />
                  ) : active.content_type === "document" ? (
                    <div className="space-y-2">
                      <iframe
                        src={mediaUrl}
                        title={active.title}
                        className="h-[60vh] w-full rounded-lg border"
                      />
                      <Button asChild size="sm" variant="outline">
                        <a href={mediaUrl} target="_blank" rel="noreferrer">
                          Open in a new tab <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button asChild>
                      <a href={mediaUrl} target="_blank" rel="noreferrer">
                        Open the material <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {active.content_type !== "rich_text" && active.body && (
                    <div
                      className="prose-sm max-w-none border-t pt-3"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(active.body) }}
                    />
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ------------------------------------------------------- quiz -- */}
        <SectionCard
          title="Quiz"
          description={
            questionCount === 0
              ? "No quiz has been set for this course."
              : quizUnlocked
                ? `${questionCount} question(s). Pass mark ${course.pass_score ?? 70}%.`
                : `Finish the required lessons first — ${requiredDone} of ${requiredTotal} done.`
          }
          actions={
            <Button
              size="sm"
              disabled={questionCount === 0 || !quizUnlocked}
              onClick={() => setQuizOpen(true)}
            >
              {quizUnlocked ? (
                <ListChecks className="mr-1 h-4 w-4" />
              ) : (
                <Lock className="mr-1 h-4 w-4" />
              )}
              {isDone ? "Review quiz" : "Take quiz"}
            </Button>
          }
        >
          {isDone ? (
            <Badge>Course completed</Badge>
          ) : (
            <p className="text-sm text-muted-foreground">
              Passing the quiz completes this course
              {course.validity_months ? " and issues your certificate." : "."}
            </p>
          )}
        </SectionCard>
      </section>

      <QuizTaker
        enrollment={quizOpen ? { ...enrollment, training_courses: course } : null}
        onClose={() => {
          setQuizOpen(false);
          qc.invalidateQueries({ queryKey: ["course-player", enrollmentId] });
          qc.invalidateQueries({ queryKey: ["me-training"] });
        }}
      />
    </AppShell>
  );
}
