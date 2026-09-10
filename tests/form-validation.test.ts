import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Required fields have to be visible, reachable and named.
 *
 * ---------------------------------------------------------------------------
 * What was reported
 * ---------------------------------------------------------------------------
 *
 * Submitting the setup guide's company form answered with a raw Zod array in a
 * toast — one `{"code":"invalid_type","expected":"string","received":"null",
 * "path":["trading_name"]}` per empty column. Nothing turned red, focus did not
 * move, and the reader had to map `path: ["trading_name"]` onto a field by eye.
 *
 * The deeper reason it looked like that: **no input in the product styled
 * `aria-invalid`**, so no form could show an error state even if it computed
 * one. Three assertions below cover the base layer; the rest cover the forms
 * built on it.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("the base controls can show an error at all", () => {
  it.each([
    ["src/components/ui/input.tsx", "Input"],
    ["src/components/ui/textarea.tsx", "Textarea"],
    ["src/components/ui/select.tsx", "SelectTrigger"],
  ])("%s styles aria-invalid", (file) => {
    const src = read(file);
    expect(
      src,
      "This control has no aria-invalid styling, so any form using it cannot " +
        "turn a field red. Driving the colour off aria-invalid keeps the " +
        "visual and the screen-reader state from disagreeing.",
    ).toMatch(/aria-\[invalid=true\]:border-destructive/);
  });
});

describe("useFormErrors does the three things a person needs", () => {
  const src = read("src/hooks/use-form-errors.tsx");

  it("marks the fields", () => {
    expect(src).toMatch(/"aria-invalid":/);
  });

  it("moves the cursor to the first problem, scrolled into view", () => {
    // Focusing a field below the fold without scrolling first pins it to the
    // window edge, which reads as the page jumping rather than as an answer.
    const from = src.indexOf("const focusFirst");
    expect(from).toBeGreaterThan(-1);
    const fn = src.slice(from, from + 500);
    expect(fn).toContain("scrollIntoView");
    expect(fn).toContain("focus");
  });

  it("names the field in the toast rather than counting them", () => {
    expect(src).toMatch(/toast\.error\(/);
    expect(src).toMatch(/is required/);
  });

  it("validates in the order the fields appear", () => {
    // So "the first problem" is the topmost one, not whichever key the object
    // happened to enumerate first.
    expect(src).toMatch(/fields\.filter\(\(f\) => next\[f\.name\]\)/);
  });

  it("rewrites a type-system message into a form message", () => {
    // "Expected string, received null" describes a parser, not a form.
    expect(src).toMatch(/invalid_type/);
    expect(src).toMatch(/\$\{label\} is required/);
  });
});

describe("the forms that had the bug now use it", () => {
  const FORMS = [
    ["src/routes/org.setup-guide.tsx", "the setup guide's company form"],
    ["src/routes/onboarding.profile.tsx", "the employee onboarding profile"],
  ] as const;

  it.each(FORMS)("%s validates before submitting", (file) => {
    const src = read(file);
    expect(src).toContain("useFormErrors");
    expect(src, "must mark fields via register()").toMatch(/register\(/);
    expect(src, "must render the message under the field").toContain("FieldError");
    expect(src, "must map server refusals onto fields").toContain("fromServer");
  });

  it("the org creation wizard marks the fields it validates", () => {
    // The first form a new customer ever touches. It already had specific
    // messages, but every one of them was a bare toast on a two-column layout —
    // the reader was told a rule had failed without being told which box.
    const src = read("src/routes/org.setup.tsx");
    expect(src).toContain("useFormErrors");
    expect(src).toContain("FieldError");
    for (const field of [
      "name",
      "country_code",
      "contact_phone",
      "contact_email",
      "registration_number",
    ]) {
      expect(src, `${field} must be registered`).toContain(`form.register("${field}")`);
    }
  });

  it("checks fields in rendered order, not state-object order", () => {
    // `check` focuses the first failure, so "first" has to mean highest on
    // screen. Phone renders above email in this layout; listing email first
    // sent the cursor past a field the reader could see was wrong.
    const src = read("src/routes/org.setup.tsx");
    const phone = src.indexOf('name: "contact_phone"');
    const email = src.indexOf('name: "contact_email"');
    expect(phone).toBeGreaterThan(-1);
    expect(email).toBeGreaterThan(-1);
    expect(phone, "contact_phone must be checked before contact_email").toBeLessThan(email);
  });

  it("the setup guide's company schema accepts null, not just absent", () => {
    // The form prefills straight from the stored row, and that row holds null
    // for every column nobody has filled in. `.optional()` permits a missing
    // key but not a null, which is what produced the reported error.
    const src = read("src/lib/setup-guide.functions.ts");
    const from = src.indexOf("export const updateCompanyProfile");
    const schema = src.slice(from, from + 1600);
    expect(schema).toMatch(/trading_name: z\.string\(\)\.trim\(\)\.max\(200\)\.nullish\(\)/);
    expect(
      schema,
      "no field in this schema may be `.optional()` — the prefill sends nulls",
    ).not.toMatch(/z\.string\(\)\.trim\(\)\.max\(\d+\)\.optional\(\)/);
  });

  it("saving a partial onboarding profile does NOT validate", () => {
    // "Save progress" is the resume feature. Demanding a complete form to save
    // an incomplete one would defeat the entire point of having it.
    const src = read("src/routes/onboarding.profile.tsx");
    const from = src.indexOf("async function save(submit: boolean)");
    expect(from).toBeGreaterThan(-1);
    const fn = src.slice(from, from + 900);
    expect(fn).toMatch(/if \(submit\) \{/);
    expect(fn).toMatch(/fieldErrors\.check\(/);
    // The check must sit inside the `if (submit)` branch, not before it.
    expect(fn.indexOf("if (submit) {")).toBeLessThan(fn.indexOf("fieldErrors.check("));
  });
});

describe("no form still shows a raw parser error", () => {
  /**
   * The visible symptom was a JSON array in a toast. Any page that toasts a
   * caught error without first offering it to `fromServer` can reproduce it,
   * so new forms should reach for the hook rather than `toast.error(e.message)`
   * alone. Recorded as a list that may only shrink.
   */
  const ROUTES = join(ROOT, "src/routes");
  const files = readdirSync(ROUTES).filter((f) => f.endsWith(".tsx"));

  it("the two forms this fix covered no longer toast a bare message on save", () => {
    for (const f of ["org.setup-guide.tsx", "onboarding.profile.tsx"]) {
      const src = read(`src/routes/${f}`);
      expect(src, `${f} should try fromServer before a plain toast`).toMatch(
        /fromServer\([\s\S]{0,400}toast\.error/,
      );
    }
  });

  it("finds the other route files, for when this pattern spreads", () => {
    // Not an assertion about them yet — the next forms to convert are the ones
    // with the most required fields, and this keeps the count honest.
    expect(files.length).toBeGreaterThan(100);
  });
});
