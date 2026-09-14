import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforcePublicRateLimit } from "@/lib/rate-limit.functions";
import { requireTenantId } from "@/lib/tenant-scope";

const JOB_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["h1","h2","h3","h4","h5","h6","p","span","strong","em","b","i","u","br","hr","ul","ol","li","blockquote","a","code","pre"],
  ALLOWED_ATTR: ["href","target","rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};
function sanitizeJobHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, JOB_HTML_SANITIZE_CONFIG);
}

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "job";
}

const DEFAULT_STAGES = [
  { name: "Applied", kind: "applied" },
  { name: "Screen", kind: "screen" },
  { name: "Interview", kind: "interview" },
  { name: "Offer", kind: "offer" },
  { name: "Hired", kind: "hired", is_terminal: true },
  { name: "Rejected", kind: "rejected", is_terminal: true },
];

// ---------- jobs ----------
export const listRecruitmentJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("recruitment_jobs").select("*, departments(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { jobs: data ?? [] };
  });

const JobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().max(80).optional(),
  department_id: z.string().uuid().nullable().optional(),
  location: z.string().max(200).optional().nullable(),
  employment_type: z.string().max(80).optional().nullable(),
  description_html: z.string().max(20000).optional().nullable(),
  requirements_html: z.string().max(20000).optional().nullable(),
  salary_min: z.number().nonnegative().nullable().optional(),
  salary_max: z.number().nonnegative().nullable().optional(),
  currency: z.string().default("AUD"),
  hiring_manager_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft","open","paused","closed","filled"]).default("draft"),
});

export const upsertRecruitmentJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JobSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const admin = await loadAdmin();
    const tenantId = await requireTenantId(supabase, userId);
    const slug = data.slug || slugify(data.title);
    const payload: any = {
      ...data,
      description_html: sanitizeJobHtml(data.description_html),
      requirements_html: sanitizeJobHtml(data.requirements_html),
      slug,
      tenant_id: tenantId,
    };
    if (data.status === "open" && !data.id) payload.published_at = new Date().toISOString();
    let row;
    if (data.id) {
      const { data: r, error } = await supabase.from("recruitment_jobs").update(payload).eq("id", data.id).select().single();
      if (error) throw error;
      row = r;
    } else {
      payload.created_by = userId;
      const { data: r, error } = await supabase.from("recruitment_jobs").insert(payload).select().single();
      if (error) throw error;
      row = r;
      // seed default stages
      const stagePayload = DEFAULT_STAGES.map((s, i) => ({
        tenant_id: tenantId, job_id: r.id, name: s.name, kind: s.kind, sort_order: i,
        is_terminal: (s as any).is_terminal ?? false,
      }));
      await admin.from("recruitment_stages").insert(stagePayload);
    }
    return { job: row };
  });

export const getRecruitmentJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: job } = await supabase.from("recruitment_jobs").select("*, departments(name)").eq("id", data.id).single();
    const { data: stages } = await supabase.from("recruitment_stages").select("*").eq("job_id", data.id).order("sort_order");
    const { data: candidates } = await supabase.from("recruitment_candidates").select("*").eq("job_id", data.id).order("applied_at", { ascending: false });
    return { job, stages: stages ?? [], candidates: candidates ?? [] };
  });

// ---------- candidates ----------
export const moveCandidate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    candidate_id: z.string().uuid(),
    stage_id: z.string().uuid(),
    status: z.enum(["active","hired","rejected","withdrawn"]).optional(),
    rejected_reason: z.string().max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const update: any = { stage_id: data.stage_id };
    if (data.status) update.status = data.status;
    if (data.rejected_reason) update.rejected_reason = data.rejected_reason;
    const { error } = await supabase.from("recruitment_candidates").update(update).eq("id", data.candidate_id);
    if (error) throw error;
    return { ok: true };
  });

export const getCandidate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: candidate } = await supabase.from("recruitment_candidates").select("*, recruitment_jobs(title,slug,job_id:id)").eq("id", data.id).single();
    const { data: interviews } = await supabase.from("recruitment_interviews").select("*").eq("candidate_id", data.id).order("scheduled_at", { ascending: false });
    const { data: scorecards } = await supabase.from("recruitment_scorecards").select("*").eq("candidate_id", data.id).order("created_at", { ascending: false });
    const { data: offers } = await supabase.from("recruitment_offers").select("*").eq("candidate_id", data.id).order("created_at", { ascending: false });
    const { data: notes } = await supabase.from("recruitment_notes").select("*").eq("candidate_id", data.id).order("created_at", { ascending: false });
    let stages: any[] = [];
    if (candidate?.job_id) {
      const { data: st } = await supabase.from("recruitment_stages").select("*").eq("job_id", candidate.job_id).order("sort_order");
      stages = st ?? [];
    }
    let resumeUrl: string | null = null;
    if (candidate?.resume_path) {
      const admin = await loadAdmin();
      const { data: signed } = await admin.storage.from("candidate-resumes").createSignedUrl(candidate.resume_path, 600);
      resumeUrl = signed?.signedUrl ?? null;
    }
    return { candidate, interviews: interviews ?? [], scorecards: scorecards ?? [], offers: offers ?? [], notes: notes ?? [], stages, resumeUrl };
  });

