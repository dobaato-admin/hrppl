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

### Dates and time zones — never `toISOString().slice(0, 10)`

A calendar date is a *local* concept. `new Date().toISOString().slice(0, 10)`
gives today **in UTC**, which is wrong for every tenant off the prime meridian
and wrong in a different direction on each side of it. That expression put
attendance on the wrong day in production: in `Asia/Kathmandu` (UTC+05:45) a
shift starting before 05:45 filed against yesterday, and in `America/New_York`
anything after 19:00 filed against tomorrow. The reported symptom was neither —
it was the week grid, which built each column from a *local* midnight `Date` and
then ran it through the same conversion, so every column queried the day before
its own label and today's entry showed up in tomorrow's row.

Use **`src/lib/work-date.ts`**:

- `workDateInZone(instant, tz)` — server side, the working day in the tenant's zone.
- `localYmd(date)` — client side, the browser's own calendar date.
- `resolveTimeZone(branch?.timezone, tenant.timezone)` — branch wins, then
  tenant, then `UTC`. Both columns are free text (`tenants.timezone` defaults to
  the literal `'UTC'`), so an unrecognised value degrades rather than throwing —
  a typo in settings must not stop a workforce clocking in.
- `resolvePunchInstant(clientIso, serverNow)` — see below.

**Daylight saving is never hard-coded.** Offsets belong to instants, not places:
`America/New_York` is -05:00 in January and -04:00 in July. Store an IANA zone
name and resolve it per instant through `Intl` (or `AT TIME ZONE` in SQL) and
the tz database supplies the rules, including the ones that change. Nepal has
never observed DST but is the good test of sub-hour offsets: +345 minutes, not
+5 or +6 hours.

`work_timezone` is stored **on each attendance row**, not read back from the
tenant, so correcting a tenant's timezone setting cannot retroactively move
every historical shift onto a different date.

### Attendance: when a punch happened, and where

- **Time comes from the client, within a tolerance.** The server used to stamp
  `new Date()` inside the handler — after auth, the employee lookup, the
  geofence query, and up to 8s waiting on geolocation. Every punch was late by
  that much, always in the employer's favour. The client now captures the
  instant the button is pressed and sends `clientTime`; `resolvePunchInstant`
  believes it within ±5 minutes and otherwise substitutes server time, records
  `clock_in_skew_seconds`, and flags the row. `clock_in_recorded_at` keeps the
  server's own receipt, so the two are never confused.
- **Geofencing reads GPS accuracy.** `coords.accuracy` is a 95% confidence
  radius that ranges from ~5 m (satellite) to kilometres (IP), and it used to be
  discarded — as did `sign_geofences.min_accuracy_meters`, which nothing had
  ever read. `evaluateGeofence` in **`src/lib/geofence.ts`** returns
  `inside` / `inside_low_confidence` / `uncertain` / `outside` and is
  deliberately generous at the boundary: a false refusal stops someone working
  and is visible instantly, a false acceptance is recorded and reviewable.
- **Refusals leave a trace.** They previously left none at all. `clockIn` writes
  `geofence_audit_log` and `geofence_reconciliation` through the *service-role*
  client, so the subject cannot suppress the record — but inside `try/catch`,
  because `client.server.ts` throws on construction without
  `SUPABASE_SERVICE_ROLE_KEY` and the audit trail must never be the reason
  nobody can clock in.
- **Work-from-home is the sanctioned exception.** An approved `wfh_requests` row
  (checked via `has_approved_wfh()`) lets the punch succeed outside every fence,
  marked `work_location = 'remote'` and queued for priority review. The review
  is what makes the exception safe, so it is not optional.
- **`ClockWidget` renders once**, inside `ShellInner` — not in `AppShell`, which
  nests. It hides itself for accounts with no employee record, and only asks for
  location when the tenant actually has fences.

### Requests — one shape, six tables, rules in the database

Six tables model "somebody asked, somebody decides": `leave_requests`,
`wfh_requests`, `expense_claims`, `support_tickets`, `toil_requests`,
`grievances`. **`src/lib/requests-inbox.functions.ts`** normalises all six —
including their six different status vocabularies — into one `InboxRow`.

- `/me/requests` — personal only: what *I* asked for.
- `/admin/requests` — the organisation-wide repository: everything, every state,
  with filters and history.
