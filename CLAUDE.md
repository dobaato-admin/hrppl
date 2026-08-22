# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

---

## Start here: use CodeGraph, not grep

This repo is indexed by **CodeGraph** (`.codegraph/` at the root) — a pre-built knowledge graph
of every symbol, edge and file: **545 files, 8,452 nodes, 22,031 edges**.

**Reach for it before Read/Grep/Glob, and before editing.** One call returns the verbatim,
line-numbered source of the relevant symbols *plus* who calls them and what they affect, so you
edit with the blast radius already in view. A direct CodeGraph answer is typically one or two
calls; the equivalent grep-and-read loop is dozens.

```sh
codegraph explore "AuthRouteGate requireActiveUser getMyGateStatus"   # source + call paths
codegraph query   "upsertChecklist"                                   # locate a symbol
codegraph node    "src/lib/auth-guard.ts"                             # one file/symbol + dependents
codegraph status                                                      # index health
codegraph files                                                       # project structure
codegraph sync                                                        # after large external changes
```

The `codegraph_explore` MCP tool takes the same query and returns the same output. Either is fine.

**Treat returned source as already read.** It is re-read from disk on every call and is
byte-identical to `Read`. Do not re-open a file CodeGraph just showed you.

**When CodeGraph is the wrong tool:** a specific line range it did not surface, a file type it
does not index (`.sql`, `.toml`, `.md`, `.json`), or listing files by glob. The ~193 migrations
in `supabase/migrations/` and the workflows in `.github/workflows/` are **not** in the graph —
use Grep for those.

### Query it by intent, not by filename

The routing and server-fn layers are large and flat, so filename guessing is slow. Ask for the
behaviour instead:

| Instead of | Ask CodeGraph |
| --- | --- |
| grepping `src/routes/admin.*` | `codegraph explore "admin gating AdminGate ADMIN_LAYOUT_ROLES"` |
| opening five `*.functions.ts` files | `codegraph explore "payroll run overtime consumption"` |
| tracing a prop by hand | `codegraph explore "AppShell AppShellProps InsideAppShell"` |

CodeGraph resolves dynamic-dispatch hops grep cannot follow — React re-render, JSX children,
callbacks. That matters here: `AppShell` alone has **160 callers**.

---

## Project

**Global Payroll Hub / HRPPL** — multi-tenant HR and payroll SaaS (employees, leave, timesheets,
payroll runs, performance reviews, onboarding/offboarding, compliance, assets, billing) built on
**TanStack Start** (React 19, file-based routing, SSR) with **Supabase** (Postgres + RLS + Auth +
Storage). Scaffolded from a Lovable Cloud template (`.lovable/`).

Package manager is **bun**. Not a git repository — there is no history to inspect.

Scale: 162 route files, 94 `*.functions.ts` server-fn modules, 9 `*.server.ts` modules,
193 migrations, 36 unit test files, 36 Playwright specs.

---

## Commands

```sh
bun install                  # required: patches/ must be applied (see Config quirks)
bun run dev                  # vite dev server (:8080)
bun run build                # production build
bun run lint                 # eslint .   (~34k pre-existing problems - scope to changed files)
bun run format               # prettier --write .
bun run test                 # vitest run (tests/**/*.test.ts)
bun run test:e2e             # playwright (e2e/**/*.spec.ts)
bun run test:e2e:install     # install Playwright chromium once
```

Single file: `bun run test tests/payroll-au.test.ts` or `bunx playwright test e2e/auth-gating.spec.ts`

### Known baseline — do not mistake these for regressions

- **4 failing tests** in `tests/onboarding-readiness.test.ts` are **pre-existing**.
- `tests/rbac.test.ts` and `tests/audit-overtime.test.ts` **cannot collect** without live
  Supabase credentials.
- `bun run lint` reports ~34k problems repo-wide, almost all Prettier formatting. Lint only the
  files you changed.

A green run therefore reads "4 failed, N passed". Any *other* failure is yours.

### RBAC / RLS integration tests (`tests/rbac*.test.ts`)

Require live service-role access — they create and tear down real users and tenants against
actual RLS policies. Self-cleaning (`afterAll`), tagged per run (`rbac_<ts>_<rand>`).

```sh
export SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." SUPABASE_PUBLISHABLE_KEY="..."
bun run test
```

