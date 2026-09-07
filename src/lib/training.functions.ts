import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";
import { assertTrainingAuthor, isTrainingAuthor } from "@/lib/training-guard";
import { resolveTimeZone, workDateInZone } from "@/lib/work-date";

/**
 * W6 · This module used to read `profiles.tenant_id` directly, which is NULL
 * for a platform account and ignores `platform_acting_tenant` entirely. Going
 * through `requireTenantId` makes training one of the modules a super_admin
 * can actually use while acting as a tenant, instead of one that answers
 * "No tenant" next to a page that works.
 */
async function getTenant(supabase: any, userId: string) {
  return requireTenantId(supabase, userId);
}
/**
 * Today, as the tenant's own calendar reckons it.
 *
 * `new Date().toISOString().slice(0, 10)` was used here for both the overdue
 * cut-off and the certificate-expiry horizon. That is today *in UTC*, so a
 * Kathmandu tenant (UTC+05:45) chased people for training that was not yet
 * overdue for the first six hours of every day, and a New York tenant stopped
 * chasing five hours early. See src/lib/work-date.ts.
 */
async function tenantToday(supabase: any, tenantId: string): Promise<string> {
  const { data } = await supabase
    .from("tenants")
    .select("timezone")
    .eq("id", tenantId)
    .maybeSingle();
  return workDateInZone(new Date(), resolveTimeZone((data as any)?.timezone));
}

async function getEmployee(supabase: any, userId: string) {
  const { data } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}

// ============ COURSES ============
const CourseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  provider: z.string().max(160).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  duration_hours: z.number().nonnegative().optional().nullable(),
  is_mandatory: z.boolean().default(false),
  validity_months: z.number().int().positive().max(600).optional().nullable(),
  external_url: z.string().url().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
  pass_score: z.number().min(0).max(100).default(70),
  max_attempts: z.number().int().min(1).max(20).optional().nullable(),
  questions_per_attempt: z.number().int().min(1).max(200).optional().nullable(),
  shuffle_questions: z.boolean().default(false),
});


export const listCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("training_courses")
      .select("*")
      .order("title");
    if (error) throw error;
    return { courses: data ?? [] };
  });

export const upsertCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CourseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    const payload: any = { ...data, tenant_id };
    if (!data.id) payload.created_by = userId;
    const { data: row, error } = data.id
      ? await supabase.from("training_courses").update(payload).eq("id", data.id).select().single()
      : await supabase.from("training_courses").insert(payload).select().single();
    if (error) throw error;
    return { course: row };
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertTrainingAuthor(supabase, userId, await getTenant(supabase, userId));
    const { error } = await supabase.from("training_courses").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ============ ENROLLMENTS ============
const AssignSchema = z.object({
  course_id: z.string().uuid(),
  employee_ids: z.array(z.string().uuid()).min(1).max(500),
  due_date: z.string().optional().nullable(),
});

export const assignCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AssignSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    // X-07 · This was the function with no role check at all. branch_admin
    // could see the Assign button, and Postgres refused the insert.
    await assertTrainingAuthor(supabase, userId, tenant_id);
    const rows = data.employee_ids.map((employee_id) => ({
      tenant_id,
      course_id: data.course_id,
      employee_id,
      assigned_by: userId,
      due_date: data.due_date || null,
      status: "assigned" as const,
    }));
    const { error } = await supabase.from("training_enrollments").upsert(rows, { onConflict: "course_id,employee_id", ignoreDuplicates: true });
    if (error) throw error;
    return { ok: true, count: rows.length };
  });

const UpdateEnrollmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["assigned","in_progress","completed","expired","waived"]).optional(),
  score: z.number().min(0).max(100).optional().nullable(),
  certificate_url: z.string().url().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  completed_at: z.string().optional().nullable(),
});

