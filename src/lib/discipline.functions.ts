import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function getTenant(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  return data?.tenant_id as string;
}

async function notify(opts: {
  tenant_id: string;
  user_ids: string[];
  kind: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: any;
}) {
  if (!opts.user_ids.length) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = opts.user_ids.filter(Boolean).map((user_id) => ({
    tenant_id: opts.tenant_id, user_id, kind: opts.kind,
    title: opts.title, body: opts.body ?? null, link: opts.link ?? null,
    metadata: opts.metadata ?? {},
  }));
  if (rows.length) await supabaseAdmin.from("in_app_notifications").insert(rows);
}

// Valid workflow transitions
const TRANSITIONS: Record<string, string[]> = {
  draft: ["open","withdrawn"],
  open: ["investigation","hearing_scheduled","decision_pending","closed","withdrawn"],
  investigation: ["hearing_scheduled","decision_pending","closed","withdrawn"],
  hearing_scheduled: ["hearing_held","investigation","withdrawn"],
  hearing_held: ["decision_pending","investigation"],
  decision_pending: ["decision_issued","investigation"],
  decision_issued: ["appeal_open","closed"],
  appeal_open: ["under_review","closed"],
  under_review: ["closed","appealed"],
  appealed: ["closed"],
  closed: [],
  withdrawn: [],
};

// =========== DISCIPLINARY CASES ===========
const CaseSchema = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  case_number: z.string().max(60).optional().nullable(),
  category: z.enum(["verbal_warning","written_warning","final_warning","suspension","termination","pip","investigation","other"]),
  severity: z.enum(["low","medium","high","critical"]).default("low"),
  incident_date: z.string().optional().nullable(),
  description: z.string().min(1).max(5000),
  status: z.enum(["draft","open","investigation","hearing_scheduled","hearing_held","decision_pending","decision_issued","appeal_open","under_review","appealed","closed","withdrawn"]).default("draft"),
  outcome: z.string().max(2000).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  appeal_deadline: z.string().optional().nullable(),
  confidential: z.boolean().default(false),
});

export const listCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    employee_id: z.string().uuid().optional(),
    assigned_to_me: z.boolean().optional(),
    status: z.string().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase.from("disciplinary_cases")
      .select("*, employees:employee_id(id,first_name,last_name,job_title)")
      .order("created_at", { ascending: false });
    if (data.employee_id) q = q.eq("employee_id", data.employee_id);
    if (data.assigned_to_me) q = q.eq("assigned_to", userId);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { cases: rows ?? [] };
  });

export const upsertCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CaseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const payload: any = { ...data, tenant_id };
    if (!data.id) payload.opened_by = userId;
    if (data.status === "closed") { payload.closed_at = new Date().toISOString(); payload.closed_by = userId; }
    if (data.status === "withdrawn") payload.withdrawn_at = new Date().toISOString();
    const { data: row, error } = data.id
      ? await supabase.from("disciplinary_cases").update(payload).eq("id", data.id).select().single()
      : await supabase.from("disciplinary_cases").insert(payload).select().single();
    if (error) throw error;

    // Notify assignee on new assignment
    if (!data.id && row.assigned_to) {
      await notify({
        tenant_id, user_ids: [row.assigned_to],
        kind: "discipline_case_assigned",
        title: "Disciplinary case assigned",
        body: `Case ${row.case_number ?? row.id.slice(0,8)} (${row.category}) was assigned to you.`,
        link: "/admin/discipline",
        metadata: { case_id: row.id },
      });
    }
    return { case: row };
  });

export const deleteCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("disciplinary_cases").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const assignCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    case_id: z.string().uuid(),
    assigned_to: z.string().uuid().nullable(),
    due_date: z.string().optional().nullable(),
    appeal_deadline: z.string().optional().nullable(),
    confidential: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const update: any = { assigned_to: data.assigned_to };
    if (data.due_date !== undefined) update.due_date = data.due_date;
    if (data.appeal_deadline !== undefined) update.appeal_deadline = data.appeal_deadline;
    if (data.confidential !== undefined) update.confidential = data.confidential;
    const { data: row, error } = await supabase.from("disciplinary_cases")
      .update(update).eq("id", data.case_id).select().single();
    if (error) throw error;

    await supabase.from("disciplinary_actions").insert({
      case_id: data.case_id, tenant_id, performed_by: userId,
      action_type: "status_changed", notes: `Reassigned${data.assigned_to ? "" : " (unassigned)"}${data.due_date ? `; due ${data.due_date}` : ""}`,
    });

    if (data.assigned_to) {
      await notify({
        tenant_id, user_ids: [data.assigned_to],
        kind: "discipline_case_assigned",
        title: "Disciplinary case assigned",
        body: `Case ${row.case_number ?? row.id.slice(0,8)} assigned to you${data.due_date ? `, due ${data.due_date}` : ""}.`,
        link: "/admin/discipline",
        metadata: { case_id: row.id },
      });
    }
    return { case: row };
  });

