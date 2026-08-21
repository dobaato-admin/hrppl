# Local Playwright E2E Harness

Run the existing Playwright specs against a throwaway Supabase project
without needing the full Lovable preview.

## One-time setup

1. Copy `.env.e2e.example` to `.env.e2e` and fill in:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` —
     **use a throwaway/staging project**, never production. The seed script
     creates and mutates rows in `tenants`, `profiles`, and `user_roles`.
2. (Optional) Start Mailpit for SMTP-dependent specs:
   ```sh
   docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit
   ```
3. Install Playwright browsers once:
   ```sh
   bun run test:e2e:install
   ```

## Run

```sh
bun run e2e:harness                  # full suite
bun run e2e:harness e2e/auth-*.spec  # subset
```

The harness:

1. Loads `.env.e2e` and mirrors the Supabase vars to `VITE_*`.
2. Seeds one tenant + super_admin user via `scripts/e2e-seed.ts`. Result is
   written to `.e2e/seeded.json` — specs can read this to log in.
3. Hands off to `bunx playwright test`, which (per `playwright.config.ts`)
   boots `bun run dev` on :5173 unless `E2E_BASE_URL` is already set.

## CI

`.github/workflows/e2e-tests.yml` runs the routing-contract subset on every
PR. `.github/workflows/e2e-full.yml` runs the full suite nightly with
Mailpit and the same seed step.
