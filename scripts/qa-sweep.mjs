#!/usr/bin/env node
/**
 * QA sweep — signs in as each seeded demo role and walks every navigation
 * destination, recording what a real user would actually hit.
 *
 * This exists because the bugs found in this codebase were not the kind a unit
 * test catches. A page with no <AppShell> renders fine and returns 200; a server
 * fn called once per navigation is invisible until you count them; an empty
 * dropdown looks identical whether the data is missing, the tenant is wrong, or
 * the query is unscoped. All of those need a browser, a real session, and a role.
 *
 * It is a REPORT, not a pass/fail test — the point is a diffable snapshot you can
 * re-run next month, not a red build. Anything that must never regress gets
 * promoted into tests/ instead.
 *
 *   node scripts/qa-sweep.mjs                  # 3 representative roles
 *   node scripts/qa-sweep.mjs --all-roles      # all 8
 *   node scripts/qa-sweep.mjs --limit 20       # first N routes per role
 *   node scripts/qa-sweep.mjs --base http://localhost:8080
 *
 * Requires the dev server running and the demo seed applied
 * (bun --env-file=.env run scripts/demo-seed.ts).
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const BASE = arg("base", "http://localhost:8080");
const LIMIT = Number(arg("limit", "0")) || Infinity;
const ALL_ROLES = argv.includes("--all-roles");
const PASSWORD = "DemoPassw0rd!23";
/**
 * Budget for the app shell to mount. Spent in full only on pages that never
 * render it, since the wait resolves as soon as the sidebar appears.
 */
const SETTLE_MS = Number(arg("settle", "9000"));

/**
 * Chrome-less by design, so absence of a sidebar here is not a finding:
 * /auth is public, and /org/setup is reachable before the user has a tenant
 * (a full org nav there would offer links that all bounce back).
 */
const NO_CHROME_EXPECTED = new Set(["/auth", "/signup", "/welcome", "/suspended", "/org/setup"]);

/** Seeded accounts, from scripts/demo-seed.ts. */
const ACCOUNTS = [
  { email: "ella.acme@demo.hrppl.test", role: "employee", core: true },
  { email: "alice.acme@demo.hrppl.test", role: "org_admin", core: true },
  { email: "sam.platform@demo.hrppl.test", role: "super_admin", core: true },
  { email: "mia.acme@demo.hrppl.test", role: "manager" },
  { email: "hana.acme@demo.hrppl.test", role: "hr" },
  { email: "fred.acme@demo.hrppl.test", role: "finance" },
  { email: "bruce.acme@demo.hrppl.test", role: "branch_admin" },
  { email: "rita.platform@demo.hrppl.test", role: "regional_admin" },
];

/**
 * Destinations parsed from the nav itself, so the sweep cannot drift out of step
 * with it. Dynamic segments are skipped — there is no meaningful id to supply.
 */
function navDestinations() {
  const src = readFileSync(join(ROOT, "src/components/AppShell.tsx"), "utf8");
  const found = [...src.matchAll(/to:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
  return [...new Set(found)].filter((p) => !p.includes("$")).sort();
}

/** Decode the base64 segment TanStack uses for server-fn URLs. */
function serverFnName(pathname) {
  const m = pathname.match(/_serverFn\/([^/?]+)/);
  if (!m) return null;
  try {
    const j = JSON.parse(Buffer.from(m[1], "base64").toString());
    return (j.export || "").replace("_createServerFn_handler", "") || m[1];
  } catch {
    return m[1];
  }
}

async function signIn(page, email) {
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).first().pressSequentially(email, { delay: 6 });
  await page.getByLabel(/password/i).first().pressSequentially(PASSWORD, { delay: 6 });
  await page.getByRole("button", { name: /sign in/i }).first().click();
  // Generous and flat. Racing the post-login redirect with waitForURL produced
  // false failures more often than it saved time.
  await page.waitForTimeout(8000);
  return !page.url().includes("/auth");
}

const OUT = join(ROOT, "docs/qa-sweep-report.md");

/**
 * Flush after every role rather than once at the end.
 *
 * A full run is 8 roles x ~100 routes and takes the better part of an hour.
 * Writing only on completion meant no partial results, nothing to look at while
 * it ran, and everything lost if it died on role seven.
 */
function flush(lines) {
  writeFileSync(OUT, lines.join("\n"), "utf8");
}

async function sweepRole(browser, account, routes) {
  const page = await (await browser.newContext()).newPage();
  const consoleErrors = [];
  const fnCalls = {};
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => consoleErrors.push(`[pageerror] ${String(e).slice(0, 200)}`));
  page.on("request", (r) => {
    const n = serverFnName(new URL(r.url()).pathname);
    if (n) fnCalls[n] = (fnCalls[n] || 0) + 1;
  });

  const rows = [];
  if (!(await signIn(page, account.email))) {
    await page.close();
    return { rows, fnCalls, signInFailed: true };
  }

  for (const route of routes) {
    const before = consoleErrors.length;
    let status = 0;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = resp?.status() ?? 0;
    } catch {
      status = -1;
    }
    // Wait for the shell to actually mount rather than sleeping a fixed amount.
    //
    // A flat sleep is wrong in both directions: too long and a full sweep takes
    // an hour, too short and every page is reported as "no chrome" because it
    // simply had not rendered yet. Lowering it from 2500ms to 1200ms produced
    // 102 false findings in a single run — the sidebar was real, the sample was
    // early.
    //
    // waitForSelector returns the instant chrome appears (so present pages cost
    // nothing) and only spends the full budget when it is genuinely absent,
    // which is exactly the case worth paying for.
    let chrome = true;
    try {
      await page.waitForSelector('[data-sidebar="sidebar"]', { timeout: SETTLE_MS });
    } catch {
      chrome = false;
    }
    // Give a redirect a moment to settle so `landed` is accurate.
    await page.waitForTimeout(400);
    const landed = new URL(page.url()).pathname;
    const h1 = (await page.locator("h1").first().innerText().catch(() => "")) || "";
    rows.push({
      route,
      status,
      landed: landed === route ? "" : landed,
      chrome,
      heading: h1.slice(0, 40).replace(/\s+/g, " "),
      errors: consoleErrors.length - before,
    });
  }
  await page.close();
  return { rows, fnCalls, signInFailed: false };
}

