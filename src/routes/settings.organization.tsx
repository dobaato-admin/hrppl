import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getOrgSettings, updateOrgSettings } from "@/lib/org-settings.functions";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/settings/organization")({
  head: () => ({
    meta: [
      { title: "Organization settings — hrppl" },
      { name: "description", content: "Configure your organization's country, currency, and payroll defaults." },
    ],
  }),
  component: () => (
    <AdminGate feature="settings.organization">
      <OrgSettingsPage />
    </AdminGate>
  ),
});

function OrgSettingsPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getOrgSettings);
  const updateFn = useServerFn(updateOrgSettings);

  const { data, isLoading } = useQuery({
    queryKey: ["org-settings"],
    queryFn: () => getFn({}),
  });

  const [form, setForm] = useState({
    name: "",
    legal_name: "",
    primary_contact_name: "",
    country_code: "",
    currency_code: "",
    contact_email: "",
    contact_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    region: "",
    postal_code: "",
    website: "",
    tagline: "",
    registration_number: "",
    tax_id_number: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.tenant) {
      setForm({
        name: data.tenant.name ?? "",
        legal_name: data.tenant.legal_name ?? "",
        primary_contact_name: data.tenant.primary_contact_name ?? "",
        country_code: data.tenant.country_code ?? "",
        currency_code: data.tenant.currency_code ?? "",
        contact_email: data.tenant.contact_email ?? "",
        contact_phone: data.tenant.contact_phone ?? "",
        address_line1: data.tenant.address_line1 ?? "",
        address_line2: data.tenant.address_line2 ?? "",
        city: data.tenant.city ?? "",
        region: data.tenant.region ?? "",
        postal_code: data.tenant.postal_code ?? "",
        website: data.tenant.website ?? "",
        tagline: data.tenant.tagline ?? "",
        registration_number: data.tenant.registration_number ?? "",
        tax_id_number: data.tenant.tax_id_number ?? "",
      });
    }
  }, [data?.tenant]);

  const countries = data?.countries ?? [];
  const selectedCountry = useMemo(
    () => countries.find((c: any) => c.code === form.country_code),
    [countries, form.country_code],
  );

  function onCountryChange(code: string) {
    const c = countries.find((x: any) => x.code === code);
    setForm((f) => ({
      ...f,
      country_code: code,
      currency_code: c?.currency_code ?? f.currency_code,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.canEdit) return;
    setBusy(true);
    try {
      await updateFn({
        data: {
          name: form.name.trim(),
          legal_name: form.legal_name.trim() || null,
          primary_contact_name: form.primary_contact_name.trim() || null,
          country_code: form.country_code,
          currency_code: form.currency_code,
          contact_email: form.contact_email.trim(),
          contact_phone: form.contact_phone.trim() || null,
          address_line1: form.address_line1.trim() || null,
          address_line2: form.address_line2.trim() || null,
          city: form.city.trim() || null,
          region: form.region.trim() || null,
          postal_code: form.postal_code.trim() || null,
          website: form.website.trim() || null,
          tagline: form.tagline.trim() || null,
          registration_number: form.registration_number.trim() || null,
          tax_id_number: form.tax_id_number.trim() || null,
        },
      });
      toast.success("Organization settings updated");
      qc.invalidateQueries({ queryKey: ["org-settings"] });
      qc.invalidateQueries({ queryKey: ["my-org-status"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update settings");
    } finally {
      setBusy(false);
    }
  }

  const pd = data?.payrollDefaults;
  const readOnly = !data?.canEdit;

  return (
    <AppShell title="Organization settings" subtitle="Country, business currency, and payroll defaults">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data?.tenant ? (
          <Card>
            <CardHeader>
              <CardTitle>No organization</CardTitle>
              <CardDescription>You're not linked to an organization yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {data.tenant.name}
                    </CardTitle>
                    <CardDescription>
                      Plan: {data.tenant.plan} · Status: {data.tenant.status}
                    </CardDescription>
                  </div>
                  {readOnly && <Badge variant="outline">Read only</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={save} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Organization name" className="md:col-span-2">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={readOnly}
                      required
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Legal business name">
                    <Input
                      value={form.legal_name}
                      onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
                      disabled={readOnly}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Primary contact name">
                    <Input
                      value={form.primary_contact_name}
                      onChange={(e) => setForm({ ...form, primary_contact_name: e.target.value })}
                      disabled={readOnly}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Country">
                    <Select
                      value={form.country_code}
                      onValueChange={onCountryChange}
                      disabled={readOnly}
                    >
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c: any) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} ({c.currency_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Business currency">
                    <Input
                      value={form.currency_code}
                      onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                      disabled={readOnly}
                      maxLength={3}
                      required
                    />
                    {selectedCountry && selectedCountry.currency_code !== form.currency_code && (
                      <p className="text-xs text-muted-foreground">
                        Default for {selectedCountry.name}: {selectedCountry.currency_code}
                      </p>
                    )}
                  </Field>
                  <Field label="Contact email">
                    <Input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      disabled={readOnly}
                      required
                    />
                  </Field>
                  <Field label="Contact phone">
                    <Input
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      disabled={readOnly}
                      maxLength={40}
                    />
                  </Field>
                  <Field label="Street address" className="md:col-span-2">
                    <Input
                      value={form.address_line1}
                      onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                      disabled={readOnly}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Address line 2" className="md:col-span-2">
                    <Input
                      value={form.address_line2}
                      onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                      disabled={readOnly}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      disabled={readOnly}
                      maxLength={120}
                    />
                  </Field>
                  <Field label="State / region">
                    <Input
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      disabled={readOnly}
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Postal code">
                    <Input
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                      disabled={readOnly}
                      maxLength={32}
                    />
                  </Field>
                  <Field label="Website">
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      disabled={readOnly}
                      maxLength={255}
                    />
                  </Field>
                  <Field label="Tagline" className="md:col-span-2">
                    <Input
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      disabled={readOnly}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Business registration number">
                    <Input
                      value={form.registration_number}
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                      disabled={readOnly}
                      maxLength={80}
                    />
                  </Field>
                  <Field label="Tax ID / ABN / EIN">
                    <Input
                      value={form.tax_id_number}
                      onChange={(e) => setForm({ ...form, tax_id_number: e.target.value })}
                      disabled={readOnly}
                      maxLength={80}
                    />
                  </Field>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={busy || readOnly}>
                      <Save className="mr-2 h-4 w-4" />
                      {busy ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll defaults</CardTitle>
                <CardDescription>
                  Country-level defaults applied to payroll runs.{" "}
                  {pd ? "" : "No defaults configured for this country yet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pd ? (
                  <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 text-sm">
                    <Stat label="Pay frequency" value={pd.pay_frequency} />
                    <Stat label="Workweek hours" value={String(pd.workweek_hours)} />
                    <Stat label="Overtime multiplier" value={`${pd.overtime_multiplier}×`} />
                    <Stat label="Fiscal year starts" value={`Month ${pd.fiscal_year_start_month}`} />
                    <Stat label="Rounding mode" value={pd.rounding_mode} />
                    <Stat label="Rounding decimals" value={String(pd.rounding_decimals)} />
                    {pd.notes && (
                      <div className="col-span-2 md:col-span-3">
                        <dt className="text-xs text-muted-foreground">Notes</dt>
                        <dd className="text-sm">{pd.notes}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Payroll defaults are managed at the country level. Contact your platform administrator
                    to configure tax brackets, contributions, and pay defaults for {selectedCountry?.name ?? "your country"}.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium capitalize">{value}</dd>
    </div>
  );
}
