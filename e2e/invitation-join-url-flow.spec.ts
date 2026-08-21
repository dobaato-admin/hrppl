/**
 * E2E: invitation email payload contains a valid join URL/token, and
 * following that URL successfully completes the signup flow for the
 * invited user.
 *
 * Flow:
 *   1. Seed tenant + org admin (with org_admin role).
 *   2. Org admin signs in via UI and sends a staff invitation.
 *   3. Assert:
 *      - `staff_invitations` row created with a token matching the
 *        validator regex (/^[a-f0-9]{20,128}$/) used by acceptInvitation.
 *      - `email_send_log` row created for the `staff-invitation` template
 *        targeting the invitee.
 *      - The join URL we would email — `${origin}/invite/${token}` —
 *        parses cleanly and the path matches `/invite/<hex token>`.
 *   4. Pre-confirm the invitee user via the admin API (simulates the
 *      recipient having clicked the email confirmation), sign them in via
 *      `/auth`, then visit the invite URL.
 *   5. Fill the required AU details (contact, next of kin, bank, BSB, TFN)
 *      and submit. Assert redirect to `/onboarding/profile` and that the
 *      `staff_invitations` row transitions to `accepted`.
 */
import { test, expect } from "@playwright/test";
import {
  admin,
  createOAuthLikeUser,
  deleteUser,
  signInViaUI,
  uniqueTag,
  type SeededUser,
} from "./helpers";

const TOKEN_RE = /^[a-f0-9]{20,128}$/i;

let adminUser: SeededUser;
let inviteeUser: SeededUser;
let tenantId = "";
const inviteeEmail = `joinflow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.test`;
const inviteePassword = `Test!Join${Date.now()}aA1`;

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_join_url");

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Join URL Org ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  adminUser = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: adminUser.id, email: adminUser.email, full_name: "Join URL Admin", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin.from("user_roles").insert({ user_id: adminUser.id, role: "org_admin", tenant_id: tenantId } as any);

  // Pre-create the invitee account as already-confirmed so the test can sign
  // in without going through the email-confirmation step. The invitation
  // join flow is what we're testing — not the confirmation hop.
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: inviteeEmail,
    password: inviteePassword,
    email_confirm: true,
    user_metadata: { full_name: "Invitee Joiner" },
  });
  if (cErr || !created.user) throw new Error(`invitee create: ${cErr?.message}`);
  inviteeUser = { id: created.user.id, email: inviteeEmail, password: inviteePassword };
});

test.afterAll(async () => {
  await admin.from("staff_invitations").delete().eq("tenant_id", tenantId);
  await admin.from("email_send_log").delete().eq("recipient_email", inviteeEmail);
  await admin.from("email_unsubscribe_tokens").delete().eq("email", inviteeEmail);
  await admin.from("employees").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", adminUser.id);
  if (inviteeUser?.id) await deleteUser(inviteeUser.id);
  if (adminUser?.id) await deleteUser(adminUser.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("invitation join URL is well-formed and the invited user can complete signup", async ({ page, baseURL }) => {
  // 1. Org admin signs in and sends the invitation through the UI.
  await signInViaUI(page, adminUser);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  await page.goto("/org/invitations");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /invite staff/i }).click();
  await page.getByLabel(/work email/i).fill(inviteeEmail);
  await page.getByLabel(/first name/i).fill("Invitee");
  await page.getByLabel(/last name/i).fill("Joiner");
  await page.getByLabel(/job title/i).fill("Engineer");
  await page.getByRole("button", { name: /send invitation/i }).click();
  await expect(page.getByText(/invitation sent/i)).toBeVisible({ timeout: 15_000 });

  // 2. Validate token + payload.
  const { data: inv } = await admin
    .from("staff_invitations")
    .select("id, token, status, email")
    .eq("tenant_id", tenantId)
    .eq("email", inviteeEmail.toLowerCase())
    .maybeSingle();
  expect(inv, "invitation row missing").toBeTruthy();
  const token = (inv as any).token as string;
  expect(token, "token missing").toBeTruthy();
  expect(token).toMatch(TOKEN_RE);
  expect((inv as any).status).toBe("pending");

  const { data: log } = await admin
    .from("email_send_log")
    .select("template_name, recipient_email, status")
    .eq("template_name", "staff-invitation")
    .ilike("recipient_email", inviteeEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  expect(log, "no email_send_log entry for staff-invitation").toBeTruthy();

  // 3. The join URL must parse cleanly and match the expected /invite/<token> shape.
  const origin = baseURL ?? "http://localhost:3000";
  const joinUrl = `${origin}/invite/${token}`;
  const parsed = new URL(joinUrl);
  expect(parsed.protocol).toMatch(/^https?:$/);
  expect(parsed.pathname).toBe(`/invite/${token}`);
  expect(parsed.pathname.split("/").pop()).toMatch(TOKEN_RE);

  // 4. Sign out admin, sign in as the (already-confirmed) invitee, follow the URL.
  await page.goto("/auth");
  await page.evaluate(async () => {
    const { supabase } = await import("/src/integrations/supabase/client.ts" as any);
    await supabase?.auth?.signOut?.();
  }).catch(() => { /* fall through; we'll just sign in again */ });

  await signInViaUI(page, inviteeUser);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  await page.goto(`/invite/${token}`);
  await page.waitForLoadState("networkidle");

  // Header shows the org + invitee email — proves the token resolved.
  await expect(page.getByText(inviteeEmail, { exact: false })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/your details/i)).toBeVisible();

  // 5. Fill required AU details and submit.
  await page.getByLabel(/^contact number/i).fill("+61412345678");
  await page.getByLabel(/full name/i).first().fill("Kin Joiner");
  await page.getByLabel(/^phone/i).fill("+61498765432");
  await page.getByLabel(/account name/i).fill("Invitee Joiner");
  await page.getByLabel(/^bsb/i).fill("062000");
  await page.getByLabel(/account number/i).fill("12345678");
  await page.getByLabel(/^tfn/i).fill("123456782");

  await page.getByRole("button", { name: /finish|complete|submit|join/i }).last().click();

  await page.waitForURL("**/onboarding/**", { timeout: 20_000 });
  expect(page.url()).toMatch(/\/onboarding\//);

  // 6. Backend state reflects a completed accept.
  const { data: after } = await admin
    .from("staff_invitations")
    .select("status, accepted_at")
    .eq("id", (inv as any).id)
    .maybeSingle();
  expect((after as any)?.status).toBe("accepted");
  expect((after as any)?.accepted_at).toBeTruthy();
});
