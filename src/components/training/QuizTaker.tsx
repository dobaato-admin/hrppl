import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listQuestions, submitQuizAttempt, listAttempts } from "@/lib/training.functions";

/**
 * The quiz, as a learner sees it.
 *
 * W6 · Extracted from `/me/training` unchanged so the course player at
 * `/me/training/$enrollmentId` can open the same dialog at the end of the
 * lesson list. Two copies of a graded assessment would be two places for the
 * attempt-limit and pass-score logic to drift.
 *
 * `listQuestions` reads the `training_quiz_questions_public` view, which omits
 * `correct_index` and `explanation` — grading happens server-side in
 * `submitQuizAttempt`. Until 20260906090000 that view returned nothing at all
 * to a learner, so this component rendered "No quiz questions have been set
 * for this course yet" for everyone; see that migration's header.
 */
export function QuizTaker({ enrollment, onClose }: { enrollment: any; onClose: () => void }) {
  const open = !!enrollment;
  const qFn = useServerFn(listQuestions);
  const submitFn = useServerFn(submitQuizAttempt);
  const attemptsFn = useServerFn(listAttempts);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: qData, isPending: questionsPending } = useQuery({
    queryKey: ["quiz-take", enrollment?.course_id],
    queryFn: () =>
      qFn({ data: { course_id: enrollment.course_id, include_answers: false, for_attempt: true } }),
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
    if (questions.length === 0) {
      toast.error("No quiz available for this course");
      return;
    }
    const payload = questions
      .filter((q: any) => answers[q.id] != null)
      .map((q: any) => ({ question_id: q.id, selected_index: answers[q.id] }));
    if (payload.length < questions.length) {
      toast.error("Answer all questions");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFn({ data: { enrollment_id: enrollment.id, answers: payload } });
      setResult(res);
      refetchAttempts();
      if (res.passed) toast.success(`Passed with ${res.percentage}%`);
      else toast.error(`Failed — ${res.percentage}% (need ${passScore}%)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setAnswers({});
          setResult(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course?.title}</DialogTitle>
          <CardDescription>
            Pass score {passScore}%. Attempts {priorAttempts.length}
            {maxAttempts ? ` / ${maxAttempts}` : ""}.
          </CardDescription>
        </DialogHeader>

        {priorAttempts.length > 0 && !result && (
          <div className="rounded border p-2 text-xs">
            <div className="mb-1 font-medium">Past attempts</div>
            {priorAttempts.map((a: any) => (
              <div key={a.id} className="flex justify-between">
                <span>
                  #{a.attempt_number} · {new Date(a.attempted_at).toLocaleString()}
                </span>
                <span className={a.passed ? "text-primary" : "text-destructive"}>
                  {a.percentage}% {a.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div
            className={`rounded-md border p-4 text-center ${result.passed ? "border-primary" : "border-destructive"}`}
          >
            <div className="text-2xl font-bold">{result.percentage}%</div>
            <div className="text-sm">
              {result.score} / {result.max_score} points
            </div>
            <Badge variant={result.passed ? "default" : "destructive"} className="mt-2">
              {result.passed ? "Passed" : "Failed"}
            </Badge>
          </div>
        )}

        {/* "Not loaded yet" and "none exist" are different answers, and saying
            the second while the first is true is how an RLS bug hid for months:
            this dialog announced the course was unconfigured every single time
            it opened, so the sentence never looking any different when it was
            permanently true drew nobody's attention. See the header of
            supabase/migrations/20260906090000_training_x07_learner_access.sql. */}
        {!result && questionsPending && (
          <p className="text-sm text-muted-foreground">Loading the quiz…</p>
        )}

        {!result && !questionsPending && questions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No quiz questions have been set for this course yet.
          </p>
        )}

        {!result && !questionsPending && questions.length > 0 && !exhausted && (
          <div className="max-h-[50vh] space-y-4 overflow-auto">
            {questions.map((q: any, i: number) => (
              <div key={q.id} className="space-y-2">
                <Label>
                  {i + 1}. {q.question}
                </Label>
                {(q.choices as string[]).map((c, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 rounded border p-2 text-sm hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                    />
                    <span>
                      {String.fromCharCode(65 + idx)}. {c}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        {exhausted && !result && (
          <p className="text-sm text-destructive">You have used all {maxAttempts} attempts.</p>
        )}

        <DialogFooter>
          {result ? (
            <Button
              onClick={() => {
                setResult(null);
                setAnswers({});
                onClose();
              }}
            >
              Close
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={submitting || exhausted || questionsPending || questions.length === 0}
            >
              {submitting ? "Submitting…" : "Submit quiz"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
