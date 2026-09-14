import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

const ResponseSchema = z.object({
  questionId: z.string().min(1).max(64),
  rating: z.number().int().min(0).max(10).nullable().optional(),
  text: z.string().max(5000).nullable().optional(),
});

// ----- Templates -----

const QuestionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(500),
  type: z.enum(["rating", "text"]),
  required: z.boolean().default(false),
  scaleMin: z.number().int().min(0).max(10).optional(),
  scaleMax: z.number().int().min(1).max(10).optional(),
  scaleLabels: z.array(z.string().max(100)).max(11).optional(),
});

/**
 * Save a template. Editing an existing template creates a NEW version row
 * (immutable history) and marks prior versions in the family as not current.
 * Creating a new template starts at version 1 with itself as the family root.
 */
export const upsertFeedbackTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      isDefault: z.boolean().default(false),
      questions: z.array(QuestionSchema).min(1).max(30),
      changeNote: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenantId = await requireTenantId(supabase, userId);

    // Editing → create a new version in the same family
    if (data.id) {
      const { data: existing, error: eErr } = await supabase
        .from("feedback_question_templates")
        .select("id,parent_template_id,tenant_id")
        .eq("id", data.id)
        .maybeSingle();
      if (eErr || !existing) throw new Error("Template not found");
      if (existing.tenant_id !== tenantId) throw new Error("Forbidden");

      const familyRoot = (existing as any).parent_template_id ?? existing.id;
      const { data: maxRow } = await supabase
        .from("feedback_question_templates")
        .select("version")
        .eq("parent_template_id", familyRoot)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextVersion = ((maxRow as any)?.version ?? 1) + 1;

      // Mark prior versions in family as not current
      const { error: cErr } = await supabase
        .from("feedback_question_templates")
        .update({ is_current: false })
        .eq("parent_template_id", familyRoot);
      if (cErr) throw new Error(cErr.message);

      if (data.isDefault) {
        await supabase
          .from("feedback_question_templates")
          .update({ is_default: false })
          .eq("tenant_id", tenantId);
      }

      const { data: ins, error: iErr } = await supabase
        .from("feedback_question_templates")
        .insert({
          tenant_id: tenantId,
          name: data.name,
          description: data.description ?? null,
          is_default: data.isDefault,
          questions: data.questions as any,
          created_by: userId,
          updated_by: userId,
          parent_template_id: familyRoot,
          version: nextVersion,
          is_current: true,
          change_note: data.changeNote ?? null,
        } as any)
        .select("id,version")
        .single();
      if (iErr) throw new Error(iErr.message);
      return { ok: true, id: ins.id, version: (ins as any).version };
    }

    // Brand new template family
    if (data.isDefault) {
      await supabase
        .from("feedback_question_templates")
        .update({ is_default: false })
        .eq("tenant_id", tenantId);
    }
    const { data: ins, error } = await supabase
      .from("feedback_question_templates")
      .insert({
        tenant_id: tenantId,
        name: data.name,
        description: data.description ?? null,
        is_default: data.isDefault,
        questions: data.questions as any,
        created_by: userId,
        updated_by: userId,
        version: 1,
        is_current: true,
        change_note: data.changeNote ?? null,
      } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    // Backfill parent_template_id = id for the root row
    await supabase
      .from("feedback_question_templates")
      .update({ parent_template_id: ins.id } as any)
      .eq("id", ins.id);
    return { ok: true, id: ins.id, version: 1 };
  });

/**
 * Delete an entire template family (all versions). Existing requests/feedback
 * keep their pinned template_id reference (SET NULL on parent only).
 */
