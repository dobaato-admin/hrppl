import { test, expect, type Page, type Locator } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * DEMO — set up Globex Nepal end to end, finishing with Nepal payroll.
 *
 * Not a regression test. It is a narrated walkthrough of the real first-run an
 * organisation admin gets, captured as video plus a labelled screenshot per
 * step. It asserts as it goes, so it fails honestly rather than producing a
 * misleading recording.
 *
 *     E2E_BASE_URL=http://localhost:8080 \
 *     bunx playwright test e2e/demo-nepal-org-setup.spec.ts --headed
 *
 * Why the org setup wizard comes first
 * -----------------------------------
 * AuthRouteGate funnels an org_admin whose setup is incomplete to /org/setup
 * and will not let them reach ANY admin route until it is finished:
 *
 *     } else if (isOrgAdmin && !setupDone) {
 *       if (pathname !== "/org/setup") { navigate({ to: "/org/setup" }); return; }
 *     }
 *
 * The demo seed writes the tenant row directly and never walks the wizard, so
 * setup_progress is empty and /admin/payroll-wizard is unreachable. Driving the
 * five real steps is therefore not scene-setting — it is the only way through,
 * and it is the "setting up the organization" half of the demo.
 *
 * Why gina.globex
 * ---------------
 * runNepalPayrollWizard resolves the tenant from the CALLER'S OWN profile and
 * throws "No tenant" without one, so a super_admin (deliberately tenantless)
 * cannot run it. The Nepal panel also renders only when country_code is 'NP'.
 * gina.globex is the only seeded account satisfying both.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:8080";
const EMAIL = process.env.DEMO_EMAIL ?? "gina.globex@demo.hrppl.test";
const PASSWORD = process.env.DEMO_PASSWORD ?? "DemoPassw0rd!23";

/** Generous: a human has to reach for their phone. */
const HUMAN_TIMEOUT = 10 * 60_000;

const SHOTS = join(process.cwd(), "playwright-report", "demo");
mkdirSync(SHOTS, { recursive: true });

let stepNo = 0;
const notes: string[] = [];

/**
 * Run one labelled step and screenshot it.
 *
 * Logs on BOTH entry and exit. An earlier version logged only on entry, which
 * made a printed marker look like a pass — a failing step announced itself and
 * then died, and the log read as success right up to the stack trace.
 */
async function step(page: Page, label: string, body: () => Promise<void>): Promise<void> {
  stepNo += 1;
  const tag = String(stepNo).padStart(2, "0");
  console.log(`  [${tag}] ${label} …`);
  await body();
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await page.screenshot({ path: join(SHOTS, `${tag}-${slug}.png`), fullPage: true });
  console.log(`  [${tag}] ${label} — OK`);
  notes.push(`${tag}. ${label}`);
}

/**
 * Wait until the URL stops changing.
 *
 * Sign-in navigates to /dashboard immediately, and only THEN does
 * AuthRouteGate run its async status check and redirect to /me/security or
 * /org/setup. Sampling page.url() straight after the click catches the
 * intermediate value and draws the wrong conclusion about where the user
 * actually is — which is exactly how an earlier run skipped its own MFA pause.
 */
async function settleUrl(page: Page, quietMs = 2_000, timeout = 45_000): Promise<string> {
  const deadline = Date.now() + timeout;
  let last = page.url();
  let stableSince = Date.now();
  while (Date.now() < deadline) {
    await page.waitForTimeout(250);
    const now = page.url();
    if (now !== last) {
      last = now;
      stableSince = Date.now();
      continue;
    }
    if (Date.now() - stableSince >= quietMs) return last;
  }
  return last;
}

/**
 * Wait until React is driving the form, then type into it.
 *
 * /auth is server-rendered with React-controlled inputs (useState("")). Before
 * hydration the markup is inert: fill() sets the DOM value and it sticks, so a
 * naive fill-then-assert LOOKS successful — toHaveValue reads the DOM, not
 * React state, so it cannot tell "React accepted this" from "nothing is
 * listening yet". Hydration then mounts, reconciles against empty state and
 * wipes the field, and the form posts an empty email.
 *
 * So probe for hydration: type, wait a beat, and require the value to survive.
 * Only a mounted React keeps it. pressSequentially rather than fill because it
 * dispatches real per-character key events, which a partially hydrated React
 * will not miss.
 */
async function typeWhenLive(field: Locator, value: string): Promise<void> {
  await expect(async () => {
    await field.click();
    await field.fill("");
    await field.pressSequentially(value, { delay: 15 });
    await field.page().waitForTimeout(400);
    await expect(field).toHaveValue(value, { timeout: 1_000 });
  }).toPass({ timeout: 45_000, intervals: [400, 800, 1_500] });
}

