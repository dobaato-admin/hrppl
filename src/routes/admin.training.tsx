import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGate } from "@/components/AdminGate";

/**
 * Layout only — `/admin/training` (the catalogue) lives in
 * `admin.training.index.tsx`, and `/admin/training/$courseId` (the course
 * builder) beside it.
 *
 * A parent route that renders a page instead of an `<Outlet />` silently
 * swallows its children: TanStack matches the child, the tab title even
 * changes, and the parent's own page renders in its place. That is why the
 * catalogue moved to `.index.tsx` when the builder was added, and it is the
 * same split `admin`, `me`, `org.documents` and `org.recruitment` already use.
 * `tests/route-parent-outlet.test.ts` enforces it.
 *
 * Gating here as well as on each child is deliberate: this route is the one
 * thing every `/admin/training/*` URL must pass through, so it is the only
 * place a new child cannot forget.
 */
export const Route = createFileRoute("/admin/training")({
  component: () => (
    <AdminGate feature="org.trainingCatalog">
      <Outlet />
    </AdminGate>
  ),
});
