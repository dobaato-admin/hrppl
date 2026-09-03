import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { validateInvitationDetails } from "@/lib/payroll-validation";
import { enforcePublicRateLimit } from "@/lib/rate-limit.functions";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadEmailSender() {
  const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
  return sendInternalEmail;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function appUrl(): string {
  // Prefer published URL when known; otherwise rely on request origin via env injection.
  return process.env.PUBLIC_APP_URL || "https://hrppl.io";
}

/**
 * Inviter authorization: org_admin / super_admin / branch_admin / hr can send
 * invitations. Returns the tenant id plus the inviter's highest role so the
 * caller can decide which target roles are assignable.
 */
async function getInviterContext(
  supabase: any,
  userId: string,
): Promise<{ tenantId: string; inviterRoles: string[]; isElevated: boolean }> {
  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No organization");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const inviterRoles: string[] = (roles ?? []).map((r: any) => r.role as string);
  const allowed = ["org_admin", "super_admin", "branch_admin", "hr"];
  if (!inviterRoles.some((r: string) => allowed.includes(r))) {
    throw new Error("Not authorized to send invitations");
  }
  const isElevated = inviterRoles.some((r: string) => r === "org_admin" || r === "super_admin");
  return { tenantId: profile.tenant_id as string, inviterRoles, isElevated };
}

// Back-compat: some functions only need the tenant id with admin authority.
async function getOrgAdminTenantId(supabase: any, userId: string): Promise<string> {
  const { tenantId } = await getInviterContext(supabase, userId);
  return tenantId;
}

// ---------- listTenantInvitations ----------
export const listTenantInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getOrgAdminTenantId(supabase, userId);
    const admin = await loadAdmin();
    const { data } = await admin
      .from("staff_invitations")
      .select("id,email,first_name,last_name,job_title,status,role,expires_at,accepted_at,created_at,last_sent_at,send_count,token")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(200);
    return { invitations: data ?? [] };
  });

// ---------- inviteStaff ----------
const dutyItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  weight: z.number().min(0).max(100),
  kpi_target: z.string().trim().max(500).optional().or(z.literal("")),
});

const inviteSchema = z.object({
  email: z.string().trim().email().max(255),
  first_name: z.string().trim().max(80).optional().or(z.literal("")),
  last_name: z.string().trim().max(80).optional().or(z.literal("")),
  job_title: z.string().trim().max(120).optional().or(z.literal("")),
  department_id: z.string().uuid().optional().nullable(),
  country_code: z.string().trim().length(2).optional().or(z.literal("")),
  role: z.enum(["employee", "manager", "org_admin", "branch_admin", "hr", "finance"]).default("employee"),
  state_region: z.string().trim().max(10).optional().or(z.literal("")),
  duties: z.array(dutyItemSchema).max(50).optional().default([]),
});