See `tests/README.md`; add users in `tests/helpers/rbac-setup.ts` → `setupRBAC()`.

### E2E harness

Never point at production. Copy `.env.e2e.example` to `.env.e2e` with a throwaway project — the
seed mutates `tenants`, `profiles`, `user_roles`. Optional Mailpit:
`docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit`.

```sh
bun run e2e:harness                 # full suite
bun run e2e:harness e2e/auth-*.spec # subset
```

`e2e-tests.yml` runs the routing-contract subset per PR; `e2e-full.yml` runs nightly.

---

## Architecture

> For any section below, `codegraph explore` with the named symbols is faster and more complete
> than opening the files.

### Routing — TanStack Start file-based (`src/routes/`)

`src/routes/README.md` has the full convention table.

- **No `src/pages/`, no Next.js/Remix conventions.** `index.tsx` → `/`, `users.$id.tsx` →
  `/users/:id` (bare `$`), `files/$.tsx` → splat (read via `_splat`). `__root.tsx` is the single
  app shell and owns `<Outlet />`.
- `routeTree.gen.ts` is **auto-generated — never hand-edit**. It regenerates on `vite dev` and
  build. To regenerate without a dev server, drive `@tanstack/router-generator` directly.
- Dots encode nesting: `admin.employees.$employeeId.tsx`, `me.banking-tax.tsx`.
- `src/routes/api/public/hooks/*` are unauthenticated webhook/cron endpoints — bearer/secret
  auth, not session. See `src/lib/cron-auth.server.ts` before adding one.
- `src/routes/api/v1/*` is the public developer API (OpenAPI at `openapi.json`), separate from
  the internal server-fn RPC layer.
- `src/routes/[.mcp]/` and `[.well-known]/` expose an MCP server surface (`@lovable.dev/mcp-js`).

### Server logic — `createServerFn`, not Edge Functions

Business logic lives in `src/lib/*.functions.ts`, one file per domain, called from client
components like an RPC:

```ts
export const getGreeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => { ... });
```

`.handler` runs server-only and its imports are tree-shaken from the client bundle — but
**module-level code still ships to the client**, so keep secrets and service-role usage inside
`.handler` or in a `*.server.ts` file.

**This pattern replaces Supabase Edge Functions entirely — do not add new ones.**

`*.server.ts` are hard server-only modules, enforced by an ESLint `no-restricted-imports` rule
blocking Next's `server-only` package.

### Auth guard — every server fn re-checks suspension

`src/lib/auth-guard.ts` is the single entry point. **Import `requireSupabaseAuth` from there,
never from `src/integrations/supabase/auth-middleware.ts`** — a test enforces this.

- `requireActiveUser` — the default. Wraps the generated JWT middleware and re-checks account
  suspension **on every request** (`src/lib/account-status.server.ts`). Injects the same
  `{ supabase, userId, claims }` context, so it is a drop-in replacement.
- `requireSupabaseAuth` — back-compatible alias for `requireActiveUser`.
- `requireAuthAllowSuspended` — suspension deliberately **not** enforced. Only for endpoints that
  exist to *report* suspension. Exactly one caller (`getMyGateStatus`); a test pins that.

The status check uses the **caller's own client**, never the service-role client. Depending on
the service-role key here once took the whole app down wherever that key was absent, because the
guard fronts ~92 server fns.

### Supabase access — three clients, three trust levels

- `src/integrations/supabase/client.ts` — browser, anon key, RLS-scoped, session in
  `localStorage`.
- `src/integrations/supabase/client.server.ts` — **service-role, bypasses RLS entirely.** Trusted
  server operations only. **Throws on construction if `SUPABASE_SERVICE_ROLE_KEY` is missing** —
  never put it in a path every request touches.
- `src/integrations/supabase/auth-middleware.ts` — the generated JWT middleware (validates a
  Bearer token via `auth.getClaims`). Wrap it via `auth-guard.ts` rather than using it directly.

`src/integrations/supabase/types.ts` is generated from the live schema — never hand-edit;
regenerate after a migration. All three `integrations/supabase/*` files are marked "automatically
generated": prefer changing callers.

### RBAC — layered, RLS is the source of truth

Full role x feature matrix: **`docs/rbac.md`** (update alongside any change).