export const updateEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateEnrollmentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // Two callers with different rights: a learner moving their OWN enrollment
    // to in_progress from /me/training (RLS "employee update own enrollment
    // progress"), and an administrator setting any status from /org/training.
    // A learner may not waive or complete their own course.
    const tenant_id = await getTenant(supabase, userId);
    const { data: target } = await supabase
      .from("training_enrollments")
      .select("id,employee_id")
      .eq("id", data.id)
      .maybeSingle();
    const emp = await getEmployee(supabase, userId);
    const isOwner = !!emp && (target as any)?.employee_id === emp.id;
    if (!isOwner) await assertTrainingAuthor(supabase, userId, tenant_id);
    else if (data.status && !["assigned", "in_progress"].includes(data.status)) {
      throw new Error("Completion is recorded by passing the quiz, not by self-declaration");
    }
    const patch: any = { ...data };
    delete patch.id;
    if (patch.status === "in_progress" && !patch.started_at) patch.started_at = new Date().toISOString();
    if (patch.status === "completed" && !patch.completed_at) patch.completed_at = new Date().toISOString();

    const { data: row, error } = await supabase
      .from("training_enrollments").update(patch).eq("id", data.id)
      .select("*, training_courses(id,title,validity_months,is_mandatory), employees(id,first_name,last_name)")
      .single();
    if (error) throw error;

    // Auto-create certification when completed and course has validity
    if (row.status === "completed" && row.training_courses?.validity_months) {
      const tenant_id = await getTenant(supabase, userId);
      const completedAt = new Date(row.completed_at ?? Date.now());
      const expires = new Date(completedAt);
      expires.setMonth(expires.getMonth() + row.training_courses.validity_months);
      await supabase.from("certifications").insert({
        tenant_id,
        employee_id: row.employee_id,
        name: row.training_courses.title,
        issued_on: completedAt.toISOString().slice(0, 10),
        expires_on: expires.toISOString().slice(0, 10),
        file_url: row.certificate_url ?? null,
        source_course_id: row.training_courses.id,
        source_enrollment_id: row.id,
        created_by: userId,
      });
    }
    return { enrollment: row };
  });

export const listEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["me","all"]).default("all"),
    status: z.string().optional(),
    course_id: z.string().uuid().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("training_enrollments")
      .select("*, training_courses(id,title,category,is_mandatory,validity_months,content_mode,pass_score,max_attempts), employees(id,first_name,last_name,email,job_title)")
      .order("assigned_at", { ascending: false });
    if (data.scope === "me") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { enrollments: [] };
      q = q.eq("employee_id", emp.id);
    }
    if (data.status) q = q.eq("status", data.status);
    if (data.course_id) q = q.eq("course_id", data.course_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { enrollments: rows ?? [] };
  });

export const deleteEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertTrainingAuthor(supabase, userId, await getTenant(supabase, userId));
    const { error } = await supabase.from("training_enrollments").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ============ CERTIFICATIONS ============
const CertSchema = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().max(160).optional().nullable(),
  credential_id: z.string().max(120).optional().nullable(),
  issued_on: z.string().optional().nullable(),
  expires_on: z.string().optional().nullable(),
  file_url: z.string().url().max(500).optional().nullable(),
});

export const upsertCertification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    // /me/training lets anyone record their OWN external certification; only
    // a training administrator may record one against somebody else.
    const emp = await getEmployee(supabase, userId);
    let employee_id = data.employee_id;
    if (!employee_id) {
      if (!emp) throw new Error("No employee record");
      employee_id = emp.id;
    } else if (employee_id !== emp?.id) {
      await assertTrainingAuthor(supabase, userId, tenant_id);
    }
    const payload: any = { ...data, tenant_id, employee_id };
    if (!data.id) payload.created_by = userId;
    const { data: row, error } = data.id
      ? await supabase.from("certifications").update(payload).eq("id", data.id).select().single()
      : await supabase.from("certifications").insert(payload).select().single();
    if (error) throw error;
    return { certification: row };
  });

