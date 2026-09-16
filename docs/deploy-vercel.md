# Deploying to Vercel

> **Read `docs/deploy-environments.md` first.** Since v1.0.0 there are *two* Vercel
> projects on this repository: `hrppl-prod` builds `main` against the production
> Supabase project, and the project described below builds `uat` against the
> development one. This document remains the mechanical reference — build settings,
> env vars, cron, the "This page didn't load" troubleshooting — and all of it still
> applies. What it does not describe is which project builds which branch.

Target: **Vercel Hobby**, GitHub integration, Vercel-assigned `*.vercel.app` domain,
connected to the existing Supabase dev project `xnrjfrxzahmfdrqfsnnq`.

---

## 1. What already changed in the repo

You do not need to redo any of this — it is committed. It is listed so the next person knows
why these files look the way they do.

| File | Change | Why |
| --- | --- | --- |
| `vite.config.ts` | `nitro: { preset: "vercel" }` | The wrapper's zero-config default is `cloudflare-module`. Left alone, the build emits a Cloudflare Worker and Vercel has nothing to serve. Override with `NITRO_PRESET` to build elsewhere. |
| `vite.config.ts` | `cloudflareWorkersStub()` plugin | `@lovable.dev/mcp-js` dynamically imports `cloudflare:workers`; Rollup cannot resolve that off-Workers and **the build hard-fails**. The import is a guarded fallback tried only after `process.env`, so an empty stub is behaviour-neutral. Disabled automatically for Cloudflare presets. |
| `vercel.json` | `installCommand: bun install` | Both `bun.lock` and `package-lock.json` are tracked. If Vercel picks npm, `patches/@lovable.dev%2Fmcp-js` never applies and the toolchain breaks. Pin it. |
| `vercel.json` | `crons` (2 jobs) | Hobby allows 2 cron jobs, once per day each. |
| `src/routes/api/public/hooks/leave-accrual.ts` | added `GET` handler | **Vercel Cron issues GET, not POST.** Every hook was POST-only, so the crons would have 405'd forever. GET takes no body and runs the current UTC period. |
| `src/routes/api/public/hooks/audit-retention-run.ts` | added `GET`, made auth fail-closed | Same GET issue. Its auth also read `if (secret && auth !== ...)`, leaving the endpoint **fully open whenever `AUDIT_RETENTION_SECRET` was unset** — which is the default. It now accepts `AUDIT_RETENTION_SECRET` *or* `CRON_SECRET`, and denies otherwise. |
| `.gitignore` | `.vercel/` | The build writes `.vercel/output`; the CLI writes `.vercel/project.json`. Neither belongs in git. |

`vercel.json` deliberately sets **no `outputDirectory`**. The `vercel` Nitro preset emits
Build Output API v3 into `.vercel/output`, which Vercel consumes directly.

Verified locally: `bun run build` succeeds and produces
`.vercel/output/{config.json,functions/__server.func,static}`.

---

## 2. Create the Vercel project

1. <https://vercel.com/new> → **Import Git Repository** → `dobaato-admin/hrppl`.
2. **Project Name** — this decides your domain. Naming it `hrppl` gives you
   `hrppl.vercel.app`. **Write the resulting domain down; steps 3 and 4 both need it.**
3. **Framework Preset**: `Other`. Do not pick Vite — that would serve a static SPA and every
   server function would 404.
4. Leave the Build and Install command overrides **empty**; `vercel.json` supplies both.
5. **Do not deploy yet.** Add the environment variables first — otherwise the first build
   ships a client bundle with no `VITE_SUPABASE_*` baked in, and you will have to redeploy
   anyway.

## 3. Environment variables

`.env.vercel.production` was generated in the repo root, pre-filled from your current `.env`.
**It is gitignored — it holds the service-role key. Do not commit it.**

In Vercel: **Settings → Environment Variables → Import .env**, paste that file's contents,
and target **Production and Preview**.

Before importing, fix these placeholders:

