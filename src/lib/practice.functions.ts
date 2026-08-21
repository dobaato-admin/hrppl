import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

// ---------------- Clients ----------------
export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { clients: data ?? [] };
  });

const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().max(160).optional().nullable(),
  contact_email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  billing_address: z.string().trim().max(500).optional().nullable(),
  country_code: z.string().trim().length(2).optional().nullable().or(z.literal("")),
  currency_code: z.string().trim().length(3).optional().nullable().or(z.literal("")),
  tax_number: z.string().trim().max(60).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["active", "archived"]).default("active"),
});

export const upsertClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => clientSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: prof } = await supabase
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    const tenantId = prof?.tenant_id;
    if (!tenantId) throw new Error("No organization");
    const payload: any = { ...data, tenant_id: tenantId, created_by: userId };
    if (payload.contact_email === "") payload.contact_email = null;
    if (payload.country_code === "") payload.country_code = null;
    if (payload.currency_code === "") payload.currency_code = null;
    const { data: row, error } = await supabase
      .from("clients").upsert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return { client: row };
  });

// ---------------- Projects ----------------
export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

/**
 * Write a create-or-update without relying on `.upsert()` to infer intent
 * (Finalization Plan §1 #7 — "single form submission creates multiple
 * duplicate entries").
 *
 * The bug: `.upsert(payload)` was called with no conflict target. Both tables
 * key on `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, so a create payload
 * carried no key to conflict on and Postgres inserted a fresh row on every
 * call. Two clicks, two rows.
 *
 * The contract now:
 *   - `id` present and the row exists  -> UPDATE that row
 *   - `id` present and it does not     -> INSERT with that id
 *   - `id` absent                      -> INSERT with a generated id
 *
 * Idempotency falls out of the second case: the client generates the id once
 * per form, so a double-submit that outruns the disabled button collides on
 * the primary key. We swallow that specific collision and return the row that
 * already exists, rather than surfacing a confusing error for what the user
 * experiences as one action. No extra column or migration needed.
 */
const UNIQUE_VIOLATION = "23505";

async function writeRow(supabase: any, table: string, payload: Record<string, unknown>) {
  const id = payload.id as string | undefined;

  if (id) {
    const { data: existing } = await supabase
      .from(table).select("id").eq("id", id).maybeSingle();

    if (existing) {
      const { data: row, error } = await supabase
        .from(table).update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return row;
    }
  }

  const { data: row, error } = await supabase
    .from(table).insert(payload).select("*").single();

  if (error) {
    // Lost a race with an identical in-flight submit — same user action, so
    // return the winner instead of an error.
    if (error.code === UNIQUE_VIOLATION && id) {
      const { data: won } = await supabase
        .from(table).select("*").eq("id", id).maybeSingle();
      if (won) return won;
    }
    throw new Error(error.message);
  }
  return row;
}

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  code: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  billing_type: z.enum(["fixed", "time_and_materials", "retainer", "non_billable"]).default("time_and_materials"),
  budget_amount: z.number().optional().nullable(),
  budget_hours: z.number().optional().nullable(),
  hourly_rate: z.number().optional().nullable(),
  currency_code: z.string().trim().length(3).optional().nullable().or(z.literal("")),
  start_date: z.string().optional().nullable().or(z.literal("")),
  end_date: z.string().optional().nullable().or(z.literal("")),
  manager_id: z.string().uuid().optional().nullable(),
});

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => projectSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: prof } = await supabase
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No organization");
    const payload: any = { ...data, tenant_id: prof.tenant_id };
    for (const k of ["currency_code", "start_date", "end_date"]) if (payload[k] === "") payload[k] = null;
    return { project: await writeRow(supabase, "projects", payload) };
  });

// ---------------- Jobs ----------------
export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ project_id: z.string().uuid().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase
      .from("client_jobs")
      .select("*, projects(name, client_id, clients(name))")
      .order("created_at", { ascending: false });
    if (data.project_id) q = q.eq("project_id", data.project_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { jobs: rows ?? [] };
  });

const jobSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["open", "in_progress", "review", "completed", "cancelled"]).default("open"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  due_date: z.string().optional().nullable().or(z.literal("")),
  assignee_id: z.string().uuid().optional().nullable(),
  estimated_hours: z.number().optional().nullable(),
});

export const upsertJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => jobSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: prof } = await supabase
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No organization");
    const payload: any = { ...data, tenant_id: prof.tenant_id };
    if (payload.due_date === "") payload.due_date = null;
    return { job: await writeRow(supabase, "client_jobs", payload) };
  });