export const transitionCaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    case_id: z.string().uuid(),
    to_status: z.string(),
    notes: z.string().max(2000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: current, error: e1 } = await supabase.from("disciplinary_cases")
      .select("*").eq("id", data.case_id).single();
    if (e1) throw e1;
    const allowed = TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(data.to_status)) {
      throw new Error(`Cannot transition from ${current.status} to ${data.to_status}`);
    }
    // Block decision_issued without an approved approval row
    if (data.to_status === "decision_issued") {
      const { data: approvals } = await supabase.from("disciplinary_approvals")
        .select("decision").eq("case_id", data.case_id);
      const approved = (approvals ?? []).some((a: any) => a.decision === "approved");
      if (!approved) throw new Error("At least one approval must be granted before issuing the decision.");
    }

    const update: any = { status: data.to_status };
    if (data.to_status === "closed") { update.closed_at = new Date().toISOString(); update.closed_by = userId; }
    if (data.to_status === "withdrawn") update.withdrawn_at = new Date().toISOString();
    if (data.to_status === "decision_issued" && !current.appeal_deadline) {
      const dl = new Date(); dl.setDate(dl.getDate() + 14);
      update.appeal_deadline = dl.toISOString().slice(0,10);
    }
    const { data: row, error } = await supabase.from("disciplinary_cases")
      .update(update).eq("id", data.case_id).select().single();
    if (error) throw error;

    await supabase.from("disciplinary_actions").insert({
      case_id: data.case_id, tenant_id, performed_by: userId,
      action_type: "status_changed",
      notes: `${current.status} → ${data.to_status}${data.notes ? `: ${data.notes}` : ""}`,
    });

    // Notify employee on key statuses
    const notable = ["hearing_scheduled","decision_issued","closed"];
    if (notable.includes(data.to_status)) {
      const { data: emp } = await supabase.from("employees").select("user_id")
        .eq("id", current.employee_id).maybeSingle();
      if (emp?.user_id) {
        await notify({
          tenant_id, user_ids: [emp.user_id],
          kind: `discipline_${data.to_status}`,
          title: data.to_status === "hearing_scheduled" ? "Disciplinary hearing scheduled"
               : data.to_status === "decision_issued" ? "Disciplinary decision issued"
               : "Disciplinary case closed",
          body: `Your case ${current.case_number ?? current.id.slice(0,8)} is now ${data.to_status.replace(/_/g," ")}.`,
          link: "/me/grievances",
          metadata: { case_id: current.id },
        });
      }
    }
    return { case: row };
  });

// =========== ACTIONS (timeline) ===========
const ActionSchema = z.object({
  id: z.string().uuid().optional(),
  case_id: z.string().uuid(),
  action_type: z.enum(["warning_issued","hearing_scheduled","hearing_held","appeal_filed","outcome_recorded","note","document_attached","status_changed"]),
  action_date: z.string().optional(),
  notes: z.string().max(4000).optional().nullable(),
  document_url: z.string().url().max(500).optional().nullable(),
});

export const listActions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ case_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("disciplinary_actions").select("*").eq("case_id", data.case_id)
      .order("action_date", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw error;
    return { actions: rows ?? [] };
  });

export const addAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ActionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: row, error } = await supabase.from("disciplinary_actions").insert({
      ...data, tenant_id, performed_by: userId,
      action_date: data.action_date ?? new Date().toISOString().slice(0,10),
    }).select().single();
    if (error) throw error;
    return { action: row };
  });

export const deleteAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("disciplinary_actions").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// =========== APPROVALS ===========
export const listApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    case_id: z.string().uuid().optional(),
    pending_for_me: z.boolean().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase.from("disciplinary_approvals")
      .select("*, case:case_id(id,case_number,category,employee_id,employees:employee_id(first_name,last_name)), approver:approver_id(full_name,email)")
      .order("requested_at", { ascending: false });
    if (data.case_id) q = q.eq("case_id", data.case_id);
    if (data.pending_for_me) q = q.eq("approver_id", userId).is("decided_at", null);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { approvals: rows ?? [] };
  });

export const requestApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    case_id: z.string().uuid(),
    approver_id: z.string().uuid(),
    approver_role: z.enum(["manager","hr","legal","org_admin"]),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: row, error } = await supabase.from("disciplinary_approvals").insert({
      case_id: data.case_id, tenant_id, approver_id: data.approver_id,
      approver_role: data.approver_role, requested_by: userId, notes: data.notes ?? null,
    }).select().single();
    if (error) throw error;

    await supabase.from("disciplinary_actions").insert({
      case_id: data.case_id, tenant_id, performed_by: userId,
      action_type: "note", notes: `Approval requested from ${data.approver_role}`,
    });

    await notify({
      tenant_id, user_ids: [data.approver_id],
      kind: "discipline_approval_requested",
      title: "Disciplinary approval needed",
      body: `Your approval is requested as ${data.approver_role}.`,
      link: "/admin/discipline",
      metadata: { case_id: data.case_id, approval_id: row.id },
    });
    return { approval: row };
  });