- `PUBLIC_APP_URL`, `APP_URL`, `SITE_URL`, `PUBLIC_SITE_URL` — replace
  `https://REPLACE-ME.vercel.app` with the domain from step 2. These are not cosmetic:
  `staff-invitations.functions.ts` and `kpi-cycles.functions.ts` fall back to a hardcoded
  `https://hrppl.io`, so leaving them unset sends every invitation and reminder email
  pointing at a domain this deployment does not serve.
- `LOVABLE_API_KEY`, `LOVABLE_SEND_URL` — **not present in your `.env`**, so they are stubbed
  as `REPLACE-ME`. Outbound email will not send until you supply real values. Everything else
  works without them.

> **`VITE_*` vars are baked in at BUILD time, not read at runtime.** If a deploy ran before
> these were added, its client bundle has no Supabase URL — SSR still returns 200 (the server
> falls back to `process.env`), but the browser throws on first use and you get the React
> error boundary in `__root.tsx`: *"This page didn't load"*. Adding the vars afterwards fixes
> nothing on its own — **you must redeploy**, and the redeploy must not reuse a cached build.

What is intentionally absent:

- `VITE_DEV_BYPASS_MFA` — **never set this in Vercel.** It disables the MFA gate. It is
  already inert in production builds (`import.meta.env.DEV`), but do not tempt it.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — billing is off by your choice. The
  `/api/public/hooks/stripe-webhook` route stays deployed but unconfigured.
- `CRON_ALLOW_SERVICE_ROLE_FALLBACK` — leave unset. Setting it makes the service-role key a
  valid bearer token on 20 public endpoints.
- `NODE_ENV` — Vercel sets this itself. Overriding it is a documented footgun (it can make
  the install skip devDependencies, and every build tool here is a devDependency).

Anything `VITE_*` is compiled into the browser bundle. The Google Maps key is client-side by
necessity — **domain-restrict it in Google Cloud Console to your Vercel domain.**

## 4. Point Supabase Auth at the new domain

Without this, sign-in redirects land on `localhost` and login is broken. Supabase dashboard →
**Authentication → URL Configuration**:

- **Site URL**: `https://<your-domain>.vercel.app`
- **Redirect URLs**:
  - `https://<your-domain>.vercel.app/**`
  - `https://*-<your-vercel-scope>.vercel.app/**` ← only if you want preview deploys to log in

Every auth redirect in the app is built from `window.location.origin` (`/reset-password`,
`/invite/:token`, and the post-login `redirect`), so the wildcard covers all of them — no
per-route entries needed.

If you use Google OAuth, add the same origin to the Google Cloud OAuth client's **Authorized
JavaScript origins**, and `https://xnrjfrxzahmfdrqfsnnq.supabase.co/auth/v1/callback` to
**Authorized redirect URIs** (that one is Supabase's, not Vercel's).

## 5. Deploy

Push to `main`, or hit **Deploy** in the dashboard. Every later push to `main` ships to
production; pull requests get preview URLs automatically.

---

## 6. Cron jobs

Hobby caps you at **2 cron jobs, once per day**. `vercel.json` wires the two that matter most
and are safely idempotent:

| Path | Schedule (UTC) | Why this one |
| --- | --- | --- |
| `/api/public/hooks/leave-accrual` | `0 2 * * *` | Core balance correctness. Idempotent: `leave_accrual_log` is unique on `period_key` and a `23505` is treated as "already accrued", so 30 daily runs credit exactly once per month — and the month boundary can never be missed. |
| `/api/public/hooks/audit-retention-run` | `0 3 * * *` | Compliance retention. It never actually worked until the `20260821093000` trigger fix; this is the first deployment where it can run. |

Vercel sends `Authorization: Bearer $CRON_SECRET` automatically, which is exactly what
`isAuthorizedCronRequest` checks — no extra wiring. `AUDIT_RETENTION_SECRET` is set to the
same value so one rotation covers both.

### The other 18 hooks

They deploy and work; nothing schedules them. Vercel Hobby has no room. Two options:

