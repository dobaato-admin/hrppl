import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const CATEGORIES = [
  "stationery",
  "equipment",
  "shift_swap",
  "time_in_lieu",
  "overtime_payment",
  "expense_reimbursement",
  "api_access_request",
  "other",
] as const;

const createSchema = z.object({
  category: z.enum(CATEGORIES),
  subject: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(4000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  requested_amount: z.number().nonnegative().max(1_000_000).optional().nullable(),
  currency_code: z.string().trim().length(3).optional().nullable(),
  requested_for_date: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
});

export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp, error: ee } = await supabase
      .from("employees")
      .select("id, tenant_id, manager_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (ee) throw new Error(ee.message);
    if (!emp) throw new Error("No employee record on file. Contact your HR admin.");

    // Default assignment: employee's manager (its user_id), else null (admins pick it up)
    let assigned_to: string | null = null;
    if (emp.manager_id) {
      const { data: mgr } = await supabase
        .from("employees")
        .select("user_id")
        .eq("id", emp.manager_id)
        .maybeSingle();
      assigned_to = (mgr?.user_id as string | null) ?? null;
    }

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        created_by: userId,
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        requested_amount: data.requested_amount ?? null,
        currency_code: data.currency_code ?? null,
        requested_for_date: data.requested_for_date ?? null,
        metadata: data.metadata ?? {},
        assigned_to,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ticket.id };
  });

// Removed in W5 P3: `listMyTickets`.
// Superseded by requests-inbox.functions.ts, which reads all six request types
// including tickets. Keeping a second 'my tickets' reader invites a divergent
// surface that answers the same question differently.

export const listInboxTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("support_tickets")
      .select(
        "id, subject, category, status, priority, requested_amount, currency_code, requested_for_date, created_at, decided_at, decision_notes, assigned_to, employee_id, employees!support_tickets_employee_id_fkey(first_name,last_name,job_title)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { tickets: data ?? [] };
  });

const decisionSchema = z.object({
  ticket_id: z.string().uuid(),
  status: z.enum(["in_review", "approved", "rejected", "fulfilled", "closed"]),
  decision_notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => decisionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const patch: any = { status: data.status, decision_notes: data.decision_notes ?? null };
    if (["approved", "rejected"].includes(data.status)) {
      patch.approver_id = userId;
      patch.decided_at = new Date().toISOString();
    }
    const { error } = await supabase.from("support_tickets").update(patch).eq("id", data.ticket_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const commentSchema = z.object({
  ticket_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  is_internal: z.boolean().default(false),
});

export const addTicketComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => commentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: t, error: te } = await supabase
      .from("support_tickets")
      .select("tenant_id")
      .eq("id", data.ticket_id)
      .maybeSingle();
    if (te) throw new Error(te.message);
    if (!t) throw new Error("Ticket not found");
    const { error } = await supabase.from("support_ticket_comments").insert({
      ticket_id: data.ticket_id,
      tenant_id: t.tenant_id,
      author_id: userId,
      body: data.body,
      is_internal: data.is_internal,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTicketComments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ ticket_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: rows, error } = await supabase
      .from("support_ticket_comments")
      .select("id, body, is_internal, author_id, created_at")
      .eq("ticket_id", data.ticket_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    // Internal comments are filtered by RLS, not here: "support_ticket_comments_view"
    // returns them only to org_admin / manager / regional_admin / super_admin.
    // Re-filtering in the handler would duplicate the rule in a second place and
    // let the two drift, which is the whole failure mode W5 was about.

    // Author labels are resolved here so both the admin queue and the
    // requester's own page render the same names from one implementation.
    //
    // Resolved through `employees` on the CALLER's client, deliberately, and it
    // is expected to come up empty sometimes: no policy lets a plain employee
    // read a colleague, so a requester sees their own name and a generic label
    // for staff, while an admin sees everyone. Using the service-role client to
    // "fix" that would publish who inside the organisation handled a request to
    // the person who raised it, which is a disclosure decision, not a display
    // detail. A missing name is the safe answer.
    const authorIds = [...new Set((rows ?? []).map((r: any) => r.author_id).filter(Boolean))];
    const names = new Map<string, string>();
    if (authorIds.length) {
      const { data: emps } = await supabase
        .from("employees")
        .select("user_id, first_name, last_name")
        .in("user_id", authorIds);
      for (const e of emps ?? []) {
        const full = [(e as any).first_name, (e as any).last_name].filter(Boolean).join(" ").trim();
        if (full) names.set((e as any).user_id, full);
      }
    }

    const comments = (rows ?? []).map((r: any) => ({
      ...r,
      is_mine: r.author_id === userId,
      author_label: r.author_id === userId ? "You" : (names.get(r.author_id) ?? "Support team"),
    }));
    return { comments };
  });
