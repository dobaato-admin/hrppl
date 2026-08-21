#!/usr/bin/env bun
/**
 * Demo seed — two tenants, all eight roles.
 *
 *     bun run scripts/demo-seed.ts            # seed (wipes previous demo data first)
 *     bun run scripts/demo-seed.ts --wipe     # remove demo data and stop
 *
 * Why two tenants and not one: a single-tenant seed cannot demonstrate tenant
 * isolation. Almost every RLS policy in this schema funnels through
 * public.has_role() and a tenant match, and a cross-tenant leak is invisible
 * until there is a second tenant to leak into. Globex exists to be the thing
 * Acme must not see.
 *
 * Signup goes through the REAL gates, not around them
 * ---------------------------------------------------
 * public.handle_new_user() rejects any signup that is not one of:
 *   a pending staff_invitations row | signup_intent=create_organization |
 *   an existing super_admin | a non-email auth provider | a hardcoded allowlist
 *
 * It would be easy to disable the trigger, seed, and re-enable it. This script
 * deliberately does not: the org creators use signup_intent, and every other
 * member gets a genuine pending invitation first. So a successful run is also
 * evidence that the invitation path works, and a change that breaks invitations
 * breaks the seed rather than passing silently.
 *
 * Safety
 * ------
 * Every account lives at @demo.hrppl.test, a reserved TLD that can never be a
 * real mailbox, and both tenants use demo- slugs. The wipe is scoped to those
 * two markers and will not touch anything else. It refuses to run against the
 * production project ref outright.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EXPENSE_CATEGORY_PRESETS } from "../src/lib/expense-category-presets";
import { REVIEW_PRESETS } from "../src/lib/review-presets";
import {
  PAYROLL_COMPONENT_PRESETS,
  RECRUITMENT_STAGE_PRESETS,
  AWARD_TYPE_PRESETS,
  TRAINING_COURSE_PRESETS,
  FEEDBACK_TEMPLATE_PRESETS,
  TOIL_SETTINGS_PRESET,
} from "../src/lib/tenant-defaults-presets";

// --------------------------------------------------------------- guardrails

const PRODUCTION_REF = "astbnkrrgchezumcujgv";
const DEMO_DOMAIN = "demo.hrppl.test";
const DEMO_PASSWORD = "DemoPassw0rd!23";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with the dev project's .env loaded, e.g.  bun --env-file=.env run scripts/demo-seed.ts",
  );
  process.exit(1);
}

if (SUPABASE_URL.includes(PRODUCTION_REF)) {
  console.error(
    `Refusing to run: SUPABASE_URL points at the production project (${PRODUCTION_REF}).\n` +
      "This script creates and deletes users. Point .env at the dev project first.",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ------------------------------------------------------------------- shapes

type Role =
  | "super_admin"
  | "regional_admin"
  | "org_admin"
  | "branch_admin"
  | "hr"
  | "finance"
  | "manager"
  | "employee";

interface PersonSpec {
  handle: string;
  first: string;
  last: string;
  role: Role;
  title: string;
  /** Department name within the tenant. Platform admins have none. */
  dept?: string;
  /** Reports to this handle. Drives employees.manager_id. */
  reportsTo?: string;
}

interface TenantSpec {
  slug: string;
  name: string;
  legalName: string;
  country: string;
  currency: string;
  timezone: string;
  departments: string[];
  designations: string[];
  branches: { name: string; city: string; code: string }[];
  people: PersonSpec[];
}

