/**
 * What a platform account sees on a tenant-owned page.
 *
 * `super_admin` and `regional_admin` have `profiles.tenant_id = NULL` by
 * design — they are platform roles, and requiring them to belong to a customer
 * organisation would be modelling them wrongly. The consequence is that every
 * correctly tenant-scoped query returns nothing for them, which is the right
 * answer and a terrible thing to render as an empty table or, worse, as the raw
 * "Your account is not attached to an organization." that `NoTenantScopeError`
 * throws.
 *
 * Before tenant scoping landed, these accounts saw *every* tenant's rows merged
 * together. That was the cross-tenant leak, not a feature — so the fix is not
 * to give platform accounts a tenant, it is to say clearly why the page is
 * empty and what to do instead.
 *
 * The permanent answer is the acting-tenant switcher (W3.0). Until it exists,
 * this is the honest explanation rather than a page that looks broken.
 */
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/monday";

export function PlatformAccountNotice({
  /** What the page would have shown, e.g. "Work-from-home requests". */
  subject,
}: {
  subject: string;
}) {
  return (
    <EmptyState
      icon={Building2}
      title="This account is not attached to an organisation"
      description={
        `${subject} belong to a single organisation, and platform roles ` +
        `(super admin, regional admin) deliberately sit outside all of them — ` +
        `that separation is what keeps one tenant's data out of another's. ` +
        `Sign in with an organisation account to see this page with data in it.`
      }
    />
  );
}
