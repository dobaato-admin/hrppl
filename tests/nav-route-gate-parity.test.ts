import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import {
  ADMIN_LAYOUT_ROLES,
  ORG_ADMIN_ONLY,
  ORG_ADMIN_OR_MANAGER,
  ORG_ADMIN_OR_FINANCE,
  PLATFORM_OR_ORG_ADMIN,
  SUPER_ADMIN_ONLY,
  OFFBOARDING_ROLES,
  WFH_APPROVER_ROLES,
  can,
  type AppRole,
} from "../src/lib/rbac";
import { NAV_DESTINATIONS } from "../src/lib/nav-tree";

/**
 * W5 P0-3 — the sidebar and the page must agree about who may be here.
 *
 * ---------------------------------------------------------------------------
 * What this catches, and why it is worth a whole test file
 * ---------------------------------------------------------------------------
 *
 * A nav row renders when `can(feature, roles)` passes. The page mounts when its
 * `<AdminGate>` passes. Those were separate declarations with no mechanical
 * relationship, and 36 of them had drifted:
 *
 *   - 18 rows rendered for roles the route then rejected. `hr` had 13 of them
 *     and `branch_admin` 17 — nearly a third of what each sees in the sidebar
 *     was a link to a refusal. Even a plain `employee` had one
 *     (/admin/holiday-calendar).
 *   - 7 routes admitted roles the sidebar never showed them, so pages built for
 *     `manager` were reachable only by typing the URL — and /admin/medical,
 *     holding confidential medical incidents, admitted `finance`,
 *     `manager` and `regional_admin` against a confidentiality rule that
 *     restricts it to super_admin/org_admin/hr.
 *
 * Nobody noticed because `org_admin` and `super_admin` — the roles a developer
 * signs in as — see a sidebar where every row resolves. The drift is invisible
 * from the seat that builds it.
 *
 * ---------------------------------------------------------------------------
 * The third drift axis this CANNOT see
 * ---------------------------------------------------------------------------
 *
 * A static test reads TypeScript, not Postgres. The nav can also disagree with
 * an RLS policy while agreeing perfectly with the route gate: /org/training's
 * nav key admits `hr` and `branch_admin`, the page carries no AdminGate at all
 * so parity here is vacuously satisfied, and every training RLS policy admits
 * only org_admin/super_admin/manager — so HR opens the page, clicks Assign, and
 * the database refuses. That axis is held by convention instead: the
 * policy-mirroring sets in EXEMPT below each carry a comment naming the policy
 * they mirror, and moving one means moving the policy in the same change.
 */

const root = process.cwd();
const routesDir = join(root, "src/routes");

const NAMED: Record<string, ReadonlySet<AppRole>> = {
  ADMIN_LAYOUT_ROLES,
  ORG_ADMIN_ONLY,
  ORG_ADMIN_OR_MANAGER,
  ORG_ADMIN_OR_FINANCE,
  PLATFORM_OR_ORG_ADMIN,
  SUPER_ADMIN_ONLY,
  OFFBOARDING_ROLES,
  WFH_APPROVER_ROLES,
};

const ALL_ROLES: AppRole[] = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
];

/**
 * Deliberate divergences, each with the reason it is allowed to stand.
 *
 * This list is the pressure valve that keeps the test honest: an intentional
 * difference shows up in the diff as a new entry with a justification, rather
 * than as a silently loosened assertion. Adding a route here without a reason
 * string is not possible — the shape requires one.
 */
const EXEMPT: Record<string, string> = {
  // The gate must equal the `offb tenant admin` RLS policy on
  // offboarding_cases, not the nav's idea of who should see the link. The nav
  // key is narrowed to match in P1 rather than the gate widened, because
  // widening needs a migration.
  "/admin/offboarding":
    "allow={OFFBOARDING_ROLES} mirrors the offboarding_cases RLS policy exactly",
  // Same shape: mirrors the "wfh tenant approver manages" policy in 20260823060000.
  "/admin/wfh": "allow={WFH_APPROVER_ROLES} mirrors the wfh_requests RLS policy exactly",
};

/** Map a route file name to the URL it serves. */
function fileToUrl(file: string): string {
  let p = file.replace(/\.tsx?$/, "");
  if (p.endsWith(".index")) p = p.slice(0, -".index".length);
  return "/" + p.replace(/\./g, "/");
}

/** Every route file, indexed by the URL it serves. */
function routeFileFor(url: string): string | null {
  const files = readdirSync(routesDir).filter((f) => f.endsWith(".tsx"));
  for (const f of files) if (fileToUrl(f) === url) return f;
  // Nested directory routes (api/, etc.) are not nav destinations.
  return null;
}

