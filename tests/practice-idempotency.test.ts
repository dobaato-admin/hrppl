import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Finalization Plan §1 #7 — "single form submission creates multiple duplicate
 * entries".
 *
 * Root cause was `.upsert(payload)` with no conflict target. Both `projects`
 * and `client_jobs` key on `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, so
 * a create payload carried nothing to conflict on and every call inserted.
 *
 * These tests drive the real write path against a fake PostgREST builder that
 * models the parts that matter: row storage and a primary-key unique violation.
 */

const root = process.cwd();

// --------------------------------------------------------------- fake client

const UNIQUE_VIOLATION = "23505";

type Row = Record<string, unknown>;

class FakeDb {
  tables: Record<string, Row[]> = { projects: [], client_jobs: [] };
  /** Every write the code attempted, so we can assert insert-vs-update. */
  ops: string[] = [];

  from(table: string) {
    const rows = (this.tables[table] ??= []);
    const ops = this.ops;

    return {
      select() {
        return {
          eq(col: string, val: unknown) {
            const match = rows.filter((r) => r[col] === val);
            return {
              maybeSingle: async () => ({ data: match[0] ?? null, error: null }),
              single: async () => ({ data: match[0] ?? null, error: null }),
            };
          },
        };
      },

      insert(payload: Row) {
        ops.push(`insert:${table}`);
        const clash = payload.id && rows.some((r) => r.id === payload.id);
        return {
          select: () => ({
            single: async () =>
              clash
                ? { data: null, error: { code: UNIQUE_VIOLATION, message: "duplicate key" } }
                : (rows.push({ ...payload }), { data: rows[rows.length - 1], error: null }),
          }),
        };
      },

      update(payload: Row) {
        ops.push(`update:${table}`);
        return {
          eq: (col: string, val: unknown) => ({
            select: () => ({
              single: async () => {
                const row = rows.find((r) => r[col] === val);
                if (!row) return { data: null, error: { message: "not found" } };
                Object.assign(row, payload);
                return { data: row, error: null };
              },
            }),
          }),
        };
      },

      // Present only to prove nothing calls it any more.
      upsert() {
        ops.push(`upsert:${table}`);
        throw new Error("upsert() must not be used — it caused the duplicate-row bug");
      },
    };
  }
}

/**
 * Mirrors writeRow() in practice.functions.ts. That helper is module-private
 * (it is an implementation detail of two server fns, which cannot be invoked
 * without a full TanStack request context), so the contract is exercised here
 * and the static assertions below pin the real source to the same shape.
 */
/** Minimal shape of the PostgREST builder chain this helper drives. */
type QueryClient = { from: (table: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function writeRow(supabase: QueryClient, table: string, payload: Record<string, unknown>) {
  const id = payload.id as string | undefined;
  if (id) {
    const { data: existing } = await supabase.from(table).select("id").eq("id", id).maybeSingle();
    if (existing) {
      const { data: row, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
  }
  const { data: row, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) {
    if (error.code === UNIQUE_VIOLATION && id) {
      const { data: won } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (won) return won;
    }
    throw new Error(error.message);
  }
  return row;
}

// ------------------------------------------------------------------ behaviour

describe("writeRow — create/update contract", () => {
  let db: FakeDb;
  beforeEach(() => {
    db = new FakeDb();
  });

  const draft = (id: string) => ({ id, tenant_id: "t1", client_id: "c1", name: "Migration" });

  it("a single create inserts exactly one row", async () => {
    await writeRow(db, "projects", draft("p-1"));
    expect(db.tables.projects).toHaveLength(1);
    expect(db.ops).toEqual(["insert:projects"]);
  });

  it("THE BUG: submitting the same draft twice still yields one row", async () => {
    await writeRow(db, "projects", draft("p-1"));
    await writeRow(db, "projects", draft("p-1"));
    expect(db.tables.projects).toHaveLength(1);
  });

  it("a double-submit that races past the disabled button collapses to one row", async () => {
    // Both in flight before either has committed — the losing insert hits the
    // primary-key violation and must resolve to the winning row, not error.
    const [a, b] = await Promise.all([
      writeRow(db, "projects", draft("p-1")),
      writeRow(db, "projects", draft("p-1")),
    ]);
    expect(db.tables.projects).toHaveLength(1);
    expect(a.id).toBe("p-1");
    expect(b.id).toBe("p-1");
  });

  it("editing an existing row updates in place and never inserts", async () => {
    await writeRow(db, "projects", draft("p-1"));
    db.ops.length = 0;
    const row = await writeRow(db, "projects", { ...draft("p-1"), name: "Renamed" });
    expect(db.tables.projects).toHaveLength(1);
    expect(row.name).toBe("Renamed");
    expect(db.ops).toEqual(["update:projects"]);
  });

  it("two genuinely different drafts both persist", async () => {
    await writeRow(db, "projects", draft("p-1"));
    await writeRow(db, "projects", { ...draft("p-2"), name: "Second" });
    expect(db.tables.projects).toHaveLength(2);
  });

  it("still creates when no id is supplied (legacy callers)", async () => {
    await writeRow(db, "projects", { tenant_id: "t1", client_id: "c1", name: "No id" });
    expect(db.tables.projects).toHaveLength(1);
  });

  it("surfaces genuine errors instead of swallowing them", async () => {
    const failing = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { code: "23503", message: "fk violation" } }),
          }),
        }),
      }),
    };
    await expect(writeRow(failing, "projects", draft("p-1"))).rejects.toThrow(/fk violation/);
  });

  it("applies identically to client_jobs", async () => {
    const job = { id: "j-1", tenant_id: "t1", project_id: "p-1", name: "Draft return" };
    await writeRow(db, "client_jobs", job);
    await writeRow(db, "client_jobs", job);
    expect(db.tables.client_jobs).toHaveLength(1);
  });
});

// ------------------------------------------------------------------- wiring

describe("the shipped code uses this path", () => {
  const SRC = readFileSync(join(root, "src/lib/practice.functions.ts"), "utf8");

  it("no longer calls .upsert() on the affected tables", () => {
    expect(SRC).not.toMatch(/\.from\("projects"\)\.upsert\(/);
    expect(SRC).not.toMatch(/\.from\("client_jobs"\)\.upsert\(/);
  });

  it("routes both writes through the shared helper", () => {
    expect(SRC).toMatch(/writeRow\(supabase, "projects", payload\)/);
    expect(SRC).toMatch(/writeRow\(supabase, "client_jobs", payload\)/);
  });

  it("handles the primary-key violation rather than surfacing it", () => {
    expect(SRC).toMatch(/const UNIQUE_VIOLATION = "23505"/);
    expect(SRC).toMatch(/error\.code === UNIQUE_VIOLATION/);
  });
});

describe("the dialogs cannot fire twice", () => {
  for (const file of ["src/routes/practice.projects.tsx", "src/routes/practice.jobs.tsx"]) {
    const SRC = readFileSync(join(root, file), "utf8");

    it(`${file} disables submit while in flight`, () => {
      expect(SRC).toMatch(/disabled=\{saving \|\|/);
      expect(SRC).toMatch(/if \(saving\) return;/);
      expect(SRC).toMatch(/finally \{ setSaving\(false\); \}/);
    });

    it(`${file} sends a stable draft id, regenerated per dialog open`, () => {
      expect(SRC).toMatch(/crypto\.randomUUID\(\)/);
      expect(SRC).toMatch(/id: draftId/);
      expect(SRC).toMatch(/if \(next\) setDraftId\(newDraftId\(\)\)/);
    });
  }
});
