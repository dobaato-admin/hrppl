import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, requireAuthAllowSuspended } from "@/lib/auth-guard";
import { validateBusinessRegistrationNumber } from "@/lib/payroll-validation";
import { getActingTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "org";
}

async function uniqueSlug(admin: any, base: string): Promise<string> {
  const root = slugify(base);
  for (let i = 0; i < 30; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await admin.from("tenants").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// ---------- getMyOrgStatus ----------
export const getMyOrgStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context as any;
    const email = ((claims?.email as string | undefined) ?? "").toLowerCase() || null;

    const { data: profile } = await supabase
      .from("profiles").select("tenant_id, full_name").eq("id", userId).maybeSingle();
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (roleRows ?? []).map((r: any) => r.role as string);
    const isPlatformAdmin = roles.includes("super_admin") || roles.includes("regional_admin");

    // Platform admins have no home tenant; fall back to whichever tenant
    // they've chosen to act as (src/lib/tenant-scope.ts).
    const homeTenantId = (profile?.tenant_id as string | null) ?? null;
    const actingTenantId =
      !homeTenantId && isPlatformAdmin ? await getActingTenantId(supabase, userId) : null;
    const tenantId = homeTenantId ?? actingTenantId;

    let setupProgress: any = null;
    let tenant: any = null;
    if (tenantId) {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase
          .from("tenants")
          .select("id,name,legal_name,primary_contact_name,slug,country_code,currency_code,status,plan,contact_email,contact_phone,address_line1,address_line2,city,region,postal_code,website,tagline,registration_number,tax_id_number")
          .eq("id", tenantId)
          .maybeSingle(),
        supabase.from("organization_setup_progress").select("*").eq("tenant_id", tenantId).maybeSingle(),
      ]);
      tenant = t;
      setupProgress = p;
    }

    let pendingInvitation: any = null;
    let pendingTrialInvitation: any = null;
    if (email) {
      const admin = await loadAdmin();
      const [staffInviteResult, trialInviteResult] = await Promise.all([
        admin
          .from("staff_invitations")
          .select("id,tenant_id,token,email,first_name,last_name,job_title,status,expires_at")
          .ilike("email", email)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("org_trial_invitations")
          .select("id,email,org_name,contact_name,country_code,trial_days,status,expires_at")
          .eq("email", email.toLowerCase())
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      pendingInvitation = staffInviteResult.data ?? null;
      pendingTrialInvitation = trialInviteResult.data ?? null;
    }

    // Employee record + onboarding status
    let employee: any = null;
    let onboardingProfile: any = null;
    {
      const { data: emp } = await supabase
        .from("employees").select("id,tenant_id,first_name,last_name,email,job_title,department_id")
        .eq("user_id", userId).maybeSingle();
      employee = emp;
      if (emp) {
        const { data: prof } = await supabase
          .from("staff_onboarding_profiles").select("employee_id,submitted_at").eq("employee_id", emp.id).maybeSingle();
        onboardingProfile = prof;
      }
    }

    return {
      userId,
      email,
      roles,
      tenant,
      tenantId,
      actingTenantId,
      isPlatformAdmin,
      setupProgress,
      pendingInvitation,
      pendingTrialInvitation,
      employee,
      onboardingProfile,
    };
  });