/**
 * The EFFECTIVE client-side gate for a route, in whatever form it takes.
 *
 * W5 · This originally understood only <AdminGate>. That was the hole that let
 * a real bug through: /org/payroll carries no AdminGate at all — just an inline
 * `canAccess` and a "Forbidden" render — so the parity check skipped it
 * entirely, and `finance` saw "Run payroll" in the sidebar and was refused by
 * the page. Ten more destinations were in the same state, including
 * /org/white-label, which locked out org_admin, and /org/analytics and
 * /org/reports, which each refused three roles the nav offered them to.
 *
 * A page states who may be here in one of four ways. All four are resolved
 * here, because the user does not care which one a page happens to use.
 */
function routeGate(
  file: string,
): { kind: "gate"; roles: Set<AppRole>; how: string } | { kind: "none" } {
  const src = readFileSync(join(routesDir, file), "utf8");

  const byFeature = src.match(/<AdminGate\s+feature="([^"]+)"/);
  if (byFeature) {
    return {
      kind: "gate",
      roles: new Set(ALL_ROLES.filter((r) => can(byFeature[1] as never, [r]))),
      how: `AdminGate feature="${byFeature[1]}"`,
    };
  }

  const byAllow = src.match(/<AdminGate\s+allow=\{([A-Z_]+)\}/);
  if (byAllow) {
    const set = NAMED[byAllow[1]];
    if (set) return { kind: "gate", roles: new Set(set), how: `AdminGate allow={${byAllow[1]}}` };
  }

  // Inline: a `canX` variable plus a refusal (redirect or a Forbidden render).
  const gatingVar = src.match(/const (can[A-Z]\w*)\s*=\s*([\s\S]*?);/);
  const refuses = /navigate\(\{\s*to:\s*"\/dashboard"/.test(src) || /Forbidden/.test(src);
  if (gatingVar && refuses) {
    // Inline the `isX` helper booleans these pages define above the gate.
    let expr = gatingVar[2];
    for (let i = 0; i < 6; i++) {
      const helper = expr.match(/\b(is[A-Z]\w*)\b/);
      if (!helper) break;
      const decl = src.match(new RegExp("const " + helper[1] + "\\s*=\\s*([^;]*);"));
      expr = expr.replace(
        new RegExp("\\b" + helper[1] + "\\b", "g"),
        decl ? `(${decl[1]})` : "false",
      );
    }
    const viaFeature = expr.match(/can\("([^"]+)"/);
    if (viaFeature) {
      return {
        kind: "gate",
        roles: new Set(ALL_ROLES.filter((r) => can(viaFeature[1] as never, [r]))),
        how: `inline ${gatingVar[1]} = can("${viaFeature[1]}")`,
      };
    }
    const listed = [...expr.matchAll(/roles\.includes\((["'`])(\w+)\1\)/g)].map(
      (m) => m[2] as AppRole,
    );
    if (listed.length) {
      return { kind: "gate", roles: new Set(listed), how: `inline ${gatingVar[1]} (hand-rolled)` };
    }
  }

  return { kind: "none" };
}

type Drift = {
  url: string;
  navFeature: string;
  gate: string;
  deadFor: AppRole[];
  hiddenFrom: AppRole[];
};

function findDrift(): Drift[] {
  const out: Drift[] = [];
  for (const d of NAV_DESTINATIONS) {
    if (!d.feature) continue;
    if (EXEMPT[d.to]) continue;
    const file = routeFileFor(d.to);
    if (!file || !existsSync(join(routesDir, file))) continue;

    const gate = routeGate(file);
    // Genuinely ungated pages lean entirely on server-fn and RLS enforcement.
    // That is a different finding, not a parity failure.
    if (gate.kind === "none") continue;
    const routeRoles = gate.roles;

    const navRoles = ALL_ROLES.filter((r) => can(d.feature!, [r]));
    const deadFor = navRoles.filter((r) => !routeRoles.has(r));
    const hiddenFrom = [...routeRoles].filter((r) => !navRoles.includes(r));
    if (deadFor.length || hiddenFrom.length) {
      out.push({ url: d.to, navFeature: d.feature, gate: gate.how, deadFor, hiddenFrom });
    }
  }
  return out;
}

function report(drifts: Drift[]): string {
  return drifts
    .map(
      (d) =>
        `\n  ${d.url}\n` +
        `    nav   ${d.navFeature}\n` +
        `    route ${d.gate}\n` +
        (d.deadFor.length ? `    DEAD LINK for: ${d.deadFor.join(", ")}\n` : "") +
        (d.hiddenFrom.length
          ? `    reachable by URL but hidden from: ${d.hiddenFrom.join(", ")}\n`
          : ""),
    )
    .join("");
}

describe("nav gate and route gate agree", () => {
  it("no nav row renders for a role its route rejects, or hides one the route allows", () => {
    const drifts = findDrift();
    expect(
      drifts,
      drifts.length
        ? `${drifts.length} nav/route gate drifts:\n${report(drifts)}\n` +
            `Fix by pointing the route at the same feature key its nav row uses ` +
            `(<AdminGate feature="…">) and setting that feature's roles once in rbac.ts.`
        : "",
    ).toEqual([]);
  });
});

describe("the exemption list stays small and justified", () => {
  it("every exempt route names the policy its gate mirrors", () => {
    for (const [url, reason] of Object.entries(EXEMPT)) {
      expect(reason.length, `${url} needs a reason`).toBeGreaterThan(20);
      expect(reason, `${url}'s reason should name the RLS policy`).toMatch(/RLS policy/);
    }
  });

  it("exempt routes really do use an explicit allow-set, not a feature", () => {
    // An exemption exists to let a gate mirror a database policy. If the route
    // has moved to `feature` gating, the exemption is stale and should go.
    for (const url of Object.keys(EXEMPT)) {
      const file = routeFileFor(url);
      expect(file, `${url} has no route file`).toBeTruthy();
      const gate = routeGate(file!);
      expect(gate.kind, `${url} has no AdminGate`).toBe("gate");
      expect(
        (gate as { how: string }).how.includes("allow={"),
        `${url} is exempt to mirror an RLS policy, so it must still use an explicit allow-set`,
      ).toBe(true);
    }
  });
});

describe("a feature-gated page does not gate itself a second time", () => {
  it("no page hand-rolls a role list beside its <AdminGate feature>", () => {
    /**
     * W5 · The fourth drift axis, found by opening the app rather than by any
     * test here.
     *
     * Thirteen pages gated at the route with <AdminGate feature="…"> AND again
     * inside the component body with their own `roles.includes(...)` list plus
     * a redirect to /dashboard. Widening the feature therefore did nothing:
     * AdminGate admitted the user and the page bounced them a moment later,
     * which looks exactly like the dead link the widening was meant to fix.
     *
     * /admin/review-cycles was the one that surfaced it — signed in as `hr`,
     * the route resolved, rendered, and then redirected. Every static check in
     * this repo passed the whole time, because all of them stop at the route
     * gate.
     *
     * A page may still compute `canAccess` — several use it to enable queries
     * and hide edit controls — but it must derive it from `can(<the same
     * feature>, roles)` rather than restate the role list.
     */
    const offenders: string[] = [];
    for (const file of readdirSync(routesDir).filter((f) => f.endsWith(".tsx"))) {
      const src = readFileSync(join(routesDir, file), "utf8");
      const gate = src.match(/<AdminGate\s+feature="([^"]+)"/);
      if (!gate) continue;
      const body = src.slice(gate.index! + gate[0].length);
      // Only the GATING variable matters. Several pages legitimately derive
      // role booleans for behaviour — which tenant scope to load, whether to
      // show an edit control — and those are not a second gate.
      const gatingVar = /const can[A-Z]\w*\s*=\s*([^;]*);/.exec(body);
      if (!gatingVar) continue;
      const derivedFromRoleList = /roles\.includes\(/.test(gatingVar[1]);
      const bouncesOrBlocks =
        /navigate\(\{\s*to:\s*"\/dashboard"/.test(body) || /Forbidden/.test(body);
      if (derivedFromRoleList && bouncesOrBlocks) offenders.push(file);
    }
    expect(
      offenders,
      offenders.length
        ? `These gate twice and disagree with themselves:\n  ${offenders.join("\n  ")}\n` +
            `Derive the page's own check from can(<its AdminGate feature>, roles).`
        : "",
    ).toEqual([]);
  });
});

describe("the resolver actually sees every gate form", () => {
  it("resolves the inline-only pages, not just the AdminGate ones", () => {
    /**
     * Guard against this test quietly becoming vacuous.
     *
     * The original version understood only <AdminGate>, so every page that
     * gated inline was skipped — and eleven of them were offering the sidebar
     * a role the page then refused. /org/payroll was the one a person found by
     * clicking Organization -> Run payroll as `finance` and being told
     * "Forbidden". If a refactor breaks the inline branch of the resolver,
     * these go back to being invisible rather than failing.
     */
    const inlineOnly = [
      "org.payroll.tsx",
      "org.analytics.tsx",
      "org.white-label.tsx",
      "org.leave.tsx",
    ];
    for (const file of inlineOnly) {
      const src = readFileSync(join(routesDir, file), "utf8");
      expect(/<AdminGate/.test(src), `${file} now has an AdminGate — update this list`).toBe(false);
      const gate = routeGate(file);
      expect(gate.kind, `${file}: resolver failed to see the inline gate`).toBe("gate");
      expect((gate as { how: string }).how).toContain("inline");
    }
  });

  it("no page gates by a hand-rolled role list", () => {
    // Every gate must resolve through a feature key or a named policy-mirroring
    // set. A hand-rolled list is a second opinion about who may be here.
    const handRolled: string[] = [];
    for (const file of readdirSync(routesDir).filter((f) => f.endsWith(".tsx"))) {
      const gate = routeGate(file);
      if (gate.kind === "gate" && gate.how.includes("hand-rolled")) handRolled.push(file);
    }
    expect(
      handRolled,
      handRolled.length
        ? `These decide access with their own role list instead of a feature key:\n  ${handRolled.join("\n  ")}`
        : "",
    ).toEqual([]);
  });
});
