/**
 * T21 / T22 — finishing setup, and coming back to it.
 *
 * T21 · Adding an employee prompts for an onboarding template, and nothing
 * created one during setup — so an admin's first hire sent them out to the
 * Templates Hub and back.
 *
 * T22 · Progress was already saved per step and the wizard already resumed at
 * the first incomplete one. What was missing was the nudge: an admin who
 * closed the tab at step three heard nothing further, ever. The columns for it
 * (`last_reminder_at`, `reminder_count`) had been on the table since the
 * beginning and nothing read them.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  dueSetupReminder,
  outstandingSetupSteps,
  REMINDER_SCHEDULE_HOURS,
} from "@/lib/setup-reminders";

const HOUR = 3600_000;
const NOW = new Date("2026-06-10T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * HOUR).toISOString();

describe("dueSetupReminder", () => {
  it("sends nothing in the first day", () => {
    expect(dueSetupReminder({ created_at: hoursAgo(2) }, NOW)).toBeNull();
    expect(dueSetupReminder({ created_at: hoursAgo(23) }, NOW)).toBeNull();
  });

  it("sends the first at 24 hours", () => {
    const d = dueSetupReminder({ created_at: hoursAgo(25) }, NOW);
    expect(d?.sequence).toBe(1);
    expect(d?.daysSinceCreated).toBe(1);
  });

  it("walks 24h, 3 days, 7 days and then stops", () => {
    expect(REMINDER_SCHEDULE_HOURS).toEqual([24, 72, 168]);
    const after = (hours: number, sent: number) =>
      dueSetupReminder(
        { created_at: hoursAgo(hours), reminder_count: sent, last_reminder_at: hoursAgo(hours - 24) },
        NOW,
      )?.sequence ?? null;
    expect(after(73, 1)).toBe(2);
    expect(after(169, 2)).toBe(3);
    // The fourth never comes. An organisation that has ignored a week of
    // reminders will not be moved by another.
    expect(after(400, 3)).toBeNull();
  });

  it("does not send the next one early just because the first is done", () => {
    expect(
      dueSetupReminder(
        { created_at: hoursAgo(48), reminder_count: 1, last_reminder_at: hoursAgo(24) },
        NOW,
      ),
    ).toBeNull();
  });

  it("never sends two inside twelve hours, whatever the schedule says", () => {
    // A re-run of the sweep, a clock change, or a backfilled created_at must
    // not be able to put three emails in somebody's morning.
    expect(
      dueSetupReminder(
        { created_at: hoursAgo(400), reminder_count: 1, last_reminder_at: hoursAgo(1) },
        NOW,
      ),
    ).toBeNull();
  });

  it("stops the moment setup is finished", () => {
    expect(
      dueSetupReminder(
        { created_at: hoursAgo(400), completed_at: hoursAgo(1), reminder_count: 0 },
        NOW,
      ),
    ).toBeNull();
  });

  it("survives a missing or nonsensical created_at rather than throwing", () => {
    // This runs in a cron sweep over every incomplete tenant. One bad row must
    // not stop the other four hundred.
    expect(dueSetupReminder({ created_at: "" }, NOW)).toBeNull();
    expect(dueSetupReminder({ created_at: "not a date" }, NOW)).toBeNull();
    // Created in the future — a clock skew, not a reason to email.
    expect(dueSetupReminder({ created_at: new Date(NOW.getTime() + HOUR).toISOString() }, NOW)).toBeNull();
  });

  it("treats a null reminder_count as none sent", () => {
    expect(dueSetupReminder({ created_at: hoursAgo(25), reminder_count: null }, NOW)?.sequence).toBe(1);
  });
});

describe("outstandingSetupSteps", () => {
  it("names the steps the wizard names", () => {
    expect(
      outstandingSetupSteps({
        details_done: true,
        branding_done: true,
        departments_done: false,
        defaults_done: false,
        invites_done: false,
      }),
    ).toEqual(["Departments", "Leave defaults", "Invite your team"]);
  });

  it("is empty when everything is done", () => {
    expect(
      outstandingSetupSteps({
        details_done: true,
        branding_done: true,
        departments_done: true,
        defaults_done: true,
        invites_done: true,
      }),
    ).toEqual([]);
  });
});

describe("the reminder sweep", () => {
  const hook = readFileSync("src/routes/api/public/hooks/org-setup-reminders.ts", "utf8");

  it("requires cron authorization like every other public hook", () => {
    expect(hook).toMatch(/isAuthorizedCronRequest/);
    expect(hook).toMatch(/status: 401/);
  });

  it("does not echo a caught error back to the caller", () => {
    // These endpoints are internet-reachable; a Postgres message names tables,
    // columns and policies.
    expect(hook).toMatch(/hookFailure\("org-setup-reminders", e\)/);
    expect(hook).not.toMatch(/e\.message/);
  });

  it("only looks at organisations that have not finished", () => {
    expect(hook).toMatch(/\.is\("completed_at", null\)/);
  });

  it("records the reminder before sending, not after", () => {
    // A send that throws should cost one missed reminder, not re-send the same
    // one on every sweep to an address that keeps failing.
    const bump = hook.indexOf("reminder_count: decision.sequence");
    const send = hook.indexOf("templateName: \"org-setup-reminder\"");
    expect(bump).toBeGreaterThan(-1);
    expect(send).toBeGreaterThan(bump);
  });

  it("links to the wizard, which resumes where the admin left off", () => {
    expect(hook).toMatch(/resumeUrl: `\$\{appUrl\}\/org\/setup`/);
    const wizard = readFileSync("src/routes/org.setup.tsx", "utf8");
    expect(wizard).toMatch(/firstIncomplete === -1 \? STEPS\.length - 1 : firstIncomplete/);
  });

  it("is registered as an email template", () => {
    const registry = readFileSync("src/lib/email-templates/registry.ts", "utf8");
    expect(registry).toMatch(/'org-setup-reminder': orgSetupReminder/);
  });
});

describe("T21 · setup leaves an organisation with a usable template", () => {
  const src = readFileSync("src/lib/org-signup.functions.ts", "utf8");
  const fn = src.slice(
    src.indexOf("export const seedOrgDefaults"),
    src.indexOf("// ---------- resetMyOrgSetup"),
  );

  it("creates a starter template", () => {
    expect(fn).toMatch(/onboarding_checklist_templates/);
    expect(fn).toMatch(/name: "New starter"/);
  });

  it("only when the tenant has none, so it cannot appear unexpectedly", () => {
    expect(fn).toMatch(/count: "exact", head: true[\s\S]{0,120}onboarding_checklist_templates|onboarding_checklist_templates[\s\S]{0,200}count: "exact", head: true/);
    expect(fn).toMatch(/\(count \?\? 0\) === 0/);
  });

  it("does not leave a template with no tasks behind", () => {
    // An empty template looks usable and assigns an empty checklist, which is
    // worse than having none.
    expect(fn).toMatch(/\.from\("onboarding_checklist_templates"\)\.delete\(\)\.eq\("id", tpl\.id\)/);
  });

  it("inserts items with no id key at all", () => {
    // T20's defect, in new code. `id: undefined` would put "id" into
    // postgrest-js's `columns` parameter and make PostgREST write NULL.
    const insert = fn.slice(fn.indexOf("onboarding_checklist_template_items"));
    expect(insert).not.toMatch(/id:\s*undefined/);
  });

  it("does not fail the whole setup step if the template cannot be made", () => {
    expect(fn).toMatch(/starter template failed/);
  });
});

describe("adding an employee never blocks on a template", () => {
  const src = readFileSync("src/routes/org.employees.tsx", "utf8");

  it("offers Skip, and says the employee already exists", () => {
    expect(src).toMatch(/the employee has been added\s+already/i);
  });
});
