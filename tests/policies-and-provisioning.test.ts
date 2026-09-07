import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The policy library (Wave 7, Segment 7) and Phase 3 provisioning.
 *
 * ---------------------------------------------------------------------------
 * What makes an acknowledgement worth anything
 * ---------------------------------------------------------------------------
 *
 * This table exists to answer, possibly years later and possibly to a tribunal,
 * "did this person accept this policy, and which words did they accept?"
 * Three properties carry that weight, and each is asserted below **and**
 * enforced independently by RLS — which is the point, because a server fn is a
 * public HTTP endpoint and cannot be the only thing standing there:
 *
 * 1. Only the person may sign. Nobody records it on your behalf.
 * 2. An acknowledgement is of a *version*. Revising the wording asks again
 *    rather than inheriting consent given to different text.
 * 3. Signing twice does not move the timestamp — the date is the fact.
 *
 * ---------------------------------------------------------------------------
 * And what Phase 3 refuses to pretend
 * ---------------------------------------------------------------------------
 *
 * The spec lists four provisioning steps. Two are built; one is left to a
 * person on purpose (issuing a laptop is a physical act, and inventing an
 * assignment would put a false row in a register that exists to be
 * authoritative); and one is **blocked** on the three unreconciled review
 * systems. A blocked step that silently no-ops is the worst of the three
 * outcomes, so it reports itself.
 */

const ROOT = process.cwd();
const LIB = join(ROOT, "src/lib");
const MIGRATION = join(ROOT, "supabase/migrations/20260907090000_guided_setup_and_policies.sql");

const policiesSrc = readFileSync(join(LIB, "policies.functions.ts"), "utf8");
const provisionSrc = readFileSync(join(LIB, "provisioning.functions.ts"), "utf8");
const sql = readFileSync(MIGRATION, "utf8");

describe("only the person signs, and only for the version they read", () => {
  it("RLS restricts the signing UPDATE to the employee themselves", () => {
    const policy = sql.slice(sql.indexOf('"employee signs own acknowledgement"'));
    expect(policy).toContain("FOR UPDATE");
    expect(policy).toMatch(/e\.user_id = auth\.uid\(\)/);
  });

  it("acknowledgePolicy refuses to sign somebody else's row", () => {
    const fn = policiesSrc.slice(policiesSrc.indexOf("export const acknowledgePolicy"));
    expect(fn).toMatch(/employee_id\s*!==\s*employeeId/);
    expect(fn).toContain("You can only sign your own acknowledgement");
  });

  it("re-reads the version server-side rather than trusting the client", () => {
    // A stale tab must not be able to record consent to a version its reader
    // never saw.
    const fn = policiesSrc.slice(policiesSrc.indexOf("export const acknowledgePolicy"));
    expect(fn).toMatch(/from\("policy_documents"\)[\s\S]{0,120}select\("version"\)/);
    expect(fn).toContain("has been revised");
  });

  it("signing twice does not move the timestamp", () => {
    const fn = policiesSrc.slice(policiesSrc.indexOf("export const acknowledgePolicy"));
    expect(fn).toMatch(
      /if \(\(row as any\)\.acknowledged_at\) return \{ ok: true, alreadySigned: true \}/,
    );
  });

  it("the unique key is (policy, employee, version), so a revision reopens it", () => {
    expect(sql).toMatch(/UNIQUE \(policy_id, employee_id, policy_version\)/);
  });
});

describe("a signed policy is retired, never deleted", () => {
  it("deletePolicyDocument deactivates when acknowledgements exist", () => {
    // The acknowledgements cascade from the document, so a hard delete would
    // destroy the evidence that people accepted the code of conduct — and it
    // would do it from behind a Delete button.
    const fn = policiesSrc.slice(policiesSrc.indexOf("export const deletePolicyDocument"));
    expect(fn).toMatch(/from\("policy_acknowledgements"\)/);
    expect(fn).toMatch(/not\("acknowledged_at", "is", null\)/);
    expect(fn).toMatch(/update\(\{ is_active: false \}\)/);
    expect(fn).toContain("retired: true");
  });
});