export const deleteFeedbackTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row } = await supabase
      .from("feedback_question_templates")
      .select("id,parent_template_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return { ok: true };
    const familyRoot = (row as any).parent_template_id ?? row.id;
    const { error } = await supabase
      .from("feedback_question_templates")
      .delete()
      .or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Return full version history for a template family (oldest → newest). */
export const getFeedbackTemplateHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ templateId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: row } = await supabase
      .from("feedback_question_templates")
      .select("id,parent_template_id,tenant_id")
      .eq("id", data.templateId)
      .maybeSingle();
    if (!row || (row as any).tenant_id !== tenantId) throw new Error("Not found");
    const familyRoot = (row as any).parent_template_id ?? row.id;
    const { data: versions, error } = await supabase
      .from("feedback_question_templates")
      .select("id,version,name,description,questions,is_current,is_default,change_note,created_at,created_by,updated_by")
      .or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`)
      .order("version", { ascending: true });
    if (error) throw new Error(error.message);
    return { versions: versions ?? [] };
  });

/**
 * Archive an entire template family — versions stay in the DB but the template
 * no longer shows in the active list (is_current = false on all family rows).
 */
export const archiveFeedbackTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: row } = await supabase
      .from("feedback_question_templates")
      .select("id,parent_template_id,tenant_id")
      .eq("id", data.id).maybeSingle();
    if (!row || (row as any).tenant_id !== tenantId) throw new Error("Not found");
    const familyRoot = (row as any).parent_template_id ?? row.id;
    const { error } = await supabase
      .from("feedback_question_templates")
      .update({ is_current: false, is_default: false } as any)
      .or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Restore an archived template — flips the latest version row back to current.
 */
export const restoreFeedbackTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: row } = await supabase
      .from("feedback_question_templates")
      .select("id,parent_template_id,tenant_id")
      .eq("id", data.id).maybeSingle();
    if (!row || (row as any).tenant_id !== tenantId) throw new Error("Not found");
    const familyRoot = (row as any).parent_template_id ?? row.id;
    const { data: latest } = await supabase
      .from("feedback_question_templates")
      .select("id")
      .or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`)
      .eq("tenant_id", tenantId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!latest) throw new Error("No versions found");
    const { error } = await supabase
      .from("feedback_question_templates")
      .update({ is_current: true } as any)
      .eq("id", (latest as any).id);
    if (error) throw new Error(error.message);
    return { ok: true, id: (latest as any).id };
  });

/** List archived template families (latest version per family). */
export const listArchivedFeedbackTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: rows } = await supabase
      .from("feedback_question_templates")
      .select("id,parent_template_id,name,description,version,questions,created_at")
      .eq("tenant_id", tenantId)
      .eq("is_current", false)
      .order("created_at", { ascending: false });
    const seen = new Set<string>();
    const out: any[] = [];
    for (const r of (rows ?? []) as any[]) {
      const fam = r.parent_template_id ?? r.id;
      if (seen.has(fam)) continue;
      seen.add(fam);
      out.push(r);
    }
    return { templates: out };
  });

// ----- Requests -----

export const requestFeedback360 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      reviewId: z.string().uuid(),
      requestedUserIds: z.array(z.string().uuid()).min(1).max(20),
      kind: z.enum(["peer", "upward"]).default("peer"),
      message: z.string().max(1000).optional(),
      templateId: z.string().uuid().optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: review, error: rErr } = await supabase
      .from("performance_reviews")
      .select("id,tenant_id,employee_id")
      .eq("id", data.reviewId)
      .maybeSingle();
    if (rErr || !review) throw new Error("Review not found");

    const roles = await getRoles(supabase, userId);
    const isAdmin = roles.some((r) => ["org_admin", "super_admin"].includes(r));
    let allowed = isAdmin;
    if (!allowed) {
      const { data: emp } = await supabase
        .from("employees").select("id,user_id,manager_id").eq("id", review.employee_id).maybeSingle();
      if (emp?.user_id === userId) allowed = true;
      else if (emp?.manager_id) {
        const { data: mgr } = await supabase.from("employees").select("user_id").eq("id", emp.manager_id).maybeSingle();
        if (mgr?.user_id === userId) allowed = true;
      }
    }
    if (!allowed) throw new Error("Not authorized to request feedback for this review");

    // Resolve template_version from pinned template_id (if provided)
    let templateVersion: number | null = null;
    if (data.templateId) {
      const { data: t } = await supabase
        .from("feedback_question_templates")
        .select("version,tenant_id")
        .eq("id", data.templateId)
        .maybeSingle();
      if (!t || (t as any).tenant_id !== review.tenant_id) throw new Error("Template not in tenant");
      templateVersion = (t as any).version ?? null;
    }

    const rows = data.requestedUserIds
      .filter((u) => u !== userId)
      .map((u) => ({
        tenant_id: review.tenant_id,
        review_id: review.id,
        subject_employee_id: review.employee_id,
        requester_id: userId,
        requested_user_id: u,
        kind: data.kind,
        message: data.message ?? null,
        template_id: data.templateId ?? null,
        template_version: templateVersion,
        due_date: data.dueDate ?? null,
      }));
    if (rows.length === 0) return { ok: true, inserted: 0 };

    const { error } = await supabase
      .from("review_feedback_requests")
      .upsert(rows, { onConflict: "review_id,requested_user_id,kind", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true, inserted: rows.length };
  });

