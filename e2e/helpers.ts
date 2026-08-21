/**
 * Shared helpers for Playwright E2E routing tests.
 *
 * These tests simulate the post-OAuth state by creating a confirmed user
 * via the Supabase admin API and then signing in through the /auth page
 * with email+password. The routing under test (`/dashboard` ->
 * `getMyOrgStatus` -> `/welcome` or `/org/setup`) runs the same way
 * regardless of whether the session came from Google OAuth or password
 * sign-in, so this faithfully exercises the Google-signup contract
 * without needing a real Google account.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!URL || !SERVICE_KEY || !ANON_KEY) {
  throw new Error(
    "E2E env missing: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY required",
  );
}

export const admin: SupabaseClient = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface SeededUser {
  id: string;
  email: string;
  password: string;
}

export function uniqueTag(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createOAuthLikeUser(tag: string): Promise<SeededUser> {
  const email = `${tag}@example.test`;
  const password = `Test!${tag}aA1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Google Test User",
      signup_intent: "create_organization",
    },
  });
  if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
  return { id: data.user.id, email, password };
}

export async function deleteUser(id: string): Promise<void> {
  await admin.auth.admin.deleteUser(id);
}

export async function signInViaUI(page: Page, user: SeededUser): Promise<void> {
  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(user.email);
  await page.getByLabel(/password/i).first().fill(user.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
}
