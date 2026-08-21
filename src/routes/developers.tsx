import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/developers")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isSuper = (roles ?? []).some((r: any) => r.role === "super_admin");
    if (!isSuper) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Developer Portal — hrppl API" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Developers,
});

function Developers() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            API v1 · OpenAPI 3.1
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            hrppl Developer Portal
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Global HRMS &amp; Payroll suite with a fully API-first surface. Every UI action has a
            matching REST endpoint, every domain change emits a signed webhook.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/api/v1/docs" className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">Open Swagger UI →</a>
            <a href="/api/v1/openapi.json" className="inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">Download openapi.json</a>
            <a href="/api/v1/health" className="inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">Health check</a>
            <Link to="/auth" className="inline-flex items-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">Sign in →</Link>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "REST + OpenAPI 3.1", body: "Cursor pagination, sparse fieldsets, filtering, expansion, idempotent writes, ETag concurrency." },
            { title: "OAuth 2.0 + PATs + API keys", body: "Authorization Code + PKCE, Client Credentials, personal access tokens, tenant-scoped keys." },
            { title: "Signed Webhooks", body: "HMAC-SHA256 events for every domain change, exponential-backoff retries, delivery replay." },
            { title: "Multi-currency Payroll", body: "Configurable tax rules, holidays, leave types, OT and penalty rates per country." },
            { title: "SCIM 2.0 + SSO", body: "Provision users from Okta / Azure AD / Google. SAML & OIDC for login." },
            { title: "Bulk + Async Jobs", body: "CSV import/export, payroll runs, bank-file generation tracked via /jobs/{id}." },
          ].map((c) => (
            <article key={c.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          Base URL · <code className="font-mono">/api/v1</code> &nbsp;|&nbsp; Spec · hrppl API v1.0.0
        </footer>
      </section>
    </main>
  );
}