export const deleteCertification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: cert } = await supabase
      .from("certifications").select("employee_id").eq("id", data.id).maybeSingle();
    const emp = await getEmployee(supabase, userId);
    if (!emp || (cert as any)?.employee_id !== emp.id) {
      await assertTrainingAuthor(supabase, userId, await getTenant(supabase, userId));
    }
    const { error } = await supabase.from("certifications").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listCertifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["me","all","expiring"]).default("all"),
    days: z.number().int().min(1).max(365).default(60),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("certifications")
      .select("*, employees(id,first_name,last_name,email,job_title)")
      .order("expires_on", { ascending: true, nullsFirst: false });
    if (data.scope === "me") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { certifications: [] };
      q = q.eq("employee_id", emp.id);
    } else if (data.scope === "expiring") {
      // The horizon counts from the tenant's today, not UTC's. See tenantToday.
      const today = await tenantToday(supabase, await getTenant(supabase, userId));
      const horizon = new Date(`${today}T00:00:00Z`);
      horizon.setUTCDate(horizon.getUTCDate() + data.days);
      q = q.lte("expires_on", horizon.toISOString().slice(0, 10));
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { certifications: rows ?? [] };
  });

// ============ QUIZ QUESTIONS ============
const QuestionSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  sort_order: z.number().int().min(0).default(0),
  question: z.string().min(1).max(2000),
  choices: z.array(z.string().min(1).max(500)).min(2).max(8),
  correct_index: z.number().int().min(0).max(7),
  points: z.number().positive().max(100).default(1),
  explanation: z.string().max(1000).optional().nullable(),
});

export const listQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    course_id: z.string().uuid(),
    include_answers: z.boolean().default(false),
    for_attempt: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let allowAnswers = data.include_answers;
    if (allowAnswers) {
      // X-07 · hr authors quizzes as of 20260906090000, so the answer key is
      // theirs to see. branch_admin is read-only and stays on the safe view.
      allowAnswers = await isTrainingAuthor(supabase, userId, await getTenant(supabase, userId));
    }
    // Managers/admins read the full table (RLS-allowed); learners read the safe view that omits correct_index/explanation.
    const table = allowAnswers ? "training_quiz_questions" : "training_quiz_questions_public";
    const cols = allowAnswers ? "*" : "id,course_id,sort_order,question,choices,points";
    const { data: rows, error } = await supabase
      .from(table)
      .select(cols)
      .eq("course_id", data.course_id)
      .order("sort_order");
    if (error) throw error;


    let list: any[] = rows ?? [];
    if (data.for_attempt) {
      const { data: course } = await supabase
        .from("training_courses")
        .select("questions_per_attempt,shuffle_questions")
        .eq("id", data.course_id).maybeSingle();
      if (course?.shuffle_questions) list = [...list].sort(() => Math.random() - 0.5);
      if (course?.questions_per_attempt && list.length > course.questions_per_attempt) {
        const pool = course?.shuffle_questions ? list : [...list].sort(() => Math.random() - 0.5);
        list = pool.slice(0, course.questions_per_attempt);
      }
    }
    return { questions: list };
  });

const CopyQuestionsSchema = z.object({
  source_course_id: z.string().uuid(),
  target_course_id: z.string().uuid(),
  question_ids: z.array(z.string().uuid()).optional(),
});

export const copyQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CopyQuestionsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    let q = supabase.from("training_quiz_questions")
      .select("sort_order,question,choices,correct_index,points,explanation")
      .eq("course_id", data.source_course_id);
    if (data.question_ids?.length) q = q.in("id", data.question_ids);
    const { data: src, error } = await q;
    if (error) throw error;
    if (!src?.length) return { ok: true, count: 0 };

    const { count: existing } = await supabase
      .from("training_quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("course_id", data.target_course_id);
    const base = existing ?? 0;

    const rows = src.map((r: any, i: number) => ({
      tenant_id,
      course_id: data.target_course_id,
      sort_order: base + i,
      question: r.question,
      choices: r.choices,
      correct_index: r.correct_index,
      points: r.points,
      explanation: r.explanation,
      created_by: userId,
    }));
    const { error: insErr } = await supabase.from("training_quiz_questions").insert(rows);
    if (insErr) throw insErr;
    return { ok: true, count: rows.length };
  });

