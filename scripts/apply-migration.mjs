#!/usr/bin/env node
/**
 * Apply a migration to the linked Supabase project.
 *
 * There is no Supabase CLI in this repo and `supabase/migrations/` is
 * append-only with ~194 files, so migrations have been applied by hand through
 * the Management API. This makes that repeatable.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-migration.mjs 20260823060000_attendance_time_geo_and_wfh.sql
 *   node scripts/apply-migration.mjs --check          # verify credentials only
 *   node scripts/apply-migration.mjs --sql "select 1" # ad-hoc query
 *
 * `SUPABASE_ACCESS_TOKEN` is a *personal access token* from
 * https://supabase.com/dashboard/account/tokens — not the anon key, not the
 * service-role key. It is account-wide and grants full control of every project
 * on the account, so keep it out of .env and out of the repo: pass it on the
 * command line for the run that needs it.
 *
 * The project ref comes from SUPABASE_PROJECT_ID in .env.
 *
 * Statements run as `postgres`, so DDL and RLS policy changes both work. The
 * endpoint runs the whole body as one request; it is not transactional across
 * statements, so a migration that fails halfway leaves the earlier statements
 * applied. Every migration in this repo is written with IF NOT EXISTS / DROP
 * POLICY IF EXISTS guards for exactly that reason — re-running is the recovery.
 */
import { readFileSync, existsSync } from "node:fs";
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

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT = envFromDotEnv("SUPABASE_PROJECT_ID");

if (!TOKEN) {
  console.error(
    "SUPABASE_ACCESS_TOKEN is not set.\n\n" +
      "Create a personal access token at https://supabase.com/dashboard/account/tokens\n" +
      "and pass it for this run only:\n\n" +
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

const sqlFlag = argv.indexOf("--sql");

try {
  if (argv.includes("--check")) {
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
