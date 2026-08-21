import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for end-to-end routing tests.
 *
 * Boots the Vite dev server, then drives Chromium against it. Tests seed
 * users via the Supabase admin API and sign in via the /auth email+password
 * form — which exercises the exact same post-authentication routing path
 * (dashboard → getMyOrgStatus → /welcome or /org/setup) that a real
 * Google OAuth sign-in goes through.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:5173",
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        stdout: "ignore",
        stderr: "pipe",
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
