import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const OwnerRole = z.enum(["hr", "it", "manager", "employee", "finance"]);
const TaskStatus = z.enum(["pending", "in_progress", "completed", "blocked", "skipped"]);

async function getActor(supabase: any, userId: string) {
  const { data: p } = await supabase
    .from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  return { email: p?.email ?? null, name: p?.full_name ?? null };
}

async function recordAudit(opts: {
  supabase: any; userId: string; assignment_id: string;
  task_id?: string | null; action: string; details?: Record<string, any>;
}) {
  const actor = await getActor(opts.supabase, opts.userId);
  await opts.supabase.from("onboarding_control_room_audit").insert({
    assignment_id: opts.assignment_id,
    task_id: opts.task_id ?? null,
    action: opts.action,
    details: opts.details ?? {},
    actor_id: opts.userId,
    actor_email: actor.email,
    actor_name: actor.name,
  });
  return actor;
}

async function notifyTaskChange(opts: {
  supabase: any; userId: string; task: any; assignment_id: string;
  action: string; actor: { email: string | null; name: string | null };
}) {
  try {
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    const { data: a } = await opts.supabase
      .from("onboarding_assignments")
      .select("employee:employee_id(first_name, last_name, email, manager_id), tenant_id")
      .eq("id", opts.assignment_id)
      .maybeSingle();
    if (!a?.employee) return;
    const emp = a.employee as any;
    const recipients = new Set<string>();
    if (emp.email) recipients.add(emp.email);
    if (emp.manager_id) {
      const { data: mgr } = await opts.supabase
        .from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.email) recipients.add(mgr.email);
    }
    for (const to of recipients) {
      await sendInternalEmail({
        templateName: "onboarding-task-status",
        recipientEmail: to,
        idempotencyKey: `onboarding-task-${opts.task.id}-${opts.action}-${Date.now()}`,
        preferenceKey: "notify_onboarding_task",
        templateData: {
          employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
          taskTitle: opts.task.title,
          ownerRole: opts.task.owner_role,
          status: opts.action,
          actorName: opts.actor.name ?? opts.actor.email ?? "Someone",
          dueDate: opts.task.due_date ?? null,
        },
      });
    }
  } catch (e) { console.error("[onboarding email]", e); }
}

export const listControlRooms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      search: z.string().trim().max(200).optional(),
      owner_role: OwnerRole.optional(),
      task_status: TaskStatus.optional(),
      due_before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      assignment_status: z.string().max(40).optional(),
    }).partial().parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: me } = await supabase
      .from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
    if (!me?.tenant_id) return { rows: [] };

    const { data: assignments, error } = await supabase
      .from("onboarding_assignments")
      .select(
        "id, status, assigned_at, signed_off_at, employee:employee_id(id, first_name, last_name, employee_number, hire_date, tenant_id, job_title)",
      )
      .order("assigned_at", { ascending: false, nullsFirst: false })
      .limit(500);
    if (error) throw new Error(error.message);

    let rows = (assignments ?? []).filter((a: any) => a.employee?.tenant_id === me.tenant_id);
    if (data?.assignment_status) rows = rows.filter((r: any) => r.status === data.assignment_status);

    if (data?.search) {
      const q = data.search.toLowerCase();
      rows = rows.filter((r: any) => {
        const e = r.employee ?? {};
        return [e.first_name, e.last_name, e.employee_number, e.job_title]
          .filter(Boolean).some((s: string) => String(s).toLowerCase().includes(q));
      });
    }

    const ids = rows.map((r: any) => r.id);
    if (!ids.length) return { rows: [] };

    let taskQ = supabase
      .from("onboarding_control_room_tasks")
      .select("assignment_id, owner_role, status, due_date")
      .in("assignment_id", ids);
    if (data?.owner_role) taskQ = taskQ.eq("owner_role", data.owner_role);
    if (data?.task_status) taskQ = taskQ.eq("status", data.task_status);
    if (data?.due_before) taskQ = taskQ.lte("due_date", data.due_before);
    const { data: tasks } = await taskQ;

    const matchSet = new Set<string>();
    const grouped: Record<string, Record<string, { total: number; done: number }>> = {};
    (tasks ?? []).forEach((t: any) => {
      matchSet.add(t.assignment_id);
      grouped[t.assignment_id] ??= {};
      grouped[t.assignment_id][t.owner_role] ??= { total: 0, done: 0 };
      grouped[t.assignment_id][t.owner_role].total += 1;
      if (t.status === "completed" || t.status === "skipped") {
        grouped[t.assignment_id][t.owner_role].done += 1;
      }
    });

    const hasTaskFilter = !!(data?.owner_role || data?.task_status || data?.due_before);
    if (hasTaskFilter) rows = rows.filter((r: any) => matchSet.has(r.id));

    return {
      rows: rows.map((r: any) => ({ ...r, lanes: grouped[r.id] ?? {} })),
    };
  });