const ImportQuestionsSchema = z.object({
  course_id: z.string().uuid(),
  mode: z.enum(["append", "replace"]).default("append"),
  questions: z.array(z.object({
    question: z.string().min(1).max(2000),
    choices: z.array(z.string().min(1).max(500)).min(2).max(8),
    correct_index: z.number().int().min(0).max(7),
    points: z.number().positive().max(100).default(1),
    explanation: z.string().max(1000).optional().nullable(),
    sort_order: z.number().int().min(0).optional(),
  })).min(1).max(500),
});

export const importQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ImportQuestionsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);

    await assertTrainingAuthor(supabase, userId, tenant_id);

    for (const q of data.questions) {
      if (q.correct_index >= q.choices.length) throw new Error(`correct_index out of range for: ${q.question.slice(0, 60)}`);
    }

    if (data.mode === "replace") {
      const { error: delErr } = await supabase.from("training_quiz_questions").delete().eq("course_id", data.course_id);
      if (delErr) throw delErr;
    }

    const { count: existing } = await supabase
      .from("training_quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("course_id", data.course_id);
    const base = existing ?? 0;

    const rows = data.questions.map((q, i) => ({
      tenant_id,
      course_id: data.course_id,
      sort_order: q.sort_order ?? base + i,
      question: q.question,
      choices: q.choices,
      correct_index: q.correct_index,
      points: q.points,
      explanation: q.explanation ?? null,
      created_by: userId,
    }));
    const { error: insErr } = await supabase.from("training_quiz_questions").insert(rows);
    if (insErr) throw insErr;
    return { ok: true, count: rows.length };
  });



