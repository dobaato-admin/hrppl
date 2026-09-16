# Two environments: production and UAT

From v1.0.0 this repository feeds **two Vercel projects and two Supabase
projects**. Nothing about the code differs between them — only environment
variables and which branch each project builds.

| | Production | UAT |
| --- | --- | --- |
| Branch | `main` | `uat` |
| Vercel project | **new** — `hrppl-prod` | **existing** — `hrppl` |
| URL | the new project's domain | `hrppl.vercel.app` (unchanged) |
| Supabase project | `ifitgxscyuabessaoqui` | `xnrjfrxzahmfdrqfsnnq` |
| Data | real | demo seed, throwaway |
| Env file to paste | `.env.vercel.prod` | already configured; add one variable |

`hrppl.vercel.app` keeps its URL and its database. What changes is the branch
it builds. Anyone who has bookmarked it keeps working exactly as before — which
is the point of not repointing it at production.

---

## The one thing that breaks if you skip it

Both Vercel projects are connected to the **same** GitHub repository, and
Vercel's default is that every project builds every push to every branch. Left
alone, each commit builds twice, and `main` gets deployed by the UAT project as
well — production code, wired to the development database, published under the
URL people think of as the live site. Nothing errors. You simply have two
deployments and no way to tell from the outside which is which.

`scripts/vercel-ignore-build.sh` is what prevents it. It is set as the
**Ignored Build Step** in both projects and keyed on one variable,
`DEPLOY_TARGET`:

- `DEPLOY_TARGET=production` — build `main`, skip everything else.
- `DEPLOY_TARGET=uat` — build everything *except* `main`.

The asymmetry is deliberate. The UAT project keeps every other branch so
pull-request previews still build, pointed at the development database, which
is where a preview belongs. Only `main` is withheld from it.

Vercel's exit-code convention is inverted — **0 skips the build, 1 runs it** —
which is worth knowing before editing the script. With `DEPLOY_TARGET` unset it
builds everything, so a forgotten variable degrades to Vercel's own default
rather than silently deploying nothing.

---

## 1. Vercel — create the production project

Do these in order. Adding the variables *before* the first deploy matters: a
build with the wrong `VITE_*` values still returns HTTP 200 from SSR, because
the server falls back to `process.env`, while the browser throws and renders
the error boundary. You get a site that looks broken in a way that does not
say which environment it is talking to.

1. **Add New → Project → Import** `dobaato-admin/hrppl`.
   Vercel will note the repository is already connected to another project.
   That is supported; continue.
2. **Project Name:** `hrppl-prod`. This becomes `hrppl-prod.vercel.app` unless
   you attach a custom domain.
3. **Framework Preset:** *Other*. `vercel.json` already sets `framework: null`,
   `installCommand: bun install` and `buildCommand: bun run build`. Do not
   override the build or install commands in the dashboard.
4. **Environment Variables → Import .env** → upload **`.env.vercel.prod`**
   (gitignored, in the repo root). Tick **Production** and **Preview**.
5. **Deploy.**
6. **Settings → Git → Production Branch:** `main`.
7. **Settings → Git → Ignored Build Step:** `bash scripts/vercel-ignore-build.sh`
8. **Settings → Deployment Protection:** new projects often enable Vercel
   Authentication on previews by default. Turn it off if you want previews
   openable without a Vercel login.
9. Note the real URL, then **update the four URL variables** to match it —
   `PUBLIC_APP_URL`, `APP_URL`, `SITE_URL`, `PUBLIC_SITE_URL` — and
   **redeploy**. Vercel does not apply variable changes to existing
   deployments. See §4 for why these four matter more than they look.

## 2. Vercel — move the existing project to `uat`

1. **Settings → Environment Variables:** add `DEPLOY_TARGET` = `uat`
   (all three environments).
2. **Settings → Git → Ignored Build Step:** `bash scripts/vercel-ignore-build.sh`
3. **Settings → Git → Production Branch:** change `main` to `uat`.
4. Leave every Supabase variable alone. This project stays on the development
   database, which is the entire point.
5. **Deployments → Redeploy** once from `uat`. Changing the production branch
   does not itself deploy; until you redeploy, the live `hrppl.vercel.app` is
   still the last build of `main`.

## 3. GitHub

1. The `uat` branch exists and is pushed, identical to `main` at `v1.0.0`.
2. **Settings → Branches → Add rule** for `main`:
   - Require a pull request before merging
   - Require status checks to pass
   - Do not allow force pushes
   `main` is now a deployment trigger for real data. A direct push is a release.