export const submitFeedback360 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      requestId: z.string().uuid(),
      text: z.string().max(5000).optional(),
      responses: z.array(ResponseSchema).max(30).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: req, error: qErr } = await supabase
      .from("review_feedback_requests")
      .select("id,tenant_id,review_id,kind,requested_user_id,status,template_id,template_version")
      .eq("id", data.requestId)
      .maybeSingle();
    if (qErr || !req) throw new Error("Request not found");
    if (req.requested_user_id !== userId) throw new Error("Not your feedback request");
    if (req.status !== "pending") throw new Error("Request is no longer open");

    const responses = data.responses ?? [];
    const ratings = responses.map((r) => r.rating).filter((v): v is number => typeof v === "number");
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const textFallback = data.text ?? responses.filter((r) => r.text).map((r) => `${r.questionId}: ${r.text}`).join("\n\n");
    if (!textFallback && responses.length === 0) throw new Error("Provide a response");

    const { data: fb, error: fbErr } = await supabase
      .from("review_feedback")
      .insert({
        tenant_id: req.tenant_id,
        review_id: req.review_id,
        author_id: userId,
        kind: req.kind,
        text: textFallback || "(structured response)",
        template_id: (req as any).template_id,
        template_version: (req as any).template_version ?? null,
        responses: responses as any,
        avg_rating: avgRating,
      } as any)
      .select("id")
      .single();
    if (fbErr) throw new Error(fbErr.message);

    const { error: uErr } = await supabase
      .from("review_feedback_requests")
      .update({ status: "submitted", responded_at: new Date().toISOString(), feedback_id: fb.id })
      .eq("id", req.id);
    if (uErr) throw new Error(uErr.message);

    return { ok: true };
  });

export const declineFeedback360 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ requestId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: req } = await supabase
      .from("review_feedback_requests").select("id,requested_user_id,status").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.requested_user_id !== userId) throw new Error("Not your feedback request");
    if (req.status !== "pending") throw new Error("Request is no longer open");
    const { error } = await supabase
      .from("review_feedback_requests")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", req.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Reminders -----

/** Manually trigger reminder pass for the caller's tenant (admin/manager). */
export const sendFeedbackReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
      throw new Error("Not authorized");
    }
    const tenantId = await requireTenantId(supabase, userId);

    const today = new Date().toISOString().slice(0, 10);
    const { data: pending } = await supabase
      .from("review_feedback_requests")
      .select("id,due_date,reminder_count,last_reminder_at")
      .eq("tenant_id", tenantId)
      .eq("status", "pending");

    let bumped = 0;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    for (const r of pending ?? []) {
      const overdueOrUpcoming = !r.due_date || r.due_date <= today;
      if (!overdueOrUpcoming) continue;
      if (r.last_reminder_at && r.last_reminder_at > cutoff) continue;
      const { error } = await supabase
        .from("review_feedback_requests")
        .update({
          last_reminder_at: new Date().toISOString(),
          reminder_count: (r.reminder_count ?? 0) + 1,
        })
        .eq("id", r.id);
      if (!error) bumped += 1;
    }
    return { ok: true, reminded: bumped };
  });