export const decideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    approval_id: z.string().uuid(),
    decision: z.enum(["approved","rejected"]),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: approval, error: e1 } = await supabase.from("disciplinary_approvals")
      .select("*").eq("id", data.approval_id).single();
    if (e1) throw e1;
    if (approval.approver_id !== userId) throw new Error("Only the assigned approver can decide.");
    if (approval.decided_at) throw new Error("Already decided.");
    const { data: row, error } = await supabase.from("disciplinary_approvals")
      .update({ decision: data.decision, decided_at: new Date().toISOString(),
                notes: data.notes ?? approval.notes })
      .eq("id", data.approval_id).select().single();
    if (error) throw error;

    await supabase.from("disciplinary_actions").insert({
      case_id: approval.case_id, tenant_id: approval.tenant_id, performed_by: userId,
      action_type: "note",
      notes: `Approval ${data.decision} by ${approval.approver_role}${data.notes ? `: ${data.notes}` : ""}`,
    });

    await notify({
      tenant_id: approval.tenant_id, user_ids: [approval.requested_by],
      kind: "discipline_approval_decided",
      title: `Approval ${data.decision}`,
      body: `${approval.approver_role} ${data.decision} the disciplinary case approval.`,
      link: "/admin/discipline",
      metadata: { case_id: approval.case_id },
    });
    return { approval: row };
  });

// =========== ATTACHMENTS (case) ===========
export const recordCaseAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    case_id: z.string().uuid(),
    storage_path: z.string().min(1).max(500),
    file_name: z.string().min(1).max(255),
    mime_type: z.string().max(120).optional().nullable(),
    size_bytes: z.number().int().nonnegative().max(50 * 1024 * 1024).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: row, error } = await supabase.from("disciplinary_attachments").insert({
      ...data, tenant_id, uploaded_by: userId,
    }).select().single();
    if (error) throw error;
    await supabase.from("disciplinary_actions").insert({
      case_id: data.case_id, tenant_id, performed_by: userId,
      action_type: "document_attached", notes: `Attached: ${data.file_name}`,
    });
    return { attachment: row };
  });

export const listCaseAttachments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ case_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase.from("disciplinary_attachments")
      .select("*").eq("case_id", data.case_id).order("created_at", { ascending: false });
    if (error) throw error;
    return { attachments: rows ?? [] };
  });

export const deleteCaseAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: row } = await supabase.from("disciplinary_attachments").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) await supabase.storage.from("disciplinary-files").remove([row.storage_path]);
    const { error } = await supabase.from("disciplinary_attachments").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getAttachmentDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ storage_path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: signed, error } = await supabase.storage
      .from("disciplinary-files").createSignedUrl(data.storage_path, 60 * 10);
    if (error) throw error;
    return { url: signed.signedUrl };
  });

// =========== GRIEVANCES ===========
const GrievanceSchema = z.object({
  id: z.string().uuid().optional(),
  against_employee_id: z.string().uuid().optional().nullable(),
  category: z.enum(["harassment","discrimination","workplace","pay","management","safety","other"]),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  is_anonymous: z.boolean().default(false),
  severity: z.enum(["low","medium","high","critical"]).default("medium"),
});

const GrievanceUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["submitted","acknowledged","investigating","resolved","dismissed"]).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  resolution: z.string().max(4000).optional().nullable(),
  severity: z.enum(["low","medium","high","critical"]).optional(),
});

export const listGrievances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ scope: z.enum(["me","all"]).default("all") }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase.from("grievances")
      .select("*, against:against_employee_id(id,first_name,last_name), filer:filer_employee_id(id,first_name,last_name)")
      .order("created_at", { ascending: false });
    if (data.scope === "me") q = q.eq("filer_user_id", userId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { grievances: rows ?? [] };
  });

export const fileGrievance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GrievanceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
    const { data: row, error } = await supabase.from("grievances").insert({
      ...data, tenant_id, filer_user_id: userId, filer_employee_id: emp?.id ?? null,
    }).select().single();
    if (error) throw error;

    // Notify all org_admins
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: admins } = await supabaseAdmin
      .from("profiles").select("id").eq("tenant_id", tenant_id);
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("user_id").in("role", ["org_admin","manager"]);
    const adminIds = (admins ?? []).map((a: any) => a.id);
    const roleIds = new Set((roles ?? []).map((r: any) => r.user_id));
    const targets = adminIds.filter((id: string) => roleIds.has(id));
    await notify({
      tenant_id, user_ids: targets,
      kind: "grievance_filed",
      title: "New grievance filed",
      body: `${row.is_anonymous ? "Anonymous" : "An employee"} filed: ${row.subject}`,
      link: "/admin/discipline",
      metadata: { grievance_id: row.id, severity: row.severity },
    });
    return { grievance: row };
  });

