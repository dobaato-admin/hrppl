import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

/**
 * Static regression checks that run on every build via CI.
 *
 * These are intentionally source-grep based: they fail fast if anyone removes
 * a super-admin guard, the API-key auth helper, or the HMAC signature step
 * from the blog CMS surface.
 */
describe("blog super-admin guard regression", () => {
  it("admin.blog route is wrapped in SuperAdminGuard and checks super_admin role", () => {
    const src = read("src/routes/admin.blog.tsx");
    expect(src).toMatch(/SuperAdminGuard/);
    expect(src).toMatch(/roles\.includes\(["']super_admin["']\)/);
  });

  it("admin.blog-integrations route is wrapped in SuperAdminGuard and checks super_admin role", () => {
    const src = read("src/routes/admin.blog-integrations.tsx");
    expect(src).toMatch(/SuperAdminGuard/);
    expect(src).toMatch(/super_admin/);
  });

  it("SuperAdminGuard logs unauthorized attempts to the audit log", () => {
    const src = read("src/components/SuperAdminGuard.tsx");
    expect(src).toMatch(/logBlogAccessAttempt/);
    // Renders the access-denied screen for non super admins.
    expect(src).toMatch(/Super admin only/);
  });

  it("blog server functions enforce super_admin via assertSuperAdmin", () => {
    const src = read("src/lib/blog.functions.ts");
    expect(src).toMatch(/assertSuperAdmin/);
    // Must be invoked, not only declared.
    const calls = src.match(/assertSuperAdmin\s*\(/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });
});

describe("blog API-key authorization regression", () => {
  it("public posts endpoint authenticates via authenticateBlogApi for every handler", () => {
    const src = read("src/routes/api/public/blog/posts.ts");
    expect(src).toMatch(/authenticateBlogApi/);
    // Both GET and POST gated.
    expect(src).toMatch(/authenticate\(request,\s*"GET",\s*"posts:read"\)/);
    expect(src).toMatch(/authenticate\(request,\s*"POST",\s*"posts:write"\)/);
  });

  it("public posts slug endpoint authenticates GET/PATCH/DELETE", () => {
    const src = read("src/routes/api/public/blog/posts.$slug.ts");
    expect(src).toMatch(/authenticateBlogApi/);
    expect(src).toMatch(/"posts:read"/);
    expect(src).toMatch(/"posts:write"/);
  });

  it("authenticateBlogApi verifies the key owner still holds super_admin", () => {
    const src = read("src/lib/blog-api-auth.server.ts");
    expect(src).toMatch(/\.eq\(\s*["']role["'],\s*["']super_admin["']\s*\)/);
    // Returns 403 when owner is no longer super admin.
    expect(src).toMatch(/api_key_owner_not_super_admin/);
    // Audit on every denial.
    expect(src).toMatch(/blog_access_audit/);
  });
});

describe("blog webhook signature regression", () => {
  it("webhook dispatcher signs payloads with HMAC-SHA256 using the per-hook secret", () => {
    const src = read("src/routes/api/public/hooks/blog-webhook-deliveries.ts");
    expect(src).toMatch(/createHmac\(\s*["']sha256["']\s*,\s*hook\.secret\s*\)/);
    expect(src).toMatch(/X-HRPPL-Signature/);
    // Signature header carries the sha256= prefix subscribers verify against.
    expect(src).toMatch(/sha256=\$\{signature\}/);
  });

  it("webhook dispatcher caps attempts and backs off on failure", () => {
    const src = read("src/routes/api/public/hooks/blog-webhook-deliveries.ts");
    expect(src).toMatch(/attempts\s*>=\s*6/);
    expect(src).toMatch(/next_retry_at/);
  });
});

describe("blog API rate limiting regression", () => {
  it("public blog API enforces a per-IP rate limit and blocks obvious bots", () => {
    const src = read("src/lib/blog-api-auth.server.ts");
    expect(src).toMatch(/rate_limited|rateLimited|too_many_requests/i);
    expect(src).toMatch(/bot_blocked|user_agent_blocked|botBlocked/);
  });
});

describe("server-fn role/ownership regression (SERVER_FN_MISSING_AUTH / IDOR)", () => {
  it("markInvoicePaid enforces org_admin/super_admin and tenant scope", () => {
    const src = read("src/lib/practice.functions.ts");
    const mark = src.slice(src.indexOf("export const markInvoicePaid"));
    expect(mark).toMatch(/user_roles/);
    expect(mark).toMatch(/org_admin/);
    expect(mark).toMatch(/super_admin/);
    expect(mark).toMatch(/tenant_id/);
    expect(mark).toMatch(/Forbidden/);
  });

  it("teams.functions.ts defines assertHrOrAdmin and applies it to every flagged handler", () => {
    const src = read("src/lib/teams.functions.ts");
    expect(src).toMatch(/async function assertHrOrAdmin/);
    // Every flagged handler must call the guard.
    const required = [
      "listTeamMembers",
      "listEmployeeRecord",
      "requestMissingDocument",
      "approveDocumentRequest",
      "cancelDocumentRequest",
      "resendDocumentRequest",
      "bulkApproveDocumentRequests",
      "bulkCancelDocumentRequests",
      "bulkResendDocumentRequests",
      "listAllDocumentRequests",
      "exportEmployeeHistoryCsv",
    ];
    for (const name of required) {
      const idx = src.indexOf(`export const ${name}`);
      expect(idx, `${name} export missing`).toBeGreaterThan(-1);
      const end = src.indexOf("export const ", idx + 1);
      const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
      expect(block, `${name} missing assertHrOrAdmin`).toMatch(/assertHrOrAdmin\(/);
    }
  });

  it("reportReturn and acknowledgeAsset enforce assignee ownership (no IDOR)", () => {
    const src = read("src/lib/assets.functions.ts");
    for (const name of ["reportReturn", "acknowledgeAsset"]) {
      const idx = src.indexOf(`export const ${name}`);
      expect(idx, `${name} export missing`).toBeGreaterThan(-1);
      const end = src.indexOf("export const ", idx + 1);
      const block = end === -1 ? src.slice(idx) : src.slice(idx, end);
      // Must resolve the caller's employee record AND scope the update by employee_id.
      expect(block).toMatch(/from\("employees"\)[\s\S]{0,200}\.eq\("user_id",\s*context\.userId\)/);
      expect(block).toMatch(/\.eq\("employee_id",/);
    }
  });
});