const TENANTS: TenantSpec[] = [
  {
    slug: "demo-acme",
    name: "Acme Global",
    legalName: "Acme Global Pty Ltd",
    country: "AU",
    currency: "AUD",
    timezone: "Australia/Sydney",
    departments: ["Operations", "Engineering", "People", "Finance"],
    designations: ["Director", "Manager", "Senior Engineer", "Engineer", "Coordinator"],
    branches: [
      { name: "Sydney HQ", city: "Sydney", code: "SYD" },
      { name: "Melbourne", city: "Melbourne", code: "MEL" },
    ],
    people: [
      { handle: "alice", first: "Alice", last: "Nguyen", role: "org_admin", title: "Director", dept: "Operations" },
      { handle: "bruce", first: "Bruce", last: "Ellis", role: "branch_admin", title: "Manager", dept: "Operations", reportsTo: "alice" },
      { handle: "hana", first: "Hana", last: "Okafor", role: "hr", title: "Manager", dept: "People", reportsTo: "alice" },
      { handle: "fred", first: "Fred", last: "Marchetti", role: "finance", title: "Manager", dept: "Finance", reportsTo: "alice" },
      { handle: "mia", first: "Mia", last: "Alvarez", role: "manager", title: "Manager", dept: "Engineering", reportsTo: "alice" },
      { handle: "evan", first: "Evan", last: "Brooks", role: "employee", title: "Senior Engineer", dept: "Engineering", reportsTo: "mia" },
      { handle: "ella", first: "Ella", last: "Sorensen", role: "employee", title: "Engineer", dept: "Engineering", reportsTo: "mia" },
      { handle: "omar", first: "Omar", last: "Haddad", role: "employee", title: "Coordinator", dept: "Operations", reportsTo: "bruce" },
      { handle: "priya", first: "Priya", last: "Raman", role: "employee", title: "Coordinator", dept: "People", reportsTo: "hana" },
    ],
  },
  {
    slug: "demo-globex",
    name: "Globex Nepal",
    legalName: "Globex Nepal Pvt Ltd",
    country: "NP",
    currency: "NPR",
    timezone: "Asia/Kathmandu",
    departments: ["Delivery", "People"],
    designations: ["Manager", "Analyst", "Associate"],
    branches: [{ name: "Kathmandu", city: "Kathmandu", code: "KTM" }],
    people: [
      { handle: "gina", first: "Gina", last: "Shrestha", role: "org_admin", title: "Manager", dept: "Delivery" },
      { handle: "hugo", first: "Hugo", last: "Tamang", role: "hr", title: "Manager", dept: "People", reportsTo: "gina" },
      { handle: "maya", first: "Maya", last: "Gurung", role: "manager", title: "Manager", dept: "Delivery", reportsTo: "gina" },
      { handle: "nina", first: "Nina", last: "Bhandari", role: "employee", title: "Analyst", dept: "Delivery", reportsTo: "maya" },
      { handle: "raj", first: "Raj", last: "Karki", role: "employee", title: "Associate", dept: "Delivery", reportsTo: "maya" },
    ],
  },
];

/** Platform-level accounts. Deliberately tenantless — that is what they are. */
const PLATFORM: { handle: string; first: string; last: string; role: Role; scopeCountry?: string }[] = [
  { handle: "sam", first: "Sam", last: "Whitfield", role: "super_admin" },
  { handle: "rita", first: "Rita", last: "Delacroix", role: "regional_admin", scopeCountry: "AU" },
];

const LEAVE_TYPES = [
  { code: "ANNUAL", name: "Annual Leave", annual_quota_days: 21, accrual_per_month: 1.75, is_paid: true, color: "#3b82f6" },
  { code: "SICK", name: "Sick Leave", annual_quota_days: 10, accrual_per_month: 0.83, is_paid: true, color: "#ef4444" },
  { code: "UNPAID", name: "Unpaid Leave", annual_quota_days: 0, accrual_per_month: 0, is_paid: false, color: "#6b7280" },
];

const email = (handle: string, slug: string) => `${handle}.${slug.replace("demo-", "")}@${DEMO_DOMAIN}`;
const platformEmail = (handle: string) => `${handle}.platform@${DEMO_DOMAIN}`;

// ---------------------------------------------------------------- utilities

function ok<T>(label: string, res: { data: T; error: unknown }): T {
  if (res.error) {
    const e = res.error as { message?: string; code?: string };
    throw new Error(`${label}: ${e.code ? e.code + " " : ""}${e.message ?? JSON.stringify(res.error)}`);
  }
  return res.data;
}

async function listDemoUsers(): Promise<{ id: string; email: string }[]> {
  // listUsers is paginated; the demo set is small but the project may hold
  // other accounts, so page through rather than assuming one page covers it.
  const found: { id: string; email: string }[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      if (u.email?.endsWith(`@${DEMO_DOMAIN}`)) found.push({ id: u.id, email: u.email });
    }
    if (data.users.length < 200) break;
  }
  return found;
}