- **`src/lib/rbac.ts`** is the frontend source of truth — `can(feature, roles)` plus named
  allow-sets `ORG_ADMIN_ONLY`, `ORG_ADMIN_OR_MANAGER`, `PLATFORM_OR_ORG_ADMIN`,
  `SUPER_ADMIN_ONLY`, `ADMIN_LAYOUT_ROLES`, `ORG_LAYOUT_ROLES`. It controls **UI only** and is
  not a security boundary.
- **RLS policies plus server-fn role checks are the actual enforcement.**
- `public.has_role()` is the RLS chokepoint: nearly every policy funnels through it, so changing
  it changes access schema-wide. It also folds in `is_account_active()`.
- Roles are additive; some are scope-limited via `role_scope` (`branch_id`, `country_code`):
  `super_admin` > `regional_admin` (country-scoped, cross-tenant) > `org_admin` >
  `branch_admin` / `hr` / `finance` / `manager` > `employee` (`/me/*` only).

**Admin route gating convention:** gate at the route, not in the page body —
`component: () => (<AdminGate allow={SOME_ROLE_SET}><Page /></AdminGate>)`. This stops the page
mounting at all. `admin.tsx` is deliberately a **pure `<Outlet />`** and does not gate;
`tests/admin-routes-block.test.ts` asserts that. Never use a bare `<AdminGate>` — its default
allow-set is permissive, and `tests/admin-gate-role-sets.test.ts` pins each page's exact roles to
catch silent widening.

> `docs/rbac.md` section 5 and all of `docs/schema-audit.md` are **proposals**, not committed
> state. Check the code before assuming either was executed.

### Tenant scoping — RLS is the boundary, not the scope

**Every list-style query must filter `tenant_id` itself.** RLS is the security boundary and stays
so, but it does not *narrow* for every role: `super_admin`'s policy on `employees`
("super admin all employees", `20260603213444:100-103`) is `FOR ALL USING has_role(...)` with no
tenant predicate at all. A query that omits `.eq("tenant_id", …)` and trusts RLS returns **every
tenant's rows** to that caller. `regional_admin` is the same within its scope countries.

That is not theoretical — it shipped, and it did more than leak. The offboarding employee picker
listed all 15 employees across 3 tenants; `createOffboarding` then copied `tenant_id` from the
*selected employee*, so picking any of them built a row that `WITH CHECK` rejected with
`new row violates row-level security policy`. The leak and the failure were one bug.

- Server: `requireTenantId()` / `getTenantId()` in **`src/lib/tenant-scope.ts`**.
- Client: **`useMyTenantId()`** in `src/hooks/use-tenant.ts`.
- `tests/tenant-scoping.test.ts` scans every `employees` list read and fails on an unscoped one.

Two consequences worth knowing:

1. **Platform accounts have no tenant**, so correctly scoped queries return *nothing* for them.
   An unexplained empty `<Select>` reads as a broken page — carry a `noTenantScope` flag and say
   so. A tenant switcher is the real fix and is not built yet.
2. **A picker usually needs the caller excluded too.** You should not be able to offboard,
   discipline, or approve your own expenses from a dropdown.

Related: `getCompanyDirectory` reads through the **service-role** client on purpose. No policy
lets a plain `employee` read a colleague, so with the caller's own client the company directory
returned exactly one row — themselves. The tenant filter there is the only thing keeping it inside
one tenant, so it must come from the caller's own employee row and the projection must stay free
of compensation and identifiers.

### UI shell

`src/components/AppShell.tsx` provides the chrome. Four layout routes (`me.tsx`, `org.tsx`,
`org.documents.tsx`, `org.recruitment.tsx`) wrap their `<Outlet />` in one, and many child pages
render one too. **`AppShell` is nesting-aware**: a nested instance renders only a `PageHeader`
(keeping its title, subtitle and actions) and skips the chrome. Wrapping a page in `AppShell` is
therefore always safe. Do not "fix" this by deleting nested shells — see
`tests/app-shell-nesting.test.ts`.

**`admin.tsx` is the one layout that deliberately does NOT provide chrome** — it is a bare
`<Outlet />`, pinned by `tests/admin-routes-block.test.ts`. Every page under `/admin` must
therefore render its own `AppShell`; one that does not has no sidebar and no top bar at all, and
nothing errors to tell you. `org.tsx` used to have the same shape *by accident*, which silently
orphaned eight first-class destinations (`/org/employees`, `/org/payroll`, `/org/reports`…). It
now wraps its `<Outlet />`, excluding `/org/setup` — that route is reachable before the user has
a tenant, so a full org nav there would offer links that all bounce back.