- Both render through `src/components/requests/RequestList.tsx` so they cannot
  drift apart.

It is a **read model**. Deciding still happens on the page that owns the rules,
because approving leave touches balances and approving WFH changes what
`clockIn` accepts. An unknown status groups as `pending` rather than being
dropped — silently hiding a request is the one behaviour that would make the
screen untrustworthy. `tests/requests-links.test.ts` pins every deep link
against `FileRoutesByFullPath` (not the `path:` literals, which are relative to
the parent and report every nested route as dead).

**The work-from-home lifecycle is enforced in Postgres**, by
`tg_wfh_lifecycle` plus RLS — not in the server fn, which only exists to
produce readable errors:

| From | To | Who |
| --- | --- | --- |
| pending | approved / rejected | an approver who is **not** the requester |
| pending | cancelled | the requester (or an approver) |
| approved | cancelled | requester **before the window opens**; approver any time |
| anything else | — | refused |

Plus: requests cannot start non-`pending`, cannot be wholly in the past, cannot
overlap another pending/approved window for the same employee, freeze their
dates and owner once decided, and **cannot be revoked once a remote punch has
been taken under them** — that punch was made in good faith and attendance is
the input to pay.

A manager may raise a request and may never decide it, whatever roles they hold.
That is why `/admin/requests` shows their own row (a repository must be
complete) while the actionable queue hides it (you cannot act on it).

### SECURITY DEFINER: `current_user` is the owner, not the caller

Worth its own note because it produced a guard that silently did nothing.

Inside a `SECURITY DEFINER` function, `current_user` is the **function owner**
(`postgres`), and `session_user` is the *connection's* role, which never follows
`SET ROLE`. Neither identifies the caller. A trigger that tried to exempt
trusted server paths with

```sql
current_user IN ('postgres','supabase_admin')   -- always true in SECURITY DEFINER
session_user IN ('postgres','supabase_admin')   -- never true via PostgREST's pooled connection
```

matched on **every** call and disabled the entire state machine below it.

Use the request context instead:

```sql
jwt_role := auth.role();
IF jwt_role IS NULL              -- migration, seed, psql: no JWT at all
   OR jwt_role = 'service_role'  -- the backend acting deliberately
THEN RETURN NEW; END IF;         -- everything else is a person: enforce
```

This is also what makes the rules *testable*: a session that sets
`request.jwt.claims` with role `authenticated` is subject to them exactly as a
browser is. A guard that exempts itself under the conditions you test it in is
worse than no guard — verify RLS and triggers under a real JWT, never as
`postgres`.

### Public hook endpoints must not echo caught errors

`/api/public/hooks/*` authenticates with a bearer secret rather than a session,
so anything in a response body is internet-reachable. Returning `e.message`
there ships Postgres messages naming tables, columns, constraints and RLS
policies — CodeQL flags it as "Information exposure through a stack trace", and
15 of the 20 handlers were doing it.

Use `hookFailure()` / `hookErrorRef()` from **`src/lib/hook-response.server.ts`**:
the full error goes to the server log, the caller gets a generic message and a
correlation ref. Writing `e.message` into an internal table such as
`billing_admin_alerts` is fine and unchanged. `tests/hook-error-exposure.test.ts`
enforces it.

### Learning (LMS) — the content layer, and what it taught

`src/lib/training.functions.ts` (courses, enrollments, quizzes, certificates) and
`src/lib/training-lessons.functions.ts` (lessons, progress, the player, roster progress).
`src/lib/training-guard.ts` is the single write guard, mirroring the RLS write policies the way
`au-guard.ts` does for the Australian domain.

- **Two feature keys.** `org.training` = may read the roster (includes `branch_admin`).
  `org.trainingManage` = may assign, author, decide (does not). Collapsing them re-opens X-07 from
  whichever end you collapse it.
- **`content_mode` on `training_courses`** is `'external'` or `'lessons'`, defaulting to
  `'external'`. Every pre-W6 course is `'external'` and behaves exactly as it did.
- **`training_quiz_questions_public` is a SECURITY DEFINER view and must stay one.** Learners are
  denied on the base table so they cannot read `correct_index`; the view is their only read path
  and carries the tenant and enrollment predicates itself. Setting `security_invoker = on` — as a
  linter-driven migration once did — empties every quiz for every employee **silently**, and
  because a course completes only by passing its quiz, blocks all completion. See the header of
  `20260906090000_training_x07_learner_access.sql`.
