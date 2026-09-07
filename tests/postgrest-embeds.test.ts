import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * A PostgREST embed needs a FOREIGN KEY, or it returns nothing.
 *
 * ---------------------------------------------------------------------------
 * What this cost
 * ---------------------------------------------------------------------------
 *
 * PostgREST resolves `.select("*, employees(first_name)")` from the foreign-key
 * graph. `training_enrollments.employee_id` was declared as a bare
 * `uuid NOT NULL` in 20260606063457 — no key, ever — so every such call
 * answered
 *
 *     PGRST200 — Could not find a relationship between 'training_enrollments'
 *     and 'employees' in the schema cache
 *
 * The callers throw the error away and render `rows ?? []`. Four surfaces have
 * therefore been permanently, silently empty since the day they shipped:
 * /org/training's enrollments and expiring-certs tabs, and /me/training's
 * assigned-courses and certifications tabs.
 *
 * Auditing the rest found six more tables in the same state. The sharpest was
 * `leave_requests`: the requests inbox normalises six tables into one list and
 * four of them carried the key, so /me/requests and /admin/requests worked —
 * while dropping leave, the highest-volume request type in the product.
 *
 * Fixed in 20260906092000, 20260906093000 and 20260906094000.
 *
 * ---------------------------------------------------------------------------
 * What this test checks, and what it deliberately does not
 * ---------------------------------------------------------------------------
 *
 * Only the **bare table-name** embed form — `employees(...)`, not
 * `employee:employees(...)` and not `employee_id(...)`. That is the form the
 * bug appeared in, and it is the one that can be matched without guessing:
 * PostgREST also accepts an FK *column* name in that position, which a static
 * reader cannot tell apart from a table. Widening the match would produce a
 * list of false positives, and a test whose failures are usually wrong is a
 * test people learn to silence.
 */

const ROOT = process.cwd();
const LIB = join(ROOT, "src/lib");
const MIGRATIONS = join(ROOT, "supabase/migrations");

const SQL = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(MIGRATIONS, f), "utf8"))
  .join("\n");

/** `parent` tables reachable by FK from `child`, per the migrations. */
function foreignKeys(): Set<string> {
  const out = new Set<string>();
  // Inline column references inside a CREATE TABLE body.
  for (const m of SQL.matchAll(
    /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?"?(\w+)"?\s*\(([\s\S]*?)\n\s*\);/g,
  )) {
    const child = m[1];
    for (const r of m[2].matchAll(/REFERENCES\s+(?:public\.)?"?(\w+)"?/g)) {
      out.add(`${child}->${r[1]}`);
    }
  }
  // ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... REFERENCES ...
  for (const m of SQL.matchAll(
    /ALTER TABLE\s+(?:ONLY\s+)?(?:public\.)?"?(\w+)"?[\s\S]{0,400}?FOREIGN KEY[\s\S]{0,160}?REFERENCES\s+(?:public\.)?"?(\w+)"?/g,
  )) {
    out.add(`${m[1]}->${m[2]}`);
  }
  return out;
}

/** Every `.from("x").select("… employees(…) …")` in the server-fn layer. */
function bareEmployeeEmbeds(): { module: string; table: string }[] {
  const out: { module: string; table: string }[] = [];
  for (const file of readdirSync(LIB)) {
    if (!/\.(functions|server)\.ts$/.test(file)) continue;
    const src = readFileSync(join(LIB, file), "utf8");
    for (const m of src.matchAll(
      /\.from\(\s*"([a-z0-9_]+)"\s*\)(?:\s*\.\w+\([^)]*\))*?\s*\.select\(\s*(["`])([\s\S]*?)\2/g,
    )) {
      const table = m[1];
      if (table === "employees") continue;
      // Bare `employees(` — not preceded by ":" (alias) or "!" (hint).
      if (/(?:^|,)\s*employees\s*\(/.test(m[3])) out.push({ module: file, table });
    }
  }
  return out;
}

describe("every employees embed has a foreign key behind it", () => {
  const FKS = foreignKeys();
  const embeds = bareEmployeeEmbeds();

  it("finds the embeds to check", () => {
    expect(embeds.length).toBeGreaterThan(3);
  });

  it("reads a plausible foreign-key graph out of the migrations", () => {
    expect(FKS.size).toBeGreaterThan(100);
    // A key added by 20260906092000, which is the reason this file exists.
    expect(FKS.has("training_enrollments->employees")).toBe(true);
  });

  it("no table embeds employees without a key to employees", () => {
    const broken = [
      ...new Set(
        embeds
          .filter((e) => !FKS.has(`${e.table}->employees`))
          .map((e) => `${e.module} → ${e.table}`),
      ),
    ];
    expect(
      broken,
      "These select an `employees(...)` embed from a table with no foreign key " +
        "to employees. PostgREST cannot resolve the relationship, so the query " +
        "fails with PGRST200 — and because the caller renders `rows ?? []`, the " +
        "page shows an empty list rather than an error. Add the key in a " +
        "migration (see 20260906093000 for the shape, including the NOT VALID " +
        "escape when legacy rows would block it).",
    ).toEqual([]);
  });

  it("the leave request embed has both of the keys it needs", () => {
    // requests-inbox selects employees(...) AND leave_types(...) in one go, so
    // one missing key hides the whole source. Adding only the first left the
    // inbox exactly as empty as before.
    expect(FKS.has("leave_requests->employees")).toBe(true);
    expect(FKS.has("leave_requests->leave_types")).toBe(true);
  });
});