// ----- Analytics -----

export const getFeedback360Analytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cycleId: z.string().uuid().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
      throw new Error("Not authorized");
    }
    const tenantId = await requireTenantId(supabase, userId);

    let reviewIds: string[] | null = null;
    if (data.cycleId) {
      const { data: revs } = await supabase
        .from("performance_reviews").select("id").eq("cycle_id", data.cycleId);
      reviewIds = (revs ?? []).map((r: any) => r.id);
      if (reviewIds.length === 0) {
        return { totals: { requested: 0, submitted: 0, declined: 0, pending: 0, overdue: 0 }, avgRating: null, byKind: { peer: 0, upward: 0 }, perEmployee: [] };
      }
    }

    let reqQuery = supabase
      .from("review_feedback_requests")
      .select("id,status,kind,due_date,subject_employee_id,review_id")
      .eq("tenant_id", tenantId);
    if (reviewIds) reqQuery = reqQuery.in("review_id", reviewIds);
    const { data: requests } = await reqQuery;

    let fbQuery = supabase
      .from("review_feedback")
      .select("id,avg_rating,kind,review_id")
      .eq("tenant_id", tenantId)
      .not("avg_rating", "is", null);
    if (reviewIds) fbQuery = fbQuery.in("review_id", reviewIds);
    const { data: feedbacks } = await fbQuery;

    const today = new Date().toISOString().slice(0, 10);
    const totals = { requested: 0, submitted: 0, declined: 0, pending: 0, overdue: 0 };
    const byKind = { peer: 0, upward: 0 };
    const perEmpMap: Record<string, { submitted: number; pending: number; declined: number }> = {};
    for (const r of requests ?? []) {
      totals.requested += 1;
      if (r.status === "submitted") totals.submitted += 1;
      else if (r.status === "declined") totals.declined += 1;
      else {
        totals.pending += 1;
        if (r.due_date && r.due_date < today) totals.overdue += 1;
      }
      if (r.kind === "peer" || r.kind === "upward") byKind[r.kind] += 1;
      const k = r.subject_employee_id as string;
      perEmpMap[k] ||= { submitted: 0, pending: 0, declined: 0 };
      if (r.status === "submitted") perEmpMap[k].submitted += 1;
      else if (r.status === "declined") perEmpMap[k].declined += 1;
      else perEmpMap[k].pending += 1;
    }
    const ratings = (feedbacks ?? []).map((f: any) => Number(f.avg_rating)).filter((n) => Number.isFinite(n));
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const responseRate = totals.requested > 0 ? totals.submitted / totals.requested : null;

    return {
      totals,
      avgRating,
      responseRate,
      byKind,
      perEmployee: Object.entries(perEmpMap).map(([employeeId, v]) => ({ employeeId, ...v })),
    };
  });

// ----- Audit trail -----

export const getFeedback360AuditTrail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reviewId: z.string().uuid().optional(), limit: z.number().int().min(1).max(500).default(100) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
      throw new Error("Not authorized");
    }
    const tenantId = await requireTenantId(supabase, userId);

    let q = supabase
      .from("audit_log")
      .select("id,entity_type,entity_id,action,actor_id,metadata,created_at")
      .eq("entity_type", "review_feedback_request")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    const { data: rows } = await q;
    // Filter by tenant client-side from metadata, and by reviewId if provided
    const filtered = (rows ?? []).filter((r: any) => {
      const meta = r.metadata ?? {};
      if (meta.tenant_id && meta.tenant_id !== tenantId) return false;
      if (data.reviewId && meta.review_id && meta.review_id !== data.reviewId) return false;
      return true;
    });
    return { entries: filtered };
  });