export const scheduleInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    candidate_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    scheduled_at: z.string(),
    duration_minutes: z.number().int().positive().max(480).default(45),
    mode: z.enum(["video","phone","onsite"]).default("video"),
    location: z.string().max(500).optional().nullable(),
    interviewer_ids: z.array(z.string().uuid()).default([]),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: c } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
    const { error } = await supabase.from("recruitment_interviews").insert({
      ...data, tenant_id: c.tenant_id, created_by: userId,
    });
    if (error) throw error;
    return { ok: true };
  });

export const submitScorecard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    candidate_id: z.string().uuid(),
    interview_id: z.string().uuid().nullable().optional(),
    overall_rating: z.number().int().min(1).max(5),
    recommendation: z.enum(["strong_yes","yes","neutral","no","strong_no"]),
    strengths: z.string().max(2000).optional().nullable(),
    concerns: z.string().max(2000).optional().nullable(),
    scores: z.record(z.string(), z.number()).default({}),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: c } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
    const { error } = await supabase.from("recruitment_scorecards").insert({ ...data, tenant_id: c.tenant_id, reviewer_id: userId });
    if (error) throw error;
    return { ok: true };
  });

export const addCandidateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ candidate_id: z.string().uuid(), body: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: c } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
    const { error } = await supabase.from("recruitment_notes").insert({ ...data, tenant_id: c.tenant_id, author_id: userId });
    if (error) throw error;
    return { ok: true };
  });

export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    candidate_id: z.string().uuid(),
    job_title: z.string().min(1).max(200),
    base_salary: z.number().positive(),
    currency: z.string().default("AUD"),
    start_date: z.string().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: c } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
    const { data: row, error } = await supabase.from("recruitment_offers").insert({
      ...data, tenant_id: c.tenant_id, created_by: userId, status: "draft",
    }).select().single();
    if (error) throw error;
    return { offer: row };
  });

// ---------- stages (customizable pipeline) ----------
export const upsertStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid().optional(),
    job_id: z.string().uuid(),
    name: z.string().min(1).max(80),
    kind: z.enum(["applied","screen","interview","offer","hired","rejected","custom"]).default("custom"),
    sort_order: z.number().int().min(0).max(99),
    is_terminal: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    if (data.id) {
      const { data: row, error } = await supabase.from("recruitment_stages")
        .update({ name: data.name, kind: data.kind, sort_order: data.sort_order, is_terminal: data.is_terminal })
        .eq("id", data.id).select().single();
      if (error) throw error;
      return { stage: row };
    }
    const { data: row, error } = await supabase.from("recruitment_stages").insert({
      tenant_id: tenantId, job_id: data.job_id, name: data.name, kind: data.kind,
      sort_order: data.sort_order, is_terminal: data.is_terminal,
    }).select().single();
    if (error) throw error;
    return { stage: row };
  });

export const deleteStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { count } = await supabase.from("recruitment_candidates")
      .select("id", { count: "exact", head: true }).eq("stage_id", data.id);
    if ((count ?? 0) > 0) throw new Error("Move candidates out of this stage first");
    const { error } = await supabase.from("recruitment_stages").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const reorderStages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    job_id: z.string().uuid(),
    order: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0).max(99) })).min(1).max(30),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    for (const o of data.order) {
      await supabase.from("recruitment_stages").update({ sort_order: o.sort_order }).eq("id", o.id).eq("job_id", data.job_id);
    }
    return { ok: true };
  });

// ---------- offer lifecycle ----------
export const updateOfferStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    status: z.enum(["draft","sent","accepted","declined","expired"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const patch: any = { status: data.status };
    if (data.status === "sent") patch.sent_at = new Date().toISOString();
    if (data.status === "accepted" || data.status === "declined") patch.responded_at = new Date().toISOString();
    const { data: row, error } = await supabase.from("recruitment_offers").update(patch).eq("id", data.id).select().single();
    if (error) throw error;
    return { offer: row };
  });

