import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * The three review systems, and the keys they were missing.
 *
 * `docs/remaining-work.md` recorded three systems that "share review_templates
 * and never reconcile". Mapping them found the sharing was not structural at
 * all — six tables carried a `template_id` with **no foreign key on any of
 * them** — and that one of the three was keyed on free text.
 *
 * This does not reconcile them. They assess different things (a person, a
 * competency, a duty), which may well be right. It pins the keys, so whoever
 * does reconcile them starts from a schema instead of string matching.
 */
const MIGRATIONS = readdirSync(join(process.cwd(), "supabase/migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(process.cwd(), "supabase/migrations", f), "utf8"))
  .join("\n");

/**
 * Comments stripped before matching. A comment explaining what a file USED to do
 * has to quote the code it replaced — this test failed on its own documentation
 * the first time it ran, which is the third time that has happened in this
 * repository and the reason every scanner here does this.
 */
const codeOf = (p: string) =>
  readFileSync(p, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const DUTY = codeOf("src/lib/duty-reviews.functions.ts");
const ADMIN_PAGE = codeOf("src/routes/admin.duty-reviews.tsx");

describe("a duty score is keyed to the cycle, not to its name", () => {
  it("duty_review_scores has a real cycle_id foreign key", () => {
    // `cycle_label` was free text supplied by the caller while
    // `kpi_review_cycles` had both an id and a label. `upsertCycle` lets an
    // admin RENAME a cycle, and every score filed under the old label then
    // stopped resolving to it — the shape of data loss that leaves the data in
    // place. Verified against the live database: after this change a score
    // survives a rename and still resolves to its cycle.
    expect(MIGRATIONS).toMatch(
      /ADD COLUMN IF NOT EXISTS cycle_id uuid REFERENCES public\.kpi_review_cycles\(id\)/,
    );
  });

  it("uniqueness moved to the cycle id", () => {
    expect(MIGRATIONS).toMatch(
      /duty_review_scores_employee_duty_cycle_key[\s\S]{0,120}UNIQUE \(employee_id, duty_id, cycle_id\)/,
    );
    expect(DUTY).toMatch(/onConflict: "employee_id,duty_id,cycle_id"/);
  });

  it("no server fn still takes a cycle label from the caller", () => {
    // A label is a display string. Accepting one as an identifier is what let a
    // score be filed against a cycle that did not exist.
    expect(DUTY).not.toMatch(/cycleLabel/);
  });

  it("the label is still written, as the record of what it was called then", () => {
    // Kept deliberately: a CSV export and a historical row should show the name
    // the cycle had when the score was filed, and a cycle can be deleted.
    expect(DUTY).toMatch(/cycle_label: cycle\.label/);
  });

  it("the page no longer invents a cycle from the clock", () => {
    // `defaultCycleLabel()` built `2026-Q3` from today's date and filed scores
    // against it, matching a real cycle only by luck.
    expect(ADMIN_PAGE).not.toMatch(/defaultCycleLabel/);
    // And the picker carries the id it already had in hand.
    expect(ADMIN_PAGE).toMatch(/<SelectItem key=\{c\.id\} value=\{c\.id\}>/);
  });
});

describe("the template_id columns are keys", () => {
  /**
   * A PostgREST embed resolves from the foreign-key graph; with no key it
   * answers PGRST200 and the caller's `rows ?? []` draws an empty table. That
   * emptied four training surfaces and the leave half of both requests inboxes
   * for months. Nothing embeds these yet — this is prevention.
   */
  it.each([
    ["performance_reviews_template_id_fkey", "review_templates"],
    ["review_cycles_template_id_fkey", "review_templates"],
    ["review_instances_template_id_fkey", "review_templates"],
    ["performance_reviews_cycle_id_fkey", "review_cycles"],
    ["review_instances_employee_id_fkey", "employees"],
  ])("%s references %s", (constraint, target) => {
    const re = new RegExp(`${constraint}[\\s\\S]{0,200}REFERENCES public\\.${target}\\(id\\)`);
    expect(MIGRATIONS).toMatch(re);
  });

  it("the 360-feedback tables point at feedback_question_templates, NOT review_templates", () => {
    // The trap. Both columns are called `template_id`, and both sit in files
    // full of "review" nouns — but verified against real rows,
    // review_feedback_requests.template_id resolved 1/1 in
    // feedback_question_templates and 0/1 in review_templates. An FK to
    // review_templates would have broken every 360-feedback insert.
    for (const c of [
      "review_feedback_requests_template_id_fkey",
      "review_feedback_template_id_fkey",
    ]) {
      expect(MIGRATIONS).toMatch(
        new RegExp(`${c}[\\s\\S]{0,200}REFERENCES public\\.feedback_question_templates\\(id\\)`),
      );
    }
  });

  it("the audit log deliberately has none", () => {
    // It records what was done TO a template, including deleting one. A key
    // would either block that delete or null the id the row exists to describe.
    expect(MIGRATIONS).not.toMatch(/review_template_audit_log_template_id_fkey/);
    expect(MIGRATIONS).toMatch(/review_template_audit_log gets NO foreign key, on purpose/);
  });
});
