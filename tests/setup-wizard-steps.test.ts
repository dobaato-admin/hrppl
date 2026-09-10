import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The creation wizard has to say what it is about to do.
 *
 * ---------------------------------------------------------------------------
 * What was reported
 * ---------------------------------------------------------------------------
 *
 * Two things, both about the same absence.
 *
 * **Departments was a `<Textarea>` split on newlines.** No idea what a sensible
 * department is, no confirmation a line counted as one, a blank line silently
 * becoming nothing, and "Engineering" typed twice becoming two departments with
 * the same name — which is genuinely hard to unpick later, because employees
 * attach to them.
 *
 * **"Create the three default leave types" was a ticked box** that never said
 * which three, how many days each carried, or whether they could be changed.
 * That checkbox decides how everybody's leave accrues.
 *
 * Underneath both: the wizard never said that it *creates* an organisation
 * rather than *configuring* one, so an admin finished it believing payroll was
 * dealt with. It is not — that is the Setup guide, and nobody was told it
 * existed.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const WIZARD = read("src/routes/org.setup.tsx");
const GEN = read("src/routeTree.gen.ts");

describe("departments is a list, not a paragraph", () => {
  it("the wizard no longer renders a textarea for them", () => {
    expect(
      WIZARD,
      "Departments were entered as newline-separated text. Splitting prose on " +
        "\\n gives no duplicate check, no confirmation, and a blank line " +
        "becomes a silent no-op.",
    ).not.toMatch(/value=\{departments\.join\("\\n"\)\}/);
    expect(WIZARD).toContain("<DepartmentPicker");
  });

  const PICKER = read("src/components/setup/DepartmentPicker.tsx");

  it("refuses duplicates case-insensitively", () => {
    // "People" and "people" are not two teams.
    expect(PICKER).toMatch(/toLowerCase\(\)/);
    expect(PICKER).toMatch(/taken\.has\(/);
    expect(PICKER).toMatch(/is already on the list/);
  });

  it("offers to create something that is not on the suggestion list", () => {
    expect(PICKER).toMatch(/canCreate/);
    expect(PICKER).toMatch(/Create &ldquo;\{query\}&rdquo;/);
  });

  it("does not offer to create a duplicate", () => {
    const from = PICKER.indexOf("const canCreate");
    const decl = PICKER.slice(from, from + 260);
    expect(decl).toContain("!taken.has(query.toLowerCase())");
  });

  it("each item can be removed, with a labelled control", () => {
    // An icon-only button with no accessible name is unusable by anyone not
    // looking at it.
    expect(PICKER).toMatch(/aria-label=\{`Remove \$\{name\}`\}/);
  });
});

describe("every step says what it will do and what happens next", () => {
  it("all five steps carry a note", () => {
    // Five StepNote uses plus the two import references; the assertion is that
    // no step was left without one.
    const notes = WIZARD.match(/<StepNote/g) ?? [];
    expect(notes.length, "every step of the wizard needs a StepNote").toBeGreaterThanOrEqual(5);
  });

  it("the leave step lists the actual defaults, with their real numbers", () => {
    // Sourced from seedOrgDefaults in org-signup.functions.ts. If those change,
    // this fails — which is the point: a form that describes defaults it no
    // longer creates is worse than one that describes nothing.
    const seed = read("src/lib/org-signup.functions.ts");
    for (const [name, quota, accrual] of [
      ["Annual Leave", "21", "1.75"],
      ["Sick Leave", "10", "0.83"],
    ]) {
      expect(seed, `${name} should still be seeded`).toContain(`name: "${name}"`);
      expect(seed).toContain(`annual_quota_days: ${quota}`);
      expect(seed).toContain(`accrual_per_month: ${accrual}`);
      expect(WIZARD, `the wizard must show ${name}'s real numbers`).toContain(
        `["${name}", "${quota}", "${accrual}"`,
      );
    }
  });

  it("says what skipping the leave defaults costs", () => {
    expect(WIZARD).toMatch(/nobody can submit a leave request/);
  });

  it("hands off to the Setup guide rather than implying setup is finished", () => {
    const note = read("src/components/setup/StepNote.tsx");
    expect(note).toContain("This creates your organisation. The Setup guide configures it.");
    expect(WIZARD).toContain("<SetupGuideHandoff");
  });

  it("the leave step is not called 'payroll' — it seeds no payroll", () => {
    // seedOrgDefaults writes departments and leave_types. Nothing else.
    const seed = read("src/lib/org-signup.functions.ts");
    const from = seed.indexOf("export const seedOrgDefaults");
    const body = seed.slice(from, seed.indexOf("// ---------- resetMyOrgSetup", from));
    expect(body).not.toMatch(/tenant_payroll_settings|payroll_components/);
    expect(WIZARD).toMatch(/title: "Leave defaults"/);
  });

  it("every page a note sends the reader to actually exists", () => {
    // A wizard that says "change this later under X" and links to a 404 is
    // worse than saying nothing — the reader stops believing the rest of it.
    const links = [...WIZARD.matchAll(/editTo="(\/[a-z0-9/-]+)"/g)].map((m) => m[1]);
    const noteLinks = [...read("src/components/setup/StepNote.tsx").matchAll(/to="(\/[a-z0-9/-]+)"/g)].map(
      (m) => m[1],
    );
    const all = [...new Set([...links, ...noteLinks])];
    expect(all.length).toBeGreaterThanOrEqual(4);
    expect(all.filter((p) => !GEN.includes(`'${p}'`))).toEqual([]);
  });
});
