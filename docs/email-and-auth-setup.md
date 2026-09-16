# Email and auth URLs

Two problems with one root cause: **neither is carried by a migration**, so the
production project was still running Supabase's untouched defaults after the
v1.0.0 release.

---

## 1. Why the confirmation link pointed at `http://localhost:3000`

Not an application bug. `signup.tsx:104` already sends the right thing:

```ts
emailRedirectTo: `${window.location.origin}${redirect}`   // -> https://…/org/setup
```

GoTrue validates that against the project's **redirect allowlist**. On the
production project the allowlist was the empty string, so *every* redirect the
app asked for was rejected and silently replaced with **Site URL** — whose
untouched default is `http://localhost:3000`.

The tell is in the link itself: it landed on `/`, not on `/org/setup`. If the
app's value had been used, the path would have survived.

GoTrue failing closed here is correct — honouring an unvalidated redirect on an
auth link hands the access token in the URL fragment to whoever asked for it.
It fails *silently*, which is the only reason this looked like the app's doing.

```
Before (production):  site_url       = "http://localhost:3000"
                      uri_allow_list = ""
```

Fix — the script writes both, and `--show` first if you want to see the current
state without changing anything:

```sh
node scripts/configure-auth.mjs --env prod --show
node scripts/configure-auth.mjs --env prod --urls
node scripts/configure-auth.mjs --env dev  --urls
```

Or Dashboard → Authentication → URL Configuration.

| | Site URL | Redirect allowlist |
| --- | --- | --- |
| prod | `https://hrppl.io` | `https://hrppl.io/**`, `https://www.hrppl.io/**`, `https://hrppl.vercel.app/**` |
| dev | `http://localhost:8080` | `http://localhost:8080/**`, `https://hrppl-*.vercel.app/**` |

**Production gets no wildcards, deliberately.** `https://hrppl-*.vercel.app/**`
would also match a project someone else creates on Vercel whose name begins
`hrppl-`, and a matching redirect on an auth link is a handover of the token in
the fragment. On the development project the wildcard is fine — preview
hostnames are generated per branch and per commit so exact entries are
impossible, it holds demo data, and a token minted against it grants nothing.

### The account that already signed up

`ams@dobaato.com` exists and is confirmed (`email_verified: true` in that
token) — the allowlist problem broke only the *redirect*, not the signup. It
still holds no role. The grant in `docs/release-v1.0.0.md` §1 is what makes it
a `super_admin`.

---

## 2. Resend goes in two places, because two different systems send mail

This is the part that is easy to get half-right. Putting `RESEND_API_KEY` in
Vercel and stopping there leaves every password reset still going through
Supabase's shared sender.

| | Sent by | Configured in | Covers |
| --- | --- | --- | --- |
| **Auth email** | GoTrue, inside Supabase | the **Supabase project's SMTP settings** | signup confirmation, password reset, magic link, email-change |
| **App email** | this codebase | **Vercel environment variables** | invitations, reminders, payslips, approvals — all 28 templates |

Nothing in `src/` can intercept an auth email. The `auth_emails` pgmq queue
exists but **has no producer anywhere in the repo** — GoTrue sends those
directly, so SMTP settings are the only lever.

### 2a. Auth email — Supabase SMTP

```sh
RESEND_API_KEY=re_xxx node scripts/configure-auth.mjs --env prod --urls --smtp
RESEND_API_KEY=re_xxx node scripts/configure-auth.mjs --env dev  --urls --smtp
```

