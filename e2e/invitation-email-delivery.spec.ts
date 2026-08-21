/**
 * E2E: end-to-end invitation email delivery.
 *
 * Regression coverage for the bug where an org admin sent a staff
 * invitation but the recipient never received the email. Root cause:
 * the `process-email-queue` pg_cron job was absent, so emails were
 * enqueued (`email_send_log.status = 'pending'`) but never dispatched.
 *
 * This test exercises the full pipeline:
 *   1. Seed an org admin + tenant + `org_admin` role.
 *   2. Sign in via the UI and POST to the `inviteStaff` server fn
 *      through the `/org/invitations` page.
 *   3. Assert a `staff_invitations` row was created.
 *   4. Assert a corresponding `email_send_log` row exists for the
 *      `staff-invitation` template targeting the invitee.
 *   5. Assert the `process-email-queue` pg_cron job exists and is
 *      active — without it, no enqueued email ever leaves the queue.
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
const inviteeEmail = `invitee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.test`;

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_inv_email");

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Email Org ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);

  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "E2E Admin", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin.from("user_roles").insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId } as any);
});

test.afterAll(async () => {
  await admin.from("staff_invitations").delete().eq("tenant_id", tenantId);
  await admin.from("email_send_log").delete().eq("recipient_email", inviteeEmail);
  await admin.from("email_unsubscribe_tokens").delete().eq("email", inviteeEmail);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("Inviting a staff member creates an invitation row AND enqueues a staff-invitation email", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  await page.goto("/org/invitations");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /invite staff/i }).click();
  await page.getByLabel(/work email/i).fill(inviteeEmail);
  await page.getByLabel(/first name/i).fill("Invitee");
  await page.getByLabel(/last name/i).fill("Tester");
  await page.getByLabel(/job title/i).fill("Engineer");
  await page.getByRole("button", { name: /send invitation/i }).click();

  await expect(page.getByText(/invitation sent/i)).toBeVisible({ timeout: 15_000 });

  // (1) staff_invitations row exists
  const { data: inv } = await admin
    .from("staff_invitations")
    .select("id, email, status, tenant_id")
    .eq("tenant_id", tenantId)
    .eq("email", inviteeEmail.toLowerCase())
    .maybeSingle();
  expect(inv, "invitation row was not created").toBeTruthy();
  expect((inv as any).status).toBe("pending");

  // (2) email_send_log row exists for this recipient + template
  //     (status may be 'pending' immediately after send; that's fine — the
  //     critical assertion is that something was enqueued for the recipient).
  const { data: log } = await admin
    .from("email_send_log")
    .select("message_id, template_name, recipient_email, status")
    .eq("template_name", "staff-invitation")
    .ilike("recipient_email", inviteeEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  expect(log, "no email_send_log entry for the invitation").toBeTruthy();
  expect((log as any).template_name).toBe("staff-invitation");
  expect(["pending", "sent"]).toContain((log as any).status);
});

test("process-email-queue cron job exists and is active (otherwise enqueued emails never send)", async () => {
  const { data, error } = await admin.rpc("pg_cron_jobs_exist" as any, {} as any).maybeSingle?.() ?? { data: null, error: null };

  // Fall back to a raw query via the admin client if the helper RPC isn't
  // present in this project. Either way we just need to confirm the job
  // exists; without it, no enqueued email is ever dispatched.
  if (!data) {
    const { data: rows } = await admin.schema("cron" as any).from("job" as any).select("jobname, active") as any;
    const job = (rows ?? []).find((r: any) => r.jobname === "process-email-queue");
    expect(job, "process-email-queue pg_cron job is missing").toBeTruthy();
    expect(job.active).toBe(true);
    return;
  }

  expect((data as any).process_email_queue_active).toBe(true);
});
