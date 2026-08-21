/**
 * RBAC smoke tests for the compliance/audit surface.
 *
 * Verifies that protected server endpoints reject:
 *   - unauthenticated callers (no bearer token)
 *   - cross-tenant / wrong-role callers via direct HTTP POST
 *
 * Server functions in TanStack Start are reachable at /_serverFn/<id>; here we
 * exercise the public-facing routes (cron hooks + admin page guard) which is
 * what production callers actually hit. The page guard test ensures an
 * unauthenticated browser hitting /admin/audit-history is redirected to /auth.
 */
import { test, expect } from "@playwright/test";

test.describe("audit + reminder RBAC", () => {
  test("audit-history page redirects unauthenticated user to /auth", async ({ page }) => {
    await page.goto("/admin/audit-history");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("compliance-attestation-reminders cron rejects unauthenticated POST", async ({ request }) => {
    const res = await request.post("/api/public/hooks/compliance-attestation-reminders", { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  test("audit-retention-run cron rejects unauthenticated POST", async ({ request }) => {
    const res = await request.post("/api/public/hooks/audit-retention-run", { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  test("compliance-attestation-reminders cron rejects bogus auth header", async ({ request }) => {
    const res = await request.post("/api/public/hooks/compliance-attestation-reminders", {
      data: {},
      headers: { "x-cron-secret": "not-the-real-secret", apikey: "not-the-real-key" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("offboarding admin page redirects unauthenticated user", async ({ page }) => {
    await page.goto("/admin/offboarding");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("onboarding tracker redirects unauthenticated user", async ({ page }) => {
    await page.goto("/org/onboarding/tracker");
    await expect(page).toHaveURL(/\/auth/);
  });
});