/**
 * The input paired with a visible label.
 *
 * org/setup renders `<div><Label>City</Label><Input/></div>` with no htmlFor,
 * so getByLabel finds nothing. Mirror the DOM shape instead.
 */
function fieldFor(page: Page, label: string): Locator {
  return page.locator(`div:has(> label:has-text("${label}")) input`).first();
}

function banner(lines: string[]): void {
  const width = Math.max(...lines.map((l) => l.length)) + 4;
  console.log("\n" + "=".repeat(width));
  for (const l of lines) console.log(`  ${l}`);
  console.log("=".repeat(width) + "\n");
}

/**
 * If the route gate has parked us on /me/security, ask the human to clear it.
 *
 * Called at more than one point on purpose. MFA is NOT the first thing an
 * org_admin meets, because AuthRouteGate checks setup completion first and
 * returns early:
 *
 *     } else if (isOrgAdmin && !setupDone) {
 *       if (pathname !== "/org/setup") { navigate({ to: "/org/setup" }); return; }
 *       return;                      // <- MFA check below never runs
 *     }
 *     ...
 *     if (!MFA_ALLOWED.has(pathname)) { ...enforce MFA... }
 *
 * So the whole org setup wizard is reachable with no second factor, and the
 * gate only bites afterwards, on the first real admin route. Handling MFA at
 * a single fixed point in the script would miss it entirely.
 *
 * Returns true if a prompt was needed.
 */
async function clearMfaIfGated(page: Page): Promise<boolean> {
  const settled = await settleUrl(page);
  if (!new URL(settled).pathname.startsWith("/me/security")) return false;

  await expect(page.getByRole("heading", { name: /two-factor|verify it/i })).toBeVisible({
    timeout: 20_000,
  });
  const enrolling = await page
    .getByAltText("TOTP QR code")
    .isVisible()
    .catch(() => false);

  await page.screenshot({ path: join(SHOTS, `mfa-${enrolling ? "enrol" : "verify"}.png`), fullPage: true });

  banner(
    enrolling
      ? [
          "ACTION NEEDED — enrol two-factor authentication",
          "",
          `Account: ${EMAIL}`,
          "",
          "1. Scan the QR code in the browser with your authenticator app.",
          "2. Type the 6-digit code.",
          "3. Click 'Verify & enable'.",
          "",
          "The demo resumes on its own.",
        ]
      : [
          "ACTION NEEDED — verify two-factor authentication",
          "",
          `Account: ${EMAIL}`,
          "",
          "Enter the current 6-digit code and click 'Verify'.",
          "",
          "The demo resumes on its own.",
        ],
  );

  // Watching the URL rather than page.pause() keeps the page interactive and
  // resumes automatically — no Inspector window to deal with.
  await page.waitForURL((u) => !u.pathname.startsWith("/me/security"), {
    timeout: HUMAN_TIMEOUT,
  });
  console.log("  MFA cleared — continuing.\n");
  await settleUrl(page);
  return true;
}

test.use({
  video: "on",
  viewport: { width: 1440, height: 900 },
  launchOptions: { slowMo: 200 },
});

