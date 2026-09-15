import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { globSync } from "glob";

/**
 * The fifth gate-drift axis: a page's feature key vs the server functions it
 * calls on mount.
 *
 * ---------------------------------------------------------------------------
 * Why this is the one that keeps getting through
 * ---------------------------------------------------------------------------
 *
 * Wave 5 converged three ways a page's permission could disagree with itself —
 * the nav row, the route gate, and an inline check. Wave 6 closed the fourth,
 * the RLS policy, for training. **Nothing checked the server functions**, and
 * both X-07 and its twin in the documents module lived there:
 *
 *   - `/org/training` admitted hr and branch_admin; every write in
 *     `training.functions.ts` carried no role check and leaned on RLS, which
 *     admitted a different set.
 *   - `/org/documents` was offered to six roles; fourteen of its twenty-one
 *     server functions admitted two.
 *
 * Both rendered as **emptiness, not as an error** — the page loaded, the table
 * drew its "nothing here yet" row, and the role concluded the organisation had
 * no data. `docs/remaining-work.md` asked for exactly this test and called it
 * "the axis with no coverage".
 *
 * ---------------------------------------------------------------------------
 * Why it checks only the functions called ON MOUNT
 * ---------------------------------------------------------------------------
 *
 * A page may legitimately admit six roles to *read* and three to *write* —
 * `/org/documents/templates` does precisely that, deliberately. Flagging those
 * produces 143 findings, almost all correct-by-design, which is how a check
 * stops being read.
 *
 * The defect has a narrower shape: a function the page calls **unconditionally
 * as it loads** — inside `useQuery`, `useEffect` or a `queryFn` — that refuses a
 * role the page's own key admits. A write behind a button that refuses produces
 * an error toast, which is visible and actionable. A read that refuses produces
 * an empty table, which is neither. Filtering to on-mount reads takes the same
 * analysis from 143 findings to 24, and every one of the 24 that has been
 * hand-checked is real.
 *
 * ---------------------------------------------------------------------------
 * What it cannot see
 * ---------------------------------------------------------------------------
 *
 * Role sets are recovered from source, so a guard has to *say* which roles it
 * admits somewhere this can find: a literal, a `*-guard.ts` export, a named set
 * in `rbac.ts`, or an `is_hr`-style RPC. A function whose gate this cannot
 * resolve is reported as unknown and **skipped, not passed** — the count is
 * asserted below so that a refactor which makes everything unresolvable fails
 * loudly instead of turning this file green.
 */

const ROOT = process.cwd();

const APP_ROLES = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
] as const;

/**
 * Role names a piece of code uses to make an authorization DECISION.
 *
 * A `role` filter counts only when the same statement also narrows to the
 * CALLER. `assertHrOrAdmin` reads `user_roles` where `user_id = userId` and
 * throws if nothing comes back — that is a guard. `discipline.listHrUsers`
 * reads `user_roles` for a whole tenant to populate an assignment dropdown —
 * that is data, and it gates nobody.
 *
 * Without the distinction this test reported a page as locking HR out of a
 * function that has no role check at all, which would have been "fixed" by
 * widening a filter and quietly changing what the dropdown lists.
 */
