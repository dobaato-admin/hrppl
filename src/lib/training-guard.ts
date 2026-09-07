/**
 * Server-side authorization for the training / LMS domain.
 *
 * ---------------------------------------------------------------------------
 * Why this file exists (X-07)
 * ---------------------------------------------------------------------------
 *
 * `/org/training`'s nav row and `/admin/training`'s route gate admit `hr` and
 * `branch_admin`. Every write in `training.functions.ts` carried **no role
 * check at all** and leaned entirely on RLS — which admitted a different set.
 * So the page loaded, the button was there, and Postgres refused: exactly the
 * failure that shipped on offboarding, and the last of Wave 5's four
 * gate-drift axes.
 *
 * `20260906090000` widened the policies for `hr` and left `branch_admin`
 * read-only. These guards mirror that decision **on the server, in front of
 * the database**, so a caller is told "Forbidden: …" instead of receiving a
 * Postgres error naming a table and a policy.
 *
 * Two properties, the same as `au-guard.ts`:
 *
 * 1. **The check runs on the CALLER's client.** These are `rpc()` calls
 *    against SECURITY DEFINER helpers, so the answer is about the caller and
 *    never about the service role.
 * 2. **The guard is not the boundary — RLS is.** The guard exists so the
 *    refusal is legible, and so a future service-role read here cannot
 *    silently become unguarded.
 *
 * `tests/training-access.test.ts` pins that every writing server fn in the
 * domain calls one of these.
 */

/**
 * May this caller author training content — courses, lessons, quiz questions,
 * enrollments, certifications?
 *
 * Mirrors, together: "admin manage courses" (org_admin | super_admin |
 * manager), "hr manages tenant training_courses" (hr) and the matching pairs
 * on `training_enrollments`, `training_quiz_questions`, `certifications` and
 * `training_lessons`.
 *
 * **`branch_admin` is deliberately absent.** Every branch_admin policy in this
 * domain is a `FOR SELECT`, by the same choice `20260613140528` made across
 * performance, onboarding and assets. They may watch their branches' training;
 * they may not assign it. `org.trainingManage` in `src/lib/rbac.ts` is the
 * client-side half of this same answer.
 */
export async function isTrainingAuthor(
  supabase: any,
  userId: string,
  tenantId: string,
): Promise<boolean> {
  for (const role of ["super_admin", "org_admin", "manager"] as const) {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role } as any);
    if (data) return true;
  }
  const { data: hr } = await supabase.rpc("is_hr", {
    _user_id: userId,
    _tenant_id: tenantId,
  } as any);
  return !!hr;
}

/** Throwing form of {@link isTrainingAuthor}. */
export async function assertTrainingAuthor(supabase: any, userId: string, tenantId: string) {
  if (!(await isTrainingAuthor(supabase, userId, tenantId))) {
    throw new Error("Forbidden: training administrator required");
  }
}

/**
 * The learner's own employee row, or `null` when the account has none.
 *
 * Platform accounts have no employee record, so every `/me/*` training path
 * has to cope with that rather than throw — an unexplained error on a page a
 * super_admin opened out of curiosity is worse than an empty state.
 */
export async function getCallerEmployee(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id,branch_id")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as { id: string; tenant_id: string; branch_id: string | null } | null) ?? null;
}