- **A PostgREST embed needs a foreign key.** `.select("*, employees(...)")` resolves from the FK
  graph; with no key it answers `PGRST200` and the caller's `rows ?? []` draws an empty table. Seven
  tables were in that state, including `leave_requests`, which is why both requests inboxes
  silently omitted leave. `tests/postgrest-embeds.test.ts` guards it.

The through-line, and the reason to be suspicious of an empty page in this codebase: **all three
of these defects rendered as emptiness rather than as an error, and none was noticed.** When a
query can fail, the surface has to be able to say so — `requests-inbox.functions.ts` returns an
`incomplete` list and the page prints "Could not load leave requests. This list is incomplete.",
which is what made the leave outage diagnosable in a single page load.

### Guided setup — completion is computed, never stored

`src/lib/setup-guide.functions.ts` drives `/org/setup-guide`, the seven-segment
walk-through an org admin uses to configure a new tenant.

**There is no per-segment "done" flag anywhere, and adding one would be the
regression.** Every check reads the tenant's actual rows. A stored flag records
that somebody clicked; it goes stale the moment the data it vouched for is
deleted, and it cannot tell an admin returning after a month what is genuinely
missing. `tenant_setup_state` holds only what a query cannot derive: which
optional segments were deferred, and when the tenant went live.

- **A segment can reopen.** Delete every leave type and payroll goes back to
  incomplete. The page says so rather than pretending otherwise.
- **A required segment cannot be skipped**, and `finalizeSetup` re-derives
  readiness server-side — the browser's copy of the guide can be minutes old.
- **A check carrying a `hint` is advisory and does not block.** "Role duties
  carrying KPI targets" is permanently unsatisfiable (there is no KPI library),
  and a check nobody can ever satisfy would make the whole guide untrustworthy.
- The guide is almost entirely deep links, so `tests/setup-guide.test.ts`
  resolves every one against `routeTree.gen.ts`. One stale path turns a segment
  into a dead end on somebody's first day.

**Policies** (`policies.functions.ts`, `/admin/policies`, `/me/policies`): an
acknowledgement is of a **version**, only the person may sign (RLS enforces it
independently), and a signed policy is retired rather than deleted because the
acknowledgements cascade.

**Phase 3 provisioning** (`provisioning.functions.ts`) enrols mandatory training
and assigns policy sign-offs, idempotently. It does not fabricate an asset
assignment, and it reports KPI assignment as **blocked** — naming the three
unreconciled review systems — rather than picking one and becoming a fourth.

### A write that changes nothing is not a success

PostgREST answers an `UPDATE` matching **zero rows** with `200` and no error. So
this reports success having done nothing:

```ts
const { error } = await supabase.from("tenants").update(patch).eq("id", id);
if (error) throw error;
return { ok: true };          // ← lies when RLS matched no row
```

That shipped in W7 and was caught only by checking the database: `tenants` had
**no UPDATE policy for `org_admin` at all** — only `super_admin` and
`regional_admin` — because every tenant-profile write in the product goes
through the *service-role* client, so RLS on that path had never been exercised.
The form saved, the toast said "saved", the row never changed.

**Read the row back on any update whose success matters:**

```ts
const { data: updated, error } = await supabase
  .from("tenants").update(patch).eq("id", id).select("id").maybeSingle();
if (error) throw error;
if (!updated) throw new Error("…not updated — you may not have permission");
```

`20260907100000` also gave org_admin the missing policy, with a trigger blocking
`plan`, `status`, `slug` and `country_code` — without that, a settings form is a
way to set your own billing plan or lift your own suspension.

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

`supabase/migrations/*.sql` is append-only (~194 files). Not indexed by CodeGraph — use Grep.

There is no Supabase CLI here. Apply a migration with
`scripts/apply-migration.mjs`, which drives the Management API as `postgres`:

```sh
node scripts/apply-migration.mjs 20260823060000_attendance_time_geo_and_wfh.sql
node scripts/apply-migration.mjs --types    # regenerate types.ts — do this every time
node scripts/apply-migration.mjs --check
```

