/**
 * Wave 7 — the HR policy library and its acknowledgements.
 *
 * Segment 7 of the guided setup ("code of conduct, whistleblower, grievance")
 * and Phase 3 step 4 ("mandatory read-and-sign tasks") both needed this, and
 * `docs/onboarding-guided-routes.md` §9 listed it as genuinely missing. Nothing
 * in the platform stored a policy document or a record that someone had read
 * one.
 *
 * Three rules the design turns on:
 *
 * 1. **An acknowledgement is of a version, not of a document.** `policy_version`
 *    is copied at signing time, so revising the code of conduct does not
 *    silently inherit consent given to different words — and "what did this
 *    person actually agree to" stays answerable years later.
 * 2. **Only the person may sign.** RLS enforces it independently
 *    ("employee signs own acknowledgement"); the whole evidentiary value of the
 *    table depends on nobody being able to record it on your behalf.
 * 3. **Assigning is separate from signing.** HR creates the obligation with a
 *    due date; the employee discharges it. A row with `acknowledged_at IS NULL`
 *    is an outstanding task, which is what makes the roster meaningful.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyEmployeeId, requireTenantId } from "@/lib/tenant-scope";

export const POLICY_CATEGORIES = [
  "conduct",
  "grievance",
  "whistleblower",
  "health_safety",
  "it_usage",
  "privacy",
  "general",
] as const;

/**
 * May this caller maintain the policy library?
 *
 * Mirrors "hr and org admin manage policies" exactly. Deliberately excludes
 * `manager`: a line manager rewriting the whistleblower policy is not something
 * this product should permit, and the RLS policy says the same.
 */
async function assertPolicyAuthor(supabase: any, userId: string, tenantId: string) {
  for (const helper of ["is_org_admin", "is_hr"] as const) {
    const { data } = await supabase.rpc(helper, {
      _user_id: userId,
      _tenant_id: tenantId,
    } as any);
    if (data) return;
  }
  throw new Error("Forbidden: HR or organisation admin required");
}

// ============================== LIBRARY ==============================

export const listPolicyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ includeInactive: z.boolean().default(false) }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    let q = supabase
      .from("policy_documents")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("category")
      .order("title");
    if (!data.includeInactive) q = q.eq("is_active", true);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { policies: rows ?? [] };
  });

export const upsertPolicyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(1).max(200),
        category: z.enum(POLICY_CATEGORIES).default("general"),
        summary: z.string().max(1000).optional().nullable(),
        body_md: z.string().max(100000).default(""),
        requires_acknowledgement: z.boolean().default(true),
        is_active: z.boolean().default(true),
        effective_from: z.string().optional().nullable(),
        /**
         * Set when the text changed materially. Bumping the version re-opens
         * the obligation for everyone — which is the point, and why it is an
         * explicit choice by the author rather than something inferred from a
         * diff.
         */
        bumpVersion: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertPolicyAuthor(supabase, userId, tenantId);

    const { id, bumpVersion, ...fields } = data;
    const payload: any = {
      ...fields,
      tenant_id: tenantId,
      effective_from: fields.effective_from || null,
      summary: fields.summary || null,
    };

    if (!id) {
      payload.created_by = userId;
      const { data: row, error } = await supabase
        .from("policy_documents")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { policy: row };
    }

    if (bumpVersion) {
      const { data: current } = await supabase
        .from("policy_documents")
        .select("version")
        .eq("id", id)
        .maybeSingle();
      payload.version = ((current as any)?.version ?? 1) + 1;
    }
    const { data: row, error } = await supabase
      .from("policy_documents")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { policy: row };
  });

export const deletePolicyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertPolicyAuthor(supabase, userId, tenantId);

    // A policy people have signed is retired, never deleted: the
    // acknowledgements cascade, and destroying the evidence that someone
    // accepted the code of conduct is not a thing an admin should be able to do
    // with a Delete button.
    const { count } = await supabase
      .from("policy_acknowledgements")
      .select("id", { count: "exact", head: true })
      .eq("policy_id", data.id)
      .not("acknowledged_at", "is", null);
    if ((count ?? 0) > 0) {
      const { error } = await supabase
        .from("policy_documents")
        .update({ is_active: false })
        .eq("id", data.id);
      if (error) throw error;
      return { ok: true, retired: true, acknowledgements: count };
    }

    const { error } = await supabase.from("policy_documents").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true, retired: false };
  });