// ---------- convert hired candidate to employee ----------
export const convertCandidateToEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    candidate_id: z.string().uuid(),
    employee_number: z.string().min(1).max(40),
    job_title: z.string().min(1).max(200),
    department_id: z.string().uuid().nullable().optional(),
    employment_type: z.enum(["full_time","part_time","casual","contractor","intern"]).default("full_time"),
    hire_date: z.string(),
    base_salary: z.number().positive().optional().nullable(),
    currency_code: z.string().max(3).default("AUD"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: cand, error: cErr } = await supabase.from("recruitment_candidates")
      .select("*").eq("id", data.candidate_id).single();
    if (cErr) throw cErr;
    if (cand.hired_employee_id) throw new Error("Candidate already converted");
    const { data: emp, error: eErr } = await supabase.from("employees").insert({
      tenant_id: tenantId,
      employee_number: data.employee_number,
      first_name: cand.first_name,
      last_name: cand.last_name,
      email: cand.email,
      phone: cand.phone ?? null,
      job_title: data.job_title,
      department_id: data.department_id ?? null,
      employment_type: data.employment_type,
      status: "active",
      hire_date: data.hire_date,
      base_salary: data.base_salary ?? null,
      currency_code: data.currency_code,
    }).select().single();
    if (eErr) throw eErr;
    await supabase.from("recruitment_candidates")
      .update({ status: "hired", hired_employee_id: emp.id }).eq("id", data.candidate_id);
    return { employee: emp };
  });


export const listPublicJobs = createServerFn({ method: "GET" })
  .handler(async () => {
    const admin = await loadAdmin();
    const { data } = await admin
      .from("recruitment_jobs")
      .select("id,slug,title,location,employment_type,department_id,published_at,tenant_id, departments(name), tenants(name)")
      .eq("status", "open").order("published_at", { ascending: false }).limit(200);
    return { jobs: data ?? [] };
  });

export const getPublicJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const admin = await loadAdmin();
    const { data: job } = await admin.from("recruitment_jobs")
      .select("id,slug,title,location,employment_type,description_html,requirements_html,salary_min,salary_max,currency,tenant_id,published_at,tenants(name)")
      .eq("slug", data.slug).eq("status","open").maybeSingle();
    return { job };
  });

const SAFE_NAME_RE = /^[A-Za-z0-9._-]{1,200}$/;

/**
 * Public careers page asks the server for a one-time signed upload URL.
 * The server validates the job is open and derives tenant from the job row
 * (never trusting client input). Anonymous uploads to the bucket are no
 * longer permitted by RLS — this signed-URL flow is the only public path.
 */
export const createResumeUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    job_id: z.string().uuid(),
    filename: z.string().min(1).max(200),
  }).parse(d))
  .handler(async ({ data }) => {
    // Mints a signed upload credential with no session. The tightest limit here.
    await enforcePublicRateLimit("public_resume_upload", 10, 3600);
    const safe = data.filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 200);
    if (!SAFE_NAME_RE.test(safe)) throw new Error("Invalid filename");
    const admin = await loadAdmin();
    const { data: job } = await admin
      .from("recruitment_jobs")
      .select("id,tenant_id,status")
      .eq("id", data.job_id)
      .maybeSingle();
    if (!job || job.status !== "open") {
      throw new Error("This role is no longer accepting applications");
    }
    const path = `${job.tenant_id}/${job.id}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
    const { data: signed, error } = await admin.storage
      .from("candidate-resumes")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Could not create upload URL");
    return { path: signed.path, token: signed.token };
  });



const ApplySchema = z.object({
  job_id: z.string().uuid(),
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().nullable(),
  current_company: z.string().max(200).optional().nullable(),
  current_title: z.string().max(200).optional().nullable(),
  linkedin_url: z.string().url().max(500).optional().nullable(),
  cover_letter: z.string().max(8000).optional().nullable(),
  resume_path: z.string().max(500).optional().nullable(),
});

export const applyToJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ApplySchema.parse(d))
  .handler(async ({ data }) => {
    // A person applies to a handful of roles, not a hundred.
    await enforcePublicRateLimit("public_job_apply", 10, 3600);
    const admin = await loadAdmin();
    const { data: job } = await admin.from("recruitment_jobs").select("id,tenant_id,status").eq("id", data.job_id).single();
    if (!job || job.status !== "open") throw new Error("This role is no longer accepting applications");
    const { data: firstStage } = await admin.from("recruitment_stages")
      .select("id").eq("job_id", job.id).order("sort_order").limit(1).maybeSingle();
    const { error } = await admin.from("recruitment_candidates").insert({
      tenant_id: job.tenant_id, job_id: job.id,
      stage_id: firstStage?.id ?? null,
      first_name: data.first_name, last_name: data.last_name,
      email: data.email, phone: data.phone ?? null,
      current_company: data.current_company ?? null,
      current_title: data.current_title ?? null,
      linkedin_url: data.linkedin_url ?? null,
      cover_letter: data.cover_letter ?? null,
      resume_path: data.resume_path ?? null,
      source: "careers_page",
    });
    if (error) {
      if (error.code === "23505") throw new Error("You've already applied to this role");
      throw error;
    }
    return { ok: true };
  });