const routes = navDestinations().slice(0, LIMIT);
const accounts = ALL_ROLES ? ACCOUNTS : ACCOUNTS.filter((a) => a.core);
console.log(`QA sweep — ${accounts.length} role(s) x ${routes.length} route(s) against ${BASE}\n`);

const browser = await chromium.launch();
const report = [];
report.push("# QA sweep report", "");
report.push(`Generated ${new Date().toISOString()} against \`${BASE}\`.`, "");
report.push(
  "Produced by `scripts/qa-sweep.mjs`. Each row is one navigation as a signed-in",
  "role. **chrome** is whether the sidebar rendered — a page without it has no",
  "navigation at all. **landed** is filled in only when the gate redirected",
  "elsewhere, which is expected for routes a role may not see.",
  "",
);

let totalMissingChrome = 0;
let totalErrors = 0;

for (const account of accounts) {
  process.stdout.write(`  ${account.role.padEnd(15)} ${account.email} ... `);
  const { rows, fnCalls, signInFailed } = await sweepRole(browser, account, routes);
  if (signInFailed) {
    console.log("SIGN-IN FAILED");
    report.push(`## ${account.role} — \`${account.email}\``, "", "**Sign-in failed.**", "");
    continue;
  }
  const noChrome = rows.filter(
    (r) => !r.chrome && !r.landed && !NO_CHROME_EXPECTED.has(r.route),
  );
  const errored = rows.filter((r) => r.errors > 0);
  const bad = rows.filter((r) => r.status >= 400 || r.status < 0);
  totalMissingChrome += noChrome.length;
  totalErrors += errored.length;
  console.log(
    `${rows.length} routes | ${noChrome.length} no-chrome | ${errored.length} with errors | ${bad.length} bad status`,
  );

  report.push(`## ${account.role} — \`${account.email}\``, "");
  report.push(
    `${rows.length} routes visited · **${noChrome.length}** without chrome · ` +
      `**${errored.length}** with console errors · **${bad.length}** non-2xx.`,
    "",
  );

  const flagged = [...new Set([...noChrome, ...errored, ...bad])];
  if (flagged.length) {
    report.push("| route | status | chrome | heading | console errors |", "|---|---|---|---|---|");
    for (const r of flagged) {
      report.push(
        `| \`${r.route}\` | ${r.status} | ${r.chrome ? "yes" : "**NO**"} | ${r.heading || "—"} | ${r.errors} |`,
      );
    }
    report.push("");
  } else {
    report.push("No issues found.", "");
  }

  flush(report);

  // Server-fn counts, with a caveat that matters for reading them.
  //
  // This sweep navigates with page.goto(), i.e. a FULL PAGE LOAD each time. That
  // tears down the QueryClient, so a fn appearing once per route here is normal
  // and says nothing about caching — a cached fn still refetches on a cold
  // document. Client-side (SPA) navigation is where the cache does its work and
  // is measured separately.
  //
  // What this section IS good for: spotting a fn called MORE than once per page
  // load, which means duplicate callers on the same screen.
  const perLoad = Object.entries(fnCalls)
    .filter(([, n]) => n > rows.length)
    .sort((a, b) => b[1] - a[1]);
  if (perLoad.length) {
    report.push(
      `<details><summary>Server fns called more than once per page load (${rows.length} loads)</summary>`,
      "",
      "| server fn | calls | per load |",
      "|---|---|---|",
      ...perLoad.map(([n, c]) => `| \`${n}\` | ${c} | ${(c / rows.length).toFixed(1)} |`),
      "",
      "</details>",
      "",
    );
  }
  flush(report);
}

await browser.close();

report.push("---", "");
report.push(
  `**Totals:** ${totalMissingChrome} route/role combinations without chrome, ` +
    `${totalErrors} with console errors.`,
  "",
);

const out = join(ROOT, "docs/qa-sweep-report.md");
writeFileSync(out, report.join("\n"), "utf8");
console.log(`\nReport written to ${out}`);
console.log(`Totals: ${totalMissingChrome} no-chrome, ${totalErrors} with console errors`);