/**
 * Remove all demo data.
 *
 * Order matters and is not the obvious one. Deleting the auth users first
 * fails with a bare "Database error deleting user", because tenants.created_by
 * and employees.user_id both reference auth.users without a cascade — so the
 * founder cannot be removed while their tenant still exists. Tenants and their
 * children therefore go first, users last.
 */
async function wipe(): Promise<void> {
  const users = await listDemoUsers();
  const userIds = users.map((u) => u.id);

  // 1. Tenant children, then tenants — releases created_by and user_id.
  //
  // Selected by CREATOR, not by slug. Demo accounts create organizations through
  // the UI — walking the org-setup wizard is a normal thing to demo — and the
  // wizard names the tenant after whatever the user typed, so the slug is
  // arbitrary. A run as rita left a "Rita OG" tenant (slug `rita-og`) that no
  // slug pattern would catch.
  //
  // Two things went wrong because of that. tenants.created_by is ON DELETE
  // NO ACTION, so the stray tenant made its founder permanently undeletable and
  // wedged every later seed run. And rita's profile stayed pointed at that
  // tenant, which had none of the seeded lookup data — so every dropdown in the
  // app was empty for her, which looks exactly like a broken page.
  //
  // Keyed on demo user ids, so the safety guarantee is unchanged: this can only
  // reach tenants created by an @demo.hrppl.test account.
  // `in.()` with an empty list is malformed, so fall back to the slug match
  // alone on a first run when there are no demo users yet.
  const tenantFilter = userIds.length
    ? `slug.like.demo-%,created_by.in.(${userIds.join(",")})`
    : `slug.like.demo-%`;
  const { data: tenants } = await admin.from("tenants").select("id").or(tenantFilter);
  const tenantIds = (tenants ?? []).map((t: { id: string }) => t.id);
  if (tenantIds.length) {
    for (const table of [
      // Cases and their children first — they reference employees.
      "offboarding_cases",
      "staff_onboarding_profiles",
      "employees",
      "staff_invitations",
      "leave_types",
      "designations",
      "tenant_branches",
      "departments",
      // Keyed on tenant_id and NOT cascaded. Missing it left rows behind
      // pointing at tenants that no longer existed, and on the next seed the
      // org setup wizard resumed mid-way instead of starting clean.
      "organization_setup_progress",
      // Lookup tables seeded below. Every one of these is keyed on tenant_id
      // and none is cascaded, so leaving them out means a re-seed duplicates
      // every category, component and stage rather than replacing it.
      "expense_categories",
      "payroll_components",
      "recruitment_stages",
      "award_types",
      "training_courses",
      "feedback_question_templates",
      "review_templates",
      "toil_settings",
    ]) {
      const { error } = await admin.from(table).delete().in("tenant_id", tenantIds);
      if (error) console.warn(`  ! ${table}: ${error.message}`);
    }
    const { error } = await admin.from("tenants").delete().in("id", tenantIds);
    if (error) console.warn(`  ! tenants: ${error.message}`);
  }
  console.log(`  removed ${tenantIds.length} demo tenant(s)`);

  // 2. Rows that reference the users and do NOT cascade.
  //
  // Anything with ON DELETE NO ACTION on a user column pins that user forever.
  // The obvious one is audit_log.actor_id: the moment a demo account does
  // something audited — approve leave, initiate an offboarding case — it can no
  // longer be deleted, and the next seed run dies with the unhelpful
  // "Database error deleting user". Clearing these is what keeps the demo
  // re-seedable after it has actually been used.
  //
  // Keyed on user id, so nothing outside the @demo.hrppl.test set is touched.
  if (userIds.length) {
    for (const [table, column] of [
      ["role_scope", "user_id"],
      ["user_roles", "user_id"],
      ["audit_log", "actor_id"],
      ["event_access_log", "actor_id"],
      ["expense_approvals", "approver_id"],
      ["employee_award_assignments", "created_by"],
      ["np_payroll_wizard_runs", "run_by"],
      ["offboarding_comms_removal", "attested_by"],
      // These four are the nasty ones. Their actor_id FK is ON DELETE SET NULL,
      // so removing a user makes Postgres UPDATE the audit row — and each table
      // carries tg_block_modify_audit, which raises
      // "Audit log rows are immutable" on UPDATE. The referential action and
      // the immutability trigger deadlock, and GoTrue surfaces it only as
      // "Database error deleting user".
      //
      // Net effect: any demo account that so much as opens an offboarding case
      // becomes permanently undeletable and wedges every future seed run. The
      // trigger exempts service_role, which is the key this script holds, so
      // deleting the rows outright is the one path that works.
      ["offboarding_comms_removal_audit", "actor_id"],
      ["offboarding_comms_removal_audit_archive", "actor_id"],
      ["onboarding_control_room_audit", "actor_id"],
      ["onboarding_control_room_audit_archive", "actor_id"],
    ] as const) {
      const { error } = await admin.from(table).delete().in(column, userIds);
      // Warn rather than throw: a table may legitimately hold no rows, and the
      // hard failure comes later at deleteUser if something was genuinely
      // missed — with the user's email attached, which is more useful.
      if (error) console.warn(`  ! ${table}.${column}: ${error.message}`);
    }
  }

  // 3. The users themselves.
  let removed = 0;
  const stuck: string[] = [];
  for (const u of users) {
    const { error } = await admin.auth.admin.deleteUser(u.id);
    if (error) stuck.push(`${u.email} (${error.message})`);
    else removed++;
  }
  console.log(`  removed ${removed} demo user(s)`);
  if (stuck.length) {
    // Loud rather than warned-and-continued: a survivor makes the next
    // createUser fail with "already registered", which is a confusing way to
    // learn that the wipe was incomplete.
    throw new Error(
      `Could not delete ${stuck.length} demo user(s), so the seed cannot start clean:\n  ` +
        stuck.join("\n  ") +
        "\nSomething outside the tables this script knows about still references them.",
    );
  }
}

