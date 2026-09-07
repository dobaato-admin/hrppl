/**
 * Wave 6 — the LMS content layer: lessons, per-learner progress, and the quiz
 * gate that depends on them.
 *
 * Two audiences share this module and they get different answers:
 *
 * - **Authors** (`assertTrainingAuthor` — org_admin, super_admin, manager, hr)
 *   build the lesson list from `/admin/training/$courseId`.
 * - **Learners** work through it at `/me/training/$courseId` and may write
 *   nothing but their own progress. RLS says the same thing independently
 *   ("training_lesson_progress own write"): a lesson somebody else marked
 *   complete on your behalf would make completion meaningless, and completion
 *   feeds compliance reporting.
 *
 * Media never reaches a learner as a bucket path. `getLessonMediaUrl` checks
 * enrollment on the caller's own client and only then signs, with the
 * service-role client, for ten minutes.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";
import { assertTrainingAuthor, getCallerEmployee } from "@/lib/training-guard";

const CONTENT_TYPES = ["rich_text", "video", "document", "external_link"] as const;

const LessonSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content_type: z.enum(CONTENT_TYPES).default("rich_text"),
  body: z.string().max(50000).optional().nullable(),
  content_url: z.string().max(1000).optional().nullable(),
  duration_minutes: z.number().int().min(0).max(10000).optional().nullable(),
  is_required: z.boolean().default(true),
  sort_order: z.number().int().min(0).optional(),
});

/**
 * A lesson has to carry the thing its type promises, or the player renders an
 * empty pane and the learner cannot tell whether that is the lesson or a bug.
 */
function assertLessonComplete(data: z.infer<typeof LessonSchema>) {
  if (data.content_type === "rich_text" && !data.body?.trim()) {
    throw new Error("A text lesson needs a body");
  }
  if (data.content_type !== "rich_text" && !data.content_url?.trim()) {
    const what = data.content_type === "external_link" ? "a link" : "an uploaded file";
    throw new Error(`A ${data.content_type.replace("_", " ")} lesson needs ${what}`);
  }
  if (data.content_type === "external_link" && !/^https?:\/\//i.test(data.content_url ?? "")) {
    throw new Error("Link lessons must point at an http(s) URL");
  }
}

// ============================== AUTHORING ==============================

export const listLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ course_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    // RLS decides who sees these: administrators of the tenant, plus the
    // learners actually enrolled. No extra filter needed, and adding one would
    // make the page lie about why it is empty.
    const { data: rows, error } = await supabase
      .from("training_lessons")
      .select("*")
      .eq("course_id", data.course_id)
      .order("sort_order");
    if (error) throw error;
    return { lessons: rows ?? [] };
  });

export const upsertLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LessonSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    assertLessonComplete(data);

    let sort_order = data.sort_order;
    if (sort_order == null) {
      const { count } = await supabase
        .from("training_lessons")
        .select("id", { count: "exact", head: true })
        .eq("course_id", data.course_id);
      sort_order = count ?? 0;
    }

    const payload: any = { ...data, tenant_id, sort_order };
    if (!data.id) payload.created_by = userId;
    const { data: row, error } = data.id
      ? await supabase.from("training_lessons").update(payload).eq("id", data.id).select().single()
      : await supabase.from("training_lessons").insert(payload).select().single();
    if (error) throw error;
    return { lesson: row };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertTrainingAuthor(supabase, userId, await requireTenantId(supabase, userId));
    const { error } = await supabase.from("training_lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const reorderLessons = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        course_id: z.string().uuid(),
        lesson_ids: z.array(z.string().uuid()).min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);

    // Reordering is one round trip, not one per lesson. `upsert` needs the
    // full row shape, so read the current rows and write them back renumbered
    // — 36 loop-with-query sites are already on the performance backlog and
    // this is not going to be the 37th.
    const { data: current, error: readErr } = await supabase
      .from("training_lessons")
      .select("*")
      .eq("course_id", data.course_id);
    if (readErr) throw readErr;

    const byId = new Map((current ?? []).map((l: any) => [l.id, l]));
    const rows = data.lesson_ids
      .map((id, i) => {
        const row = byId.get(id);
        return row ? { ...row, sort_order: i } : null;
      })
      .filter(Boolean);
    if (rows.length !== (current ?? []).length) {
      throw new Error("Reorder must list every lesson in the course exactly once");
    }

    const { error } = await supabase.from("training_lessons").upsert(rows as any[]);
    if (error) throw error;
    return { ok: true, count: rows.length };
  });