export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const sendInternalEmail = await loadEmailSender();
    const { tenantId, isElevated } = await getInviterContext(supabase, userId);
    // Only org_admin/super_admin can grant elevated/admin roles. HR/branch
    // admins may only invite operational roles.
    const elevatedTargets = new Set(["org_admin", "branch_admin", "hr", "finance"]);
    if (elevatedTargets.has(data.role) && !isElevated) {
      throw new Error("Only Org Admins can invite admin or HR roles.");
    }
    const admin = await loadAdmin();

    // Hard-block: payroll, overtime, and leave setup must all be complete
    // before any invitation can be created. Server-side enforcement so the
    // gate cannot be bypassed by a stale or tampered UI state.
    const { checkPayrollReadiness, checkOvertimeReadiness } = await import("@/lib/payroll-setup.functions");
    const { checkLeaveReadiness } = await import("@/lib/leave-setup.functions");
    const [payroll, overtime, leave] = await Promise.all([
      checkPayrollReadiness(admin, tenantId),
      checkOvertimeReadiness(admin, tenantId),
      checkLeaveReadiness(admin, tenantId),
    ]);
    if (!payroll.allComplete) {
      const missing = Object.entries(payroll.steps).filter(([, ok]) => !ok).map(([k]) => k).join(", ");
      throw new Error(`Complete the Payroll Setup Wizard before inviting employees. Outstanding: ${missing}.`);
    }
    if (!overtime.allComplete) {
      throw new Error("Complete the Overtime & Penalty Rates setup before inviting employees.");
    }
    if (!leave.allComplete) {
      const missing = Object.entries(leave.steps).filter(([, ok]) => !ok).map(([k]) => k).join(", ");
      throw new Error(`Complete the Leave Setup Wizard before inviting employees. Outstanding: ${missing}.`);
    }

    const { data: tenant } = await admin
      .from("tenants").select("name,country_code").eq("id", tenantId).maybeSingle();
    if (!tenant) throw new Error("Organization not found");

    const { data: inviter } = await admin
      .from("profiles").select("full_name,email").eq("id", userId).maybeSingle();

    const token = generateToken();
    const { data: inserted, error } = await admin
      .from("staff_invitations").insert({
        tenant_id: tenantId,
        email: data.email.toLowerCase(),
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        job_title: data.job_title || null,
        department_id: data.department_id || null,
        country_code: (data.country_code || tenant.country_code || "").toUpperCase() || null,
        role: data.role,
        token,
        invited_by: userId,
        state_region: data.state_region || null,
        duties: data.duties ?? [],
      }).select("id,token").single();
    if (error || !inserted) throw new Error(error?.message ?? "Could not create invitation");

    const inviteUrl = `${appUrl()}/invite/${token}`;
    await sendInternalEmail({
      templateName: "staff-invitation",
      recipientEmail: data.email,
      idempotencyKey: `invite-${inserted.id}`,
      templateData: {
        organizationName: tenant.name,
        inviterName: inviter?.full_name || inviter?.email,
        firstName: data.first_name || null,
        jobTitle: data.job_title || null,
        inviteUrl,
      },
    });

    const dutySum = (data.duties ?? []).reduce((s, d) => s + Number(d.weight || 0), 0);
    let weightWarning: string | null = null;
    if (data.duties && data.duties.length > 0) {
      const { data: tSet } = await admin.from("tenants")
        .select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
      const tolerance = Number(tSet?.kpi_weight_tolerance ?? 0);
      const strict = Boolean(tSet?.kpi_strict_weights ?? true);
      const within = Math.abs(dutySum - 100) <= tolerance;
      if (strict && !within) {
        throw new Error(`KPI weights must sum to 100% (±${tolerance}%). Current total: ${dutySum}%.`);
      }
      if (!within) {
        weightWarning = `Duty KPI weights sum to ${dutySum}% (expected 100%, ±${tolerance}%). The invitation was sent — adjust weights before reviews start.`;
      }
    }
    return { id: inserted.id, inviteUrl, weight_sum: dutySum, warning: weightWarning };
  });


// ---------- resendInvitation ----------
export const resendInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const sendInternalEmail = await loadEmailSender();
    const tenantId = await getOrgAdminTenantId(supabase, userId);
    const admin = await loadAdmin();
    const { data: inv } = await admin
      .from("staff_invitations").select("*").eq("id", data.id).eq("tenant_id", tenantId).maybeSingle();
    if (!inv) throw new Error("Invitation not found");
    if (inv.status !== "pending") throw new Error("Invitation is not pending");

    const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await admin.from("staff_invitations").update({
      last_sent_at: new Date().toISOString(),
      send_count: (inv.send_count ?? 1) + 1,
      expires_at: newExpiry,
    }).eq("id", inv.id);

    const { data: tenant } = await admin.from("tenants").select("name").eq("id", tenantId).maybeSingle();
    const { data: inviter } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
    const inviteUrl = `${appUrl()}/invite/${inv.token}`;

    await sendInternalEmail({
      templateName: "staff-invitation",
      recipientEmail: inv.email,
      idempotencyKey: `invite-${inv.id}-resend-${Date.now()}`,
      templateData: {
        organizationName: tenant?.name,
        inviterName: inviter?.full_name || inviter?.email,
        firstName: inv.first_name,
        jobTitle: inv.job_title,
        inviteUrl,
      },
    });
    return { ok: true };
  });

