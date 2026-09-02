import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/payroll-settings")({
  head: () => ({ meta: [{ title: "Payroll Settings — WorldPay HRMS" }] }),
  component: () => (
    <AdminGate feature="org.payrollSettings">
      <PayrollSettingsPage />
    </AdminGate>
  ),
});

type PayFreq = "weekly" | "biweekly" | "semimonthly" | "monthly";

interface Country {
  code: string;
  name: string;
  currency_code: string;
}
interface Defaults {
  country_code: string;
  pay_frequency: PayFreq;
  workweek_hours: number;
  overtime_multiplier: number;
  holiday_pay_multiplier: number;
  fiscal_year_start_month: number;
  rounding_mode: string;
  rounding_decimals: number;
  notes: string | null;
}
interface TaxBracket {
  id: string;
  country_code: string;
  name: string;
  effective_from: string;
  effective_to: string | null;
  bracket_order: number;
  min_income: number;
  max_income: number | null;
  rate_percent: number;
  fixed_amount: number;
  is_active: boolean;
}
interface ContribRule {
  id: string;
  country_code: string;
  name: string;
  effective_from: string;
  effective_to: string | null;
  employee_rate_percent: number;
  employer_rate_percent: number;
  min_base: number;
  max_base: number | null;
  is_active: boolean;
}

function PayrollSettingsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [defaults, setDefaults] = useState<Defaults | null>(null);
  const [brackets, setBrackets] = useState<TaxBracket[]>([]);
  const [contribs, setContribs] = useState<ContribRule[]>([]);
  const [busy, setBusy] = useState(false);
  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");

  useEffect(() => {
    const allowed =
      roles.includes("super_admin") ||
      roles.includes("regional_admin") ||
      roles.includes("org_admin");
    if (!loading && (!user || !allowed)) {
      if (user) toast.error("Admin access required");
      navigate({ to: user ? "/dashboard" : "/auth" });
    }
  }, [loading, user, roles, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (isSuper) {
        const { data } = await supabase.from("countries").select("*").order("name");
        setCountries((data ?? []) as Country[]);
        if (data && data.length > 0 && !selected) setSelected(data[0].code as string);
        return;
      }

      if (isOrg) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .maybeSingle();
        if (!prof?.tenant_id) return;
        const { data: tenant } = await supabase
          .from("tenants")
          .select("country_code")
          .eq("id", prof.tenant_id)
          .maybeSingle();
        if (!tenant?.country_code) return;
        const { data } = await supabase
          .from("countries")
          .select("*")
          .eq("code", tenant.country_code)
          .order("name");
        setCountries((data ?? []) as Country[]);
        if (data && data.length > 0 && !selected) setSelected(data[0].code as string);
        return;
      }

      if (isRegional) {
        const { data: scope } = await supabase
          .from("role_scope")
          .select("country_code")
          .eq("user_id", user.id);
        const codes = (scope ?? []).map((s) => s.country_code as string);
        if (!codes.length) return;
        const { data } = await supabase
          .from("countries")
          .select("*")
          .in("code", codes)
          .order("name");
        setCountries((data ?? []) as Country[]);
        if (data && data.length > 0 && !selected) setSelected(data[0].code as string);
      }
    })();
  }, [isOrg, isRegional, isSuper, selected, user]);

  async function loadCountry(code: string) {
    const [{ data: d }, { data: b }, { data: c }] = await Promise.all([
      supabase.from("country_payroll_settings").select("*").eq("country_code", code).maybeSingle(),
      supabase
        .from("tax_brackets")
        .select("*")
        .eq("country_code", code)
        .order("effective_from", { ascending: false })
        .order("bracket_order"),
      supabase
        .from("contribution_rules")
        .select("*")
        .eq("country_code", code)
        .order("effective_from", { ascending: false }),
    ]);
    setDefaults((d as Defaults) ?? null);
    setBrackets((b ?? []) as TaxBracket[]);
    setContribs((c ?? []) as ContribRule[]);
  }

  useEffect(() => {
    if (selected) loadCountry(selected);
  }, [selected]);

  const country = useMemo(() => countries.find((c) => c.code === selected), [countries, selected]);

  async function saveDefaults(values: Partial<Defaults>) {
    if (!selected) return;
    setBusy(true);
    const base: Defaults = defaults ?? {
      country_code: selected,
      pay_frequency: "monthly",
      workweek_hours: 40,
      overtime_multiplier: 1.5,
      holiday_pay_multiplier: 2.0,
      fiscal_year_start_month: 1,
      rounding_mode: "half_up",
      rounding_decimals: 2,
      notes: null,
    };
    const payload = { ...base, ...values, country_code: selected };
    const { error } = await supabase.from("country_payroll_settings").upsert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Defaults saved");
    loadCountry(selected);
  }

  const canView =
    roles.includes("super_admin") ||
    roles.includes("regional_admin") ||
    roles.includes("org_admin");
  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    <AppShell>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">Payroll Settings</h1>
              <p className="text-xs text-muted-foreground">
                Country-level tax, contributions, and defaults
              </p>
            </div>
            <Link to={isSuper ? "/admin" : "/org"}>
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Country</CardTitle>
              <CardDescription>Pick a country to configure its payroll rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.currency_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {country && <Badge variant="outline">{country.currency_code}</Badge>}
              </div>
            </CardContent>
          </Card>

          {selected && (
            <Tabs defaultValue="defaults">
              <TabsList>
                <TabsTrigger value="defaults">Defaults</TabsTrigger>
                <TabsTrigger value="tax">Tax Brackets ({brackets.length})</TabsTrigger>
                <TabsTrigger value="contrib">Contributions ({contribs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="defaults">
                <DefaultsForm
                  key={selected}
                  country={country}
                  defaults={defaults}
                  busy={busy}
                  onSave={saveDefaults}
                />
              </TabsContent>

              <TabsContent value="tax">
                <TaxBracketsPanel
                  countryCode={selected}
                  rows={brackets}
                  onChange={() => loadCountry(selected)}
                />
              </TabsContent>

              <TabsContent value="contrib">
                <ContributionsPanel
                  countryCode={selected}
                  rows={contribs}
                  onChange={() => loadCountry(selected)}
                />
              </TabsContent>
            </Tabs>
          )}
        </section>
      </main>
    </AppShell>
  );
}

