import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/org/recruitment")({
  head: () => ({ meta: [{ title: "Recruitment — hrppl" }] }),
  // Gated at the layout, not per page: the three children carry no gate of
  // their own, so this is the single place that decides who reaches any of
  // them. Same key the sidebar row uses.
  component: () => (
    <AdminGate feature="org.recruitment">
      <AppShell title="Recruitment" subtitle="Jobs, candidates, interviews and offers">
        <Outlet />
      </AppShell>
    </AdminGate>
  ),
});