test("demo: Globex Nepal — org setup, then FY 2081/82 payroll", async ({ page }) => {
  test.setTimeout(HUMAN_TIMEOUT + 5 * 60_000);

  // ---------------------------------------------------------------- sign in
  await step(page, "Sign in page", async () => {
    await page.goto(`${BASE}/auth`);
    await expect(page.getByRole("heading", { name: /sign in to hrppl/i })).toBeVisible();
  });

  // Filling and submitting are ONE step: a screenshot between them left a gap
  // long enough for a late hydration to empty a form already verified as full.
  await step(page, "Enter credentials and submit", async () => {
    await typeWhenLive(page.locator("#email-in"), EMAIL);
    await typeWhenLive(page.locator("#pw-in"), PASSWORD);
    await expect(page.locator("#email-in")).toHaveValue(EMAIL);
    await expect(page.locator("#pw-in")).toHaveValue(PASSWORD);

    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Fail fast and quote the app's own alert rather than burning a timeout.
    const alertBox = page.getByRole("alert");
    const outcome = await Promise.race([
      page.waitForURL(/\/(me\/security|dashboard|org\/setup)/, { timeout: 30_000 }).then(() => "ok" as const),
      alertBox.waitFor({ state: "visible", timeout: 30_000 }).then(() => "rejected" as const),
    ]).catch(() => "timeout" as const);

    if (outcome === "rejected") {
      throw new Error(`Sign-in rejected: ${(await alertBox.innerText()).replace(/\s+/g, " ")}`);
    }
    if (outcome === "timeout") throw new Error(`Sign-in stalled at ${page.url()}`);
  });

  // MFA may or may not fire here — see clearMfaIfGated for why.
  await clearMfaIfGated(page);
  const where = await settleUrl(page);

  // ------------------------------------------------- organisation setup
  if (new URL(where).pathname.startsWith("/org/setup")) {
    await step(page, "Org setup wizard", async () => {
      await expect(page.getByRole("heading", { name: /set up your organization/i })).toBeVisible();
      // Prefilled from the tenant row the seed created.
      await expect(page.getByText(/steps complete/i)).toBeVisible();
    });

    await step(page, "Step 1 - organisation details", async () => {
      // The only two required fields the seed left blank. Registration number
      // for a non-AU country just needs 3-32 chars of [A-Za-z0-9 -/].
      await typeWhenLive(fieldFor(page, "Contact phone"), "+977 1 4444555");
      await typeWhenLive(fieldFor(page, "Business registration number"), "NP-123456789");
      await page.getByRole("button", { name: /save & continue/i }).click();
      // The gate can intercept between ANY two steps: the moment setup counts
      // as complete, the `isOrgAdmin && !setupDone` early return stops applying
      // and the MFA check below it takes over, bouncing us off /org/setup
      // mid-wizard. Observed after step 4 -- invites is "Optional - do it
      // later", so the app treats setup as done before the wizard is.
      if (await clearMfaIfGated(page)) await page.goto(`${BASE}/org/setup`);
      // Assert on a field unique to the NEXT step, not on its title. shadcn's
      // CardTitle is not exposed as a heading, and the stepper rail repeats
      // every step title as button text -- so getByRole("heading") finds
      // nothing and getByText matches twice.
      await expect(page.getByPlaceholder("https://")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("1/5 steps complete")).toBeVisible();
    });

    await step(page, "Step 2 - address and branding", async () => {
      await typeWhenLive(fieldFor(page, "Street address"), "Durbar Marg 21");
      await typeWhenLive(fieldFor(page, "City"), "Kathmandu");
      await typeWhenLive(fieldFor(page, "State / region"), "Bagmati");
      await typeWhenLive(fieldFor(page, "Postal code"), "44600");
      await page.getByRole("button", { name: /save & continue/i }).click();
      // The gate can intercept between ANY two steps: the moment setup counts
      // as complete, the `isOrgAdmin && !setupDone` early return stops applying
      // and the MFA check below it takes over, bouncing us off /org/setup
      // mid-wizard. Observed after step 4 -- invites is "Optional - do it
      // later", so the app treats setup as done before the wizard is.
      if (await clearMfaIfGated(page)) await page.goto(`${BASE}/org/setup`);
      await expect(page.getByPlaceholder("One per line")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("2/5 steps complete")).toBeVisible();
    });

    await step(page, "Step 3 - departments", async () => {
      // Globex already has Delivery and People, and seedOrgDefaults does NOT
      // dedupe department names — reusing them would create duplicates. Add
      // genuinely new ones instead.
      const box = page.locator("textarea").first();
      await box.click();
      await box.fill("Engineering\nFinance\nSupport");
      await page.getByRole("button", { name: /create & continue/i }).click();
      // The gate can intercept between ANY two steps: the moment setup counts
      // as complete, the `isOrgAdmin && !setupDone` early return stops applying
      // and the MFA check below it takes over, bouncing us off /org/setup
      // mid-wizard. Observed after step 4 -- invites is "Optional - do it
      // later", so the app treats setup as done before the wizard is.
      if (await clearMfaIfGated(page)) await page.goto(`${BASE}/org/setup`);
      await expect(page.getByText("Create the three default leave types")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText("3/5 steps complete")).toBeVisible();
    });

    await step(page, "Step 4 - leave and payroll defaults", async () => {
      // leave_types ARE deduped server-side (count check before insert), so
      // leaving this ticked is safe even though the seed already made them.
      const tick = page.locator('input[type="checkbox"]').first();
      if (!(await tick.isChecked())) await tick.check();
      await page.getByRole("button", { name: /save & continue/i }).click();
      // The gate can intercept between ANY two steps: the moment setup counts
      // as complete, the `isOrgAdmin && !setupDone` early return stops applying
      // and the MFA check below it takes over, bouncing us off /org/setup
      // mid-wizard. Observed after step 4 -- invites is "Optional - do it
      // later", so the app treats setup as done before the wizard is.
      if (await clearMfaIfGated(page)) await page.goto(`${BASE}/org/setup`);
      await expect(page.getByRole("button", { name: /skip & finish/i })).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText("4/5 steps complete")).toBeVisible();
    });

    await step(page, "Step 5 - skip invitations and finish", async () => {
      await page.getByRole("button", { name: /skip & finish/i }).click();
      // markSetupStep('invites') completes the wizard. Where we land depends on
      // whether MFA has been satisfied yet, so settle rather than insisting on
      // /dashboard -- the Dashboard step below makes the real assertion.
      await clearMfaIfGated(page);
      await settleUrl(page);
    });
  }

  // Leaving /org/setup is the moment the MFA gate finally applies, so this is
  // usually where the human is asked for a code — not at sign-in.
  await clearMfaIfGated(page);

  await step(page, "Dashboard", async () => {
    const path = new URL(await settleUrl(page)).pathname;
    // Explicitly NOT a loose /me match — /me/security satisfies that and would
    // let a still-gated run sail past this check.
    expect(path, `expected the dashboard, got ${path}`).toMatch(/^\/(dashboard|me)$/);
  });

  // --------------------------------------------------------- payroll wizard
  await step(page, "Payroll wizard - country is NP", async () => {
    await page.goto(`${BASE}/admin/payroll-wizard`);
    // One more chance for the gate to intercept, e.g. if the per-tab MFA
    // session flag was never set.
    if (await clearMfaIfGated(page)) await page.goto(`${BASE}/admin/payroll-wizard`);

    const settled = new URL(await settleUrl(page)).pathname;
    expect(settled, `gate redirected to ${settled}`).toContain("/admin/payroll-wizard");
    await expect(page.getByText("Nepal payroll quick-seed (FY 2081/82)")).toBeVisible({
      timeout: 30_000,
    });
  });

  await step(page, "Open Nepal wizard", async () => {
    await page.getByRole("button", { name: /open nepal wizard/i }).click();
    await expect(page.getByRole("dialog").getByText(/nepal payroll wizard/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  const dialog = page.getByRole("dialog");

  await step(page, "FY 2081-82 slab preview", async () => {
    await expect(dialog.getByText(/2081\/82 BS/)).toBeVisible({ timeout: 20_000 });
    await expect(dialog.getByText("Social Security Tax")).toBeVisible();
    await expect(dialog.getByText("11% emp")).toBeVisible();
    await expect(dialog.getByText("20% empr")).toBeVisible();
  });

  await step(page, "Configure - couple, SSF on, CIT 31.5", async () => {
    // Radix SelectTrigger has role=combobox. Dialog source order:
    // marital default, festival month, PF election.
    const selects = dialog.getByRole("combobox");
    await selects.nth(0).click();
    await page.getByRole("option", { name: /couple \(joint\)/i }).click();
    // Couple thresholds start at 600,000 rather than 500,000 — proof the
    // preview is live rather than a static table.
    await expect(dialog.getByText("600,000")).toBeVisible({ timeout: 10_000 });

    const ssf = dialog.locator("#ssf");
    if ((await ssf.getAttribute("data-state")) !== "checked") await ssf.click();
    await expect(ssf).toHaveAttribute("data-state", "checked");

    // Two number inputs, in source order: CIT %, then remittance %.
    const numbers = dialog.locator('input[type="number"]');
    await numbers.nth(0).fill("31.5");
    await numbers.nth(1).fill("5");
  });

  await step(page, "Festival month and PF election", async () => {
    const selects = dialog.getByRole("combobox");
    await selects.nth(1).click();
    await page.getByRole("option", { name: "Kartik", exact: true }).click();
    await selects.nth(2).click();
    await page.getByRole("option", { name: /mandatory for all/i }).click();
  });

  await step(page, "Seed FY 2081-82 defaults", async () => {
    await dialog.getByRole("button", { name: /seed fy 2081\/82 defaults/i }).click();
    await expect(page.getByText(/nepal payroll seeded for fy 2081\/82/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  await step(page, "Wizard closed - setup complete", async () => {
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });
  });

  writeFileSync(
    join(SHOTS, "steps.md"),
    `# Demo — Globex Nepal setup\n\nAccount: \`${EMAIL}\`\n\n${notes.join("\n")}\n`,
    "utf8",
  );

  banner(["DEMO COMPLETE", "", `Screenshots: ${SHOTS}`]);
});