describe("policy authoring matches the RLS write policy", () => {
  it("assertPolicyAuthor admits org_admin and hr, and nothing else", () => {
    const guard = policiesSrc.slice(
      policiesSrc.indexOf("async function assertPolicyAuthor"),
      policiesSrc.indexOf("// ============================== LIBRARY"),
    );
    expect(guard).toContain("is_org_admin");
    expect(guard).toContain("is_hr");
    expect(guard).not.toContain("manager");
  });

  it("the RLS policy names the same two", () => {
    const policy = sql.slice(
      sql.indexOf('"hr and org admin manage policies"'),
      sql.indexOf("CREATE TABLE IF NOT EXISTS public.policy_acknowledgements"),
    );
    expect(policy).toContain("is_org_admin");
    expect(policy).toContain("is_hr");
    expect(policy).not.toMatch(/'manager'/);
  });

  it("every write in the module asserts it", () => {
    const writes = ["upsertPolicyDocument", "deletePolicyDocument", "assignPolicyAcknowledgements"];
    for (const name of writes) {
      const fn = policiesSrc.slice(policiesSrc.indexOf(`export const ${name}`));
      expect(fn.slice(0, 1500), `${name} must call assertPolicyAuthor`).toContain(
        "assertPolicyAuthor(",
      );
    }
  });
});

describe("Phase 3 provisioning is honest about what it does not do", () => {
  it("reports the KPI step as blocked instead of skipping it silently", () => {
    expect(provisionSrc).toContain("KRA & KPI assignment");
    expect(provisionSrc).toMatch(/no KPI assignment table/);
    // Names the actual obstacle, so the next person does not have to rediscover it.
    expect(provisionSrc).toContain("review_instances");
    expect(provisionSrc).toContain("duty_review_scores");
  });

  it("does not fabricate an asset assignment", () => {
    // Handing someone a laptop is a physical act; the register cannot know it
    // happened, and a false row in an authoritative register is worse than a
    // gap. Candidates are offered; the choice stays with a person.
    expect(provisionSrc).toMatch(/assetCandidates/);
    expect(provisionSrc).not.toMatch(/from\("asset_assignments"\)[\s\S]{0,200}insert\(/);
  });

  it("is idempotent — re-running adds nothing and resets nothing", () => {
    expect(provisionSrc).toMatch(/onConflict: "course_id,employee_id", ignoreDuplicates: true/);
    expect(provisionSrc).toMatch(/onConflict: "policy_id,employee_id,policy_version"/);
    expect(provisionSrc).toMatch(/ignoreDuplicates: true/);
  });

  it("checks the employee is in the caller's tenant before writing", () => {
    const fn = provisionSrc.slice(provisionSrc.indexOf("export const provisionEmployee"));
    expect(fn).toMatch(/tenant_id !== tenantId/);
    expect(fn).toContain("Employee not found in this organisation");
  });

  it("derives due dates in the tenant's zone, not UTC", () => {
    // A 7-day deadline that lands a day early for half the world is a support
    // ticket. src/lib/work-date.ts exists for exactly this.
    expect(provisionSrc).toContain("workDateInZone");
    expect(provisionSrc).toContain("resolveTimeZone");
    expect(provisionSrc).not.toMatch(/toISOString\(\)\.slice\(0, 10\)/);
  });

  it("guards the write with the training author check", () => {
    const fn = provisionSrc.slice(provisionSrc.indexOf("export const provisionEmployee"));
    expect(fn).toContain("assertTrainingAuthor(");
  });
});

describe("the tenant setup state cannot be used as a back door", () => {
  it("skipped_segments defaults to empty and is not nullable", () => {
    expect(sql).toMatch(/skipped_segments text\[\] NOT NULL DEFAULT '\{\}'/);
  });

  it("only an org admin may write it", () => {
    const policy = sql.slice(sql.indexOf('"org admin writes setup state"'));
    expect(policy.slice(0, 400)).toContain("is_org_admin");
  });

  it("everyone in the tenant may read it", () => {
    // The dashboard tells people setup is incomplete; hiding the reason from
    // the people who can see the symptom helps nobody.
    const policy = sql.slice(sql.indexOf('"tenant reads own setup state"'));
    expect(policy.slice(0, 300)).toContain("user_tenant_id(auth.uid())");
  });
});