// ---------- getMyGateStatus ----------
// Lightweight status used by the global route gate on every protected
// navigation. Keep this intentionally narrow so back/forward navigation is not
// blocked by invitation, employee and onboarding detail lookups.
// Uses requireAuthAllowSuspended, not the standard guard: this is the endpoint
// that TELLS the route gate the caller is suspended. Guarding it would make
// "suspended" indistinguishable from "server error" and the gate fails open.
// It returns only the caller's own status — no tenant data leaks here.
export const getMyGateStatus = createServerFn({ method: "GET" })
  .middleware([requireAuthAllowSuspended])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context as any;
    const email = ((claims?.email as string | undefined) ?? "").toLowerCase();

    // Resolved first: a suspended caller short-circuits before any tenant read.
    const { getAccountStatus } = await import("@/lib/account-status.server");
    const account = await getAccountStatus(supabase, userId);
    if (!account.active) {
      return {
        userId,
        tenantId: null,
        actingTenantId: null,
        isPlatformAdmin: false,
        roles: [] as string[],
        orgCreated: false,
        orgActivated: false,
        pendingTrialInvitation: null,
        suspended: true,
        suspensionReason: account.reason,
        suspendedScope: account.status === "suspended" ? "account" : "organisation",
      };
    }

    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roles = (roleRows ?? []).map((r: any) => r.role as string);
    const isPlatformAdmin = roles.includes("super_admin") || roles.includes("regional_admin");

    // Platform admins have no home tenant; fall back to whichever tenant
    // they've chosen to act as (src/lib/tenant-scope.ts).
    const homeTenantId = (profile?.tenant_id as string | null) ?? null;
    const actingTenantId =
      !homeTenantId && isPlatformAdmin ? await getActingTenantId(supabase, userId) : null;
    const tenantId = homeTenantId ?? actingTenantId;

    // Two distinct milestones, deliberately named apart.
    //
    //   orgCreated   — the five-step wizard at /org/setup finished: the tenant
    //                  row exists, with a country, a currency and departments.
    //   orgActivated — /org/setup-guide's "Finalize & activate" ran: payroll,
    //                  leave and policies are actually configured, re-derived
    //                  server-side from the tenant's own data.
    //
    // These were previously one idea called `setupCompleted`, which is why a
    // new admin finished the wizard and was dropped on the dashboard with a
    // half-configured organisation and no sign that a guide existed.
    //
    // Both reads run in parallel. `getMyGateStatus` fires on every protected
    // navigation, so this must not add a serial round trip.
    let orgCreated = false;
    let orgActivated = false;
    if (tenantId) {
      const [{ data: setupProgress }, { data: setupState }] = await Promise.all([
        supabase
          .from("organization_setup_progress")
          .select("completed_at")
          .eq("tenant_id", tenantId)
          .maybeSingle(),
        supabase
          .from("tenant_setup_state")
          .select("activated_at")
          .eq("tenant_id", tenantId)
          .maybeSingle(),
      ]);
      orgCreated = !!setupProgress?.completed_at;
      orgActivated = !!setupState?.activated_at;
    }

    let pendingTrialInvitation: any = null;
    if (!tenantId && email) {
      const admin = await loadAdmin();
      const { data: trialInvite } = await admin
        .from("org_trial_invitations")
        .select("id,email,status,expires_at")
        .eq("email", email)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      pendingTrialInvitation = trialInvite ?? null;
    }

    return {
      userId, tenantId, actingTenantId, isPlatformAdmin, roles, orgCreated, orgActivated, pendingTrialInvitation,
      suspended: false, suspensionReason: null, suspendedScope: null,
    };
  });