export const upsertQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => QuestionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    if (data.correct_index >= data.choices.length) throw new Error("correct_index out of range");
    const tenant_id = await getTenant(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    const payload: any = { ...data, tenant_id };
    if (!data.id) payload.created_by = userId;
    const { data: row, error } = data.id
      ? await supabase.from("training_quiz_questions").update(payload).eq("id", data.id).select().single()
      : await supabase.from("training_quiz_questions").insert(payload).select().single();
    if (error) throw error;
    return { question: row };
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertTrainingAuthor(supabase, userId, await getTenant(supabase, userId));
    const { error } = await supabase.from("training_quiz_questions").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ============ QUIZ ATTEMPTS ============
const AttemptSchema = z.object({
  enrollment_id: z.string().uuid(),
  answers: z.array(z.object({
    question_id: z.string().uuid(),
    selected_index: z.number().int().min(0).max(7),
  })).min(1).max(200),
});

export const submitQuizAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AttemptSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);

    // Load enrollment + course
    const { data: en, error: enErr } = await supabase
      .from("training_enrollments")
      .select("id,employee_id,course_id,status,training_courses(id,title,pass_score,max_attempts,validity_months)")
      .eq("id", data.enrollment_id).single();
    if (enErr || !en) throw new Error("Enrollment not found");

    // Authorize: employee owner OR manager+
    const emp = await getEmployee(supabase, userId);
    const isOwner = emp?.id === en.employee_id;
    if (!isOwner) await assertTrainingAuthor(supabase, userId, tenant_id);

    const course = en.training_courses;
    const pass_score = Number(course?.pass_score ?? 70);
    const max_attempts = course?.max_attempts as number | null;

    // Attempt count
    const { count: prior } = await supabase
      .from("training_quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", en.id);
    if (max_attempts && (prior ?? 0) >= max_attempts) throw new Error(`Maximum attempts (${max_attempts}) reached`);

    // Load questions with answers — use admin client because RLS restricts
    // correct_index/explanation to managers/admins, but the employee taking
    // their own quiz must be graded server-side after the auth check above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const qids = data.answers.map((a) => a.question_id);
    const { data: qs, error: qErr } = await supabaseAdmin
      .from("training_quiz_questions")
      .select("id,correct_index,points")
      .eq("course_id", en.course_id)
      .in("id", qids);
    if (qErr) throw qErr;

    const qMap = new Map<string, any>((qs ?? []).map((q: any) => [q.id, q]));
    let score = 0, max = 0;
    const detailed = data.answers.map((a) => {
      const q = qMap.get(a.question_id);
      if (!q) return { ...a, correct: false, points: 0 };
      const pts = Number(q.points ?? 1);
      max += pts;
      const correct = q.correct_index === a.selected_index;
      if (correct) score += pts;
      return { ...a, correct, points: correct ? pts : 0 };
    });
    // Add unanswered questions to max
    const { data: allQ } = await supabaseAdmin
      .from("training_quiz_questions").select("id,points").eq("course_id", en.course_id);
    const answered = new Set(qids);
    (allQ ?? []).forEach((q: any) => { if (!answered.has(q.id)) max += Number(q.points ?? 1); });


    const percentage = max > 0 ? Math.round((score / max) * 10000) / 100 : 0;
    const passed = percentage >= pass_score;
    const attempt_number = (prior ?? 0) + 1;

    const { data: attempt, error: aErr } = await supabase
      .from("training_quiz_attempts")
      .insert({
        tenant_id, enrollment_id: en.id, course_id: en.course_id,
        employee_id: en.employee_id, user_id: userId,
        answers: detailed, score, max_score: max, percentage, passed, attempt_number,
      }).select().single();
    if (aErr) throw aErr;

    // On pass: mark enrollment completed and auto-issue cert if validity set
    if (passed && en.status !== "completed") {
      const completedAt = new Date().toISOString();
      await supabase.from("training_enrollments")
        .update({ status: "completed", score: percentage, completed_at: completedAt })
        .eq("id", en.id);

      if (course?.validity_months) {
        const expires = new Date(completedAt);
        expires.setMonth(expires.getMonth() + course.validity_months);
        await supabase.from("certifications").insert({
          tenant_id, employee_id: en.employee_id, name: course.title,
          issued_on: completedAt.slice(0, 10),
          expires_on: expires.toISOString().slice(0, 10),
          source_course_id: course.id, source_enrollment_id: en.id,
          created_by: userId,
        });
      }
    }

    return { attempt, passed, percentage, score, max_score: max, attempt_number };
  });

export const listAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    enrollment_id: z.string().uuid().optional(),
    course_id: z.string().uuid().optional(),
    scope: z.enum(["me","all"]).default("all"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase
      .from("training_quiz_attempts")
      .select("*, employees(id,first_name,last_name), training_courses(id,title,pass_score)")
      .order("attempted_at", { ascending: false });
    if (data.enrollment_id) q = q.eq("enrollment_id", data.enrollment_id);
    if (data.course_id) q = q.eq("course_id", data.course_id);
    if (data.scope === "me") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { attempts: [] };
      q = q.eq("employee_id", emp.id);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return { attempts: rows ?? [] };
  });

// ============ PRESETS ============
const TrainingPresetCourseSchema = z.object({
  title: z.string().min(1).max(200),
  aliases: z.array(z.string().min(1).max(200)).optional(),
  category: z.string().max(80).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  provider: z.string().max(160).optional().nullable(),
  duration_hours: z.number().nonnegative().optional().nullable(),
  is_mandatory: z.boolean().default(false),
  validity_months: z.number().int().positive().max(600).optional().nullable(),
  pass_score: z.number().min(0).max(100).default(70),
  quiz_questions: z.array(z.object({
    question: z.string().min(1).max(2000),
    choices: z.array(z.string().min(1).max(500)).min(2).max(8),
    correct_index: z.number().int().min(0).max(7),
    points: z.number().positive().max(100).default(1),
    explanation: z.string().max(1000).optional().nullable(),
  })).optional(),
});