3. **Leave the default branch as `main`.** Everyday PRs target `uat`, so you
   will be changing the base branch in the PR form often; switching the default
   to `uat` removes that friction but makes the repository read as though `uat`
   were the trunk. Either is defensible — the reason to keep `main` is that the
   tag, the changelog and every document here already treat it as the trunk.
4. Expect **two Vercel checks** on each PR from now on. One will report as
   skipped; that is the ignore script, working.

### The workflow this sets up

```
feature branch  ──PR──>  uat  ──PR──>  main
                          │              │
                          │              └─> hrppl-prod      → production DB
                          └────────────────> hrppl.vercel.app → development DB
```

Promote forward, never sideways. A commit reaches production only by having
been on `uat` first, so nothing is cherry-picked and `main` only ever receives
what was tested. Merge `uat` → `main` when you want to release, and tag it.

### CI

`uat` was added to the branch filters in `e2e-tests`, `rbac-tests`,
`security`, `security-regression`, `security-findings-gate` and `seo-gate`.
Without that, the two gates pinned to `pull_request: branches: [main]` — the
open-criticals gate and the SEO gate — would not have run until the final
`uat → main` pull request, which is the last moment you want to discover a
blocker.

---

## 4. What is NOT carried by any of this

### The four URL variables

`PUBLIC_APP_URL`, `APP_URL`, `SITE_URL` and `PUBLIC_SITE_URL` are what
invitation, reminder and billing emails build their links from. Unset, the code
falls back to the literal `https://hrppl.io`, which is not this deployment:

```
src/lib/staff-invitations.functions.ts:28   process.env.PUBLIC_APP_URL || "https://hrppl.io"
src/lib/kpi-cycles.functions.ts:111         same
src/routes/api/public/hooks/org-setup-reminders.ts:31   same
```

Every invitation link would be dead, and nothing reports it — the failure
surfaces when somebody clicks a link, days later.

### `CRON_SECRET`

`isAuthorizedCronRequest` **fails closed** when `CRON_SECRET` is unset
(`src/lib/cron-auth.server.ts`). Both nightly jobs in `vercel.json` would
return 401 every night, silently. `.env.vercel.prod` carries a freshly
generated secret — deliberately not the development one, so a leak there
cannot fire production's jobs.

Vercel Cron issues **GET**, which is why only `leave-accrual` and
`audit-retention-run` are scheduled; the other 18 hooks are POST-only. Crons
run on **production deployments only**, so the UAT project will now run them
too, against the development database — harmless, and arguably useful, but know
that it is happening. On the Hobby plan crons are capped at two per project per
day and may be delayed.

### Supabase project settings

Migrations carry schema. They do not carry:

- **Auth URL configuration** — in the *production* Supabase project, set Site
  URL and the redirect allowlist to the new domain. Sign-in silently redirects
  to the wrong origin otherwise.
- **Google OAuth** — client ID, secret and authorised redirect URIs are
  per-origin. The existing credentials name the old origins only.
- **SMTP**, backups and PITR, custom domain.

Leave the development project's settings pointed at `hrppl.vercel.app`.

### Outbound email is not configured — and never was

`LOVABLE_API_KEY` and `LOVABLE_SEND_URL` are the literal placeholder
`REPLACE-ME` on the existing deployment too. This is pre-existing rather than a
regression, but production is where it starts to matter, because staff
invitations are email. `.env.vercel.prod` leaves both commented out rather than
pasting a placeholder that would look configured.

---

## 5. Confirming it actually worked

```sh
# Which Supabase project did each bundle compile against?
for host in hrppl-prod.vercel.app hrppl.vercel.app; do
  echo "--- $host"
  js=$(curl -s "https://$host/" | grep -oE '/_build/assets/[^"]+\.js' | head -1)
  curl -s "https://$host$js" | grep -oE '[a-z]{20}\.supabase\.co' | sort -u
done
```

Expect `ifitgxscyuabessaoqui.supabase.co` for the first and
`xnrjfrxzahmfdrqfsnnq.supabase.co` for the second. If both print the same ref,
the env-var step was missed or the project was never rebuilt after it.

`docs/deploy-vercel.md` §8 has the longer troubleshooting path for
"This page didn't load", including how to tell the SSR 500 page from the
client-side error boundary — they print the same string.

## Known issue, pre-existing

`.github/workflows/seo-gate.yml` **does not parse as YAML**. An inline
`python3 -c "..."` spans lines inside a `run: |` block at an indentation the
parser rejects (line 61). It fails identically at `v1.0.0` and before, so the
SEO gate has almost certainly never run. Not fixed here — changing what a merge
gate does is its own decision, not a side effect of environment setup.