/**
 * Create an auth user through whichever gate handle_new_user will accept.
 *
 * `intent` mirrors what /signup sends when someone creates an organisation.
 * `invitationTenant` instead writes the pending staff_invitations row that an
 * org admin would have created, which is the path every non-founder takes.
 */
async function createUser(opts: {
  email: string;
  fullName: string;
  intent?: boolean;
  invitationTenant?: { id: string; role: Role };
}): Promise<string> {
  if (opts.invitationTenant) {
    ok(
      `invitation for ${opts.email}`,
      await admin.from("staff_invitations").insert({
        tenant_id: opts.invitationTenant.id,
        email: opts.email,
        role: opts.invitationTenant.role,
        token: crypto.randomUUID(),
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      }).select("id"),
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: opts.email,
    password: DEMO_PASSWORD,
    // Confirmed outright. config.toml disables confirmations on this project,
    // but setting it explicitly means the seed does not depend on that.
    email_confirm: true,
    user_metadata: {
      full_name: opts.fullName,
      ...(opts.intent ? { signup_intent: "create_organization" } : {}),
    },
  });
  if (error) throw new Error(`createUser ${opts.email}: ${error.message}`);
  return data.user!.id;
}

async function grantRole(userId: string, role: Role, tenantId: string | null): Promise<void> {
  ok(
    `grant ${role}`,
    await admin.from("user_roles").insert({ user_id: userId, role, tenant_id: tenantId }).select("id"),
  );
}

// --------------------------------------------------------------------- seed

interface SeededAccount {
  email: string;
  name: string;
  role: Role;
  tenant: string;
  title: string;
}