function rolesIn(raw: string): Set<string> {
  const text = raw
    .split(";")
    .map((stmt) =>
      /\brole\b/.test(stmt) && !/\buserId\b|\b_user_id\b|auth\.uid/.test(stmt)
        ? stmt
            .replace(/\.in\(\s*["']role["']\s*,[\s\S]*?\)/g, "")
            .replace(/\.eq\(\s*["']role["']\s*,[^)]*\)/g, "")
        : stmt,
    )
    .join(";");
  const found = new Set<string>();
  for (const r of APP_ROLES) {
    if (new RegExp(`["']${r}["']`).test(text)) found.add(r);
  }
  for (const [rpc, role] of [
    ["is_hr", "hr"],
    ["is_finance", "finance"],
    ["is_branch_admin", "branch_admin"],
    ["is_org_admin", "org_admin"],
  ] as const) {
    if (text.includes(rpc)) found.add(role);
  }
  return found;
}

/** Text of each brace-delimited block introduced by `pattern` (capture 1 = name). */
function blocks(src: string, pattern: RegExp): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of src.matchAll(pattern)) {
    const open = src.indexOf("{", m.index!);
    if (open < 0) continue;
    let depth = 0;
    let j = open;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = src.slice(m.index!, j + 1);
    out.set(m[1], (out.get(m[1]) ?? "") + "\n" + body);
  }
  return out;
}

/** Symbol → role set, for everything that declares one centrally. */
function buildGuardTable(): Map<string, Set<string>> {
  const table = new Map<string, Set<string>>();
  for (const rel of globSync("src/lib/*-guard.ts", { cwd: ROOT })) {
    const gs = readFileSync(join(ROOT, rel), "utf8");
    const consts = new Map<string, Set<string>>();
    for (const m of gs.matchAll(/export const (\w+)\s*=\s*\[([\s\S]*?)\]\s*as const/g)) {
      consts.set(m[1], rolesIn(m[2]));
    }
    // `[...OTHER_SET, "finance"]` — one hop is enough for how these are written.
    for (const [name] of consts) {
      const m = new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`).exec(gs);
      if (!m) continue;
      for (const sp of m[1].matchAll(/\.\.\.(\w+)/g)) {
        const other = consts.get(sp[1]);
        if (other) for (const r of other) consts.get(name)!.add(r);
      }
    }
    for (const [fn, body] of blocks(gs, /export (?:async )?function (\w+)/g)) {
      const roles = rolesIn(body);
      for (const [cname, croles] of consts) {
        if (new RegExp(`\\b${cname}\\b`).test(body)) for (const r of croles) roles.add(r);
      }
      if (roles.size) table.set(fn, roles);
    }
    for (const [c, r] of consts) table.set(c, r);
  }
  const rbac = readFileSync(join(ROOT, "src/lib/rbac.ts"), "utf8");
  for (const m of rbac.matchAll(
    /export const (\w+):\s*ReadonlySet<AppRole>\s*=\s*SET\(([^)]*)\)/g,
  )) {
    table.set(m[1], rolesIn(m[2]));
  }
  return table;
}

function buildMatrix(): Map<string, Set<string>> {
  const rbac = readFileSync(join(ROOT, "src/lib/rbac.ts"), "utf8");
  const body = rbac.slice(rbac.indexOf("const MATRIX"));
  const out = new Map<string, Set<string>>();
  for (const m of body.matchAll(/"([\w.]+)":\s*SET\(([^)]*)\)/g)) out.set(m[1], rolesIn(m[2]));
  return out;
}

const GUARDS = buildGuardTable();
const MATRIX = buildMatrix();

const moduleCache = new Map<string, string | null>();
function moduleSource(mod: string): string | null {
  if (!moduleCache.has(mod)) {
    try {
      moduleCache.set(mod, readFileSync(join(ROOT, `src/lib/${mod}.functions.ts`), "utf8"));
    } catch {
      moduleCache.set(mod, null);
    }
  }
  return moduleCache.get(mod)!;
}

/** Roles a server fn admits, or null when its gate cannot be resolved. */
function serverFnRoles(mod: string, name: string): Set<string> | null {
  const src = moduleSource(mod);
  if (!src) return null;
  const start = src.indexOf(`export const ${name} = createServerFn`);
  if (start < 0) return null;
  const next = src.indexOf("\nexport const ", start + 1);
  const body = next < 0 ? src.slice(start) : src.slice(start, next);

  const found = rolesIn(body);
  // Module-local guard helpers — `assertOrgAdmin`, `getCtx`, and friends.
  for (const [helper, hbody] of blocks(src, /(?:async\s+)?function (\w+)\s*\(/g)) {
    if (new RegExp(`\\b${helper}\\s*\\(`).test(body)) for (const r of rolesIn(hbody)) found.add(r);
  }
  for (const [sym, roles] of GUARDS) {
    if (new RegExp(`\\b${sym}\\b`).test(body)) for (const r of roles) found.add(r);
  }
  return found.size ? found : null;
}

/**
 * Identifiers on a page whose value is derived from the caller's roles —
 * `const canSeeAccessAudit = roles.includes("org_admin") || …`, `const canEdit =
 * can("org.x", roles)`. A query gated on one of these is not offered to a role
 * that cannot use it, so it is not the defect this test looks for.
 */
function roleDerivedIdentifiers(pageSrc: string): string[] {
  const out: string[] = [];
  for (const m of pageSrc.matchAll(/const\s+(\w+)\s*=\s*([^;\n]*(?:\n[^;\n]*){0,3});/g)) {
    if (/\broles\b|\bcan\(/.test(m[2])) out.push(m[1]);
  }
  return out;
}

/** Is `fn` invoked as the page loads, rather than from a button? */
function calledOnMount(pageSrc: string, fn: string): boolean {
  const roleDerived = roleDerivedIdentifiers(pageSrc);
  let alias = fn;
  const bound = new RegExp(`const\\s+(\\w+)\\s*=\\s*useServerFn\\(\\s*${fn}\\s*\\)`).exec(pageSrc);
  if (bound) alias = bound[1];
  const KINDS: Array<[RegExp, boolean]> = [
    [/useQuery\(/g, false],
    [/useEffect\(/g, false],
    [/queryFn/g, true],
  ];
  for (const [kind, isQueryFn] of KINDS) {
    for (const m of pageSrc.matchAll(kind)) {
      const open = pageSrc.indexOf("{", m.index!);
      if (open < 0) continue;
      let depth = 0;
      let j = open;
      for (; j < pageSrc.length; j++) {
        if (pageSrc[j] === "{") depth++;
        else if (pageSrc[j] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      const block = pageSrc.slice(m.index!, j + 1);
      if (!new RegExp(`\\b${alias}\\s*\\(`).test(block)) continue;
      // A block started at `queryFn` ENDS before its sibling `enabled:`, so read
      // on its own it makes a correctly role-gated panel look unconditional.
      // When the enclosing useQuery is right there it is already being scanned
      // with the `enabled` attached, so defer to that pass rather than judging
      // on a half-read block. `queryFn` is still scanned where it stands alone.
      if (isQueryFn) {
        const enclosing = pageSrc.lastIndexOf("useQuery(", m.index!);
        if (enclosing >= 0 && m.index! - enclosing < 600) continue;
      }
      // A call gated on a role-derived condition is not offered to the roles the
      // fn refuses, which is a correct answer rather than a gap. Both shapes
      // count: `enabled: … && canSeeAccessAudit` on a useQuery
      // (/admin/employees/$id's access-audit panel) and an early
      // `if (!remindersFor || !isAdmin) return;` in a useEffect
      // (/org/performance's reminder-schedule preview).
      const gated = roleDerived.some((id) =>
        new RegExp(`(?:enabled:[^,\\n]*|[!&|(]\\s*)\\b${id}\\b`).test(block),
      );
      if (gated) continue;
      return true;
    }
  }
  return false;
}

type Finding = { page: string; feature: string; fn: string; missing: string[] };

function analyse(): { findings: Finding[]; resolved: number; unresolved: number } {
  const findings: Finding[] = [];
  let resolved = 0;
  let unresolved = 0;
  for (const rel of globSync("src/routes/**/*.tsx", { cwd: ROOT }).sort()) {
    const src = readFileSync(join(ROOT, rel), "utf8");
    const key =
      /<AdminGate\s+feature="([^"]+)"/.exec(src) ?? /can\(\s*"([^"]+)"\s*,\s*roles/.exec(src);
    if (!key) continue;
    const pageRoles = MATRIX.get(key[1]);
    if (!pageRoles) continue;
    for (const im of src.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*"@\/lib\/([\w.-]+)\.functions"/gs,
    )) {
      const mod = im[2];
      for (const raw of im[1].split(",")) {
        const fn = raw.trim().split(" as ")[0].trim();
        if (!fn || fn.startsWith("type")) continue;
        if (!calledOnMount(src, fn)) continue;
        const fnRoles = serverFnRoles(mod, fn);
        // An unresolvable gate, or one that does not even admit super_admin,
        // is not something this analysis can reason about.
        if (!fnRoles || !fnRoles.has("super_admin")) {
          unresolved++;
          continue;
        }
        resolved++;
        const missing = [...pageRoles].filter((r) => !fnRoles.has(r)).sort();
        if (missing.length) {
          findings.push({
            page: rel.split("\\").join("/"),
            feature: key[1],
            fn: `${mod}.${fn}`,
            missing,
          });
        }
      }
    }
  }
  return { findings, resolved, unresolved };
}

const { findings, resolved, unresolved } = analyse();

/**
 * **Empty as of 2026-09-15.** All twenty-four gaps this test found on the day it
 * was written are closed. The list may only shrink, and this entry exists so
 * that "empty" is a recorded state rather than an unwritten one.
 *
 * Four of the five closed last were not oversights — `timeline.functions.ts`
 * and `teams.functions.ts` both stated, in comments beside their guards, that
 * finance and branch_admin were deliberately excluded because "finance holds
 * read-only access to employees and branch_admin is scoped to a branch, neither
 * of which matches what these endpoints do".
 *
 * Both halves of that were true, so the endpoints were changed to fit the roles
 * rather than the guards widened to ignore it: `branch_admin` is admitted with
 * the ROWS narrowed to the branches they administer, and `finance` is admitted
 * tenant-wide because "read-only" was never an argument against a read. See
 * `resolveBranchScope` in tenant-scope.ts.
 *
 * If you are adding an entry here, read the failure message first: the fix is
 * almost never to add an entry.
 */
const KNOWN_GAPS = new Set<string>([]);

const key = (f: Finding) => `${f.page.split("/").pop()} :: ${f.fn} :: ${f.missing.join(",")}`;

describe("a page's feature key and the server fns it loads with agree", () => {
  it("the analysis can actually resolve gates", () => {
    // If a refactor moved every guard somewhere this cannot read, the whole
    // file would pass by finding nothing — the failure mode Wave 5 named.
    // 20 at the time of writing: on-mount call sites whose gate resolves AND
    // admits super_admin, which is the population this can reason about. The
    // floor is deliberately well below it — this guards against the analysis
    // going BLIND, not against the number drifting, and a floor set near the
    // current value just fails on every unrelated change.
    expect(resolved, "no server-fn gate could be resolved at all").toBeGreaterThan(12);
    expect(GUARDS.size).toBeGreaterThan(5);
    expect(MATRIX.size).toBeGreaterThan(50);
  });

  it("every finding is a real page/function pair, not a parse artefact", () => {
    // Unresolvable gates are skipped, never counted as passing — so assert the
    // findings themselves are well-formed rather than asserting on a count that
    // would only ever be trivially true.
    expect(unresolved).toBeGreaterThanOrEqual(0);
    for (const f of findings) {
      expect(f.missing.length, `${f.page} ${f.fn}`).toBeGreaterThan(0);
      expect(MATRIX.has(f.feature)).toBe(true);
      expect(f.fn).toMatch(/^[\w.-]+\.\w+$/);
    }
  });

  it("no NEW page loads with a server fn that refuses a role it admits", () => {
    const fresh = findings.map(key).filter((k) => !KNOWN_GAPS.has(k));
    expect(
      fresh,
      "This page is offered to a role whose first read then refuses them, so " +
        "that role sees an empty surface instead of a refusal — X-07's shape. " +
        "Either widen the server fn's guard, or narrow the feature key. Do not " +
        "add to KNOWN_GAPS to make this pass.",
    ).toEqual([]);
  });

  it("the known-gap list only shrinks", () => {
    const live = new Set(findings.map(key));
    const fixed = [...KNOWN_GAPS].filter((k) => !live.has(k));
    expect(
      fixed,
      "These are recorded as gaps but no longer are. Delete them from " +
        "KNOWN_GAPS so the list keeps meaning what it says.",
    ).toEqual([]);
  });
});
