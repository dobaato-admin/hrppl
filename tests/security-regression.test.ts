import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

/**
 * Static regression checks for portal-wide hardening fixes shipped after the
 * 2026-06 security re-scan. Every guard added in this pass MUST keep its
 * server-side authorization wiring. If anyone removes one, CI fails here.
 */

describe("expense receipt signed-url IDOR fix", () => {
  it("getReceiptSignedUrl verifies caller tenant + ownership before signing", () => {
    const src = read("src/lib/expenses.functions.ts");
    const idx = src.indexOf("export const getReceiptSignedUrl");
    expect(idx, "getReceiptSignedUrl missing").toBeGreaterThan(-1);
    const end = src.indexOf("export const ", idx + 1);
    const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
    // Caller-scoped lookup BEFORE the admin client signs.
    expect(block).toMatch(/getEmployee\(supabase,\s*userId\)/);
    expect(block).toMatch(/pathTenant\s*!==\s*emp\.tenant_id/);
    expect(block).toMatch(/Forbidden/);
    // admin client must come AFTER the ownership check.
    const empIdx = block.indexOf("getEmployee");
    const adminIdx = block.indexOf("loadAdmin");
    expect(adminIdx).toBeGreaterThan(empIdx);
  });

  it("deleteExpenseClaim enforces owner-of-draft or admin", () => {
    const src = read("src/lib/expenses.functions.ts");
    const idx = src.indexOf("export const deleteExpenseClaim");
    const end = src.indexOf("export const ", idx + 1);
    const block = src.slice(idx, end);
    expect(block).toMatch(/isOrgAdmin\(supabase,\s*userId\)/);
    expect(block).toMatch(/Forbidden/);
  });
});

describe("biometric device admin guards", () => {
  it("rotateDeviceSecret asserts org_admin and tenant scope before admin write", () => {
    const src = read("src/lib/biometric.functions.ts");
    const idx = src.indexOf("export const rotateDeviceSecret");
    const end = src.indexOf("export const ", idx + 1);
    const block = src.slice(idx, end);
    expect(block).toMatch(/assertOrgAdmin\(supabase,\s*userId\)/);
    expect(block).toMatch(/existing\.tenant_id\s*!==\s*tenantId/);
    expect(block).toMatch(/Forbidden/);
  });
  it("upsertBiometricDevice + upsertMapping run through assertOrgAdmin", () => {
    const src = read("src/lib/biometric.functions.ts");
    for (const name of ["upsertBiometricDevice", "upsertMapping"]) {
      const idx = src.indexOf(`export const ${name}`);
      const end = src.indexOf("export const ", idx + 1);
      const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
      expect(block, `${name} missing assertOrgAdmin`).toMatch(/assertOrgAdmin\(/);
    }
  });
});

describe("timeline server fns hide PII from non-HR users", () => {
  it("listEmployeesForAdmin / recordCustomEvent / linkEvents all assertHrOrAdmin", () => {
    const src = read("src/lib/timeline.functions.ts");
    for (const name of ["listEmployeesForAdmin", "recordCustomEvent", "linkEvents"]) {
      const idx = src.indexOf(`export const ${name}`);
      const end = src.indexOf("export const ", idx + 1);
      const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
      expect(block, `${name} missing assertHrOrAdmin`).toMatch(/assertHrOrAdmin\(/);
    }
  });
});

describe("legacy returnAsset ownership guard", () => {
  it("returnAsset checks assignee or org_admin/super_admin", () => {
    const src = read("src/lib/assets.functions.ts");
    const idx = src.indexOf("export const returnAsset");
    const end = src.indexOf("export const ", idx + 1);
    const block = src.slice(idx, end);
    expect(block).toMatch(/from\("employees"\)[\s\S]{0,200}\.eq\("user_id",\s*context\.userId\)/);
    expect(block).toMatch(/from\("user_roles"\)/);
    expect(block).toMatch(/Forbidden/);
  });
});

describe("training quiz answer-key protection (tenant-scoped view)", () => {
  it("learners cannot read correct_index via training_quiz_questions table", () => {
    // The base table policy must NOT grant SELECT to enrolled employees; only
    // managers/admins keep direct access. Learners go through the
    // training_quiz_questions_public view which omits correct_index/explanation.
    // We assert by checking the migration history doesn't reintroduce the old policy.
    const migrationDir = "supabase/migrations";
    const fs = require("fs") as typeof import("fs");
    const files = fs.readdirSync(join(root, migrationDir));
    // Most recent quiz-related migration should drop the learner SELECT policy.
    const dropMigration = files.map((f) => readFileSync(join(root, migrationDir, f), "utf8"))
      .find((sql) => /DROP POLICY[\s\S]*enrolled employees read quiz questions/i.test(sql));
    expect(dropMigration, "Expected migration that drops learner SELECT policy on training_quiz_questions").toBeTruthy();
  });
});

describe("anonymous candidate resume bucket hardening", () => {
  it("RESTRICTIVE policies block anon SELECT/UPDATE/DELETE on candidate-resumes", () => {
    const fs = require("fs") as typeof import("fs");
    const files = fs.readdirSync(join(root, "supabase/migrations"));
    const sqls = files.map((f) => readFileSync(join(root, "supabase/migrations", f), "utf8")).join("\n");
    expect(sqls).toMatch(/candidate_resumes anon no read[\s\S]{0,400}AS RESTRICTIVE FOR SELECT TO anon/);
    expect(sqls).toMatch(/candidate_resumes anon no update[\s\S]{0,400}AS RESTRICTIVE FOR UPDATE TO anon/);
    expect(sqls).toMatch(/candidate_resumes anon no delete[\s\S]{0,400}AS RESTRICTIVE FOR DELETE TO anon/);
  });
});

describe("sensitive secret columns hidden from Data API", () => {
  it("blog_webhooks.secret + biometric_devices.shared_secret/webhook_token revoked from authenticated", () => {
    const fs = require("fs") as typeof import("fs");
    const files = fs.readdirSync(join(root, "supabase/migrations"));
    const sqls = files.map((f) => readFileSync(join(root, "supabase/migrations", f), "utf8")).join("\n");
    expect(sqls).toMatch(/REVOKE SELECT \(secret\) ON public\.blog_webhooks FROM authenticated/);
    expect(sqls).toMatch(/REVOKE SELECT \(shared_secret, webhook_token\) ON public\.biometric_devices FROM authenticated/);
  });
});

describe("security findings log is super-admin only", () => {
  it("server fns assert super_admin before reading/writing the log", () => {
    const src = read("src/lib/security-findings.functions.ts");
    expect(src).toMatch(/async function assertSuperAdmin/);
    for (const name of ["listSecurityFindings", "recordSecurityFinding", "updateSecurityFindingStatus"]) {
      const idx = src.indexOf(`export const ${name}`);
      expect(idx, `${name} missing`).toBeGreaterThan(-1);
      const end = src.indexOf("export const ", idx + 1);
      const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
      expect(block, `${name} missing assertSuperAdmin`).toMatch(/assertSuperAdmin\(/);
    }
  });
});
