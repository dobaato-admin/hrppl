#!/usr/bin/env bash
# =============================================================================
# Vercel "Ignored Build Step" — which branch belongs to which project
# =============================================================================
#
# Two Vercel projects are connected to this one GitHub repository:
#
#   hrppl-prod   production branch `main` -> PRODUCTION Supabase (ifitgxscyuabessaoqui)
#   hrppl (old)  production branch `uat`  -> DEVELOPMENT Supabase (xnrjfrxzahmfdrqfsnnq)
#
# By default Vercel builds EVERY push on EVERY connected project, so without
# this script each commit builds twice and `main` would be deployed by the UAT
# project as well — against the development database, under the URL people
# think is production. Nothing errors; you simply get a second deployment of
# production code wired to the wrong project.
#
# Vercel's exit-code convention is inverted and worth stating plainly:
#
#     exit 0  ->  SKIP the build
#     exit 1  ->  RUN  the build
#
# Set `DEPLOY_TARGET` in each project's environment variables (all three
# environments — Production, Preview and Development — so preview builds are
# routed too):
#
#     hrppl-prod   DEPLOY_TARGET=production   builds `main`, nothing else
#     hrppl (old)  DEPLOY_TARGET=uat          builds everything EXCEPT `main`
#
# The UAT project deliberately keeps every other branch, so pull-request
# previews still build — pointed at the development database, which is where a
# preview belongs. Only `main` is withheld from it.
#
# With DEPLOY_TARGET unset the script builds everything, which is exactly what
# Vercel does with no Ignored Build Step at all. A missing variable therefore
# degrades to the previous behaviour rather than silently deploying nothing.

set -euo pipefail

BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
TARGET="${DEPLOY_TARGET:-}"
PROD_BRANCH="main"

build()  { echo "BUILD: $1"; exit 1; }
skip()   { echo "SKIP:  $1"; exit 0; }

if [ -z "$TARGET" ]; then
  build "DEPLOY_TARGET is not set — building every branch (Vercel default)."
fi

if [ -z "$BRANCH" ]; then
  # No git ref: a redeploy from the dashboard or a CLI deploy. Refusing here
  # would make the "Redeploy" button do nothing, with no explanation.
  build "no VERCEL_GIT_COMMIT_REF (manual or CLI deploy) — building."
fi

case "$TARGET" in
  production)
    [ "$BRANCH" = "$PROD_BRANCH" ] \
      && build "branch '$BRANCH' is the production branch." \
      || skip  "branch '$BRANCH' is not '$PROD_BRANCH'; the UAT project owns it."
    ;;
  uat)
    [ "$BRANCH" = "$PROD_BRANCH" ] \
      && skip  "branch '$BRANCH' belongs to the production project." \
      || build "branch '$BRANCH' is UAT or a preview."
    ;;
  *)
    # An unrecognised value is a typo, and skipping on a typo means deployments
    # silently stop. Build, and say why.
    build "DEPLOY_TARGET='$TARGET' is not recognised (expected 'production' or 'uat') — building."
    ;;
esac