async function seed(): Promise<SeededAccount[]> {
  const accounts: SeededAccount[] = [];

  // ---- platform admins (no tenant) ----
  console.log("\nPlatform accounts");
  for (const p of PLATFORM) {
    const addr = platformEmail(p.handle);
    const uid = await createUser({ email: addr, fullName: `${p.first} ${p.last}`, intent: true });
    await grantRole(uid, p.role, null);
    if (p.scopeCountry) {
      // regional_admin is country-scoped and cross-tenant; without the scope
      // row it behaves like an unscoped platform admin.
      ok(
        "role_scope",
        await admin.from("role_scope").insert({
          user_id: uid,
          role: p.role,
          country_code: p.scopeCountry,
        }).select("id"),
      );
    }
    console.log(`  ${p.role.padEnd(15)} ${addr}`);
    accounts.push({ email: addr, name: `${p.first} ${p.last}`, role: p.role, tenant: "— platform —", title: p.scopeCountry ? `scoped to ${p.scopeCountry}` : "platform-wide" });
  }

  // ---- tenants ----
  for (const spec of TENANTS) {
    console.log(`\n${spec.name}  (${spec.slug})`);

    const founder = spec.people.find((p) => p.role === "org_admin")!;
    const founderEmail = email(founder.handle, spec.slug);

    // The founder must exist before the tenant: tenants.created_by references
    // them, and every later invitation needs an inviter.
    const founderId = await createUser({
      email: founderEmail,
      fullName: `${founder.first} ${founder.last}`,
      intent: true,
    });

    const tenant = ok(
      "tenant",
      await admin.from("tenants").insert({
        slug: spec.slug,
        name: spec.name,
        legal_name: spec.legalName,
        country_code: spec.country,
        currency_code: spec.currency,
        timezone: spec.timezone,
        status: "active",
        plan: "pro",
        contact_email: founderEmail,
        primary_contact_name: `${founder.first} ${founder.last}`,
        created_by: founderId,
        approved_at: new Date().toISOString(),
      }).select("id").single(),
    ) as { id: string };

    await admin.from("profiles").update({ tenant_id: tenant.id }).eq("id", founderId);
    await grantRole(founderId, "org_admin", tenant.id);
    console.log(`  org_admin       ${founderEmail}`);

    // ---- org structure ----
    const depts = ok(
      "departments",
      await admin.from("departments")
        .insert(spec.departments.map((name) => ({ tenant_id: tenant.id, name })))
        .select("id, name"),
    ) as { id: string; name: string }[];
    const deptId = (name?: string) => depts.find((d) => d.name === name)?.id ?? null;

    ok(
      "designations",
      await admin.from("designations")
        .insert(spec.designations.map((title) => ({ tenant_id: tenant.id, title, currency_code: spec.currency, is_active: true })))
        .select("id"),
    );

    ok(
      "branches",
      await admin.from("tenant_branches")
        .insert(
          spec.branches.map((b, i) => ({
            tenant_id: tenant.id,
            name: b.name,
            code: b.code,
            city: b.city,
            country_code: spec.country,
            currency_code: spec.currency,
            timezone: spec.timezone,
            // First branch is the HQ. branch_admin scoping and holiday
            // calendars both key off a branch, so one must be canonical.
            is_headquarters: i === 0,
            created_by: founderId,
          })),
        )
        .select("id"),
    );

    ok(
      "leave_types",
      await admin.from("leave_types")
        .insert(LEAVE_TYPES.map((lt) => ({ ...lt, tenant_id: tenant.id })))
        .select("id"),
    );

    // ---- tenant lookup tables ----
    //
    // Without these the app looks broken on first run rather than empty: the
    // expense-claim dialog cannot be submitted because its Category select has
    // no options, a payroll run has no components to attach, recruitment has no
    // pipeline, and the 360 feedback flow has no questions. Each dropdown reads
    // one of the tables below.
    //
    // Presets live in src/lib/*-presets.ts so the same lists can back an
    // "apply starter defaults" action in org setup, rather than existing only
    // inside this script.
    //
    // Onboarding and offboarding checklists are deliberately NOT seeded here:
    // the seed_country_onboarding_packs trigger (20260622131550) already
    // populates them per tenant on INSERT, and duplicating it would double them.
    ok(
      "expense_categories",
      await admin.from("expense_categories")
        .insert(EXPENSE_CATEGORY_PRESETS.map((p) => ({
          tenant_id: tenant.id,
          name: p.name,
          code: p.code,
          description: p.description,
          requires_receipt: p.requires_receipt,
          max_amount: p.max_amount,
          is_active: true,
        })))
        .select("id"),
    );

    ok(
      "payroll_components",
      await admin.from("payroll_components")
        .insert(PAYROLL_COMPONENT_PRESETS.map((p) => ({ ...p, tenant_id: tenant.id, is_active: true })))
        .select("id"),
    );

    ok(
      "recruitment_stages",
      await admin.from("recruitment_stages")
        .insert(RECRUITMENT_STAGE_PRESETS.map((p) => ({ ...p, tenant_id: tenant.id })))
        .select("id"),
    );

    ok(
      "award_types",
      await admin.from("award_types")
        .insert(AWARD_TYPE_PRESETS.map((p) => ({ ...p, tenant_id: tenant.id, is_active: true })))
        .select("id"),
    );

    ok(
      "training_courses",
      await admin.from("training_courses")
        .insert(TRAINING_COURSE_PRESETS.map((p) => ({ ...p, tenant_id: tenant.id, is_active: true, created_by: founderId })))
        .select("id"),
    );

    ok(
      "feedback_question_templates",
      await admin.from("feedback_question_templates")
        .insert(FEEDBACK_TEMPLATE_PRESETS.map((p) => ({
          tenant_id: tenant.id,
          name: p.name,
          description: p.description,
          is_default: p.is_default,
          questions: p.questions,
          is_current: true,
          version: 1,
          created_by: founderId,
        })))
        .select("id"),
    );

    ok(
      "toil_settings",
      await admin.from("toil_settings")
        .insert({ ...TOIL_SETTINGS_PRESET, tenant_id: tenant.id })
        .select("tenant_id"),
    );

    // Record the setup wizard as done. Everything the wizard collects —
    // organization details, branches, departments, leave and payroll defaults,
    // team invitations — has just been seeded above, so leaving the progress row
    // empty is simply wrong: AuthRouteGate funnels an org_admin with incomplete
    // setup to /org/setup and refuses every other page, so every demo admin
    // landed in a wizard asking for things that already existed.
    // Upsert, not insert: a row already exists by this point (created
    // alongside the tenant), so an insert hits the primary key.
    ok(
      "organization_setup_progress",
      await admin.from("organization_setup_progress")
        .upsert({
          tenant_id: tenant.id,
          details_done: true,
          branding_done: true,
          departments_done: true,
          defaults_done: true,
          invites_done: true,
          completed_at: new Date().toISOString(),
        })
        .select("tenant_id"),
    );

    // Review templates come from the shared KPI/KRA preset library — the same
    // rows /admin/kpi-kra applies one at a time. Seeding the cross-industry
    // ones means the performance module has something to distribute out of the
    // box; the industry-specific presets stay opt-in.
    const seedPresets = REVIEW_PRESETS.filter((p) =>
      ["generic_kpi", "generic_kra", "edu_360_manager"].includes(p.key),
    );
    ok(
      "review_templates",
      await admin.from("review_templates")
        .insert(seedPresets.map((p, i) => ({
          tenant_id: tenant.id,
          name: p.name,
          industry: p.industry,
          kind: p.kind,
          competencies: p.competencies,
          scale_min: p.scaleMin,
          scale_max: p.scaleMax,
          scale_labels: p.scaleLabels,
          is_default: i === 0,
          is_current: true,
          version: 1,
        })))
        .select("id"),
    );

    // ---- remaining members, each via a real invitation ----
    const userIds = new Map<string, string>([[founder.handle, founderId]]);
    for (const p of spec.people) {
      if (p.handle === founder.handle) continue;
      const addr = email(p.handle, spec.slug);
      const uid = await createUser({
        email: addr,
        fullName: `${p.first} ${p.last}`,
        invitationTenant: { id: tenant.id, role: p.role },
      });
      await admin.from("profiles").update({ tenant_id: tenant.id }).eq("id", uid);
      await grantRole(uid, p.role, tenant.id);
      // Everyone in an org is also an employee of it; the /me/* surfaces gate
      // on the employee row, not on the role.
      if (p.role !== "employee") await grantRole(uid, "employee", tenant.id);
      userIds.set(p.handle, uid);
      console.log(`  ${p.role.padEnd(15)} ${addr}`);
    }

    // ---- employee records (second pass so manager_id can resolve) ----
    const empIds = new Map<string, string>();
    let n = 1;
    for (const p of spec.people) {
      const row = ok(
        `employee ${p.handle}`,
        await admin.from("employees").insert({
          tenant_id: tenant.id,
          user_id: userIds.get(p.handle),
          employee_number: `${spec.slug.replace("demo-", "").toUpperCase()}-${String(n++).padStart(4, "0")}`,
          first_name: p.first,
          last_name: p.last,
          email: email(p.handle, spec.slug),
          hire_date: new Date(Date.now() - (200 + n * 37) * 24 * 3600_000).toISOString().slice(0, 10),
          department_id: deptId(p.dept),
          job_title: p.title,
          employment_type: "full_time",
          status: "active",
        }).select("id").single(),
      ) as { id: string };
      empIds.set(p.handle, row.id);
    }
    for (const p of spec.people) {
      if (!p.reportsTo) continue;
      await admin.from("employees")
        .update({ manager_id: empIds.get(p.reportsTo) })
        .eq("id", empIds.get(p.handle)!);
    }

    // Submitted onboarding profiles.
    //
    // dashboard.tsx redirects any user who has an employee record and no
    // submitted profile straight to /onboarding/profile. Every seeded account
    // has an employee record, so without this NOBODY could reach the dashboard
    // — every sign-in bounced into the onboarding form, including the org
    // admins, which made most of the app unreachable in a demo.
    //
    // Seeded as already submitted: these are established staff with hire dates
    // months in the past, so "still onboarding" is the wrong state for them.
    ok(
      "staff_onboarding_profiles",
      await admin.from("staff_onboarding_profiles")
        .insert(spec.people.map((p) => ({
          employee_id: empIds.get(p.handle)!,
          tenant_id: tenant.id,
          country_code: spec.country,
          submitted_at: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
        })))
        .select("employee_id"),
    );

    for (const p of spec.people) {
      accounts.push({
        email: email(p.handle, spec.slug),
        name: `${p.first} ${p.last}`,
        role: p.role,
        tenant: spec.name,
        title: p.title,
      });
    }
  }

  return accounts;
}