// ---------------- Time entries ----------------
export const listMyTimeEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("id").eq("user_id", userId).maybeSingle();
    if (!emp) return { entries: [] };
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, projects(name, currency_code), client_jobs(name)")
      .eq("employee_id", emp.id)
      .order("work_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { entries: data ?? [] };
  });

const timeEntrySchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  job_id: z.string().uuid().optional().nullable(),
  work_date: z.string().min(8),
  hours: z.number().min(0.01).max(24),
  description: z.string().trim().max(500).optional().nullable(),
  billable: z.boolean().default(true),
  hourly_rate: z.number().optional().nullable(),
});

export const upsertMyTimeEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => timeEntrySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("id, tenant_id").eq("user_id", userId).maybeSingle();
    if (!emp) throw new Error("No employee record");
    const payload: any = { ...data, employee_id: emp.id, tenant_id: emp.tenant_id };
    const { data: row, error } = await supabase
      .from("time_entries").upsert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return { entry: row };
  });

export const deleteMyTimeEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("time_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Invoices ----------------
export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("invoices")
      .select("*, clients(name)")
      .order("issue_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { invoices: data ?? [] };
  });

const invoiceLineSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  tax_rate: z.number().min(0).max(100).default(0),
  project_id: z.string().uuid().optional().nullable(),
});

const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  invoice_number: z.string().trim().min(1).max(40),
  status: z.enum(["draft", "sent", "paid", "overdue", "void"]).default("draft"),
  issue_date: z.string(),
  due_date: z.string().optional().nullable().or(z.literal("")),
  currency_code: z.string().trim().length(3),
  notes: z.string().trim().max(2000).optional().nullable(),
  terms: z.string().trim().max(2000).optional().nullable(),
  lines: z.array(invoiceLineSchema).min(1).max(100),
});

export const upsertInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => invoiceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: prof } = await supabase
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No organization");

    const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
    const taxTotal = data.lines.reduce((s, l) => s + (l.quantity * l.unit_price * (l.tax_rate / 100)), 0);
    const total = subtotal + taxTotal;

    const invoicePayload: any = {
      id: data.id,
      tenant_id: prof.tenant_id,
      client_id: data.client_id,
      invoice_number: data.invoice_number,
      status: data.status,
      issue_date: data.issue_date,
      due_date: data.due_date || null,
      currency_code: data.currency_code,
      notes: data.notes ?? null,
      terms: data.terms ?? null,
      subtotal, tax_total: taxTotal, total,
      created_by: userId,
    };
    const { data: inv, error: invErr } = await supabase
      .from("invoices").upsert(invoicePayload).select("*").single();
    if (invErr) throw new Error(invErr.message);

    // Replace lines
    await supabase.from("invoice_lines").delete().eq("invoice_id", inv.id);
    const lineRows = data.lines.map((l, i) => ({
      tenant_id: prof.tenant_id,
      invoice_id: inv.id,
      project_id: l.project_id ?? null,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate: l.tax_rate,
      line_total: l.quantity * l.unit_price * (1 + l.tax_rate / 100),
      sort_order: i,
    }));
    const { error: lErr } = await supabase.from("invoice_lines").insert(lineRows);
    if (lErr) throw new Error(lErr.message);
    return { invoice: inv };
  });

export const getInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const [{ data: inv }, { data: lines }] = await Promise.all([
      supabase.from("invoices").select("*, clients(name, billing_address, contact_email)").eq("id", data.id).maybeSingle(),
      supabase.from("invoice_lines").select("*").eq("invoice_id", data.id).order("sort_order"),
    ]);
    return { invoice: inv, lines: lines ?? [] };
  });

export const markInvoicePaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    // Role guard: only org_admin / super_admin can mark invoices paid.
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    if (!roles.some((r: string) => ["org_admin", "super_admin"].includes(r))) {
      throw new Error("Forbidden");
    }

    // Tenant scope: resolve caller's tenant and scope the update to it.
    const { data: prof } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    const tenantId = prof?.tenant_id;
    if (!tenantId && !roles.includes("super_admin")) {
      throw new Error("No organization");
    }

    let q = supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", data.id);
    if (!roles.includes("super_admin")) q = q.eq("tenant_id", tenantId);
    const { error, count } = await q.select("id", { count: "exact" });
    if (error) throw new Error(error.message);
    if (!count) throw new Error("Invoice not found");
    return { ok: true };
  });

