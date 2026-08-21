import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { describePasswordSignInError, describeOAuthError } from "../src/lib/oauth-errors";

/**
 * "Email sign-in is not working" is unfalsifiable if the UI never says why.
 *
 * The password grant and the Google redirect flow fail in completely different
 * ways, but /auth described both with describeOAuthError — whose every branch
 * is OAuth-shaped and whose fallback mentions Google. Every password failure
 * therefore rendered as a generic Google-flavoured toast that vanished, hiding
 * GoTrue's error_code, which is the only thing that distinguishes a wrong
 * password from an unconfirmed address from a rate limit.
 */

/** GoTrue returns { code, error_code, message } — shape it the same way here. */
const gotrue = (code: string, message: string) => ({ code, error_code: code, message });

describe("password sign-in failures are described accurately", () => {
  it("distinguishes wrong credentials and points at the no-password case", () => {
    const info = describePasswordSignInError(
      gotrue("invalid_credentials", "Invalid login credentials"),
    );
    expect(info.code).toBe("invalid_credentials");
    expect(info.title).toMatch(/incorrect/i);
    // The most likely cause for a Google-created account: no password exists.
    expect(info.message).toMatch(/Forgot password/i);
  });

  it("distinguishes an unconfirmed email, where the password WAS right", () => {
    const info = describePasswordSignInError(
      gotrue("email_not_confirmed", "Email not confirmed"),
    );
    expect(info.code).toBe("email_not_confirmed");
    expect(info.title).toMatch(/not confirmed/i);
    expect(info.message).toMatch(/password is correct/i);
  });

  it("distinguishes a rate limit from a credential problem", () => {
    const info = describePasswordSignInError(
      gotrue("over_request_rate_limit", "Request rate limit reached"),
    );
    expect(info.title).toMatch(/too many/i);
  });

  it("distinguishes a suspended account", () => {
    expect(describePasswordSignInError(gotrue("user_banned", "User is banned")).title).toMatch(
      /suspended/i,
    );
  });

  it("distinguishes the provider being switched off", () => {
    expect(
      describePasswordSignInError(gotrue("email_provider_disabled", "Email logins are disabled"))
        .title,
    ).toMatch(/turned off/i);
  });

  it("never falls back to the Google-flavoured copy", () => {
    // Naming Google is fine and often correct — a Google-created account really
    // may have no password. What must not survive is describeOAuthError's
    // fallback sentence, which asserts the user was signing in with Google.
    for (const c of [
      "invalid_credentials",
      "email_not_confirmed",
      "user_banned",
      "over_request_rate_limit",
      "validation_failed",
      "email_provider_disabled",
    ]) {
      const info = describePasswordSignInError(gotrue(c, c));
      expect(`${info.title} ${info.message}`).not.toMatch(/signing you in with Google/i);
    }
  });

  it("always carries the raw code through for diagnosis", () => {
    // The whole point: the user can read the code off the screen and it maps
    // 1:1 to what the Network tab would have shown.
    expect(describePasswordSignInError(gotrue("weird_new_code", "Something")).code).toBe(
      "weird_new_code",
    );
  });

  it("falls back without inventing a code for unrecognised shapes", () => {
    const info = describePasswordSignInError(new Error("boom"));
    expect(info.code).toBe("");
    expect(info.message).toBe("boom");
  });

  it("leaves the Google describer alone", () => {
    // Regression guard: the OAuth path must keep its own copy.
    expect(describeOAuthError({ code: "access_denied" }).title).toMatch(/cancelled/i);
  });
});

describe("the sign-in form surfaces the failure persistently", () => {
  const AUTH = readFileSync(join(process.cwd(), "src/routes/auth.tsx"), "utf8");

  it("uses the password describer, not the OAuth one, for the password form", () => {
    const fn = AUTH.slice(AUTH.indexOf("async function signIn("), AUTH.indexOf("async function signInGoogle("));
    expect(fn).toMatch(/describePasswordSignInError/);
    expect(fn).not.toMatch(/describeOAuthError/);
  });

  it("renders an alert, not only a toast", () => {
    expect(AUTH).toMatch(/setSignInError\(info\)/);
    expect(AUTH).toMatch(/<Alert variant="destructive">/);
  });

  it("trims the email but never the password", () => {
    expect(AUTH).toMatch(/email: email\.trim\(\)/);
    // Whitespace in a password is significant — trimming it would silently
    // change the credential and produce this exact bug report.
    expect(AUTH).not.toMatch(/password: password\.trim\(\)/);
  });
});
