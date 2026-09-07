import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Storage buckets must exist in a migration, not just in someone's dashboard.
 *
 * The gap was narrow: the RLS policies on storage.objects were in migrations
 * all along, but the storage.buckets ROWS were not — they had been created by
 * hand in the old project. A rebuilt project therefore got every access rule
 * and no bucket, and every upload failed with bucket-not-found while the
 * policies sat there looking correct.
 *
 * The second thing this file guards is subtler and was a live mistake: an
 * earlier draft of the migration also added four tenant-scoped policies.
 * Postgres RLS policies are PERMISSIVE and combine with OR, so adding a
 * tenant-wide policy next to the existing owner-scoped ones did not tighten
 * anything — it widened it. Hence `adds no policies of its own` below.
 */

const root = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

const SRC = walk(join(root, "src"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const MIGRATIONS_DIR = join(root, "supabase/migrations");
const BUCKETS_SQL = readFileSync(
  join(MIGRATIONS_DIR, "20260820090000_storage_buckets.sql"),
  "utf8",
);
/**
 * Every migration, concatenated. A bucket does not have to live in the file
 * above: `training-content` arrived with the W6 content layer in its own
 * migration, which is the normal way a new bucket appears. Reading only the
 * one file made this test fail for a bucket that WAS in a migration — the
 * check has to follow the rule ("created by a migration"), not the file that
 * happened to hold the first six.
 */
const ALL_MIGRATIONS = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
  .join("\n");

/**
 * Buckets the application actually addresses. Matches `.storage.from("x")`
 * only — a bare `.from("x")` is a PostgREST table, which is how `assets` was
 * initially mistaken for a bucket. \s* spans the newline in the common
 * `admin.storage\n  .from("payslips")` formatting.
 */
function bucketsUsedInCode(): Set<string> {
  const found = new Set<string>();
  for (const m of SRC.matchAll(/\.storage\s*\.from\(\s*["'`]([a-z0-9-]+)["'`]\s*\)/g)) {
    found.add(m[1]);
  }
  return found;
}

/** Bucket ids in the INSERT INTO storage.buckets. */
function bucketsInMigration(): Set<string> {
  const found = new Set<string>();
  let from = ALL_MIGRATIONS.indexOf("INSERT INTO storage.buckets");
  while (from !== -1) {
    const end = ALL_MIGRATIONS.indexOf("ON CONFLICT", from);
    const block = ALL_MIGRATIONS.slice(from, end === -1 ? undefined : end);
    for (const m of block.matchAll(/\(\s*'([a-z0-9-]+)'\s*,/g)) found.add(m[1]);
    from = ALL_MIGRATIONS.indexOf("INSERT INTO storage.buckets", from + 1);
  }
  return found;
}

describe("every bucket the app uses is created by a migration", () => {
  it("has no bucket referenced in code but missing from SQL", () => {
    const missing = [...bucketsUsedInCode()].filter((b) => !bucketsInMigration().has(b));
    expect(missing).toEqual([]);
  });

  it("creates no bucket the code never touches", () => {
    // Not a correctness bug, but an unused bucket is usually a rename that
    // left the old one behind.
    const unused = [...bucketsInMigration()].filter((b) => !bucketsUsedInCode().has(b));
    expect(unused).toEqual([]);
  });

  it("finds the seven known buckets and nothing else", () => {
    expect([...bucketsUsedInCode()].sort()).toEqual([
      "candidate-resumes",
      "disciplinary-files",
      "employee-documents",
      "expense-receipts",
      "medical-files",
      "payslips",
      // W6 · lesson video and documents. Private, mime-allow-listed, and read
      // back only through a signed URL minted after an enrollment check.
      "training-content",
    ]);
  });
});

describe("bucket configuration", () => {
  const block = BUCKETS_SQL.slice(
    BUCKETS_SQL.indexOf("INSERT INTO storage.buckets"),
    BUCKETS_SQL.indexOf("ON CONFLICT"),
  );

  it("makes every bucket private", () => {
    // Every read reaches the client through a signed URL. A public bucket
    // would make payslips and medical files enumerable by URL.
    expect(block).not.toMatch(/,\s*true\s*,/);
    expect([...block.matchAll(/,\s*false\s*,/g)]).toHaveLength(6);
  });

  it("is idempotent so a replay does not fail", () => {
    expect(BUCKETS_SQL).toMatch(/ON CONFLICT \(id\) DO NOTHING/);
  });
});

describe("the buckets migration does not touch access control", () => {
  it("adds no policies of its own", () => {
    // The load-bearing assertion. RLS policies are permissive and OR together,
    // so a tenant-scoped policy added here would widen the owner-scoped ones
    // that already exist rather than complement them.
    expect(BUCKETS_SQL).not.toMatch(/CREATE POLICY/i);
  });

  it("adds no helper function that only a policy would need", () => {
    expect(BUCKETS_SQL).not.toMatch(/CREATE (OR REPLACE )?FUNCTION/i);
  });

  it("leaves the pre-existing storage policies as the only ones", () => {
    // They live in the earlier migrations and are tighter than tenant scope.
    // If this count changes, someone added storage access control somewhere
    // new — check it is RESTRICTIVE, or that it genuinely belongs.
    const all = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
      .join("\n");

    const storagePolicies = [
      ...all.matchAll(/CREATE POLICY\s+"([^"]+)"\s+ON\s+storage\.objects/gi),
    ].map((m) => m[1]);

    expect(storagePolicies.length).toBeGreaterThan(20);
    // The four that were briefly added here and then removed.
    for (const gone of [
      "tenant members use employee-documents",
      "tenant members use expense-receipts",
      "admin roles use medical-files",
      "case managers use disciplinary-files",
    ]) {
      expect(storagePolicies, `${gone} was dropped as over-permissive`).not.toContain(gone);
    }
  });
});
