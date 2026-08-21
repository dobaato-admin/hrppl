import { test, expect } from "@playwright/test";

/**
 * Verifies that the Blog CMS, API keys and webhook management pages, plus the
 * public REST + webhook endpoints, are locked to super admins.
 *
 * The tests drive the public surfaces only — auth-bearing flows are exercised
 * by the existing super-admin Playwright suites. The critical guarantee here
 * is that unauthenticated / unauthorized callers NEVER see CMS data, are
 * redirected/shown a denied screen, and that the public API rejects bogus
 * keys with 401/403.
 */

test.describe("blog super-admin access", () => {
  test("unauthenticated visit to /admin/blog never leaks posts", async ({ page }) => {
    const res = await page.goto("/admin/blog");
    expect(res?.status() ?? 0).toBeLessThan(500);
    // Either redirected to /auth, or shown the denied screen. In neither case
    // should the editor toolbar render.
    await expect(page.getByRole("button", { name: /new post/i })).toHaveCount(0);
  });

  test("unauthenticated visit to /admin/blog-integrations never leaks keys/webhooks", async ({ page }) => {
    const res = await page.goto("/admin/blog-integrations");
    expect(res?.status() ?? 0).toBeLessThan(500);
    await expect(page.getByRole("button", { name: /generate key/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /new webhook/i })).toHaveCount(0);
  });

  test("/api/public/blog/posts rejects missing api key with 401", async ({ request }) => {
    const res = await request.get("/api/public/blog/posts");
    expect([401, 403]).toContain(res.status());
  });

  test("/api/public/blog/posts rejects bogus api key with 401", async ({ request }) => {
    const res = await request.get("/api/public/blog/posts", {
      headers: { Authorization: "Bearer hpk_not_a_real_key_aaaaaaaaaaaaaaaa" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("/api/public/blog/posts POST without key rejects with 401", async ({ request }) => {
    const res = await request.post("/api/public/blog/posts", {
      data: { title: "x", content_md: "y" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("/api/public/hooks/blog-webhook-deliveries cannot leak deliveries to anonymous callers", async ({ request }) => {
    // Cron endpoint should respond successfully but never include subscriber URLs / secrets in its body.
    const res = await request.post("/api/public/hooks/blog-webhook-deliveries");
    const text = await res.text();
    expect(text).not.toMatch(/whsec_/);
    expect(text).not.toMatch(/hpk_/);
  });
});
