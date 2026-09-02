import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
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
import { AppShell } from "@/components/AppShell";
import { KpiTile, StatusChip, statusTone, CardRail } from "@/components/monday";
import { toast } from "sonner";
import { Building2, Globe2, Users2, Activity, Search, Trash2 } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { SUPER_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Super Admin — hrppl" }] }),
  component: () => (
    <AdminGate allow={SUPER_ADMIN_ONLY}>
      <AdminPage />
    </AdminGate>
  ),
});

interface Country {
  code: string;
  name: string;
  region_code: string;
  currency_code: string;
}
interface Tenant {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  currency_code: string;
  status: string;
  contact_email: string;
  plan: string | null;
  created_at: string;
}
interface RegAdmin {
  user_id: string;
  email: string | null;
  full_name: string | null;
  countries: string[];
}
interface AuditRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
}

function AdminPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [regionals, setRegionals] = useState<RegAdmin[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [actorMap, setActorMap] = useState<
    Record<string, { email: string | null; full_name: string | null }>
  >({});
  const [auditFilter, setAuditFilter] = useState<string>("all");
  const [tenantSearch, setTenantSearch] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [working, setWorking] = useState(false);

  async function refresh() {
    const [c, t, rolesRes, a] = await Promise.all([
      supabase.from("countries").select("*").order("name"),
      supabase.from("tenants").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role").eq("role", "regional_admin"),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (c.data) setCountries(c.data as Country[]);
    if (t.data) setTenants(t.data as Tenant[]);

    const ids = (rolesRes.data ?? []).map((r) => r.user_id);
    if (ids.length > 0) {
      const [p, s] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name").in("id", ids),
        supabase.from("role_scope").select("user_id, country_code").in("user_id", ids),
      ]);
      const profiles = new Map((p.data ?? []).map((x) => [x.id as string, x]));
      const scope = new Map<string, string[]>();
      (s.data ?? []).forEach((row) => {
        const arr = scope.get(row.user_id as string) ?? [];
        arr.push(row.country_code as string);
        scope.set(row.user_id as string, arr);
      });
      setRegionals(
        ids.map((id) => ({
          user_id: id,
          email: profiles.get(id)?.email ?? null,
          full_name: profiles.get(id)?.full_name ?? null,
          countries: scope.get(id) ?? [],
        })),
      );
    } else {
      setRegionals([]);
    }

    const auditRows = (a.data ?? []) as AuditRow[];
    setAudit(auditRows);
    const actorIds = Array.from(
      new Set(auditRows.map((r) => r.actor_id).filter(Boolean) as string[]),
    );
    if (actorIds.length) {
      const { data: ap } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .in("id", actorIds);
      const m: Record<string, { email: string | null; full_name: string | null }> = {};
      (ap ?? []).forEach((p: any) => {
        m[p.id] = { email: p.email, full_name: p.full_name };
      });
      setActorMap(m);
    }
  }

  useEffect(() => {
    if (!loading && rolesLoaded && roles.includes("super_admin")) {
      refresh();
    }
  }, [loading, rolesLoaded, roles]);

  async function grantRegional(e: React.FormEvent) {
    e.preventDefault();
    if (!countryCode) return toast.error("Pick a country");
    setWorking(true);
    const { data: prof, error: pe } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (pe || !prof) {
      setWorking(false);
      return toast.error("User must sign up first with that email");
    }
    const { error: re } = await supabase
      .from("user_roles")
      .insert({ user_id: prof.id, role: "regional_admin" });
    if (re && !re.message.includes("duplicate")) {
      setWorking(false);
      return toast.error(re.message);
    }
    const { error: se } = await supabase
      .from("role_scope")
      .insert({ user_id: prof.id, country_code: countryCode });
    setWorking(false);
    if (se && !se.message.includes("duplicate")) return toast.error(se.message);
    toast.success("Regional admin granted");
    setEmail("");
    setCountryCode("");
    refresh();
  }

  async function removeRegionalCountry(userId: string, code: string) {
    if (!confirm(`Remove ${code} scope from this regional admin?`)) return;
    const { error } = await supabase
      .from("role_scope")
      .delete()
      .eq("user_id", userId)
      .eq("country_code", code);
    if (error) return toast.error(error.message);
    toast.success("Scope removed");
    refresh();
  }

  async function revokeRegional(userId: string) {
    if (!confirm("Revoke regional_admin from this user? All country scopes will also be removed."))
      return;
    setWorking(true);
    const { error: e1 } = await supabase.from("role_scope").delete().eq("user_id", userId);
    if (e1) {
      setWorking(false);
      return toast.error(e1.message);
    }
    const { error: e2 } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "regional_admin");
    setWorking(false);
    if (e2) return toast.error(e2.message);
    toast.success("Regional admin revoked");
    refresh();
  }

  async function setTenantStatus(id: string, status: "active" | "suspended" | "cancelled") {
    // This is a live access gate, not a label: is_account_active() reads
    // tenants.status, so suspending/cancelling blocks every user in the tenant
    // on their very next request. Spell that out before it happens.
    const name = tenants.find((t) => t.id === id)?.name ?? "this tenant";
    const warning =
      status === "active"
        ? `Restore access for everyone in ${name}?`
        : `Set ${name} to ${status}?\n\nEvery user in this organisation will be blocked from all pages and API calls on their next request.`;
    if (!confirm(warning)) return;
    const { error } = await supabase.from("tenants").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(
      status === "active" ? `${name} restored` : `${name} ${status} — all users blocked`,
    );
    refresh();
  }

  const filteredTenants = useMemo(() => {
    const q = tenantSearch.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.country_code.toLowerCase().includes(q) ||
        (t.contact_email ?? "").toLowerCase().includes(q),
    );
  }, [tenants, tenantSearch]);

  const filteredAudit = useMemo(() => {
    if (auditFilter === "all") return audit;
    return audit.filter((r) => r.entity_type === auditFilter);
  }, [audit, auditFilter]);

  const entityTypes = useMemo(
    () => Array.from(new Set(audit.map((r) => r.entity_type))).sort(),
    [audit],
  );

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

  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const suspendedTenants = tenants.filter((t) => t.status === "suspended").length;

  return (
    <AppShell
      title="Super Admin Console"
      subtitle="Platform-wide controls"
      actions={
        <div className="hidden md:flex items-center gap-2">
          <Link to="/admin/holidays">
            <Button size="sm" variant="outline">
              Holidays
            </Button>
          </Link>
          <Link to="/admin/overtime-rates">
            <Button size="sm" variant="outline">
              Overtime / Penalty
            </Button>
          </Link>
          <Link to="/admin/payroll-settings">
            <Button size="sm" variant="outline">
              Payroll Settings
            </Button>
          </Link>
          <Link to="/admin/payslip-templates">
            <Button size="sm">Payslip Templates</Button>
          </Link>
        </div>
      }
    >
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Tenants"
            value={tenants.length}
            tone="primary"
            icon={Building2}
            hint={`${activeTenants} active`}
          />
          <KpiTile
            label="Suspended"
            value={suspendedTenants}
            tone={suspendedTenants > 0 ? "stuck" : "done"}
            icon={Building2}
          />
          <KpiTile label="Regional admins" value={regionals.length} tone="info" icon={Globe2} />
          <KpiTile label="Countries" value={countries.length} tone="working" icon={Users2} />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Grant Regional Admin</CardTitle>
            <CardDescription>
              User must already have signed up. Bind one country at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={grantRegional}
              className="grid gap-4 md:grid-cols-[1fr_200px_auto] md:items-end"
            >
              <div className="space-y-2">
                <Label>User email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.currency_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={working}>
                Grant
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardRail tone="info" />
          <CardHeader>
            <CardTitle>Regional Admins ({regionals.length})</CardTitle>
            <CardDescription>
              Click a country chip to remove that scope, or revoke the role entirely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Countries</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No regional admins yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  regionals.map((r) => (
                    <TableRow key={r.user_id}>
                      <TableCell>{r.full_name ?? "—"}</TableCell>
                      <TableCell>{r.email ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.countries.length === 0 && (
                            <span className="text-xs text-muted-foreground">No scopes</span>
                          )}
                          {r.countries.map((c) => (
                            <button
                              key={c}
                              onClick={() => removeRegionalCountry(r.user_id, c)}
                              className="group inline-flex items-center"
                              title="Click to remove"
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer group-hover:bg-destructive group-hover:text-destructive-foreground group-hover:border-destructive"
                              >
                                {c}
                                <Trash2 className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100" />
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={working}
                          onClick={() => revokeRegional(r.user_id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardRail tone="primary" />
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
              <CardDescription>
                Every organization across all regions. Use the actions to suspend or reactivate.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Search tenants…"
                className="pl-7"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      No tenants.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((t) => {
                    const s = statusTone(t.status);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                        <TableCell>{t.country_code}</TableCell>
                        <TableCell>{t.currency_code}</TableCell>
                        <TableCell>
                          <StatusChip tone={s.tone}>{s.label}</StatusChip>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.contact_email}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {t.status !== "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTenantStatus(t.id, "active")}
                            >
                              Activate
                            </Button>
                          )}
                          {t.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTenantStatus(t.id, "suspended")}
                            >
                              Suspend
                            </Button>
                          )}
                          {t.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTenantStatus(t.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardRail tone="working" />
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Audit log
              </CardTitle>
              <CardDescription>Most recent 100 events</CardDescription>
            </div>
            <Select value={auditFilter} onValueChange={setAuditFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entity types</SelectItem>
                {entityTypes.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudit.map((r) => {
                  const actor = r.actor_id ? actorMap[r.actor_id] : null;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {actor?.email ??
                          actor?.full_name ??
                          (r.actor_id ? r.actor_id.slice(0, 8) + "…" : "system")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.entity_type}
                        {r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md truncate font-mono">
                        {r.metadata ? JSON.stringify(r.metadata) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAudit.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      No events.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