export const seedTrainingPreset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ courses: z.array(TrainingPresetCourseSchema).min(1).max(50) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    const { data: existing } = await supabase
      .from("training_courses")
      .select("id,title")
      .eq("tenant_id", tenant_id);
    const existingByTitle = new Map(
      (existing ?? []).map((r: any) => [r.title.trim().toLowerCase(), r]),
    );
    const normalize = (value: string) => value.trim().toLowerCase();
    const coursePayload = (c: z.infer<typeof TrainingPresetCourseSchema>) => ({
      title: c.title,
      category: c.category ?? null,
      description: c.description ?? null,
      provider: c.provider ?? null,
      duration_hours: c.duration_hours ?? null,
      is_mandatory: c.is_mandatory,
      validity_months: c.validity_months ?? null,
      pass_score: c.pass_score ?? 70,
      tenant_id,
      is_active: true,
    });
    let inserted = 0;
    let updated = 0;
    let questionsSeeded = 0;
    for (const c of data.courses) {
      for (const q of c.quiz_questions ?? []) {
        if (q.correct_index >= q.choices.length) {
          throw new Error(`correct_index out of range for preset question: ${q.question.slice(0, 60)}`);
        }
      }

      const match = [c.title, ...(c.aliases ?? [])]
        .map(normalize)
        .map((title) => existingByTitle.get(title))
        .find(Boolean) as any | undefined;

      let courseId = match?.id as string | undefined;
      if (courseId) {
        const { error } = await supabase
          .from("training_courses")
          .update(coursePayload(c))
          .eq("id", courseId);
        if (error) throw error;
        updated++;
      } else {
        const { data: row, error } = await supabase
          .from("training_courses")
          .insert({ ...coursePayload(c), created_by: userId })
          .select("id,title")
          .single();
        if (error) throw error;
        courseId = row.id;
        existingByTitle.set(normalize(c.title), row);
        inserted++;
      }

      if (courseId && c.quiz_questions?.length) {
        const { error: deleteError } = await supabase
          .from("training_quiz_questions")
          .delete()
          .eq("course_id", courseId);
        if (deleteError) throw deleteError;
        const rows = c.quiz_questions.map((q, i) => ({
          tenant_id,
          course_id: courseId,
          sort_order: i,
          question: q.question,
          choices: q.choices,
          correct_index: q.correct_index,
          points: q.points ?? 1,
          explanation: q.explanation ?? null,
          created_by: userId,
        }));
        const { error, count: qCount } = await supabase
          .from("training_quiz_questions")
          .insert(rows, { count: "exact" });
        if (error) throw error;
        questionsSeeded += qCount ?? rows.length;
      }
    }
    return { inserted, updated, skipped: 0, questionsSeeded };
  });

export const sendOverdueTrainingReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ course_id: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenant_id);
    const today = await tenantToday(supabase, tenant_id);
    let q = supabase
      .from("training_enrollments")
      .select(
        "id, employee_id, course_id, due_date, status, training_courses!inner(id,title), employees!inner(id,first_name,last_name,email)",
      )
      .eq("tenant_id", tenant_id)
      .lt("due_date", today)
      .in("status", ["assigned", "in_progress"]);
    if (data.course_id) q = q.eq("course_id", data.course_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    if (!rows || rows.length === 0) return { sent: 0 };
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    let sent = 0;
    for (const r of rows as any[]) {
      const email = r.employees?.email;
      if (!email) continue;
      const due = r.due_date as string;
      const daysOverdue = Math.max(
        0,
        Math.floor((Date.now() - new Date(due).getTime()) / 86400000),
      );
      try {
        await sendInternalEmail({
          templateName: "training-overdue",
          recipientEmail: email,
          templateData: {
            recipientName: r.employees?.first_name ?? undefined,
            courseTitle: r.training_courses?.title ?? "Training course",
            dueDate: due,
            daysOverdue,
          },
          idempotencyKey: `training-overdue-${r.id}-${today}`,
        });
        sent++;
      } catch {
        /* skip individual failures */
      }
    }
    return { sent, candidates: rows.length };
  });