// ---------- createOrganization ----------
const createOrgSchema = z.object({
  name: z.string().trim().min(2).max(120),
  legal_name: z.string().trim().max(160).optional().or(z.literal("")),
  primary_contact_name: z.string().trim().max(160).optional().or(z.literal("")),
  country_code: z.string().trim().length(2),
  contact_email: z.string().trim().email().max(255),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  address_line1: z.string().trim().max(160).optional().or(z.literal("")),
  address_line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  postal_code: z.string().trim().max(32).optional().or(z.literal("")),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  registration_number: z.string().trim().max(80).optional().or(z.literal("")),
  tax_id_number: z.string().trim().max(80).optional().or(z.literal("")),
  owner_job_title: z.string().trim().max(120).optional().or(z.literal("")),
});

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createOrgSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context as any;
    const admin = await loadAdmin();
    const clean = (value?: string | null) => {
      const next = value?.trim();
      return next ? next : null;
    };
    const email = (claims?.email as string | undefined)?.toLowerCase() ?? null;

    // Already in a tenant? Don't create another
    const { data: existingProfile } = await admin
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (existingProfile?.tenant_id) {
      throw new Error("You already belong to an organization.");
    }

    const { data: country } = await admin
      .from("countries").select("code,currency_code,name").eq("code", data.country_code.toUpperCase()).maybeSingle();
    if (!country) throw new Error("Unsupported country code");

    const { data: trialInvitation } = email
      ? await admin
          .from("org_trial_invitations")
          .select("id,org_name,contact_name,country_code")
          .eq("email", email)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    const phone = clean(data.contact_phone);
    const registrationNumber = clean(data.registration_number);

    if (!trialInvitation && (!phone || phone.replace(/\D+/g, "").length < 6)) {
      throw new Error("Contact phone is required.");
    }

    let normalizedRegistrationNumber: string | null = null;
    if (registrationNumber) {
      const regCheck = validateBusinessRegistrationNumber(registrationNumber, data.country_code);
      if (!regCheck.ok) throw new Error(regCheck.error);
      normalizedRegistrationNumber = regCheck.value;
    } else if (!trialInvitation) {
      throw new Error(country.code === "AU" ? "ABN is required." : "Business registration number is required.");
    }

    const slug = await uniqueSlug(admin, data.name);

    const { data: tenant, error: tErr } = await admin
      .from("tenants").insert({
        name: data.name,
        legal_name: clean(data.legal_name) ?? data.name,
        primary_contact_name: clean(data.primary_contact_name) ?? clean(trialInvitation?.contact_name),
        slug,
        country_code: country.code,
        currency_code: country.currency_code,
        contact_email: data.contact_email,
        contact_phone: phone,
        address_line1: clean(data.address_line1),
        address_line2: clean(data.address_line2),
        city: clean(data.city),
        region: clean(data.region),
        postal_code: clean(data.postal_code),
        website: clean(data.website),
        tagline: clean(data.tagline),
        registration_number: normalizedRegistrationNumber,
        tax_id_number: clean(data.tax_id_number),
        plan: "starter",
        status: "active",
        created_by: userId,
      }).select("*").single();
    if (tErr || !tenant) throw new Error(tErr?.message ?? "Could not create organization");

    const { error: profileErr } = await admin
      .from("profiles")
      .update({ tenant_id: tenant.id })
      .eq("id", userId);
    if (profileErr) {
      await admin.from("tenants").delete().eq("id", tenant.id);
      throw new Error(profileErr.message || "Could not link your account to the organization");
    }

    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "org_admin", tenant_id: tenant.id });
    if (roleErr) {
      await admin.from("profiles").update({ tenant_id: null }).eq("id", userId);
      await admin.from("tenants").delete().eq("id", tenant.id);
      throw new Error(roleErr.message || "Could not grant organization admin access");
    }

    const { data: existingEmployee } = await admin
      .from("employees")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingEmployee) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name,email")
        .eq("id", userId)
        .maybeSingle();

      const fullName = (profile?.full_name || "").trim();
      const [firstNameRaw, ...restName] = fullName.split(/\s+/).filter(Boolean);
      const firstName = firstNameRaw || data.primary_contact_name?.trim() || data.name.trim();
      const lastName = restName.join(" ") || "Administrator";

      const { error: employeeErr } = await admin.from("employees").insert({
        tenant_id: tenant.id,
        user_id: userId,
        employee_number: `ADM-${Date.now().toString(36).toUpperCase()}`,
        first_name: firstName.slice(0, 120),
        last_name: lastName.slice(0, 120),
        email: (profile?.email || data.contact_email).toLowerCase(),
        phone: clean(data.contact_phone),
        job_title: clean(data.owner_job_title) ?? "Organization Administrator",
        employment_type: "full_time",
        status: "active",
        hire_date: new Date().toISOString().slice(0, 10),
        currency_code: country.currency_code,
      });

      if (employeeErr) {
        await admin.from("user_roles").delete().eq("user_id", userId).eq("tenant_id", tenant.id);
        await admin.from("profiles").update({ tenant_id: null }).eq("id", userId);
        await admin.from("tenants").delete().eq("id", tenant.id);
        throw new Error(employeeErr.message || "Could not create organization owner record");
      }
    }

    return { tenantId: tenant.id, slug: tenant.slug };
  });

// ---------- updateSetupStep ----------
const stepSchema = z.object({
  step: z.enum(["details", "branding", "departments", "defaults", "invites"]),
});

const updateOrgProfileSchema = z.object({
  legal_name: z.string().trim().max(160).optional().or(z.literal("")),
  primary_contact_name: z.string().trim().max(160).optional().or(z.literal("")),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  address_line1: z.string().trim().max(160).optional().or(z.literal("")),
  address_line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  postal_code: z.string().trim().max(32).optional().or(z.literal("")),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  registration_number: z.string().trim().max(80).optional().or(z.literal("")),
  tax_id_number: z.string().trim().max(80).optional().or(z.literal("")),
});

async function assertOrgAdmin(supabase: any, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id as string | null;
  if (!tenantId) throw new Error("No organization");
  const { data: roleRows } = await supabase
    .from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r: any) => r.role as string);
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: organization admin required");
  }
  return tenantId;
}