// ========================== ACKNOWLEDGEMENTS ==========================

/**
 * Create the obligation for a set of employees.
 *
 * Idempotent on `(policy_id, employee_id, policy_version)`, so re-running it —
 * which Phase 3 provisioning does on every activation — never duplicates a
 * task or resets one somebody already signed.
 */
export const assignPolicyAcknowledgements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        policy_ids: z.array(z.string().uuid()).min(1).max(100).optional(),
        employee_ids: z.array(z.string().uuid()).min(1).max(1000),
        due_date: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertPolicyAuthor(supabase, userId, tenantId);

    let q = supabase
      .from("policy_documents")
      .select("id,version")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .eq("requires_acknowledgement", true);
    if (data.policy_ids?.length) q = q.in("id", data.policy_ids);
    const { data: policies, error } = await q;
    if (error) throw error;
    if (!policies?.length) return { ok: true, count: 0 };

    const rows = [];
    for (const p of policies as any[]) {
      for (const employee_id of data.employee_ids) {
        rows.push({
          tenant_id: tenantId,
          policy_id: p.id,
          employee_id,
          policy_version: p.version,
          due_date: data.due_date || null,
        });
      }
    }
    const { error: insErr } = await supabase
      .from("policy_acknowledgements")
      .upsert(rows, { onConflict: "policy_id,employee_id,policy_version", ignoreDuplicates: true });
    if (insErr) throw insErr;
    return { ok: true, count: rows.length };
  });

/** What this employee still has to read and sign, and what they already have. */
export const listMyPolicyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) return { tasks: [], noEmployeeRecord: true as const };

    const { data, error } = await supabase
      .from("policy_acknowledgements")
      .select("*, policy_documents(id,title,category,summary,body_md,version)")
      .eq("employee_id", employeeId)
      .order("acknowledged_at", { nullsFirst: true });
    if (error) throw error;
    return { tasks: data ?? [], noEmployeeRecord: false as const };
  });

export const acknowledgePolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        acknowledgement_id: z.string().uuid(),
        signature_name: z.string().trim().min(2).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) throw new Error("Only an employee can sign a policy");

    const { data: row } = await supabase
      .from("policy_acknowledgements")
      .select("id,employee_id,acknowledged_at,policy_id,policy_version")
      .eq("id", data.acknowledgement_id)
      .maybeSingle();
    if (!row) throw new Error("Acknowledgement not found");
    if ((row as any).employee_id !== employeeId) {
      throw new Error("You can only sign your own acknowledgement");
    }
    // Signing twice is not an error, but it must not move the timestamp: the
    // date somebody accepted a policy is the fact this row exists to hold.
    if ((row as any).acknowledged_at) return { ok: true, alreadySigned: true };

    // The version is re-read here rather than trusted from the client, so a
    // stale tab cannot record consent to a version the reader never saw.
    const { data: policy } = await supabase
      .from("policy_documents")
      .select("version")
      .eq("id", (row as any).policy_id)
      .maybeSingle();
    if ((policy as any)?.version !== (row as any).policy_version) {
      throw new Error("This policy has been revised — reload and read the current version");
    }

    const { error } = await supabase
      .from("policy_acknowledgements")
      .update({ acknowledged_at: new Date().toISOString(), signature_name: data.signature_name })
      .eq("id", data.acknowledgement_id);
    if (error) throw error;
    return { ok: true, alreadySigned: false };
  });

/** Roster: who has signed what. Drives the compliance view on /admin/policies. */
export const listPolicyCompliance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ policy_id: z.string().uuid().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    let q = supabase
      .from("policy_acknowledgements")
      .select("*, employees(id,first_name,last_name,job_title), policy_documents(id,title)")
      .eq("tenant_id", tenantId)
      .order("assigned_at", { ascending: false });
    if (data.policy_id) q = q.eq("policy_id", data.policy_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [] };
  });
