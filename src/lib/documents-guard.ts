/**
 * Server-side authorization for the documents / e-signature domain.
 *
 * ---------------------------------------------------------------------------
 * Why this file exists — X-07's twin
 * ---------------------------------------------------------------------------
 *
 * `/org/documents` is offered by nav and by route to six roles: `super_admin`,
 * `org_admin`, `branch_admin`, `hr`, `finance`, `manager`. Fourteen of the
 * twenty-one server functions in `documents.functions.ts` went through a local
 * `getOrgAdminTenant`, which admitted **`org_admin` and `super_admin` only**
 * and threw `"Not authorized"` for everyone else.
 *
 * It rendered as emptiness, not as an error. Verified live as `mia.acme`
 * (manager): `listEnvelopes` and `listTemplates` both threw, and the page drew
 * a table saying "No envelopes yet." beside a "Send document" button. A manager
 * reasonably concludes the organisation has no documents. The 2026-09-07 QA
 * sweep found console errors on the three `/org/documents*` pages for
 * **manager, hr, finance and branch_admin and for nobody else** — precisely
 * `org.documents` minus `getOrgAdminTenant`, which is what made the diagnosis
 * certain rather than likely.
 *
 * This is X-07 exactly: the nav and the route agree with each other, and the
 * *server function* disagrees with both. Wave 5 converged the first three gate
 * axes, Wave 6 closed the RLS axis for training; nothing checked the server-fn
 * axis, which is why this survived.
 *
 * ---------------------------------------------------------------------------
 * What the database actually permits
 * ---------------------------------------------------------------------------
 *
 * These guards mirror the RLS, the way `training-guard.ts` does for training
 * and `au-guard.ts` does for the Australian domain. They are **not** the
 * boundary — RLS is. They exist so a refusal is legible, and so a future
 * service-role read here cannot silently become unguarded.
 *
 * `document_templates` / `document_envelopes` (20260606022609, 20260607132133,
 * 20260613140425, and 20260913 for branch_admin):
 *
 * | Role           | Templates            | Envelopes                        |
 * | -------------- | -------------------- | -------------------------------- |
 * | `super_admin`  | ALL                  | ALL                              |
 * | `org_admin`    | ALL (own tenant)     | ALL (own tenant)                 |
 * | `hr`           | ALL (own tenant)     | ALL (own tenant)                 |
 * | `finance`      | SELECT               | SELECT                           |
 * | `manager`      | SELECT, published    | SELECT, own direct reports       |
 * | `branch_admin` | SELECT, published    | SELECT, own branches             |
 * | `employee`     | —                    | SELECT, own                      |
 *
 * `employee_documents` is a **different table with a different answer**, and
 * conflating the two is how a personal passport scan ends up on a page that was
 * only ever meant to carry company letters (20260604064304, 20260604232312,
 * 20260613140101):
 *
 * | Role           | employee_documents                                  |
 * | -------------- | --------------------------------------------------- |
 * | `super_admin`  | ALL                                                 |
 * | `org_admin`    | ALL (own tenant)                                    |
 * | `hr`           | ALL (own tenant)                                    |
 * | `branch_admin` | ALL, own branches                                   |
 * | `manager`      | SELECT, `visibility IN ('manager','employee')`      |
 * | `finance`      | **nothing**                                         |
 *
 * So `/org/documents/expiring` carries its own feature key,
 * `org.documentVerification`, which drops `finance`. Giving finance a read
 * there would be a privacy widening into identity documents, not a gating fix,
 * and it is not what the envelope decision asked for.
 *
 * `tests/documents-access.test.ts` pins all of it.
 */

import { getMyRoles, requireTenantId } from "@/lib/tenant-scope";

/**
 * May write templates and envelopes: author, publish, send, cancel, remind.
 *
 * Mirrors the `FOR ALL` policies — `tpl_org_admin_all` / `env_org_admin_all`,
 * `tpl_super_all` / `env_super_all`, and "hr manages tenant document_*".
 *
 * `finance`, `manager` and `branch_admin` are deliberately absent: every policy
 * they hold on these two tables is a `FOR SELECT`.
 */
export const DOCUMENT_ADMIN_ROLES = ["super_admin", "org_admin", "hr"] as const;

/**
 * May read templates and envelopes. The superset — RLS still narrows *which*
 * rows each of the read-only three actually sees (a manager gets their direct
 * reports' envelopes and published templates; a branch_admin gets their
 * branches'), which is the correct place for that narrowing to happen.
 */
export const DOCUMENT_READ_ROLES = [
  ...DOCUMENT_ADMIN_ROLES,
  "finance",
  "manager",
  "branch_admin",
] as const;

/** May verify and edit rows in `employee_documents`. Note: no `finance`. */
export const EMPLOYEE_DOCUMENT_ADMIN_ROLES = [
  "super_admin",
  "org_admin",
  "hr",
  "branch_admin",
] as const;

/** May read `employee_documents`. Still no `finance` — no policy admits it. */
export const EMPLOYEE_DOCUMENT_READ_ROLES = [
  ...EMPLOYEE_DOCUMENT_ADMIN_ROLES,
  "manager",
] as const;

/**
 * Roles are read through the **caller's own client** and memoised per request
 * by `getMyRoles`, so this costs one query per request however many document
 * functions a page calls. Tenant binding comes from `requireTenantId`, which
 * resolves the caller's own tenant — or, for a platform account, the tenant
 * they have chosen to act as — so a role name is enough here; there is no path
 * by which these roles are evaluated against somebody else's tenant.
 */
async function tenantForRoles(
  supabase: any,
  userId: string,
  allowed: readonly string[],
  refusal: string,
): Promise<string> {
  const roles = await getMyRoles(supabase, userId);
  if (!roles.some((r) => allowed.includes(r))) throw new Error(refusal);
  return requireTenantId(supabase, userId);
}

/** Tenant for a caller who may **write** templates and envelopes. */
export function requireDocumentAdminTenant(supabase: any, userId: string): Promise<string> {
  return tenantForRoles(
    supabase,
    userId,
    DOCUMENT_ADMIN_ROLES,
    "Forbidden: document administrator required (org admin or HR)",
  );
}

/** Tenant for a caller who may **read** templates and envelopes. */
export function requireDocumentReadTenant(supabase: any, userId: string): Promise<string> {
  return tenantForRoles(
    supabase,
    userId,
    DOCUMENT_READ_ROLES,
    "Forbidden: not permitted to view organisation documents",
  );
}

/** Tenant for a caller who may **verify** employee documents. */
export function requireEmployeeDocumentAdminTenant(
  supabase: any,
  userId: string,
): Promise<string> {
  return tenantForRoles(
    supabase,
    userId,
    EMPLOYEE_DOCUMENT_ADMIN_ROLES,
    "Forbidden: not permitted to verify employee documents",
  );
}

/** Tenant for a caller who may **read** employee documents. */
export function requireEmployeeDocumentReadTenant(
  supabase: any,
  userId: string,
): Promise<string> {
  return tenantForRoles(
    supabase,
    userId,
    EMPLOYEE_DOCUMENT_READ_ROLES,
    "Forbidden: not permitted to view employee documents",
  );
}
