import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  listQuestions,
  upsertQuestion,
  deleteQuestion,
  copyQuestions,
  importQuestions,
} from "@/lib/training.functions";
import { questionsToCsv, csvToQuestions, downloadCsv, QUIZ_CSV_HEADER } from "@/lib/quiz-csv";

/**
 * The question bank for one course.
 *
 * W6 · This was a modal on `/admin/training` — a 400-line dialog reached from
 * a table row, which is the wrong home for the half of a course that takes
 * longest to write. It now sits inline in the Quiz tab of the course builder
 * at `/admin/training/$courseId`, beside the lessons the quiz is meant to
 * test, and the catalogue row links there instead of opening a modal.
 *
 * The editor itself is unchanged: same server fns, same CSV import/export,
 * same copy-from-another-course. Only its container moved.
 */
export function QuizEditor({ course, courses }: { course: any; courses: any[] }) {
  const qc = useQueryClient();
  const qFn = useServerFn(listQuestions);
  const saveQ = useServerFn(upsertQuestion);
  const delQ = useServerFn(deleteQuestion);
  const copyFn = useServerFn(copyQuestions);
  const importFn = useServerFn(importQuestions);
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
    enabled: !!course?.id,
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

  if (!course) return null;
  const questions = data?.questions ?? [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Pass score {course.pass_score ?? 70}%. {questions.length} question(s).
      </p>

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
                const safe = (course.title || "quiz").replace(/[^a-z0-9-_]+/gi, "_").toLowerCase();
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
                    {importPreview.errors.length ? `, ${importPreview.errors.length} issue(s)` : ""}
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit">Save question</Button>
          </div>
        </form>
      )}
    </div>
  );
}
