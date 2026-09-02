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

/** The allow-set a route file declares, or null if it has no <AdminGate>. */
function routeGate(file: string): { kind: "named"; name: string } | { kind: "none" } {
  const src = readFileSync(join(routesDir, file), "utf8");
  const m = src.match(/<AdminGate\s+allow=\{([A-Z_]+)\}/);
  if (m) return { kind: "named", name: m[1] };
  const f = src.match(/<AdminGate\s+feature="([^"]+)"/);
  if (f) return { kind: "named", name: `feature:${f[1]}` };
  return { kind: "none" };
}

/** Roles a gate admits. */
function gateRoles(gate: { kind: "named"; name: string }): Set<AppRole> | null {
  if (gate.name.startsWith("feature:")) {
    const feature = gate.name.slice("feature:".length);
    return new Set(ALL_ROLES.filter((r) => can(feature as never, [r])));
  }
  const set = NAMED[gate.name];
  return set ? new Set(set) : null;
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
    // No route-level gate is a different finding (the page relies entirely on
    // server-fn and RLS enforcement); it is not a parity failure.
    if (gate.kind === "none") continue;

    const routeRoles = gateRoles(gate);
    if (!routeRoles) continue;

    const navRoles = ALL_ROLES.filter((r) => can(d.feature!, [r]));
    const deadFor = navRoles.filter((r) => !routeRoles.has(r));
    const hiddenFrom = [...routeRoles].filter((r) => !navRoles.includes(r));
    if (deadFor.length || hiddenFrom.length) {
      out.push({ url: d.to, navFeature: d.feature, gate: gate.name, deadFor, hiddenFrom });
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
      expect(gate.kind, `${url} has no AdminGate`).toBe("named");
      expect(
        (gate as { name: string }).name.startsWith("feature:"),
        `${url} is exempt but gates by feature — remove the exemption`,
      ).toBe(false);
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
