#!/usr/bin/env node
/**
 * Apply a migration to the linked Supabase project.
 *
 * There is no Supabase CLI in this repo and `supabase/migrations/` is
 * append-only with ~194 files, so migrations have been applied by hand through
 * the Management API. This makes that repeatable.
 *
 *   node scripts/apply-migration.mjs 20260823060000_attendance_time_geo_and_wfh.sql
 *   node scripts/apply-migration.mjs --types          # regenerate types.ts
 *   node scripts/apply-migration.mjs --check          # verify credentials only
 *   node scripts/apply-migration.mjs --sql "select 1" # ad-hoc query
 *
 * `SUPABASE_ACCESS_TOKEN` is a *personal access token* from
 * https://supabase.com/dashboard/account/tokens — not the anon key, not the
 * service-role key. It is read from `.env`, which is gitignored and untracked.
 *
 * Treat it as the most powerful credential in the project: it is account-wide,
 * grants full control of every Supabase project on the account, and unlike the
 * service-role key it is not scoped to one database. If `.env` is ever shared,
 * pasted, or committed, rotate it at the URL above.
 *
 * The project ref comes from SUPABASE_PROJECT_ID in .env.
 *
 * Statements run as `postgres`, so DDL and RLS policy changes both work. The
 * endpoint runs the whole body as one request; it is not transactional across
 * statements, so a migration that fails halfway leaves the earlier statements
 * applied. Every migration in this repo is written with IF NOT EXISTS / DROP
 * POLICY IF EXISTS guards for exactly that reason — re-running is the recovery.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);

function envFromDotEnv(name) {
  if (process.env[name]) return process.env[name];
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return undefined;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "").trim();
  }
  return undefined;
}

const TOKEN = envFromDotEnv("SUPABASE_ACCESS_TOKEN");
const PROJECT = envFromDotEnv("SUPABASE_PROJECT_ID");

if (!TOKEN) {
  console.error(
    "SUPABASE_ACCESS_TOKEN is not set.\n\n" +
      "Create a personal access token at https://supabase.com/dashboard/account/tokens,\n" +
      "then either put it in .env (which is gitignored) or pass it per run:\n\n" +
      "  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-migration.mjs <file.sql>\n",
  );
  process.exit(2);
}
if (!PROJECT) {
  console.error("SUPABASE_PROJECT_ID is not set in .env.");
  process.exit(2);
}

async function runSql(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      // The API rejects some default runtime user-agents outright. Sending a
      // conventional one avoids a 403 that looks exactly like a bad token.
      "User-Agent": "curl/8.5.0",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 2000)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Regenerate `src/integrations/supabase/types.ts` from the live schema.
 *
 * The generated file is marked "automatically generated" and CLAUDE.md forbids
 * hand-editing it, so this is the only correct way to teach the codebase about
 * a migration that has just been applied. Run it immediately after applying
 * one — the gap between the two is exactly when `as any` casts breed.
 */
async function regenerateTypes() {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT}/types/typescript?included_schemas=public`,
    {
      headers: { Authorization: `Bearer ${TOKEN}`, "User-Agent": "curl/8.5.0" },
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 2000)}`);
  let types;
  try {
    types = JSON.parse(text).types;
  } catch {
    types = text;
  }
  if (typeof types !== "string" || types.length < 1000) {
    throw new Error(`Unexpected typegen response (${String(types).slice(0, 300)})`);
  }
  const out = join(ROOT, "src/integrations/supabase/types.ts");
  const previous = existsSync(out) ? readFileSync(out, "utf8") : "";
  // Refuse a suspiciously small result rather than truncating a 10k-line file
  // that everything imports.
  if (previous && types.length < previous.length * 0.5) {
    throw new Error(
      `Refusing to write: generated types are ${types.length} bytes against ${previous.length} on disk.`,
    );
  }
  writeFileSync(out, types, "utf8");
  console.log(`Wrote ${out} (${types.length} bytes, was ${previous.length}).`);
}

const sqlFlag = argv.indexOf("--sql");

try {
  if (argv.includes("--types")) {
    await regenerateTypes();
  } else if (argv.includes("--check")) {
    const out = await runSql("select current_user, current_database(), version()");
    console.log("Connected:", JSON.stringify(out, null, 2));
  } else if (sqlFlag >= 0) {
    console.log(JSON.stringify(await runSql(argv[sqlFlag + 1]), null, 2));
  } else {
    const name = argv[0];
    if (!name) {
      console.error(
        'Usage: node scripts/apply-migration.mjs <migration.sql | path> [--check] [--sql "..."]',
      );
      process.exit(2);
    }
    const path = isAbsolute(name)
      ? name
      : existsSync(join(ROOT, name))
        ? join(ROOT, name)
        : join(ROOT, "supabase/migrations", name);
    if (!existsSync(path)) {
      console.error(`Not found: ${path}`);
      process.exit(2);
    }
    const sql = readFileSync(path, "utf8");
    console.log(`Applying ${path} (${sql.length} bytes) to project ${PROJECT}…`);
    const out = await runSql(sql);
    console.log("OK:", JSON.stringify(out).slice(0, 500));
  }
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
}
