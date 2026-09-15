# Release v1.0.0 — first production deployment

**Date:** 2026-09-15
**Target:** Supabase project `ifitgxscyuabessaoqui` (production)
**Source of truth:** `supabase/migrations/` at tag `v1.0.0`
**Development project:** `xnrjfrxzahmfdrqfsnnq` — unchanged, still the local default

---

## What was deployed

The schema, and nothing else. 227 migrations replayed oldest-first onto an empty
project. **No user data, no tenant data, no demo data.**

| | Dev | Prod | |
| --- | --- | --- | --- |
| Tables | 216 | 216 | ✅ |
| Functions | 129 | 129 | ✅ |
| Policies | 708 | 708 | ✅ |
| Triggers | 195 | 195 | ✅ |
| Enums | 49 | 49 | ✅ |
| Storage buckets | 7 | 7 | ✅ |
| Tables without RLS | 0 | 0 | ✅ |
| `ensure_rls` event trigger | 1 | 1 | ✅ |
| **Users** | 20 | **0** | intended |
| **Tenants** | 5 | **0** | intended |

### Proving there was no user or tenant data

Not assumed — checked. The migration set contains 99 `INSERT` statements. Stripping
dollar-quoted function bodies first (a first pass without that mistook
`handle_new_user`'s own `INSERT INTO profiles … VALUES (NEW.id, …)` for a data insert),
only **four** are top-level literal inserts into tenant-or-user tables, and all four are
`INSERT INTO email_send_state (id) VALUES (1)` — a singleton row for the email subsystem.

Everything else the migrations insert is reference or system data: countries and public
holidays, subscription plans, onboarding and offboarding checklist **templates**, payslip
**templates**, knowledge-base articles, storage buckets.

`scripts/demo-seed.ts` was **not** run and must never be run against this project. It
creates users and tenants.

---

## Two things this release changed in the schema

### `20260915100000` — the RLS net that was never in code

Production came out **one function short** of dev. The missing one was `rls_auto_enable`,
wired to an event trigger `ensure_rls` that enables RLS automatically on any new table in
`public`. It existed in the development project's dashboard and **in no migration**, so
every environment ever built from this repository has been without it — including, until
this migration, production.

That matters more here than almost anywhere. The security posture is "RLS is the
boundary": 216 tables, 708 policies, a test asserting no table is left without it. All of
it depends on every migration remembering `ALTER TABLE … ENABLE ROW LEVEL SECURITY`.
Forgetting does not fail — it produces a table every authenticated caller can read in
full, through PostgREST, with no error anywhere.

It is a backstop, not a substitute. A table with RLS on and no policies denies everyone,
which is safe but broken; migrations must still write their policies. What it guarantees
is that the mistake shows up as a visible denial rather than an invisible leak.

### `20260915110000` — the production signup allowlist

`handle_new_user` decides whether a new `auth.users` row may exist at all. Signup is
closed by default: an account needs a pending invitation, the create-organisation flow, an
OAuth provider, an existing `super_admin` grant, or an entry in the allowlist.

Production's allowlist is now:

- `mannie@ebta.com.au`
- `ams@dobaato.com`

`expertsydney@gmail.com` was removed — a development testing account with no business
bypassing invitations in production.

**Being on the list grants no role.** It permits signup without an invitation, and nothing
else. `super_admin` is granted deliberately, by SQL, once the accounts exist. Auto-granting
it from a trigger keyed on an email address would hand the platform to whoever controls
that mailbox, silently, at signup.

The function was rebuilt from the **live** definition read back with `pg_get_functiondef`,
not from an older migration. It has four definitions in history, and CLAUDE.md warns that
rebuilding one from an old copy silently reverts every later fix. The only change from the
live body is the allowlist line.

---

## Still to do before this serves traffic

These are **not** done. In order.

### 1. Create the first administrator

Nobody is `super_admin` and no tenant exists, so the platform surfaces are unreachable.

1. `mannie@ebta.com.au` and/or `ams@dobaato.com` sign up through the app's
   create-organisation flow (which works on an empty database, and which the allowlist also
   permits directly).
2. Then grant the role — one statement per account:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'
FROM auth.users u
WHERE lower(u.email) IN ('mannie@ebta.com.au', 'ams@dobaato.com')
ON CONFLICT DO NOTHING;
```

Run it, then confirm: `SELECT email, role FROM auth.users u JOIN public.user_roles r ON
r.user_id = u.id;`

### 2. Point the deployment at production

`VITE_*` values are **compiled into the bundle at build time**, not read at runtime. A
deploy built against the old values still returns 200 from SSR — the server falls back to
`process.env` — while the browser throws and renders the error boundary. Changing them in
a dashboard does nothing until a rebuild.

The production values are in **`.env.production`** (gitignored, read by nothing
automatically). Copy them into the hosting environment, then **rebuild**.

Also set `VITE_DEV_BYPASS_MFA=false`.

`docs/deploy-vercel.md` §8 has the curl checks for confirming which environment a
deployed bundle is actually talking to.

### 3. Decide what `hrppl.vercel.app` should point at

It currently auto-deploys `main` against the **development** project. Either repoint it at
production, or stand up a separate production deployment and leave it as a dev preview.
Until that decision is made, the live site is still the dev database.

### 4. Configure what the migrations cannot

- **Auth providers.** Google OAuth is configured only for the old origins; production
  needs its own client IDs and redirect URLs.
- **SMTP.** Email templates and sending are project-level settings.
- **Backups and PITR.** Check the plan's retention and turn on what the client needs.
- **Custom domain**, if there is one.

### 5. Verification not yet done

- **The QA sweep has not been run against production.** `docs/qa-sweep-report.md` is
  pre-Wave-5 and says so. It is the only check that walks all eight roles through a real
  browser, and it needs seeded accounts — which production deliberately has none of.
- **No smoke test of a real signup** on production. The allowlist and trigger are verified
  by reading the live function; nobody has actually created an account.

---

## How to do this again

The mechanics, so the next environment is not reconstructed from memory.

```sh
# 1. Confirm the target is empty and reachable
SUPABASE_PROJECT_ID=<ref> node scripts/apply-migration.mjs --sql \
  "select (select count(*) from information_schema.tables where table_schema='public') as tables,
          (select count(*) from auth.users) as users"

# 2. Apply every migration, oldest first, halting on the first failure
for f in supabase/migrations/*.sql; do
  SUPABASE_PROJECT_ID=<ref> node scripts/apply-migration.mjs "$(basename "$f")" \
    | grep -q '^OK:' || { echo "HALTED at $f"; break; }
done

# 3. Diff the result against a known-good project — tables, functions, policies,
#    triggers, enums, buckets, and tables-without-RLS. A single missing function
#    is what surfaced the ensure_rls gap; do not skip this step.
```

Two things that cost time here and will again:

- **`bun run build` needs a bigger heap.** It aborts with a bare `SIGABRT` otherwise —
  use `NODE_OPTIONS="--max-old-space-size=8192"`. The trace says
  `CollectGarbageAndRetryAllocation` partway down; nothing says "out of memory".
- **The Management API is not transactional across statements.** A migration that fails
  halfway leaves earlier statements applied. Every migration here is written with
  `IF NOT EXISTS` / `DROP … IF EXISTS` guards so that re-running is the recovery.
