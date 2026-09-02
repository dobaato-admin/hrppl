import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/api-docs")({
  head: () => ({ meta: [{ title: "API reference — hrppl" }] }),
  component: () => (
    <AdminGate feature="platform.admin">
      <ApiDocsPage />
    </AdminGate>
  ),
});

function ApiDocsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!roles.includes("super_admin")) {
      setError("forbidden");
    }
  }, [loading, user, roles, navigate]);

  useEffect(() => {
    if (!user || !roles.includes("super_admin") || !containerRef.current) return;
    let cancelled = false;

    async function mount() {
      // Inject Swagger UI CSS + script once
      if (!document.getElementById("swagger-ui-css")) {
        const link = document.createElement("link");
        link.id = "swagger-ui-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css";
        document.head.appendChild(link);
      }
      if (!(window as any).SwaggerUIBundle) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js";
          s.crossOrigin = "anonymous";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load Swagger UI"));
          document.body.appendChild(s);
        });
      }
      if (cancelled || !containerRef.current) return;

      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      (window as any).SwaggerUIBundle({
        url: "/api/v1/openapi.json",
        domNode: containerRef.current,
        deepLinking: true,
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        tryItOutEnabled: true,
        persistAuthorization: true,
        filter: true,
        requestInterceptor: (req: any) => {
          if (token) {
            req.headers = req.headers ?? {};
            req.headers["Authorization"] = `Bearer ${token}`;
          }
          return req;
        },
      });
    }

    mount().catch((e) => setError(e?.message ?? String(e)));
    return () => {
      cancelled = true;
    };
  }, [user, roles]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (error === "forbidden" || (user && !roles.includes("super_admin"))) {
    return (
      <AppShell title="API reference" subtitle="Restricted area">
        <div className="mx-auto max-w-2xl p-6">
          <Card className="border-status-stuck/40 bg-status-stuck/5">
            <CardHeader>
              <CardTitle>Super admin only</CardTitle>
              <CardDescription>
                The developer API reference is available to super administrators only. If you need
                API access, contact a super admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="API reference"
      subtitle="Swagger UI · authenticated with your Supabase session"
    >
      <div className="p-4">
        {error && error !== "forbidden" && (
          <p className="mb-3 text-sm text-destructive">Could not load the API reference: {error}</p>
        )}
        <div ref={containerRef} className="rounded-lg border bg-card" />
      </div>
    </AppShell>
  );
}
