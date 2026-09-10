/**
 * One in-app notification writer.
 *
 * `notify()` existed as a private copy in `leave.functions.ts` and another in
 * `wfh.functions.ts`, with the same comment above both. Escalation needs a
 * third, which is the point at which copying it again stops being reasonable.
 *
 * Email alone is silently invisible whenever `employees.email` is null, which
 * nothing checks — so the in-app row is the reliable half, not the extra.
 *
 * A failure here never rolls back the decision it describes: nobody should be
 * unable to approve leave because a notification insert failed.
 */
export async function notifyInApp(args: {
  tenantId: string;
  userId: string | null;
  kind: string;
  title: string;
  body: string;
  link: string;
}): Promise<void> {
  if (!args.userId) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("in_app_notifications").insert({
      tenant_id: args.tenantId,
      user_id: args.userId,
      kind: args.kind,
      title: args.title,
      body: args.body,
      link: args.link,
    });
  } catch (e) {
    console.error("[notify] in-app notification failed", args.kind, e);
  }
}

/** Fan out to several recipients, tolerating individual failures. */
export async function notifyManyInApp(
  userIds: (string | null)[],
  args: Omit<Parameters<typeof notifyInApp>[0], "userId">,
): Promise<void> {
  await Promise.all([...new Set(userIds.filter(Boolean))].map((userId) => notifyInApp({ ...args, userId })));
}