export const updateOrganizationProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateOrgProfileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);

    const admin = await loadAdmin();
    const clean = (value?: string | null) => {
      const next = value?.trim();
      return next ? next : null;
    };

    const { error } = await admin
      .from("tenants")
      .update({
        legal_name: clean(data.legal_name),
        primary_contact_name: clean(data.primary_contact_name),
        contact_phone: clean(data.contact_phone),
        address_line1: clean(data.address_line1),
        address_line2: clean(data.address_line2),
        city: clean(data.city),
        region: clean(data.region),
        postal_code: clean(data.postal_code),
        website: clean(data.website),
        tagline: clean(data.tagline),
        registration_number: clean(data.registration_number),
        tax_id_number: clean(data.tax_id_number),
      })
      .eq("id", tenantId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markSetupStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => stepSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);

    const col = `${data.step}_done`;
    const admin = await loadAdmin();
    const { data: row } = await admin
      .from("organization_setup_progress").select("*").eq("tenant_id", tenantId).maybeSingle();
    const next = { ...(row ?? { tenant_id: tenantId }), [col]: true } as any;
    const allDone =
      next.details_done && next.branding_done && next.departments_done && next.defaults_done;
    if (allDone && !next.completed_at) next.completed_at = new Date().toISOString();
    const { error } = await admin
      .from("organization_setup_progress").upsert(next, { onConflict: "tenant_id" } as any);
    if (error) throw new Error(error.message);
    return { ok: true, completed: !!next.completed_at };
  });

// ---------- seedDefaults ----------
const seedSchema = z.object({
  departments: z.array(z.string().trim().min(1).max(80)).max(20).default(["Operations","Engineering","People"]),
  withLeaveTypes: z.boolean().default(true),
  /**
   * T18 · Which of the country's default leave types to create.
   *
   * Omitted means "the country's standard set", which is what `withLeaveTypes`
   * alone used to mean — so an older client, or any caller that has not been
   * updated, behaves exactly as before. An explicit empty array means the
   * admin unticked everything, which is different from not having been asked.
   */
  leaveTypeCodes: z.array(z.string().trim().max(40)).max(30).optional(),
});

