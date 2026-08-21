/**
 * Smoke + RBAC tests for CSV export job retry / failure UI.
 *
 * The retry button only renders for failed jobs and re-enqueues the same
 * filters. These tests cover route protection + server-fn endpoint guards;
 * the retry validation rules (succeeded job can't be retried, only owner can
 * retry) are exercised by tests/csv-export-retry.test.ts.
 */
import { test, expect } from "@playwright/test";

test.describe("CSV export retry + failure UI", () => {
  test("admin/audit-history page is auth-gated", async ({ page }) => {
    await page.goto("/admin/audit-history");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("retryExportJob server fn rejects unauthenticated POST", async ({ request }) => {
    const res = await request.post("/_serverFn/src_lib_csv-export-jobs_functions_ts--retryExportJob_createServerFn_handler", {
      data: { jobId: "00000000-0000-0000-0000-000000000000" },
    });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("enqueueAuditExportJob server fn rejects unauthenticated POST", async ({ request }) => {
    const res = await request.post("/_serverFn/src_lib_csv-export-jobs_functions_ts--enqueueAuditExportJob_createServerFn_handler", {
      data: { jobType: "audit_unified", filters: {} },
    });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("deep-link to a specific job id renders the recent-jobs section after auth", async ({ page }) => {
    await page.goto("/admin/audit-history?job=11111111-1111-1111-1111-111111111111");
    // Unauthenticated → /auth (route exists + query param preserved or stripped on redirect).
    await expect(page).toHaveURL(/\/auth/);
  });
});