`title` is optional on `AppShellProps` precisely so a layout can supply chrome without claiming a
title; the page supplies it. Passing `""` renders an empty `<h1>` in the top bar.

`tests/route-parent-outlet.test.ts` enforces both rules: every authenticated page resolves to a
chrome provider, and every parent route renders an `<Outlet />`.

### Database — migration-only

`supabase/migrations/*.sql` is append-only (~193 files). Not indexed by CodeGraph — use Grep.

**Before `CREATE OR REPLACE` on an existing function, grep for every prior definition.** Several
have been revised repeatedly, and rebuilding one from an old copy silently reverts later fixes.
`prevent_profile_privileged_changes` has four revisions — the live body comes from
`20260606132210`, which added the `auth.role() = 'service_role'` escape that `acceptInvitation`
depends on.

`docs/schema-audit.md` documents known modeling debt with risk ratings — consult it before adding
tables in the domains it flags.

---

## Config quirks

- **`patches/` must be applied.** `@lovable.dev/mcp-js` compares a forward-slash root against a
  backslash path, which breaks `vite dev` and `vite build` on Windows. Fixed via
  `patches/@lovable.dev%2Fmcp-js@0.24.0.patch`, wired through `package.json`. A `bun install`
  that drops it re-breaks the toolchain.
- **`vite.config.ts` is intentionally minimal.** `@lovable.dev/vite-tanstack-config` already
  wires TanStack Start, React, Tailwind v4, tsconfig-paths, Nitro (Cloudflare target), the
  dev-only tagger, `VITE_*` injection, the `@` to `src` alias and React/TanStack dedupe. **Do not
  re-add any of those** — duplicate registration breaks the build.
- **`src/server.ts`** wraps the Nitro/TanStack SSR entry to catch an h3 failure mode (in-handler
  throws silently becoming a JSON 500) and to apply security headers to every response, including
  the framework-bypassing 500 path. Do not simplify it away.
- **`bunfig.toml`** enforces a 24h supply-chain delay (`minimumReleaseAge`). Only
  `@lovable.dev/vite-tanstack-config` and `@lovable.dev/mcp-js` are excluded; another exclusion
  needs explicit user confirmation.
- Path alias `@/*` to `./src/*` (TypeScript and Vite, kept in sync).
- Anything `VITE_*` is compiled into the client bundle — never prefix a secret.

---

## Deployment — Vercel

Live at **https://hrppl.vercel.app**, auto-deploying from `main` via the GitHub integration,
pointed at the same dev Supabase project (`xnrjfrxzahmfdrqfsnnq`). Full runbook:
**`docs/deploy-vercel.md`**.

Three things that are easy to break and hard to diagnose:

- **The Nitro preset is `vercel`, set explicitly in `vite.config.ts`.** The Lovable wrapper's
  zero-config default is `cloudflare-module`. Reverting to it ships a Cloudflare Worker that
  Vercel cannot serve. `NITRO_PRESET` overrides it without editing the file.
- **Never commit `.vercel/`.** It was committed once (950 files, `9e752de`) and the deploy
  served a stale Windows-built bundle that 500'd on every request until the tree was untracked.
  `.gitignore` covers it now.
- **`VITE_*` is compiled in at build time, not read at runtime.** Adding or changing one in the
  Vercel dashboard does nothing until a rebuild. A deploy built without them still returns 200
  from SSR — the server falls back to `process.env` — while the browser throws and renders the
  `__root.tsx` error boundary. That boundary and the SSR 500 page in `src/lib/error-page.ts`
  print the *same* "This page didn't load" string, so check the HTTP status before assuming
  which one you are looking at. `docs/deploy-vercel.md` §8 has the curl checks.

Cron: Hobby allows 2 jobs/day, wired in `vercel.json` to `leave-accrual` and
`audit-retention-run`. **Vercel Cron issues GET**, so those two hooks have GET handlers; the
other 18 remain POST-only and unscheduled (use Supabase `pg_cron` — recipe in the runbook).

## Current status