// ---------- revokeInvitation ----------
export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getOrgAdminTenantId(supabase, userId);
    const admin = await loadAdmin();
    await admin.from("staff_invitations").update({ status: "revoked" })
      .eq("id", data.id).eq("tenant_id", tenantId);
    return { ok: true };
  });

// ---------- getInvitationByToken (public; minimal data) ----------
export const getInvitationByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().min(20).max(128).regex(/^[a-f0-9]+$/i) }).parse(data),
  )
  .handler(async ({ data }) => {
    // Reads by token; the limit is what makes brute-force enumeration impractical.
    await enforcePublicRateLimit("public_invite_lookup", 30, 3600);
    const admin = await loadAdmin();
    const { data: inv } = await admin
      .from("staff_invitations")
      .select("id,tenant_id,email,first_name,last_name,job_title,country_code,role,status,expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (!inv) return { invitation: null, organization: null };
    const isExpired = new Date(inv.expires_at as string) < new Date();
    if (isExpired && inv.status === "pending") {
      await admin.from("staff_invitations").update({ status: "expired" }).eq("id", inv.id);
      inv.status = "expired";
    }
    const { data: tenant } = await admin
      .from("tenants").select("name,country_code,currency_code").eq("id", inv.tenant_id).maybeSingle();
    return {
      invitation: {
        id: inv.id,
        email: inv.email,
        first_name: inv.first_name,
        last_name: inv.last_name,
        job_title: inv.job_title,
        country_code: inv.country_code,
        role: inv.role,
        status: inv.status,
        expires_at: inv.expires_at,
      },
      organization: tenant ? { name: tenant.name, country_code: tenant.country_code, currency_code: tenant.currency_code } : null,
    };
  });

// ---------- acceptInvitation ----------
function genEmpNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `EMP-${n}`;
}

const acceptSchema = z.object({
  token: z.string().min(20).max(128).regex(/^[a-f0-9]+$/i),
  details: z
    .object({
      contact_number: z.string().trim().max(40).optional().or(z.literal("")),
      bank_name: z.string().trim().max(120).optional().or(z.literal("")),
      bank_bsb: z.string().trim().max(20).optional().or(z.literal("")),
      bank_account_number: z.string().trim().max(40).optional().or(z.literal("")),
      bank_account_name: z.string().trim().max(120).optional().or(z.literal("")),
      tfn: z.string().trim().max(20).optional().or(z.literal("")),
      super_fund_name: z.string().trim().max(120).optional().or(z.literal("")),
      super_member_number: z.string().trim().max(60).optional().or(z.literal("")),
      next_of_kin_name: z.string().trim().max(120).optional().or(z.literal("")),
      next_of_kin_relationship: z.string().trim().max(60).optional().or(z.literal("")),
      next_of_kin_phone: z.string().trim().max(40).optional().or(z.literal("")),
    })
    .optional(),
});