// ---------------------------------------------------------------- manifest

function writeManifest(accounts: SeededAccount[]): string {
  const path = join(process.cwd(), "docs", "demo-accounts.md");
  const rows = accounts
    .map((a) => `| ${a.tenant} | \`${a.role}\` | ${a.name} | ${a.title} | \`${a.email}\` |`)
    .join("\n");

  writeFileSync(
    path,
    `# Demo accounts

Generated by \`scripts/demo-seed.ts\`. Re-running the seed wipes and recreates
every account below, so treat this file as output, not as something to edit.

**Password for every account:** \`${DEMO_PASSWORD}\`

Sign in at \`/auth\` with email and password. Confirmation is disabled on the
dev project, so these work immediately with no inbox round-trip.

> Every address is at \`${DEMO_DOMAIN}\` — a reserved TLD that can never receive
> real mail. That is deliberate: it makes the wipe unambiguous and guarantees no
> demo account can ever collide with a real person's address.

| Tenant | Role | Name | Title | Email |
| --- | --- | --- | --- | --- |
${rows}

## What this exercises

- **Two tenants.** Acme Global (AU/AUD) and Globex Nepal (NP/NPR). A single
  tenant cannot demonstrate isolation — sign in as an Acme user and confirm
  Globex data is invisible, and vice versa.
- **All eight roles**, including the two platform roles that deliberately have
  no tenant: \`super_admin\` (platform-wide) and \`regional_admin\` (scoped to AU
  via \`role_scope\`, so it sees Acme but not Globex).
- **A reporting line.** \`employees.manager_id\` is populated, so manager-scoped
  views have something to scope to.
- **The real signup gates.** Founders were created with
  \`signup_intent=create_organization\`; everyone else went through a genuine
  pending \`staff_invitations\` row, because \`handle_new_user\` rejects anything
  else. A successful seed is therefore also proof the invitation path works.

## Not seeded

Leave requests, timesheets, payroll runs and review cycles. The org structure,
leave types and employee records they depend on are all in place, so these can
be layered on without changing anything above.
`,
    "utf8",
  );
  return path;
}

// -------------------------------------------------------------------- main

const wipeOnly = process.argv.includes("--wipe");

console.log(`Target: ${SUPABASE_URL}`);
console.log("Wiping previous demo data...");
await wipe();

if (wipeOnly) {
  console.log("\nDone (--wipe).");
  process.exit(0);
}

const accounts = await seed();
const manifest = writeManifest(accounts);

console.log(`\n${accounts.length} accounts seeded across ${TENANTS.length} tenants + platform.`);
console.log(`Credentials written to ${manifest}`);
console.log(`Password for all: ${DEMO_PASSWORD}`);
