#!/usr/bin/env bash
# Local Playwright E2E harness.
#
# 1. Loads .env.e2e (copy from .env.e2e.example)
# 2. Seeds tenant + super_admin user via scripts/e2e-seed.ts
# 3. Boots Vite preview (or reuses an existing server on E2E_BASE_URL)
# 4. Runs `bun run test:e2e`
#
# Usage:
#   ./scripts/e2e-harness.sh                 # full run
#   ./scripts/e2e-harness.sh e2e/auth-*.spec # subset
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env.e2e ]; then
  set -a; . ./.env.e2e; set +a
fi

: "${SUPABASE_URL:?set SUPABASE_URL in .env.e2e}"
: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY in .env.e2e}"
: "${SUPABASE_PUBLISHABLE_KEY:?set SUPABASE_PUBLISHABLE_KEY in .env.e2e}"

# Mirror to VITE_* so the dev server picks them up.
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-$SUPABASE_URL}"
export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-$SUPABASE_PUBLISHABLE_KEY}"
export VITE_SUPABASE_PROJECT_ID="${VITE_SUPABASE_PROJECT_ID:-}"

# SMTP + OAuth fixtures (mailpit + dummy creds — never real ones in CI).
export SMTP_HOST="${SMTP_HOST:-127.0.0.1}"
export SMTP_PORT="${SMTP_PORT:-1025}"
export SMTP_HTTP_PORT="${SMTP_HTTP_PORT:-8025}"
export E2E_FAKE_OAUTH_CLIENT_ID="${E2E_FAKE_OAUTH_CLIENT_ID:-test-google-client-id}"
export E2E_FAKE_OAUTH_CLIENT_SECRET="${E2E_FAKE_OAUTH_CLIENT_SECRET:-test-google-secret}"

echo "[harness] seeding tenant + admin user…"
bun run scripts/e2e-seed.ts

echo "[harness] launching Playwright…"
exec bunx playwright test "$@"