function DefaultsForm({
  country,
  defaults,
  busy,
  onSave,
}: {
  country?: Country;
  defaults: Defaults | null;
  busy: boolean;
  onSave: (v: Partial<Defaults>) => void;
}) {
  const [form, setForm] = useState<Defaults>(
    defaults ?? {
      country_code: country?.code ?? "",
      pay_frequency: "monthly",
      workweek_hours: 40,
      overtime_multiplier: 1.5,
      holiday_pay_multiplier: 2.0,
      fiscal_year_start_month: 1,
      rounding_mode: "half_up",
      rounding_decimals: 2,
      notes: null,
    },
  );
  useEffect(() => {
    if (defaults) setForm(defaults);
  }, [defaults]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{country?.name ?? "Country"} defaults</CardTitle>
        <CardDescription>Applied to all tenants in this country unless overridden.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <Field label="Pay frequency">
            <Select
              value={form.pay_frequency}
              onValueChange={(v) => setForm({ ...form, pay_frequency: v as PayFreq })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Workweek hours">
            <Input
              type="number"
              step="0.5"
              min={0}
              max={168}
              value={form.workweek_hours}
              onChange={(e) => setForm({ ...form, workweek_hours: Number(e.target.value) })}
            />
          </Field>
          <Field label="Overtime multiplier">
            <Input
              type="number"
              step="0.05"
              min={1}
              max={5}
              value={form.overtime_multiplier}
              onChange={(e) => setForm({ ...form, overtime_multiplier: Number(e.target.value) })}
            />
          </Field>
          <Field label="Holiday pay multiplier">
            <Input
              type="number"
              step="0.05"
              min={1}
              max={10}
              value={form.holiday_pay_multiplier}
              onChange={(e) => setForm({ ...form, holiday_pay_multiplier: Number(e.target.value) })}
            />
          </Field>
          <Field label="Fiscal year start month (1–12)">
            <Input
              type="number"
              min={1}
              max={12}
              value={form.fiscal_year_start_month}
              onChange={(e) =>
                setForm({ ...form, fiscal_year_start_month: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Rounding mode">
            <Select
              value={form.rounding_mode}
              onValueChange={(v) => setForm({ ...form, rounding_mode: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="half_up">Half up</SelectItem>
                <SelectItem value="half_even">Banker's (half to even)</SelectItem>
                <SelectItem value="down">Down (truncate)</SelectItem>
                <SelectItem value="up">Up (always)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Rounding decimals">
            <Input
              type="number"
              min={0}
              max={6}
              value={form.rounding_decimals}
              onChange={(e) => setForm({ ...form, rounding_decimals: Number(e.target.value) })}
            />
          </Field>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save defaults"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TaxBracketsPanel({
  countryCode,
  rows,
  onChange,
}: {
  countryCode: string;
  rows: TaxBracket[];
  onChange: () => void;
}) {
  const empty: Partial<TaxBracket> = {
    country_code: countryCode,
    name: "",
    effective_from: new Date().toISOString().slice(0, 10),
    bracket_order: (rows[0]?.bracket_order ?? 0) + 1,
    min_income: 0,
    rate_percent: 0,
    fixed_amount: 0,
    is_active: true,
  };
  const [draft, setDraft] = useState<Partial<TaxBracket>>(empty);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name || draft.rate_percent == null) return toast.error("Name and rate required");
    setBusy(true);
    const { error } = await supabase.from("tax_brackets").insert({
      country_code: countryCode,
      name: draft.name!,
      effective_from: draft.effective_from!,
      effective_to: draft.effective_to || null,
      bracket_order: Number(draft.bracket_order ?? 1),
      min_income: Number(draft.min_income ?? 0),
      max_income:
        draft.max_income != null && (draft.max_income as unknown as string) !== ""
          ? Number(draft.max_income)
          : null,
      rate_percent: Number(draft.rate_percent ?? 0),
      fixed_amount: Number(draft.fixed_amount ?? 0),
      is_active: draft.is_active ?? true,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Bracket added");
    setDraft({ ...empty, bracket_order: Number(draft.bracket_order ?? 1) + 1 });
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this bracket?")) return;
    const { error } = await supabase.from("tax_brackets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChange();
  }

  async function toggleActive(b: TaxBracket) {
    const { error } = await supabase
      .from("tax_brackets")
      .update({ is_active: !b.is_active })
      .eq("id", b.id);
    if (error) return toast.error(error.message);
    onChange();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax brackets</CardTitle>
        <CardDescription>
          Progressive income tax bands. Lower bracket order applies first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={add} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Name">
            <Input
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Order">
            <Input
              type="number"
              min={1}
              value={draft.bracket_order ?? 1}
              onChange={(e) => setDraft({ ...draft, bracket_order: Number(e.target.value) })}
            />
          </Field>
          <Field label="Effective from">
            <Input
              type="date"
              value={draft.effective_from ?? ""}
              onChange={(e) => setDraft({ ...draft, effective_from: e.target.value })}
              required
            />
          </Field>
          <Field label="Effective to">
            <Input
              type="date"
              value={draft.effective_to ?? ""}
              onChange={(e) => setDraft({ ...draft, effective_to: e.target.value || null })}
            />
          </Field>
          <Field label="Min income">
            <Input
              type="number"
              step="0.01"
              value={draft.min_income ?? 0}
              onChange={(e) => setDraft({ ...draft, min_income: Number(e.target.value) })}
            />
          </Field>
          <Field label="Max income (blank = ∞)">
            <Input
              type="number"
              step="0.01"
              value={draft.max_income ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  max_income: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Rate %">
            <Input
              type="number"
              step="0.001"
              min={0}
              max={100}
              value={draft.rate_percent ?? 0}
              onChange={(e) => setDraft({ ...draft, rate_percent: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Fixed amount">
            <Input
              type="number"
              step="0.01"
              value={draft.fixed_amount ?? 0}
              onChange={(e) => setDraft({ ...draft, fixed_amount: Number(e.target.value) })}
            />
          </Field>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add bracket"}
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Income range</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Fixed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground text-center py-8">
                  No brackets yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.bracket_order}</TableCell>
                <TableCell>{b.name}</TableCell>
                <TableCell className="text-xs">
                  {b.effective_from}
                  {b.effective_to ? ` → ${b.effective_to}` : ""}
                </TableCell>
                <TableCell className="text-xs">
                  {b.min_income} – {b.max_income ?? "∞"}
                </TableCell>
                <TableCell>{b.rate_percent}%</TableCell>
                <TableCell>{b.fixed_amount}</TableCell>
                <TableCell>
                  <Badge variant={b.is_active ? "default" : "secondary"}>
                    {b.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(b)}>
                    {b.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(b.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ContributionsPanel({
  countryCode,
  rows,
  onChange,
}: {
  countryCode: string;
  rows: ContribRule[];
  onChange: () => void;
}) {
  const empty: Partial<ContribRule> = {
    country_code: countryCode,
    name: "",
    effective_from: new Date().toISOString().slice(0, 10),
    employee_rate_percent: 0,
    employer_rate_percent: 0,
    min_base: 0,
    is_active: true,
  };
  const [draft, setDraft] = useState<Partial<ContribRule>>(empty);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name) return toast.error("Name required");
    setBusy(true);
    const { error } = await supabase.from("contribution_rules").insert({
      country_code: countryCode,
      name: draft.name!,
      effective_from: draft.effective_from!,
      effective_to: draft.effective_to || null,
      employee_rate_percent: Number(draft.employee_rate_percent ?? 0),
      employer_rate_percent: Number(draft.employer_rate_percent ?? 0),
      min_base: Number(draft.min_base ?? 0),
      max_base:
        draft.max_base != null && (draft.max_base as unknown as string) !== ""
          ? Number(draft.max_base)
          : null,
      is_active: draft.is_active ?? true,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Contribution added");
    setDraft(empty);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this rule?")) return;
    const { error } = await supabase.from("contribution_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChange();
  }

  async function toggleActive(c: ContribRule) {
    const { error } = await supabase
      .from("contribution_rules")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    onChange();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statutory contributions</CardTitle>
        <CardDescription>
          Social security, pension, healthcare — anything with an employee/employer split.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={add} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Name">
            <Input
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Effective from">
            <Input
              type="date"
              value={draft.effective_from ?? ""}
              onChange={(e) => setDraft({ ...draft, effective_from: e.target.value })}
              required
            />
          </Field>
          <Field label="Effective to">
            <Input
              type="date"
              value={draft.effective_to ?? ""}
              onChange={(e) => setDraft({ ...draft, effective_to: e.target.value || null })}
            />
          </Field>
          <div />
          <Field label="Employee rate %">
            <Input
              type="number"
              step="0.001"
              min={0}
              max={100}
              value={draft.employee_rate_percent ?? 0}
              onChange={(e) =>
                setDraft({ ...draft, employee_rate_percent: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Employer rate %">
            <Input
              type="number"
              step="0.001"
              min={0}
              max={100}
              value={draft.employer_rate_percent ?? 0}
              onChange={(e) =>
                setDraft({ ...draft, employer_rate_percent: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Min base">
            <Input
              type="number"
              step="0.01"
              value={draft.min_base ?? 0}
              onChange={(e) => setDraft({ ...draft, min_base: Number(e.target.value) })}
            />
          </Field>
          <Field label="Max base (blank = ∞)">
            <Input
              type="number"
              step="0.01"
              value={draft.max_base ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  max_base: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add contribution"}
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center py-8">
                  No contributions yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-xs">
                  {c.effective_from}
                  {c.effective_to ? ` → ${c.effective_to}` : ""}
                </TableCell>
                <TableCell>{c.employee_rate_percent}%</TableCell>
                <TableCell>{c.employer_rate_percent}%</TableCell>
                <TableCell className="text-xs">
                  {c.min_base} – {c.max_base ?? "∞"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? "default" : "secondary"}>
                    {c.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>
                    {c.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
