import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyWhiteLabel, upsertMyWhiteLabel } from "@/lib/super-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/org/white-label")({
  head: () => ({ meta: [{ title: "White-label — WorldPay HRMS" }] }),
  component: WhiteLabelPage,
});

function WhiteLabelPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const fetchData = useServerFn(getMyWhiteLabel);
  const save = useServerFn(upsertMyWhiteLabel);
  const qc = useQueryClient();
  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.whiteLabel", roles);
  const { data } = useQuery({
    queryKey: ["white-label"],
    queryFn: () => fetchData({}),
    enabled: canAccess,
  });

  const [form, setForm] = useState<any>({
    brand_name: "",
    logo_url: "",
    primary_color: "",
    accent_color: "",
    email_from_name: "",
    email_from_address: "",
    support_email: "",
    footer_html: "",
    custom_domain: "",
  });

  useEffect(() => {
    if (data?.settings) {
      setForm((f: any) => ({
        ...f,
        ...Object.fromEntries(Object.entries(data.settings as any).filter(([k]) => k in f)),
      }));
    }
  }, [data]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Super admin access required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  async function submit() {
    try {
      await save({ data: form });
      toast.success("White-label saved");
      qc.invalidateQueries({ queryKey: ["white-label"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || !user || !canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <AppShell title="White-label" subtitle="Brand the experience for your org">
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              These settings apply to your organization's portal and outbound emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Brand name</Label>
              <Input
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Logo URL</Label>
              <Input
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label>Primary color</Label>
              <Input
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
            <div>
              <Label>Accent color</Label>
              <Input
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                placeholder="#22c55e"
              />
            </div>
            <div>
              <Label>Email from name</Label>
              <Input
                value={form.email_from_name}
                onChange={(e) => setForm({ ...form, email_from_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email from address</Label>
              <Input
                type="email"
                value={form.email_from_address}
                onChange={(e) => setForm({ ...form, email_from_address: e.target.value })}
              />
            </div>
            <div>
              <Label>Support email</Label>
              <Input
                type="email"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              />
            </div>
            <div>
              <Label>Custom domain</Label>
              <Input
                value={form.custom_domain}
                onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
                placeholder="hr.example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email footer (HTML)</Label>
              <Textarea
                rows={4}
                value={form.footer_html}
                onChange={(e) => setForm({ ...form, footer_html: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={submit}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
