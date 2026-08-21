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

### UI shell

`src/components/AppShell.tsx` provides the chrome. Four layout routes (`me.tsx`, `org.tsx`,
`org.documents.tsx`, `org.recruitment.tsx`) wrap their `<Outlet />` in one, and many child pages
render one too. **`AppShell` is nesting-aware**: a nested instance renders only a `PageHeader`
(keeping its title, subtitle and actions) and skips the chrome. Wrapping a page in `AppShell` is
therefore always safe. Do not "fix" this by deleting nested shells — see
`tests/app-shell-nesting.test.ts`.

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

## Current status

Recent work targeted section 1 "Issues to Fix" of the Finalization Plan (DBT-FP-26-001 v3.0).

**Landed:** account-suspension enforcement (schema, guard, admin UI); security headers
(`src/lib/security-headers.ts`, applied in `src/server.ts`); cron-auth hardening (service-role
fallback now off by default, behind `CRON_ALLOW_SERVICE_ROLE_FALLBACK`); session policy pinned in
`supabase/config.toml`; revoke-on-role-change; duplicate-submit fix in `practice.functions.ts`
(`writeRow`); onboarding completion and redirect; personal-nav regrouping; admin gating
standardized on `<AdminGate>`; the `AppShell` nesting fix.

**Blocked on credentials — two pending items, not one:**

1. `supabase/migrations/20260818090000_account_suspension.sql` is **not applied**. Until it is,
   `is_account_active()` does not exist and `account-status.server.ts` fails open with a loud
   one-time warning. Suspension is **not being enforced**.
2. `supabase/config.toml` now holds the session policy (24h `timebox`, 8h `inactivity_timeout`,
   `jwt_expiry`, refresh rotation), but **`supabase config push` has not run** — the live project
   still uses its dashboard values.

Applying either needs `SUPABASE_ACCESS_TOKEN` or the database password.
`SUPABASE_SERVICE_ROLE_KEY` is also absent from `.env`, so every service-role path (invitations,
blog, super-admin, `listSuspendedAccounts`) fails locally.

**Local sign-in:** Google OAuth is configured only for deployed origins. `/dev-session`
(dev-only, guarded by `import.meta.env.DEV`) imports a session copied from the deployed app —
both point at the same Supabase project. See `tests/dev-session-guard.test.ts`.

**Known remaining inconsistencies:** 13 of 50 admin routes render no `AppShell`, so they have no
sidebar (`admin.tsx` is a bare `<Outlet />`); roughly 9 pages render their own `<header>` inside
a layout that already provides one. Both are residue of section 1 item 10.