`SUPABASE_ACCESS_TOKEN` is a **personal access token** (dashboard → account →
tokens), not the anon or service-role key, and it lives in `.env` (gitignored,
untracked). It is account-wide and grants full control of every project on the
account — the most powerful credential here — so rotate it if `.env` is ever
shared or committed.

The endpoint is not transactional across statements, which is why every
migration here uses `IF NOT EXISTS` / `DROP POLICY IF EXISTS` guards: re-running
is the recovery. **Always follow an apply with `--types`** — the gap between a
migration landing and `types.ts` catching up is exactly where `as any` casts
breed.

Verify RLS changes under a real JWT rather than as `postgres`, which bypasses
it entirely:

```sql
SELECT set_config('request.jwt.claims',
  json_build_object('sub', '<user-uuid>', 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT count(*) FROM your_table;   -- then RESET ROLE
```

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

## Which document answers what

Read the one you need; they do not repeat each other.

| Question | Document |
| --- | --- |
| What is left to build, and how do I finish it? | **`docs/remaining-work.md`** — start here |
| What are the guided onboarding flows meant to do? | `docs/onboarding-guided-routes.md` — spec + coverage map; **next up**, W6 is done |
| Where are the trust boundaries, and what is public? | **`docs/security-model.md`** |
| Who may do what? | `docs/rbac.md` §3 — **generated** from `rbac.ts`, pinned by a test |
| What exists, and how do I verify it as each role? | `docs/product-state-and-feature-checklist.md` |
| Why is the product shaped this way? | `docs/plan-waves.md` (W1–W6 + audit A1) |
| Why is the navigation shaped this way? | `docs/w4-information-architecture-design.md` (+ its W5 addendum) |
| How do I sign in as each role? | `docs/demo-accounts.md` |
| How do I deploy? | `docs/deploy-vercel.md` |
| Known modelling debt | `docs/schema-audit.md` — **a proposal, not committed state** |

## Current status

**Last full pass: 2026-09-07 (Wave 7 / guided onboarding). Read this section and the Tenant
scoping section before doing anything else; the rest of this file is stable reference.**

Runs against Supabase dev project `xnrjfrxzahmfdrqfsnnq`, 215 migrations applied.
Scale: 173 routes, 101 `*.functions.ts` modules, ~615 server fns, 121 nav destinations,
66 unit-test files, 37 Playwright specs.

**A green suite reads 0 failed / 990 passed / 5 skipped.** This changed in W7: the long-standing
"4 failed" baseline was four stale fixtures in `tests/onboarding-readiness.test.ts`, not a product
bug, and a permanently-red suite is the state in which real regressions hide. Any red is now yours.
`tests/rbac.test.ts` and `tests/audit-overtime.test.ts` still cannot *collect* without live
service-role credentials — a missing credential, not a failure.

**Demo data:** `bun --env-file=.env run scripts/demo-seed.ts` builds two tenants (Acme Global AU,
Globex Nepal NP) and 16 accounts covering all 8 roles. Credentials in `docs/demo-accounts.md`;
password `DemoPassw0rd!23`. The wipe selects tenants **by creator, not by slug** — the setup
wizard names orgs whatever the user typed, and `tenants.created_by` is `ON DELETE NO ACTION`, so
a stray tenant makes its founder permanently undeletable and wedges every later seed run.

### Wave 5 — reachability (complete, merged)

Every authorization surface now resolves **one feature key** from `src/lib/rbac.ts`. The wave
existed because a page's permission could be written in four places that were free to disagree,
and three of them had no test:

| Axis | Was | Now |
| --- | --- | --- |
| nav row vs route gate | 36 dead links | one key each |
| nav row vs **inline page check** | 11 more, incl. `/org/white-label` locking out `org_admin` | converged |
| nav row vs **no gate at all** | 23 destinations rendered for anyone with the URL | gated |
| nav row vs **RLS policy** | HR could assign a course, not author its quiz | closed in W6 — see below |

Also landed: `src/lib/nav-tree.ts` (nav is data, not markup — sidebar, GlobalSearch and tests all
read it); the per-role **"Your work"** shortcut group; the AU compliance domain given a UI
(5 pages, 5 feature keys, country-gated); ticket conversations; variation drafts; timeline event
links. **Orphan server functions: 48 → 0**, held there by `tests/no-orphan-server-fns.test.ts`.