export const seedOrgDefaults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => seedSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);

    const admin = await loadAdmin();

    // Departments
    const deptRows = data.departments.map((name) => ({ tenant_id: tenantId, name }));
    if (deptRows.length) {
      await admin.from("departments").insert(deptRows);
    }

    // Leave types
    //
    // T18 · Seeded from `country_leave_defaults` rather than from three
    // hard-coded rows that were the same for every country. Australia's
    // entitlements are not Nepal's, and the previous set (21 days annual, 10
    // sick) matched neither.
    let leaveTypesCreated = 0;
    if (data.withLeaveTypes) {
      const { count } = await admin
        .from("leave_types").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId);
      if ((count ?? 0) === 0) {
        const { data: tenant } = await admin
          .from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
        const countryCode = String(tenant?.country_code ?? "").toUpperCase();

        const { data: catalogue } = countryCode
          ? await admin
              .from("country_leave_defaults")
              .select("code,name,annual_quota_days,accrual_per_month,is_paid,color,is_standard")
              .eq("country_code", countryCode)
              .order("sort_order")
          : { data: [] as any[] };

        const wanted = data.leaveTypeCodes
          ? new Set(data.leaveTypeCodes.map((c) => c.toUpperCase()))
          : null;
        const chosen = (catalogue ?? []).filter((row: any) =>
          wanted ? wanted.has(String(row.code).toUpperCase()) : row.is_standard,
        );

        const rows =
          chosen.length > 0
            ? chosen.map((row: any) => ({
                tenant_id: tenantId,
                code: row.code,
                name: row.name,
                annual_quota_days: Number(row.annual_quota_days),
                accrual_per_month: Number(row.accrual_per_month),
                is_paid: row.is_paid,
                color: row.color,
              }))
            : // No catalogue for this country yet — launch coverage is AU and
              // NP. Falling back to the universal three is better than leaving
              // an organisation with no leave types at all, which stops anyone
              // requesting time off. An explicit empty selection is honoured.
              wanted && wanted.size === 0
              ? []
              : [
                  { tenant_id: tenantId, code: "ANNUAL", name: "Annual Leave", annual_quota_days: 21, accrual_per_month: 1.75, is_paid: true, color: "#3b82f6" },
                  { tenant_id: tenantId, code: "SICK", name: "Sick Leave", annual_quota_days: 10, accrual_per_month: 0.83, is_paid: true, color: "#ef4444" },
                  { tenant_id: tenantId, code: "UNPAID", name: "Unpaid Leave", annual_quota_days: 0, accrual_per_month: 0, is_paid: false, color: "#6b7280" },
                ];

        if (rows.length > 0) {
          const { error } = await admin.from("leave_types").insert(rows);
          if (error) {
            console.error("[seedOrgDefaults] leave types insert failed", error);
            throw new Error("Could not create the leave types. Nothing else was changed.");
          }
          leaveTypesCreated = rows.length;
        }
      }
    }

    // T21 · A starter onboarding template.
    //
    // Adding an employee prompts for one, but nothing created one during
    // setup — so an admin's first hire sent them out to the Templates Hub and
    // back. Seeded only when the tenant has none, so an admin who has built
    // their own never gets an unexpected extra.
    let templateCreated = false;
    {
      const { count } = await admin
        .from("onboarding_checklist_templates")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      if ((count ?? 0) === 0) {
        const { data: tpl, error: tplErr } = await admin
          .from("onboarding_checklist_templates")
          .insert({
            tenant_id: tenantId,
            name: "New starter",
            description:
              "A starting checklist for a new hire. Edit it, or build your own, under Templates.",
            is_default: true,
            is_active: true,
            created_by: userId,
          })
          .select("id")
          .single();
        if (tplErr) {
          // Not fatal: an organisation with no template is the state we were
          // already in, and failing the whole setup step over a convenience
          // would be worse than not having it.
          console.error("[seedOrgDefaults] starter template failed", tplErr);
        } else if (tpl) {
          const items = [
            { title: "Sign employment contract", category: "paperwork", owner_role: "employee", due_offset_days: 0, required: true },
            { title: "Provide bank and tax details", category: "paperwork", owner_role: "employee", due_offset_days: 2, required: true },
            { title: "Add to payroll", category: "paperwork", owner_role: "hr", due_offset_days: 3, required: true },
            { title: "Issue laptop and accounts", category: "equipment", owner_role: "it", due_offset_days: 0, required: true },
            { title: "Workplace health and safety induction", category: "training", owner_role: "hr", due_offset_days: 5, required: true },
            { title: "Introduce to the team", category: "intro", owner_role: "manager", due_offset_days: 1, required: false },
            { title: "First-week check-in", category: "intro", owner_role: "manager", due_offset_days: 7, required: false },
          ];
          const { error: itemErr } = await admin
            .from("onboarding_checklist_template_items")
            .insert(
              // T20 · Note there is no `id` key here at all. Setting one to
              // `undefined` would put "id" in postgrest-js's `columns`
              // parameter and make PostgREST write NULL over the default.
              items.map((it, idx) => ({ ...it, template_id: tpl.id, tenant_id: tenantId, sort_order: idx })),
            );
          if (itemErr) {
            console.error("[seedOrgDefaults] starter template items failed", itemErr);
            // A template with no tasks is worse than none: it looks usable and
            // assigns an empty checklist. Remove it rather than leave it.
            await admin.from("onboarding_checklist_templates").delete().eq("id", tpl.id);
          } else {
            templateCreated = true;
          }
        }
      }
    }

    return { ok: true, leaveTypesCreated, templateCreated };
  });

// ---------- resetMyOrgSetup ----------
// Escape hatch for org admins who got stuck mid-setup with no employees.
// Wipes their tenant link + tenant row + admin role so they can start over.
// Safety: only allowed when the tenant has 0 employees AND caller is org_admin or super_admin.
export const resetMyOrgSetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as any;
    const admin = await loadAdmin();

    const { data: profile } = await admin
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    const tenantId = profile?.tenant_id as string | null;
    if (!tenantId) return { ok: true, reset: false, reason: "no_tenant" };

    const { count: empCount } = await admin
      .from("employees").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId);
    if ((empCount ?? 0) > 0) {
      throw new Error("Cannot reset: this organization already has employees. Contact support.");
    }

    const { data: roleRows } = await admin
      .from("user_roles").select("role").eq("user_id", userId).eq("tenant_id", tenantId);
    const isAdmin = (roleRows ?? []).some((r: any) => r.role === "org_admin" || r.role === "super_admin");
    if (!isAdmin) throw new Error("Only the organization admin can reset setup");

    // Cleanup in dependency order
    await admin.from("organization_setup_progress").delete().eq("tenant_id", tenantId);
    await admin.from("departments").delete().eq("tenant_id", tenantId);
    await admin.from("leave_types").delete().eq("tenant_id", tenantId);
    await admin.from("user_roles").delete().eq("user_id", userId).eq("tenant_id", tenantId);
    await admin.from("profiles").update({ tenant_id: null }).eq("id", userId);
    const { error: delErr } = await admin.from("tenants").delete().eq("id", tenantId);
    if (delErr) throw new Error(delErr.message);
    return { ok: true, reset: true };
  });
