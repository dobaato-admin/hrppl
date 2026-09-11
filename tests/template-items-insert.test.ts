/**
 * T20 — "null value in column \"id\" of relation
 * onboarding_checklist_template_items violates not-null constraint", shown to
 * the user as a raw Postgres message every time they edited a template that
 * already had tasks.
 *
 * The column has `DEFAULT gen_random_uuid()`, so the default should have
 * covered it. What defeated the default was the *client*:
 *
 *   postgrest-js  →  const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), [])
 *                    url.searchParams.set("columns", …)
 *
 * `Object.keys({ id: undefined })` is `["id"]`. So `{ ...i, id: undefined }`
 * declared `id` as a column being inserted, while `JSON.stringify` removed the
 * value from the body — and PostgREST fills a declared-but-absent column with
 * NULL instead of the default (`defaultToNull` is its default behaviour).
 *
 * The fix is to omit the key. These tests pin that, because the difference
 * between `{ id: undefined }` and `{}` is invisible in review and in a
 * debugger, and identical under `console.log`.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { buildTemplateItemRows } from "@/lib/templates.functions";
import { plainDbMessage, isDbError } from "@/lib/db-error";

describe("buildTemplateItemRows", () => {
  const ITEM = { id: "11111111-1111-1111-1111-111111111111", title: "Sign contract", required: true };

  it("omits the id key entirely — not merely sets it undefined", () => {
    const [row] = buildTemplateItemRows([ITEM], "tpl-1", "tenant-1");
    expect("id" in row).toBe(false);
    // The assertion that actually reproduces the bug: this is what postgrest-js
    // reads to build `?columns=`.
    expect(Object.keys(row)).not.toContain("id");
  });

  it("keeps every other field, and stamps template and tenant", () => {
    const [row] = buildTemplateItemRows([ITEM], "tpl-1", "tenant-1") as any[];
    expect(row.title).toBe("Sign contract");
    expect(row.required).toBe(true);
    expect(row.template_id).toBe("tpl-1");
    expect(row.tenant_id).toBe("tenant-1");
  });

  it("a mix of existing and newly added tasks produces one uniform key set", () => {
    // The reported repro: edit a template that has tasks, add one more, save.
    // A ragged key set is what makes PostgREST union the columns in the first
    // place, so every row must carry exactly the same keys.
    const rows = buildTemplateItemRows(
      [ITEM, { title: "Collect laptop", required: false }],
      "tpl-1",
      "tenant-1",
    );
    const keySets = rows.map((r) => Object.keys(r).sort());
    expect(new Set(keySets.map((k) => k.join(","))).size).toBe(1);
    // `.not.toContain("id")` on the *array*: the joined string contains "id"
    // as a substring of "template_id" and would pass either way.
    expect(keySets[0]).not.toContain("id");
  });

  it("falls back to array position for sort_order, and 0 is not treated as absent", () => {
    const rows = buildTemplateItemRows(
      [{ title: "a" }, { title: "b" }, { title: "c", sort_order: 0 }],
      "tpl-1",
      "tenant-1",
    );
    expect(rows.map((r) => r.sort_order)).toEqual([0, 1, 0]);
  });
});

describe("no array insert declares a column it does not send", () => {
  /**
   * The same mistake anywhere else produces the same not-null violation, so
   * this scans rather than trusting the one site to stay fixed.
   */
  function sourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) sourceFiles(full, out);
      else if (/\.tsx?$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  it("no `.insert(` call maps rows containing `<key>: undefined`", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("src")) {
      if (file.includes("integrations/supabase/types.ts")) continue;
      const src = readFileSync(file, "utf8");
      // `.insert(` … `.map(` … `key: undefined` on the same statement.
      const re = /\.insert\(\s*[\s\S]{0,400}?\.map\([\s\S]{0,400}?\)\s*\)/g;
      for (const match of src.match(re) ?? []) {
        if (/\w+:\s*undefined/.test(match)) {
          offenders.push(`${file}: ${match.slice(0, 120).replace(/\s+/g, " ")}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("plainDbMessage", () => {
  it("replaces a not-null violation with something a person can act on", () => {
    const pgErr = {
      code: "23502",
      message:
        'null value in column "id" of relation "onboarding_checklist_template_items" violates not-null constraint',
    };
    const msg = plainDbMessage(pgErr, "Could not save the template's tasks.");
    expect(msg).not.toMatch(/null value|relation|constraint/);
    expect(msg.length).toBeGreaterThan(10);
  });

  it("never leaks a table, column or policy name for any recognised code", () => {
    const leaky = [
      { code: "23503", message: 'insert on table "x" violates foreign key constraint "x_y_fkey"' },
      { code: "42501", message: 'new row violates row-level security policy for table "employees"' },
      { code: "PGRST200", message: "Could not find a relationship between 'a' and 'b'" },
    ];
    for (const e of leaky) {
      expect(plainDbMessage(e, "Could not save.")).not.toMatch(/"|policy|relationship/);
    }
  });

  it("passes our own written refusals through untouched", () => {
    // `throw new Error("You may not approve your own leave request")` is
    // already written for a person; rewriting it would be a regression.
    const ours = new Error("You may not approve your own leave request");
    expect(isDbError(ours)).toBe(false);
    expect(plainDbMessage(ours, "Could not save.")).toBe(
      "You may not approve your own leave request",
    );
  });

  it("uses the caller's fallback for an unrecognised database code", () => {
    expect(plainDbMessage({ code: "XX000", message: "internal error" }, "Could not save.")).toBe(
      "Could not save.",
    );
  });
});
