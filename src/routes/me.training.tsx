import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout only — `/me/training` is `me.training.index.tsx` and the course
 * player is `me.training.$enrollmentId.tsx`.
 *
 * No gate: `/me/*` is every authenticated user's own hub, and `me.tsx` already
 * supplies the chrome. See `admin.training.tsx` for why the parent is an
 * `<Outlet />` and not a page.
 */
export const Route = createFileRoute("/me/training")({
  component: Outlet,
});