export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => acceptSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context as any;
    const userEmail = ((claims?.email as string | undefined) ?? "").toLowerCase();
    if (!userEmail) throw new Error("User has no email");
    const admin = await loadAdmin();
    const { data: inv } = await admin
      .from("staff_invitations").select("*").eq("token", data.token).maybeSingle();
    if (!inv) throw new Error("Invitation not found");
    if (inv.status !== "pending") throw new Error(`Invitation is ${inv.status}`);
    if (new Date(inv.expires_at) < new Date()) {
      await admin.from("staff_invitations").update({ status: "expired" }).eq("id", inv.id);
      throw new Error("Invitation expired");
    }
    if ((inv.email as string).toLowerCase() !== userEmail) {
      throw new Error("This invitation was sent to a different email address.");
    }

    const rawDetails = data.details ?? {};
    const orgCountry = (inv.country_code as string | null) || "";
    const isAU = orgCountry.toUpperCase() === "AU" || !orgCountry; // default AU if unset (legacy)
    const { errors, normalized } = validateInvitationDetails(rawDetails, { isAU });
    if (Object.keys(errors).length > 0) {
      const first = Object.entries(errors)[0];
      throw new Error(`${first[0]}: ${first[1]}`);
    }
    const d = normalized;
    const blank = (v?: string | null) => (v && v.trim().length > 0 ? v.trim() : null);

    // Profile -> tenant
    await admin.from("profiles").update({ tenant_id: inv.tenant_id }).eq("id", userId);

    // Employee row (create if not exists)
    const { data: existingEmp } = await admin
      .from("employees").select("id").eq("user_id", userId).eq("tenant_id", inv.tenant_id).maybeSingle();
    let employeeId = existingEmp?.id as string | undefined;
    if (!employeeId) {
      const { data: emp, error: empErr } = await admin.from("employees").insert({
        tenant_id: inv.tenant_id,
        user_id: userId,
        employee_number: genEmpNumber(),
        first_name: inv.first_name || userEmail.split("@")[0],
        last_name: inv.last_name || "",
        email: userEmail,
        phone: blank(d.contact_number),
        job_title: inv.job_title,
        department_id: inv.department_id,
        employment_type: "full_time",
        status: "active",
        hire_date: new Date().toISOString().slice(0, 10),
        state_region: (inv as any).state_region ?? null,
      }).select("id").single();
      if (empErr || !emp) throw new Error(empErr?.message ?? "Could not create employee");
      employeeId = emp.id;
    } else {
      const patch: Record<string, any> = {};
      if (blank(d.contact_number)) patch.phone = blank(d.contact_number);
      if ((inv as any).state_region) patch.state_region = (inv as any).state_region;
      if (Object.keys(patch).length) await admin.from("employees").update(patch as any).eq("id", employeeId);
    }

    // Materialize duties captured on the invitation into employee_duties.
    const invDuties = Array.isArray((inv as any).duties) ? (inv as any).duties : [];
    if (invDuties.length && employeeId) {
      const rows = invDuties.map((d: any, idx: number) => ({
        tenant_id: inv.tenant_id,
        employee_id: employeeId,
        title: String(d.title ?? "").slice(0, 200),
        description: d.description ? String(d.description).slice(0, 2000) : null,
        weight: Number(d.weight ?? 0),
        kpi_target: d.kpi_target ? String(d.kpi_target).slice(0, 500) : null,
        sort_order: idx,
        is_active: true,
        created_by: (inv as any).invited_by ?? null,
      }));
      await admin.from("employee_duties").insert(rows);
    }

    // Payroll / personal details (upsert)
    await admin.from("employee_payroll_details").upsert({
      employee_id: employeeId,
      tenant_id: inv.tenant_id,
      contact_number: blank(d.contact_number),
      bank_name: blank(d.bank_name),
      bank_bsb: blank(d.bank_bsb),
      bank_account_number: blank(d.bank_account_number),
      bank_account_name: blank(d.bank_account_name),
      tfn: blank(d.tfn),
      super_fund_name: blank(d.super_fund_name),
      super_member_number: blank(d.super_member_number),
      next_of_kin_name: blank(d.next_of_kin_name),
      next_of_kin_relationship: blank(d.next_of_kin_relationship),
      next_of_kin_phone: blank(d.next_of_kin_phone),
    }, { onConflict: "employee_id" } as any);

    // Also mirror bank + tax fields into staff_onboarding_profiles so they
    // appear in the employee's "My banking & tax" tab (which reads from that table).
    const obFields: Record<string, string | null> = {
      bank_name: blank(d.bank_name),
      bank_account_holder: blank(d.bank_account_name),
      bank_account_number: blank(d.bank_account_number),
      bank_branch_code: blank(d.bank_bsb),
      tax_identification_number: blank(d.tfn),
      pension_fund_number: blank(d.super_member_number),
    };
    const hasAny = Object.values(obFields).some((v) => v != null && v !== "");
    if (hasAny) {
      await admin
        .from("staff_onboarding_profiles")
        .upsert(
          { employee_id: employeeId, tenant_id: inv.tenant_id, ...obFields },
          { onConflict: "employee_id" } as any,
        );
    }

    // Role
    await admin.from("user_roles").upsert(
      { user_id: userId, role: inv.role || "employee", tenant_id: inv.tenant_id },
      { onConflict: "user_id,role" } as any,
    );

    // Mark accepted
    await admin.from("staff_invitations").update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_user_id: userId,
    }).eq("id", inv.id);

    return { tenantId: inv.tenant_id, employeeId };
  });