Or Dashboard → Project Settings → Authentication → SMTP Settings:

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` (587 also works; 25 is blocked) |
| Username | `resend` — the literal word, for every account |
| Password | the API key |
| Sender email | `noreply@hrppl.io` (a **verified** domain) |

The username trips people up: putting the API key in the *username* field
authenticates as nobody and returns a generic `535`.

**This is urgent, not cosmetic.** With no custom SMTP a project uses Supabase's
shared sender, and production currently reads `rate_limit_email_sent: 2` —
**two emails per hour for the entire project**. The third person to sign up in
an hour gets nothing, and Supabase documents that sender as not for production.
The script raises it to 30/hour once a real sender is attached.

### 2b. App email — Vercel

Add to the Vercel project, **Production** environment:

```
RESEND_API_KEY   re_xxx
EMAIL_FROM       hrppl <noreply@hrppl.io>
```

And to **Preview** (the `uat` branch), so UAT does not send as production —
ideally a separate Resend key so you can revoke one without the other:

```
RESEND_API_KEY   re_xxx
EMAIL_FROM       hrppl UAT <noreply@hrppl.io>
```

Neither is `VITE_`-prefixed, so neither reaches the browser. `EMAIL_FROM` must
be on a domain verified under **Resend → Domains**; an unverified `From:` is a
hard 403 on every message.

### What changed in the code

`src/lib/email/resend.server.ts`, plus a transport swap in
`src/routes/lovable/email/queue/process.ts`. Nothing else. The pipeline was
already complete — suppression lists, per-user notification preferences,
unsubscribe tokens, TTLs, a retry budget, a duplicate-send guard, 429 backoff
and a dead-letter queue. Only delivery was missing, because `LOVABLE_API_KEY`
has been the literal string `REPLACE-ME` in every environment.

`ResendError` deliberately carries `status` and `retryAfterSeconds`, the same
two fields `process.ts` already reads off the Lovable error, so the existing
classification keeps working untouched:

- **429** → park the queue until `retry_after_until`, leave messages enqueued
- **403** → straight to the dead-letter queue; five retries cannot fix a
  missing DNS record
- anything else → log an attempt, retry when the visibility timeout expires

Raw `fetch`, not the `resend` package: one POST to one endpoint, and a new
dependency would need an exclusion from `bunfig.toml`'s 24-hour
`minimumReleaseAge` supply-chain delay.

---

## 3. The queue has no drain, so nothing sends yet

Both of the above can be correct and **no application email will arrive**.
`sendInternalEmail` only enqueues. `/lovable/email/queue/process` is what
delivers, it is POST-only, and **nothing calls it** — the Lovable platform used
to, via the API key that was never set.

Vercel Cron is not available: Hobby allows two jobs, and `vercel.json` already
spends both on `leave-accrual` and `audit-retention-run`. Use `pg_cron`, which
is already enabled and already used by several migrations:

```sql
select cron.schedule(
  'email-queue-drain',
  '* * * * *',                       -- every minute; the drainer is idempotent
  $CRON$
  select net.http_post(
    url     := 'https://hrppl.io/lovable/email/queue/process',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $CRON$
);
```

Run it in the **production** project's SQL editor with that project's own
service-role key, and again in dev against the UAT URL.

Two things to know before running it:

- **That endpoint authenticates with the service-role key as a bearer token**
  (`process.ts:87`). This is pre-existing and is exactly the pattern
  `cron-auth.server.ts` was written to get *away* from for `/api/public/hooks/*`
  — a single log or proxy capture is a full RLS bypass. It is out of scope for
  this change, but it is why the `CRON_SECRET` treatment should reach this
  endpoint too.
- **Check the backlog before scheduling.** Every email the product has ever
  queued is still in `transactional_emails`. The TTL sweep will dead-letter
  anything past 60 minutes rather than sending it, so old messages will not
  suddenly go out — but confirm rather than assume:

  ```sql
  select count(*) from pgmq.q_transactional_emails;
  select status, count(*) from public.email_send_log group by status;
  ```

## 4. Verifying

```sh
node scripts/configure-auth.mjs --env prod --show   # expect hrppl.io + smtp.resend.com
```

Then sign up a throwaway address on production. The confirmation link should
land on `https://hrppl.io/org/setup#access_token=…`, not on `localhost`, and the
mail should show as delivered in the Resend dashboard.

## 5. Still not configured

- **Google OAuth is off on production** (`external_google_enabled: false`).
  `/auth` offers a Google button that cannot work there until a client ID,
  secret and redirect URI are set for `hrppl.io`.
- **`notify.hrppl.io` does not resolve**, and `hrppl.io` has no MX record. The
  templates in `send-internal.server.ts` name that subdomain as the sender
  domain. Add and verify whichever domain you intend to send from in Resend,
  then make `EMAIL_FROM` match it.