The project now runs against a **fresh Supabase dev project** (`xnrjfrxzahmfdrqfsnnq`), with all
~197 migrations replayed. The blockers the previous version of this section described — the
unapplied suspension migration, the missing service-role key — are resolved.

**Demo data:** `bun --env-file=.env run scripts/demo-seed.ts` builds two tenants (Acme Global AU,
Globex Nepal NP), 16 accounts covering all 8 roles, and the tenant lookup tables every dropdown
reads (expense categories, payroll components, recruitment stages, award types, training courses,
feedback and review templates, TOIL settings). Credentials land in `docs/demo-accounts.md`.

The wipe selects tenants **by creator, not by slug** — demo accounts create orgs through the
setup wizard and the wizard names them whatever the user typed, so a slug pattern misses them.
That matters beyond tidiness: `tenants.created_by` is `ON DELETE NO ACTION`, so a stray tenant
makes its founder permanently undeletable and wedges every later seed run.

**Landed since:** tenant scoping across ~25 query sites (see the Tenant scoping section, which is
the single most important thing to read before adding a query); the offboarding RLS failure;
chrome restored on 20 orphaned routes; the always-on loading bar; the `listNotifications` storm
(once per navigation → once per session); route-parent `<Outlet />` fixes that had made
`/onboarding/profile` and three other routes unreachable.

**Two live bugs found and fixed that were invisible from the app:**

- `tg_block_modify_audit`'s `service_role` escape read the *legacy* `request.jwt.claim.role` GUC,
  which current PostgREST does not set. So it never passed: **audit retention had never worked**
  (`audit-retention.functions.ts` archives exactly those tables), and because
  `offboarding_comms_removal_audit.actor_id` is `ON DELETE SET NULL` — an UPDATE, which the
  trigger blocks — any user who touched an offboarding case became undeletable. Fixed in
  `20260821093000`.
- The MCP `list_employees` tool selected and ordered by `full_name`, a column that does not
  exist, so every call returned PostgREST 42703.

**Known gaps, in priority order:**

1. **No tenant switcher.** `super_admin` / `regional_admin` have `profiles.tenant_id = NULL`, so
   every tenant-scoped surface is legitimately empty for them. Before scoping they saw all
   tenants merged, which was the leak. Until a switcher exists these accounts cannot demo tenant
   features.
2. **Three unconnected review systems** share `review_templates` but never reconcile:
   `performance_reviews` (whole-tenant fan-out on cycle activate), `review_instances`
   (schedule-generated scorecards), and `duty_review_scores` (duty-based KPI). There is **no
   assignment table and no targeting UI** — `generateReviewInstances` accepts `employeeIds` but
   its only caller never passes it, so every "Schedule" blasts the entire tenant.
   `reviewReviewInstance` (the approve/reject fn) has **zero callers**. The templates page points
   at "Performance → Cycles", which does not exist under that name; the real control is
   `/org/performance`.
3. **Leave trusts a client-computed `days`** (`leave.functions.ts:77`) with no balance check and
   no weekend/holiday exclusion, and `leave_approval_routes` is authored but never consumed.
4. **No work-from-home concept at all**, and `clockIn` has no geofence exception — out-of-fence
   is a hard throw that leaves no trace anywhere.

`scripts/qa-sweep.mjs` walks every nav destination as each seeded role and writes
`docs/qa-sweep-report.md` — chrome, console errors, status, repeated server-fn calls. Re-run it
after structural changes.

**Local sign-in:** Google OAuth is configured only for deployed origins. `/dev-session`
(dev-only, guarded by `import.meta.env.DEV`) imports a session copied from the deployed app —
both point at the same Supabase project. See `tests/dev-session-guard.test.ts`.

**Chrome coverage: resolved.** The old note here said "13 of 50 admin routes render no
`AppShell`". The real count was **20** — 12 admin pages plus 8 under `/org`, because `org.tsx`
was also a bare `<Outlet />`. All 20 now render inside the shell, verified per role in a browser,
and `tests/route-parent-outlet.test.ts` stops it regressing. Some pages still render their own
`<header>` beneath the shell's top bar; that is cosmetic, not a loss of navigation.

**Do not run two dev servers at once.** Vite silently falls back to :8081 when :8080 is taken, so
you end up testing stale code against a second process — and both regenerate `routeTree.gen.ts`
into the same file, which has corrupted it (a parent route naming a file that no longer existed).
Check with `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` before starting one.
