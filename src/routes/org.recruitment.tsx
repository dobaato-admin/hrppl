import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/org/recruitment")({
  head: () => ({ meta: [{ title: "Recruitment — hrppl" }] }),
  component: () => <AppShell title="Recruitment" subtitle="Jobs, candidates, interviews and offers"><Outlet /></AppShell>,
});
