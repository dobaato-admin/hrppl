# Manual QA checklist — Google session persistence & token refresh

This checklist verifies that Google sign-in produces a session that survives
the same things an email/password session does: refreshes, new tabs, new
devices, and the silent refresh-token rotation that Supabase performs every
~60 minutes.

Run through this list any time the auth client, the `lovable` OAuth wrapper,
or the redirect-URI allowlist changes.

## Pre-flight

- [ ] Project is published OR being tested on an origin listed in
      `src/lib/oauth-config.ts` (`ALLOWED_OAUTH_ORIGINS`).
- [ ] Google provider is enabled in Lovable Cloud → Authentication.
- [ ] You have a Google account NOT already linked to a hrppl user.

Recent confirmation in production (`hrppl.io`): a `token_refreshed` event
followed by a `token_revoked` event for `expertsydney@gmail.com` was
observed in the auth logs, which is the normal refresh-token rotation
pattern. Use that as your baseline shape — if you don't see the same pair
during the refresh checks below, something is wrong.

## A. First-time sign-in (Device 1, normal window)

1. [ ] Open `https://hrppl.io/auth`.
2. [ ] Click **Continue with Google** and approve consent.
3. [ ] Land on `/dashboard` (or `/welcome` if no tenant). No error toast.
4. [ ] DevTools → Application → Local Storage → `sb-*-auth-token` is present
       and contains `access_token`, `refresh_token`, and an `expires_at`
       roughly 60 minutes in the future.

## B. Hard refresh (same tab)

1. [ ] Press ⌘R / Ctrl-R. The same page reloads, you stay signed in, no
       redirect to `/auth`.
2. [ ] Network tab shows a `GET .../auth/v1/user` returning the same user id
       as before the refresh.

## C. Close & reopen tab (same browser profile)

1. [ ] Close the tab, reopen `https://hrppl.io/dashboard` directly.
2. [ ] You're signed in without going through `/auth`.

## D. New device / second browser profile

1. [ ] On a different device (or a fresh Chrome/Firefox profile), open
       `https://hrppl.io/auth`.
2. [ ] Click **Continue with Google**, choose the same Google account.
3. [ ] You're signed in as the SAME user (same email shown in
       `Settings → Account`). NO duplicate account was created.
4. [ ] Both Device 1 and Device 2 remain signed in independently — each
       device has its own refresh-token chain.

## E. Incognito / private window

1. [ ] Open an incognito window. Visit `/dashboard` directly. You're
       redirected to `/auth` (no shared session — expected).
2. [ ] Click **Continue with Google**. Approve.
3. [ ] You land on `/dashboard` as the same user.
4. [ ] Close the incognito window. Reopen incognito. Visit `/dashboard`.
       You're redirected to `/auth` (session correctly NOT persisted
       across incognito sessions).

## F. Silent refresh (the 60-minute test)

The Supabase client auto-refreshes 5 minutes before the access token expires.
You can either wait ~55 minutes OR force it by clearing the `access_token`
from local storage while keeping the `refresh_token`.

1. [ ] In DevTools, edit the `sb-*-auth-token` entry: set `expires_at` to a
       timestamp 30 seconds in the future. Save.
2. [ ] Wait 60–90 seconds with the tab focused.
3. [ ] Network tab shows a `POST .../auth/v1/token?grant_type=refresh_token`
       returning `200`. (This is the exact event seen in the production
       auth logs as `token_refreshed`.)
4. [ ] Local storage now has a fresh `access_token` and a new `expires_at`
       ~60 minutes ahead. You stayed on the page — no redirect to `/auth`.

## G. Account linking (existing email user → adds Google)

1. [ ] Sign in with an existing email/password account.
2. [ ] Open `Settings → Account` → **Connected sign-in methods**.
3. [ ] Google row shows **Not connected** with a **Connect Google** button.
4. [ ] Click **Connect Google**, approve the same Google account.
5. [ ] You return to `/settings/account`. Google row now shows
       **Connected** with an **Unlink** button.
6. [ ] In Lovable Cloud → Users, confirm there is still exactly ONE auth
       user for that email (no duplicate created by the link).
7. [ ] Sign out. Sign back in with **Continue with Google** on `/auth`.
       You land on the SAME account (employee record, tenant, roles
       preserved).

## H. Misconfigured-origin guard

1. [ ] Edit `src/lib/oauth-config.ts` temporarily — remove
       `https://hrppl.io` from `ALLOWED_OAUTH_ORIGINS`.
2. [ ] Reload `https://hrppl.io/auth`.
3. [ ] Click **Continue with Google**.
4. [ ] A toast titled **Sign-in misconfigured** appears and the OAuth flow
       does NOT start (no Google redirect).
5. [ ] DevTools console shows a structured
       `[oauth] redirect_uri_mismatch { currentOrigin, attemptedRedirectUri,
       allowedOrigins, ... }` log entry.
6. [ ] Restore `ALLOWED_OAUTH_ORIGINS`.

## I. Sign-out

1. [ ] In `Settings → Account`, sign out.
2. [ ] `sb-*-auth-token` entry is removed from local storage.
3. [ ] Reload `/dashboard`. You're redirected to `/auth`.

If any step fails, capture the failing step number, the Network tab
`auth/v1` requests, and the `sb-*-auth-token` local-storage value (with the
token value redacted) before filing.
