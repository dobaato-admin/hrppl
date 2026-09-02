import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Building2, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { TIMEZONES, TIMEZONE_GROUPS } from "@/lib/timezones";

export const Route = createFileRoute("/org/branches")({
  head: () => ({ meta: [{ title: "Branches — Organization" }] }),
  component: BranchesPage,
});

interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  country_code: string;
  currency_code: string;
  timezone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  holiday_category_id: string | null;
  is_headquarters: boolean;
  status: "active" | "inactive";
  created_at: string;
}
interface Country {
  code: string;
  name: string;
  currency_code: string;
}
interface HolidayCategory {
  id: string;
  name: string;
  country_code: string;
}

const empty: BranchForm = {
  name: "",
  code: "",
  country_code: "",
  currency_code: "",
  timezone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  region: "",
  postal_code: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  holiday_category_id: "",
  is_headquarters: false,
  status: "active",
};

interface BranchForm {
  name: string;
  code: string;
  country_code: string;
  currency_code: string;
  timezone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  holiday_category_id: string;
  is_headquarters: boolean;
  status: "active" | "inactive";
}

function BranchesPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const canManage = roles.includes("org_admin") || roles.includes("super_admin");

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [holidayCats, setHolidayCats] = useState<HolidayCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/org/branches" } });
  }, [loading, user, navigate]);

  async function refresh() {
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .maybeSingle();
    const tid = prof?.tenant_id ?? null;
    setTenantId(tid);
    const [b, c, h] = await Promise.all([
      tid
        ? supabase
            .from("tenant_branches")
            .select("*")
            .eq("tenant_id", tid)
            .order("is_headquarters", { ascending: false })
            .order("name")
        : Promise.resolve({ data: [] as Branch[] }),
      supabase.from("countries").select("code,name,currency_code").order("name"),
      supabase.from("public_holiday_categories").select("id,name,country_code"),
    ]);
    setBranches((b.data ?? []) as Branch[]);
    setCountries((c.data ?? []) as Country[]);
    setHolidayCats((h.data ?? []) as HolidayCategory[]);
  }

  useEffect(() => {
    if (rolesLoaded && user) refresh();
  }, [rolesLoaded, user]);

  function openCreate() {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  }
  function openEdit(b: Branch) {
    setEditing(b);
    setForm({
      name: b.name,
      code: b.code,
      country_code: b.country_code,
      currency_code: b.currency_code,
      timezone: b.timezone ?? "",
      address_line1: b.address_line1 ?? "",
      address_line2: b.address_line2 ?? "",
      city: b.city ?? "",
      region: b.region ?? "",
      postal_code: b.postal_code ?? "",
      contact_name: b.contact_name ?? "",
      contact_email: b.contact_email ?? "",
      contact_phone: b.contact_phone ?? "",
      holiday_category_id: b.holiday_category_id ?? "",
      is_headquarters: b.is_headquarters,
      status: b.status,
    });
    setOpen(true);
  }

  async function save() {
    if (!tenantId) return toast.error("No organization found");
    if (!form.name || !form.code || !form.country_code || !form.currency_code) {
      return toast.error("Name, code, country and currency are required");
    }
    setSaving(true);
    const payload = {
      tenant_id: tenantId,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      country_code: form.country_code,
      currency_code: form.currency_code,
      timezone: form.timezone || null,
      address_line1: form.address_line1 || null,
      address_line2: form.address_line2 || null,
      city: form.city || null,
      region: form.region || null,
      postal_code: form.postal_code || null,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      holiday_category_id: form.holiday_category_id || null,
      is_headquarters: form.is_headquarters,
      status: form.status,
    };
    const res = editing
      ? await supabase.from("tenant_branches").update(payload).eq("id", editing.id)
      : await supabase.from("tenant_branches").insert({ ...payload, created_by: user?.id });
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Branch updated" : "Branch created");
    setOpen(false);
    refresh();
  }

  async function remove(b: Branch) {
    // Block deletion if any employees are attached to this branch.
    const { count, error: countErr } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", b.id);
    if (countErr) return toast.error(countErr.message);
    const attached = count ?? 0;

    if (attached > 0) {
      const others = branches.filter((x) => x.id !== b.id && x.status === "active");
      if (others.length === 0) {
        return toast.error(
          `${attached} staff member${attached === 1 ? " is" : "s are"} attached to "${b.name}". Create another active branch first, then reassign them.`,
        );
      }
      const optionsText = others.map((x, i) => `${i + 1}. ${x.name} (${x.code})`).join("\n");
      const choice = prompt(
        `"${b.name}" has ${attached} staff attached and can't be deleted directly.\n\n` +
          `Reassign them to which branch? Enter the number:\n\n${optionsText}\n\n` +
          `Cancel to keep the branch as-is.`,
      );
      if (!choice) return;
      const idx = parseInt(choice.trim(), 10) - 1;
      const target = others[idx];
      if (!target) return toast.error("Invalid choice — branch not deleted.");
      const { error: moveErr } = await supabase
        .from("employees")
        .update({ branch_id: target.id })
        .eq("branch_id", b.id);
      if (moveErr) return toast.error(`Reassignment failed: ${moveErr.message}`);
      toast.success(
        `Moved ${attached} staff to ${target.name}. Affected staff will be notified by email.`,
      );
    } else {
      if (!confirm(`Delete branch "${b.name}"? This cannot be undone.`)) return;
    }
    const { error } = await supabase.from("tenant_branches").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Branch deleted");
    refresh();
  }

  const matchingHolidayCats = useMemo(
    () => holidayCats.filter((h) => !form.country_code || h.country_code === form.country_code),
    [holidayCats, form.country_code],
  );

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }
  if (rolesLoaded && !canManage && !roles.includes("employee") && !roles.includes("manager")) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden.
      </main>
    );
  }

  return (
    <AppShell
      title="Branches"
      subtitle="Manage offices and locations across countries"
      actions={
        canManage ? (
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New branch
          </Button>
        ) : null
      }
    >
      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> All branches ({branches.length})
            </CardTitle>
            <CardDescription>
              Branches can be in any country. The headquarters branch is highlighted.{" "}
              <Link to="/org" className="underline">
                Back to organization
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground text-center py-8">
                      No branches yet.{" "}
                      {canManage && 'Click "New branch" to add your first location.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.name}
                        {b.is_headquarters && (
                          <Badge variant="default" className="ml-2">
                            HQ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{b.code}</TableCell>
                      <TableCell>{b.country_code}</TableCell>
                      <TableCell>{b.currency_code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.city ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {b.contact_name ?? "—"}
                        {b.contact_email && <div className="font-mono">{b.contact_email}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === "active" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {canManage && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => remove(b)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit branch" : "New branch"}</DialogTitle>
            <DialogDescription>
              Branches can be located anywhere — same country or different.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sydney HQ"
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SYD"
              />
            </div>
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select
                value={form.country_code}
                onValueChange={(v) => {
                  const c = countries.find((x) => x.code === v);
                  setForm({
                    ...form,
                    country_code: v,
                    currency_code: c?.currency_code ?? form.currency_code,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country…" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency *</Label>
              <Input
                value={form.currency_code}
                onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                placeholder="AUD"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Timezone</Label>
              <Select
                value={form.timezone || "__unset"}
                onValueChange={(v) => setForm({ ...form, timezone: v === "__unset" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__unset">Not set</SelectItem>
                  {TIMEZONE_GROUPS.map((group) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group}
                      </div>
                      {TIMEZONES.filter((t) => t.group === group).map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 1</Label>
              <Input
                value={form.address_line1}
                onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 2</Label>
              <Input
                value={form.address_line2}
                onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>State / Region</Label>
              <Input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Postal code</Label>
              <Input
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Public holiday category</Label>
              <Select
                value={form.holiday_category_id || "__none"}
                onValueChange={(v) =>
                  setForm({ ...form, holiday_category_id: v === "__none" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  {matchingHolidayCats.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({h.country_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact name</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact phone</Label>
              <Input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 md:col-span-2 pt-2">
              <Switch
                id="hq"
                checked={form.is_headquarters}
                onCheckedChange={(v) => setForm({ ...form, is_headquarters: v })}
              />
              <Label htmlFor="hq" className="cursor-pointer">
                This is the headquarters branch
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