Four functions are recorded as deliberately uncalled, each naming the surface it waits on:
`upsertAward` / `upsertAwardClassification` / `upsertAwardRate` (platform-level catalogue editing,
parked with D-8) and `previewAuPeriod` (a preview panel on `/org/payroll`).

### The tests that encode all of this

Run these before believing a gating change is safe. Each exists because the defect it catches was
invisible in review, in the browser, or both:

| Test | Catches |
| --- | --- |
| `training-access` | the quiz view flipped back to `security_invoker = on`; a training write with no guard |
| `postgrest-embeds` | a table embedding `employees(...)` with no foreign key to `employees` |
| `setup-guide` | a setup segment that stores completion instead of computing it; a dead deep link; a skip that opens the activation gate |
| `policies-and-provisioning` | a signature somebody else could record; a provisioning step that silently no-ops |
| `nav-route-gate-parity` | a nav row and its page disagreeing, in any of four gate forms |
| `nav-render-filter` | the sidebar computing a filtered list and rendering the unfiltered one |
| `nav-integrity` | duplicate/dead nav destinations, role shortcuts a role cannot open |
| `no-orphan-server-fns` | a server fn nothing calls; also pins one product name |
| `public-endpoint-security` | an endpoint without auth middleware; an unlimited public write |
| `au-guard-coverage` | an AU server fn with no role guard; unscoped AU list reads |
| `route-parent-outlet` | a page with no `AppShell`; a parent with no `<Outlet />` |
| `tenant-scoping` | an `employees` list read with no `tenant_id` filter |

### Security audit — 2026-09-03

Two real findings, both invisible from inside the app because the *pages* were gated correctly:

- **`countOpenHighSeverityFindings` had no `.middleware()` at all** and read through the
  service-role client. A TanStack server fn is a public HTTP endpoint, so anyone could read back
  a live count of the platform's open critical findings. Now gated like its siblings.
- **No public endpoint could be rate limited.** `check_rate_limit` opens with
  `IF v_user IS NULL THEN RETURN true`, and `rate_limit_buckets.user_id` is
  `REFERENCES auth.users(id)` — so anonymous callers were waved through by construction. Five
  server fns take no session; four write. `createResumeUploadUrl` is an unauthenticated mint of a
  storage upload credential. Fixed by `20260903120000_public_rate_limit.sql` +
  `enforcePublicRateLimit()`, keyed on a **salted hash** of the IP, **failing open** on every
  error path (a limiter that fails closed on a careers page takes it offline for real applicants).

Verified clean in the same pass: RLS enabled on all 207 tables; no unscoped `employees` read; no
secret behind a `VITE_` prefix; all 20 public hooks use `hookFailure()`; `renderMarkdown` escapes
before converting.

### Known gaps, in priority order

1. **Acting-tenant coverage: 14 of 97 modules.** `TenantSwitcher` and `platform_acting_tenant`
   exist and work, but only the modules using `requireTenantId()` / `getTenantId()` honour them.
   The rest read `profiles.tenant_id` directly, which is `NULL` for a platform account — so a
   `super_admin` acting as a tenant gets a working page from one module and "No tenant" from the
   next. **This is the single biggest architectural inconsistency left.** (W6 converted
   `training.functions.ts` and wrote `training-lessons.functions.ts` this way from the start.)
2. **Three unconnected review systems** share `review_templates` and never reconcile:
   `performance_reviews` (whole-tenant fan-out), `review_instances` (schedule-generated), and
   `duty_review_scores`. There is no assignment table. Both fns now have callers and targeting
   works, so this is a modelling gap rather than a dead feature.
3. **Two `NOT VALID` foreign keys.** `leave_requests` and `timesheets` each hold one row pointing
   at a deleted employee (both `1649efd6-b59e-4b59-875e-31e81bb1764b`, from 2026-08-21). The keys
   are in place and enforced for new writes; run `VALIDATE CONSTRAINT` once someone decides what
   those two records are. Deleting them to satisfy a constraint would destroy a record of
   somebody's absence and hours.
4. **Attendance leftovers:** `clockOut` records position but does not validate it; WFH decisions
   notify in-app only; the 24h reconciliation cron does not know the new WFH mismatch types;
   there is no tenant-level "remote work allowed" switch.