export const updateGrievance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GrievanceUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { id, ...rest } = data;
    const payload: any = { ...rest };
    if (rest.status === "resolved" || rest.status === "dismissed") {
      payload.resolved_at = new Date().toISOString();
    }
    const { data: row, error } = await supabase.from("grievances").update(payload).eq("id", id).select().single();
    if (error) throw error;

    // Notify filer + assignee on status changes
    if (rest.status) {
      const targets = [row.filer_user_id, row.assigned_to].filter(Boolean) as string[];
      await notify({
        tenant_id: row.tenant_id, user_ids: Array.from(new Set(targets)),
        kind: `grievance_${rest.status}`,
        title: `Grievance ${rest.status}`,
        body: `"${row.subject}" is now ${rest.status}.`,
        link: "/me/grievances",
        metadata: { grievance_id: row.id },
      });
    }
    if (rest.assigned_to) {
      await notify({
        tenant_id: row.tenant_id, user_ids: [rest.assigned_to],
        kind: "grievance_assigned",
        title: "Grievance assigned to you",
        body: `"${row.subject}" — please review.`,
        link: "/admin/discipline",
        metadata: { grievance_id: row.id },
      });
    }
    return { grievance: row };
  });

export const withdrawGrievance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase.from("grievances")
      .update({ status: "dismissed", resolved_at: new Date().toISOString(),
                resolution: "Withdrawn by filer" })
      .eq("id", data.id).eq("filer_user_id", userId).select().single();
    if (error) throw error;
    return { grievance: row };
  });

// =========== GRIEVANCE COMMENTS ===========
export const listGrievanceComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ grievance_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("grievance_comments").select("*, profiles:author_id(full_name,email)")
      .eq("grievance_id", data.grievance_id).order("created_at", { ascending: true });
    if (error) throw error;
    return { comments: rows ?? [] };
  });

export const addGrievanceComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    grievance_id: z.string().uuid(),
    comment: z.string().min(1).max(4000),
    is_internal: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: row, error } = await supabase.from("grievance_comments").insert({
      ...data, tenant_id, author_id: userId,
    }).select().single();
    if (error) throw error;

    // Notify other party (skip for internal)
    if (!data.is_internal) {
      const { data: g } = await supabase.from("grievances")
        .select("filer_user_id,assigned_to,subject").eq("id", data.grievance_id).single();
      if (g) {
        const targets = [g.filer_user_id, g.assigned_to].filter((u: string) => u && u !== userId);
        await notify({
          tenant_id, user_ids: Array.from(new Set(targets)),
          kind: "grievance_comment",
          title: "New grievance comment",
          body: `New comment on "${g.subject}".`,
          link: "/me/grievances",
          metadata: { grievance_id: data.grievance_id },
        });
      }
    }
    return { comment: row };
  });

// =========== GRIEVANCE ATTACHMENTS ===========
export const recordGrievanceAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    grievance_id: z.string().uuid(),
    storage_path: z.string().min(1).max(500),
    file_name: z.string().min(1).max(255),
    mime_type: z.string().max(120).optional().nullable(),
    size_bytes: z.number().int().nonnegative().max(50 * 1024 * 1024).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { data: row, error } = await supabase.from("grievance_attachments").insert({
      ...data, tenant_id, uploaded_by: userId,
    }).select().single();
    if (error) throw error;
    return { attachment: row };
  });

export const listGrievanceAttachments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ grievance_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase.from("grievance_attachments")
      .select("*").eq("grievance_id", data.grievance_id).order("created_at", { ascending: false });
    if (error) throw error;
    return { attachments: rows ?? [] };
  });

export const deleteGrievanceAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: row } = await supabase.from("grievance_attachments").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) await supabase.storage.from("disciplinary-files").remove([row.storage_path]);
    const { error } = await supabase.from("grievance_attachments").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// =========== HR LIST (for assignment dropdown) ===========
export const listHrUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getTenant(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profs } = await supabaseAdmin
      .from("profiles").select("id,full_name,email").eq("tenant_id", tenant_id);
    const ids = (profs ?? []).map((p: any) => p.id);
    if (!ids.length) return { users: [] };
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("user_id,role").in("user_id", ids)
      .in("role", ["manager","org_admin","super_admin"]);
    const allowed = new Set((roles ?? []).map((r: any) => r.user_id));
    return { users: (profs ?? []).filter((p: any) => allowed.has(p.id)) };
  });