export const updateCourseContentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        course_id: z.string().uuid(),
        content_mode: z.enum(["external", "lessons"]),
        require_lessons_before_quiz: z.boolean(),
        pass_score: z.number().min(0).max(100).optional(),
        max_attempts: z.number().int().min(1).max(20).optional().nullable(),
        validity_months: z.number().int().min(1).max(600).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);

    if (data.content_mode === "lessons") {
      const { count } = await supabase
        .from("training_lessons")
        .select("id", { count: "exact", head: true })
        .eq("course_id", data.course_id);
      if (!count) {
        throw new Error("Add at least one lesson before switching this course to hosted content");
      }
    }

    const { course_id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("training_courses")
      .update(patch)
      .eq("id", course_id)
      .select()
      .single();
    if (error) throw error;
    return { course: row };
  });

// ============================== MEDIA ==============================

export const createLessonUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        course_id: z.string().uuid(),
        filename: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);

    // Path convention is <tenant_id>/<course_id>/<filename>, which the storage
    // policy's first-segment tenant check depends on. Strip anything that
    // could climb out of it.
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const path = `${tenant_id}/${data.course_id}/${Date.now()}-${safe}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("training-content")
      .createSignedUploadUrl(path);
    if (error) throw error;
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const getLessonMediaUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ lesson_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    // Read the lesson through the CALLER's client: "training_lessons read"
    // already limits this to staff and enrolled learners, so a lesson the
    // caller may not open simply is not found here — before anything is signed.
    const { data: lesson, error } = await supabase
      .from("training_lessons")
      .select("id,content_type,content_url,tenant_id")
      .eq("id", data.lesson_id)
      .maybeSingle();
    if (error) throw error;
    if (!lesson) throw new Error("Lesson not found");
    if ((lesson as any).content_type === "external_link") {
      return { url: (lesson as any).content_url as string };
    }
    const path = (lesson as any).content_url as string | null;
    if (!path) throw new Error("This lesson has no file attached");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("training-content")
      .createSignedUrl(path, 60 * 10);
    if (signErr) throw signErr;
    return { url: signed.signedUrl };
  });

// ============================== THE PLAYER ==============================

/**
 * Everything `/me/training/$courseId` needs, in one round trip: the
 * enrollment, the course, its lessons, this learner's progress, and whether
 * the quiz is open yet.
 */
export const getCoursePlayer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ enrollment_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getCallerEmployee(supabase, userId);

    const { data: enrollment, error } = await supabase
      .from("training_enrollments")
      .select(
        "*, training_courses(id,title,description,external_url,pass_score,max_attempts," +
          "validity_months,is_mandatory,content_mode,require_lessons_before_quiz," +
          "questions_per_attempt,shuffle_questions)",
      )
      .eq("id", data.enrollment_id)
      .maybeSingle();
    if (error) throw error;
    if (!enrollment) throw new Error("Enrollment not found");

    const course = (enrollment as any).training_courses;
    const { data: lessons } = await supabase
      .from("training_lessons")
      .select("id,title,content_type,body,content_url,duration_minutes,is_required,sort_order")
      .eq("course_id", course.id)
      .order("sort_order");

    const employeeId = (enrollment as any).employee_id;
    const { data: progress } = await supabase
      .from("training_lesson_progress")
      .select("lesson_id,started_at,completed_at")
      .eq("course_id", course.id)
      .eq("employee_id", employeeId);

    const done = new Set(
      (progress ?? []).filter((p: any) => p.completed_at).map((p: any) => p.lesson_id),
    );
    const required = (lessons ?? []).filter((l: any) => l.is_required);
    const requiredDone = required.filter((l: any) => done.has(l.id)).length;

    // A course still in 'external' mode has no lessons to gate on, so the quiz
    // is open — that is every course that existed before this wave.
    const gated =
      course.content_mode === "lessons" &&
      course.require_lessons_before_quiz &&
      required.length > 0;

    const { count: questionCount } = await supabase
      .from("training_quiz_questions_public")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);

    return {
      enrollment,
      course,
      lessons: lessons ?? [],
      progress: progress ?? [],
      isOwner: !!emp && emp.id === employeeId,
      requiredTotal: required.length,
      requiredDone,
      quizUnlocked: !gated || requiredDone >= required.length,
      questionCount: questionCount ?? 0,
    };
  });

export const markLessonProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        lesson_id: z.string().uuid(),
        completed: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getCallerEmployee(supabase, userId);
    if (!emp) throw new Error("Only an employee can record training progress");

    const { data: lesson, error: lessonErr } = await supabase
      .from("training_lessons")
      .select("id,course_id,tenant_id")
      .eq("id", data.lesson_id)
      .maybeSingle();
    if (lessonErr) throw lessonErr;
    if (!lesson) throw new Error("Lesson not found");

    // Progress without an enrollment would count toward a roster the learner
    // was never on.
    const { data: enrollment } = await supabase
      .from("training_enrollments")
      .select("id,status")
      .eq("course_id", (lesson as any).course_id)
      .eq("employee_id", emp.id)
      .maybeSingle();
    if (!enrollment) throw new Error("You are not enrolled in this course");

    const { error } = await supabase.from("training_lesson_progress").upsert(
      {
        tenant_id: (lesson as any).tenant_id,
        lesson_id: (lesson as any).id,
        course_id: (lesson as any).course_id,
        employee_id: emp.id,
        completed_at: data.completed ? new Date().toISOString() : null,
      },
      { onConflict: "lesson_id,employee_id" },
    );
    if (error) throw error;

    // Opening the first lesson is what "in progress" means. Doing it here
    // rather than in the UI keeps the roster honest even if the learner never
    // touches the status control.
    if ((enrollment as any).status === "assigned") {
      await supabase
        .from("training_enrollments")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", (enrollment as any).id);
    }
    return { ok: true };
  });

// ============================== THE ROSTER ==============================

/**
 * Per-enrollment lesson completion for `/org/training`, so a manager can see
 * where their team actually is instead of only whether the quiz has been
 * passed.
 */
export const listCourseProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ course_id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);

    let lessonQuery = supabase
      .from("training_lessons")
      .select("id,course_id,is_required")
      .eq("tenant_id", tenantId);
    if (data.course_id) lessonQuery = lessonQuery.eq("course_id", data.course_id);
    const { data: lessons, error } = await lessonQuery;
    if (error) throw error;
    if (!lessons?.length)
      return { progress: {} as Record<string, { done: number; total: number }> };

    const requiredByCourse = new Map<string, Set<string>>();
    for (const l of lessons as any[]) {
      if (!l.is_required) continue;
      if (!requiredByCourse.has(l.course_id)) requiredByCourse.set(l.course_id, new Set());
      requiredByCourse.get(l.course_id)!.add(l.id);
    }

    // One query for every learner's completions, not one per enrollment.
    let progressQuery = supabase
      .from("training_lesson_progress")
      .select("lesson_id,course_id,employee_id,completed_at")
      .eq("tenant_id", tenantId)
      .not("completed_at", "is", null);
    if (data.course_id) progressQuery = progressQuery.eq("course_id", data.course_id);
    const { data: rows, error: pErr } = await progressQuery;
    if (pErr) throw pErr;

    const progress: Record<string, { done: number; total: number }> = {};
    for (const [courseId, required] of requiredByCourse) {
      progress[courseId] = { done: 0, total: required.size };
    }
    const seen = new Map<string, number>();
    for (const r of (rows ?? []) as any[]) {
      if (!requiredByCourse.get(r.course_id)?.has(r.lesson_id)) continue;
      const key = `${r.course_id}:${r.employee_id}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }

    // Keyed by "<course_id>:<employee_id>" so the roster can look a row up
    // directly; the per-course totals ride along under the bare course id.
    const byEnrollment: Record<string, { done: number; total: number }> = { ...progress };
    for (const [key, done] of seen) {
      const courseId = key.split(":")[0];
      byEnrollment[key] = { done, total: requiredByCourse.get(courseId)?.size ?? 0 };
    }
    return { progress: byEnrollment };
  });