5. **Performance, measured not guessed:** 36 loop-with-query sites remain (`payroll.functions.ts`
   has 8, the hottest path); ~200 `useQuery` sites but only ~20 declare `staleTime`, so most
   refetch on every mount. Neither is urgent at demo scale; both are the next real perf work.

Fixed in the audit: the N+1 in `generateSuperContributionsForRun`, which resolved a fund choice
per payslip — 500 sequential round trips on a 500-employee run, now one `.in()`.

### Wave 6 — Learning (complete, merged 2026-09-06)

The LMS content layer shipped and **X-07 closed**. Courses can carry ordered lessons
(`rich_text | video | document | external_link`) in a private `training-content` bucket, with
per-learner progress, a builder at `/admin/training/$courseId`, a player at
`/me/training/$enrollmentId`, and roster progress on `/org/training`. `content_mode` defaults to
`'external'`, so no course already assigned to anyone changed underneath them.

**Two feature keys, not one.** `org.training` is the view key (admits `branch_admin`);
`org.trainingManage` is the write key (does not). The database grants read and write to different
sets, so one key could only have been wrong in one direction. `src/lib/training-guard.ts` mirrors
the write key server-side.

**Three silent failures were found under X-07, and all three rendered as emptiness.** This is the
domain's defining lesson and the reason `tests/training-access.test.ts` and
`tests/postgrest-embeds.test.ts` exist:

1. **No learner could read a quiz question.** `training_quiz_questions_public` is a SECURITY
   DEFINER view *on purpose* — learners are denied on the base table so they cannot read
   `correct_index`, and the view is their only read path. `20260613143222`, "Fix Security Definer
   view", set `security_invoker = on` to clear a linter warning **that `20260609120840` had
   already recorded as an accepted risk**. Enforcement went back to the base table's deny; every
   learner read 0 rows; and since a course completes only by passing its quiz, **no employee could
   complete any course.** The screen said "No quiz questions have been set for this course yet."
   Restored by `20260906090000`. Do not flip it back — a test now fails if you do.
2. **Seven tables embedded `employees(...)` through a foreign key that never existed.** PostgREST
   resolves an embed from the FK graph; with no key it answers `PGRST200`, and every caller renders
   `rows ?? []`. `/org/training`'s two tabs, `/me/training`'s two tabs and the **leave** half of
   both requests inboxes had therefore been empty since they shipped. Fixed by `20260906092000`,
   `20260906093000`, `20260906094000`. **Before adding a `.select()` embed, check the FK exists.**
3. **`hr` had no policy at all** on `training_quiz_questions` or `certifications`, despite holding
   manage rights on courses and enrollments since `20260613140528`.

Also fixed: `listEnrollments` never selected `pass_score` / `max_attempts` (so the learner's quiz
dialog always showed 70%); the overdue sweep and the expiry horizon both took "today" from UTC;
and the quiz dialog said "no questions have been set" *while still loading*.

**Next: the acting-tenant conversion** (gap 1 below) — the largest architectural inconsistency
left, and now the only one with no wave behind it. **Parked, each for a stated reason:** SCORM (a
JavaScript runtime and a content-security decision, not a content type), the cross-tenant course
library (D-8), split pay across accounts (three bank-detail shapes to reconcile first), the KPI
library (the three review systems), and ABN Lookup / address autocomplete (external APIs needing a
key).

`scripts/qa-sweep.mjs` walks every nav destination as each seeded role and writes
`docs/qa-sweep-report.md`. Re-run it after structural changes — the committed report is **stale**
(pre-W5) and says so. The script reads the nav from `src/lib/nav-tree.ts` and **exits non-zero if
it parses fewer than 80 destinations**: it previously read `AppShell.tsx`, and after W5 moved the
nav it swept exactly one route and reported cleanly on it.

**Local sign-in:** Google OAuth is configured only for deployed origins. Sign in with email +
password at `/auth`, or use `/dev-session` (dev-only, guarded by `import.meta.env.DEV`).

**Do not run two dev servers at once.** Vite silently falls back to :8081 when :8080 is taken, so
you test stale code against a second process — and both regenerate `routeTree.gen.ts` into the
same file, which has corrupted it before. Check with `lsof -nP -iTCP:8080 -sTCP:LISTEN`.