export const getControlRoom = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ assignment_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: assignment, error } = await supabase
      .from("onboarding_assignments")
      .select(
        "id, status, assigned_at, signed_off_at, due_date, notes, employee:employee_id(id, first_name, last_name, employee_number, hire_date, email, job_title, department_id, manager_id)",
      )
      .eq("id", data.assignment_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!assignment) throw new Error("Assignment not found");

    const { data: tasks } = await supabase
      .from("onboarding_control_room_tasks").select("*")
      .eq("assignment_id", data.assignment_id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const { data: documents } = await supabase
      .from("employee_documents")
      .select("id, document_name, document_type, verification_status, uploaded_at")
      .eq("employee_id", assignment.employee.id).limit(50);

    return { assignment, tasks: tasks ?? [], documents: documents ?? [] };
  });

export const listControlRoomAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ assignment_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: entries, error } = await supabase
      .from("onboarding_control_room_audit")
      .select("*")
      .eq("assignment_id", data.assignment_id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { entries: entries ?? [] };
  });

export const upsertControlRoomTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      assignment_id: z.string().uuid(),
      owner_role: OwnerRole,
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().max(2000).nullable().optional(),
      due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      assigned_to: z.string().uuid().nullable().optional(),
      sort_order: z.number().int().default(0),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    if (data.id) {
      const { error } = await supabase
        .from("onboarding_control_room_tasks")
        .update({
          owner_role: data.owner_role,
          title: data.title,
          description: data.description ?? null,
          due_date: data.due_date ?? null,
          assigned_to: data.assigned_to ?? null,
          sort_order: data.sort_order,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      await recordAudit({
        supabase, userId, assignment_id: data.assignment_id, task_id: data.id,
        action: "task_updated", details: { title: data.title, owner_role: data.owner_role },
      });
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabase
      .from("onboarding_control_room_tasks")
      .insert({
        assignment_id: data.assignment_id,
        owner_role: data.owner_role,
        title: data.title,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
        assigned_to: data.assigned_to ?? null,
        sort_order: data.sort_order,
        created_by: userId,
      })
      .select("id").single();
    if (error) throw new Error(error.message);
    const actor = await recordAudit({
      supabase, userId, assignment_id: data.assignment_id, task_id: ins.id,
      action: "task_created", details: { title: data.title, owner_role: data.owner_role },
    });
    await notifyTaskChange({
      supabase, userId, assignment_id: data.assignment_id, action: "created",
      task: { id: ins.id, title: data.title, owner_role: data.owner_role, due_date: data.due_date ?? null },
      actor,
    });
    return { ok: true, id: ins.id };
  });

export const completeControlRoomTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: TaskStatus }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const completed = data.status === "completed" || data.status === "skipped";
    const { data: existing } = await supabase
      .from("onboarding_control_room_tasks")
      .select("id, assignment_id, title, owner_role, due_date, status")
      .eq("id", data.id).maybeSingle();
    if (!existing) throw new Error("Task not found");

    const { error } = await supabase
      .from("onboarding_control_room_tasks")
      .update({
        status: data.status,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: completed ? userId : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const actor = await recordAudit({
      supabase, userId, assignment_id: existing.assignment_id, task_id: existing.id,
      action: `task_${data.status}`,
      details: { from: existing.status, to: data.status, title: existing.title },
    });
    await notifyTaskChange({
      supabase, userId, assignment_id: existing.assignment_id, action: data.status,
      task: existing, actor,
    });
    return { ok: true };
  });

export const deleteControlRoomTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: existing } = await supabase
      .from("onboarding_control_room_tasks")
      .select("id, assignment_id, title").eq("id", data.id).maybeSingle();
    const { error } = await supabase
      .from("onboarding_control_room_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (existing) {
      await recordAudit({
        supabase, userId, assignment_id: existing.assignment_id, task_id: null,
        action: "task_deleted", details: { title: existing.title },
      });
    }
    return { ok: true };
  });

export const bulkUpdateAssignmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      ids: z.array(z.string().uuid()).min(1).max(200),
      decision: z.enum(["approve", "reject"]),
      notes: z.string().trim().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const newStatus = data.decision === "approve" ? "completed" : "blocked";
    const patch: Record<string, any> = { status: newStatus };
    if (data.decision === "approve") patch.signed_off_at = new Date().toISOString();
    if (data.notes) patch.notes = data.notes;

    const { error } = await supabase
      .from("onboarding_assignments")
      .update(patch)
      .in("id", data.ids);
    if (error) throw new Error(error.message);

    const actor = await getActor(supabase, userId);
    const rows = data.ids.map((id) => ({
      assignment_id: id,
      task_id: null,
      action: `assignment_bulk_${data.decision}`,
      details: { status: newStatus, notes: data.notes ?? null },
      actor_id: userId,
      actor_email: actor.email,
      actor_name: actor.name,
    }));
    await supabase.from("onboarding_control_room_audit").insert(rows);
    return { ok: true, count: data.ids.length };
  });
