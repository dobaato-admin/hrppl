/**
 * E2E: when a freshly signed-up user has no tenant but DOES have a pending
 * staff invitation matching their email, /welcome must surface the
 * "pending invitation" affordance with an Accept option — and the
 * invitation-code form must accept their token.
 *
 * Seeds a tenant + a pending staff_invitation, then signs the invitee in
 * and asserts the UI contract.
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

let user: SeededUser;
let tenantId = "";
let invitationId = "";
let invitationToken = "";

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_invite");

  // Create a host tenant the invitation belongs to.
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Invite Host ${tag}`, country_code: "AU" })
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  // Create the invitee user (no tenant, no roles — matches post-OAuth state).
  user = await createOAuthLikeUser(tag);

  // Seed a pending invitation targeted at that email.
  invitationToken = `tok_${tag}`;
  const { data: inv, error: iErr } = await admin
    .from("staff_invitations")
    .insert({
      tenant_id: tenantId,
      email: user.email,
      first_name: "Invited",
      last_name: "User",
      job_title: "Engineer",
      role: "employee",
      token: invitationToken,
      status: "pending",
    })
    .select("id")
    .single();
  if (iErr || !inv) throw new Error(`invitation insert: ${iErr?.message}`);
  invitationId = (inv as { id: string }).id;
});

test.afterAll(async () => {
  if (invitationId) await admin.from("staff_invitations").delete().eq("id", invitationId);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("No tenant + pending invitation -> /welcome shows join-organization affordance", async ({ page }) => {
  await signInViaUI(page, user);

  await page.waitForURL("**/welcome", { timeout: 20_000 });

  // The pending-invitation card from getMyOrgStatus must render with Accept.
  await expect(page.getByText(/pending invitation/i)).toBeVisible();
  const accept = page.getByRole("button", { name: /accept invitation/i });
  await expect(accept).toBeVisible();
  await expect(accept).toBeEnabled();

  // The generic "Join an organization" form must also be present as a fallback.
  await expect(page.getByText(/join an organization/i)).toBeVisible();
  await expect(page.getByPlaceholder(/invitation code/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^join organization$/i })).toBeVisible();
});

test("Pasting the invitation token into the join form proceeds to onboarding", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  await page.getByPlaceholder(/invitation code/i).fill(invitationToken);
  await page.getByRole("button", { name: /^join organization$/i }).click();

  // Successful accept routes to /onboarding/profile.
  await page.waitForURL("**/onboarding/**", { timeout: 20_000 });
  expect(page.url()).toMatch(/\/onboarding\//);
});
