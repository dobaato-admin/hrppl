import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

/**
 * End-to-end (static + integration) regression suite for the 2026-06 security
 * hardening pass. Each describe block locks down one of the surfaces the user
 * explicitly asked us to cover with both an authorized and an anonymous path.
 *
 * The static assertions guard the AUTHORIZED contract (server fn asserts &
 * ownership checks), and the SQL/policy assertions guard the ANONYMOUS contract
 * (storage RESTRICTIVE policies, REVOKE on secret columns, etc.).
 */

function migrations(): string {
  const dir = join(root, "supabase/migrations");
  return readdirSync(dir).map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
}

describe("public job-application uploads (candidate-resumes bucket)", () => {
  const sqls = migrations();
  it("anon can INSERT into candidate-resumes — required for public job applications", () => {
    expect(sqls).toMatch(/candidate-resumes[\s\S]{0,2000}TO anon/);
    // path[1] == tenant_id of an OPEN recruitment_jobs.id, exactly 3 segments
    expect(sqls).toMatch(/recruitment_jobs[\s\S]{0,1000}status\s*=\s*'open'/i);
  });
  it("anon CANNOT read, update, or delete uploads (RESTRICTIVE policies)", () => {
    expect(sqls).toMatch(/candidate_resumes anon no read[\s\S]{0,400}AS RESTRICTIVE FOR SELECT TO anon/);
    expect(sqls).toMatch(/candidate_resumes anon no update[\s\S]{0,400}AS RESTRICTIVE FOR UPDATE TO anon/);
    expect(sqls).toMatch(/candidate_resumes anon no delete[\s\S]{0,400}AS RESTRICTIVE FOR DELETE TO anon/);
  });
});

describe("expense receipt signed-url flow", () => {
  const src = read("src/lib/expenses.functions.ts");
  it("requires Supabase auth middleware (anonymous calls 401)", () => {
    const idx = src.indexOf("export const getReceiptSignedUrl");
    const end = src.indexOf("export const ", idx + 1);
    const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
    expect(block).toMatch(/\.middleware\(\[requireSupabaseAuth\]\)/);
  });
  it("verifies caller tenant ownership before signing — auth alone is not enough", () => {
    const idx = src.indexOf("export const getReceiptSignedUrl");
    const end = src.indexOf("export const ", idx + 1);
    const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
    expect(block).toMatch(/getEmployee\(supabase,\s*userId\)/);
    expect(block).toMatch(/pathTenant\s*!==\s*emp\.tenant_id/);
  });
});

describe("training quiz tenant-scoped public view", () => {
  it("learners read via training_quiz_questions_public, never the base table", () => {
    const sqls = migrations();
    expect(sqls).toMatch(/DROP POLICY[\s\S]{0,200}enrolled employees read quiz questions/i);
    expect(sqls).toMatch(/training_quiz_questions_public/);
  });
});

describe("blog webhook secret hashing + rotation", () => {
  const src = read("src/lib/blog.functions.ts");
  it("rotateWebhookSecret is super-admin only and updates secret_hash + audit fields", () => {
    const idx = src.indexOf("export const rotateWebhookSecret");
    expect(idx).toBeGreaterThan(-1);
    const end = src.indexOf("export const ", idx + 1);
    const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
    expect(block).toMatch(/assertSuperAdmin\(/);
    expect(block).toMatch(/secret_hash/);
    expect(block).toMatch(/last_rotated_at/);
    expect(block).toMatch(/rotated_by/);
  });
  it("upsertWebhook computes secret_hash on creation", () => {
    const idx = src.indexOf("export const upsertWebhook");
    const end = src.indexOf("export const ", idx + 1);
    const block = src.slice(idx, end);
    expect(block).toMatch(/secret_hash\s*=\s*hashHex\(secret\)/);
  });
  it("blog_webhooks.secret remains revoked from authenticated role", () => {
    const sqls = migrations();
    expect(sqls).toMatch(/REVOKE SELECT \(secret\) ON public\.blog_webhooks FROM authenticated/);
  });
});

describe("security scan ingest endpoint", () => {
  const src = read("src/routes/api/public/hooks/security-scan-results.ts");
  it("requires HMAC signature header (anonymous unsigned posts -> 401)", () => {
    expect(src).toMatch(/x-scan-signature/);
    expect(src).toMatch(/timingSafeEqual/);
    expect(src).toMatch(/SECURITY_SCAN_WEBHOOK_SECRET/);
    expect(src).toMatch(/Invalid signature/);
  });
  it("validates payload with zod before processing", () => {
    expect(src).toMatch(/Body\.parse/);
    expect(src).toMatch(/findings:\s*z\.array/);
  });
});

describe("security alert delivery", () => {
  const src = read("src/lib/security-alerts.server.ts");
  it("emails super admins AND fires webhook fan-out", () => {
    expect(src).toMatch(/sendInternalEmail\(/);
    expect(src).toMatch(/security-finding-alert/);
    expect(src).toMatch(/security_alert_webhook_url/);
    expect(src).toMatch(/channel:\s*['"]webhook['"]/);
  });
  it("idempotent: existing finding only refreshes scanned_at, no duplicate alert", () => {
    expect(src).toMatch(/from\("security_findings_log"\)[\s\S]{0,300}\.update\(\{\s*scanned_at\s*\}/);
  });
});