1. **Supabase `pg_cron` + `pg_net`** (recommended — free, and `pg_cron` is already enabled;
   several migrations use it). Schedule an HTTP POST per hook:

   ```sql
   select cron.schedule(
     'onboarding-task-reminders',
     '0 8 * * *',
     $CRON$
     select net.http_post(
       url     := 'https://<your-domain>.vercel.app/api/public/hooks/onboarding-task-reminders',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <CRON_SECRET>"}'::jsonb,
       body    := '{}'::jsonb
     );
     $CRON$
   );
   ```

   Use **POST** here — the other 18 hooks are still POST-only; only the two Vercel crons
   needed GET handlers.

2. **Upgrade to Vercel Pro** and move them into `vercel.json` (each would need a GET handler).

Unscheduled until you do one of these: leave carry-over, monthly billing cycle,
onboarding/offboarding reminders, review + feedback + KPI reminders, discipline alerts,
geofence reconciliation, ID-request retries, auto-retry alerts, SLA sweep, blog webhook
deliveries.

---

## 7. Post-deploy checklist

- [ ] `https://<domain>/` renders and the app shell (sidebar + top bar) is present.
- [ ] Sign in with a seeded account from `docs/demo-accounts.md`. If it bounces to localhost,
      step 4 was missed.
- [ ] A tenant-scoped page (`/org/employees`) lists data. Empty for `super_admin` /
      `regional_admin` is **correct** — they have `tenant_id = NULL` and there is still no
      tenant switcher (CLAUDE.md, Known gaps #1).
- [ ] `curl -i https://<domain>/api/public/hooks/leave-accrual` → **401** (proves the hook
      deployed and is fail-closed).
- [ ] Same request with `-H "Authorization: Bearer <CRON_SECRET>"` → **200** and a JSON summary.
- [ ] Vercel → Settings → Cron Jobs lists both entries.
- [ ] DevTools console clean on first load, no CSP violations. `src/lib/security-headers.ts`
      builds `connect-src` from `SUPABASE_URL`, so a missing value surfaces here as blocked
      Supabase calls.

## 8. Troubleshooting: "This page didn't load"

That exact string is rendered by **two different things**, and they mean opposite things.
Check the page source before doing anything else:

| What you see | Which one | Meaning |
| --- | --- | --- |
| System font, `#111` button, no app CSS, page source is a short standalone document | `src/lib/error-page.ts`, served by `src/server.ts` | A genuine **SSR 500**. The server threw. Check Vercel Runtime Logs — `src/server.ts` `console.error`s the real error. |
| App fonts (Manrope/Sora), Tailwind classes, full app HTML in view-source | `ErrorComponent` in `src/routes/__root.tsx` | SSR **succeeded** (HTTP 200) and the crash happened in the browser. Almost always a missing `VITE_*` var — see below. |

**The common cause:** a deploy whose build ran before the environment variables existed. Confirm
it directly, without guessing:

```sh
# 1. Find the client bundle hash
curl -s https://<domain>/ | grep -o '/assets/index-[A-Za-z0-9_-]*\.js' | head -1

# 2. Check whether the Supabase project ref was compiled into it
curl -s https://<domain>/assets/index-<HASH>.js | grep -c xnrjfrxzahmfdrqfsnnq
```

`1` means the vars were baked in correctly. **`0` means they were not** — the build predates
them. Fix: Vercel → Deployments → ⋯ → **Redeploy**, with **"Use existing Build Cache" unchecked**.
Adding the variables alone changes nothing until a fresh build runs.

To see whether SSR itself is healthy, independent of the browser:

```sh
curl -s -o /dev/null -w '%{http_code}' https://<domain>/
```

200 means SSR is fine and the fault is client-side.

## 9. Known limitations on this deployment

- **Hobby serverless functions time out at 60s.** The whole app is one `__server.func`, so
  long operations — a full-tenant payroll run, a tenant-wide review fan-out, `leave-accrual`
  across many tenants — can be cut off mid-flight. Accrual is idempotent, so a retry is safe;
  payroll runs are the ones to watch.
- **Cold starts.** Everything routes through a single function; expect a slow first request
  after idle.
- This points at the **dev** Supabase project — the same database the demo seed wipes.
  `scripts/demo-seed.ts` deletes tenants by creator. Do not run the seed against a project a
  live deployment is serving unless you mean it.
