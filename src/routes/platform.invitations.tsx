import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  listOrgTrialInvitations,
  createOrgTrialInvitation,
  revokeOrgTrialInvitation,
  resendOrgTrialInvitation,
} from "@/lib/super-invitations.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/invitations")({
  head: () => ({ meta: [{ title: "Org trial invitations — Platform" }] }),
  component: PlatformInvitationsPage,
});

const STATUS_TONE: Record<string, string> = {
  pending: "bg-status-pending text-status-pending-foreground",
  redeemed: "bg-status-done text-status-done-foreground",
  revoked: "bg-muted text-muted-foreground",
  expired: "bg-destructive text-destructive-foreground",
};

type Invitation = {
  id: string;
  email: string;
  org_name: string;
  contact_name: string | null;
  country_code: string | null;
  trial_days: number;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
};

type AuditEvent = {
  id: string;
  invitation_id: string;
  action: string;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function PlatformInvitationsPage() {
  const fetchList = useServerFn(listOrgTrialInvitations);
  const createFn = useServerFn(createOrgTrialInvitation);
  const revokeFn = useServerFn(revokeOrgTrialInvitation);
  const resendFn = useServerFn(resendOrgTrialInvitation);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-org-trial-invitations"],
    queryFn: () => fetchList({}),
    retry: false,
  });

  const [form, setForm] = useState({
    email: "",
    org_name: "",
    contact_name: "",
    country_code: "",
    trial_days: 30,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  const invitations: Invitation[] = (data?.invitations ?? []) as Invitation[];
  const audit: AuditEvent[] = (data?.audit ?? []) as AuditEvent[];
  const now = Date.now();
  const isExpired = (inv: Invitation) =>
    inv.status === "expired" || (inv.status === "pending" && new Date(inv.expires_at).getTime() < now);
  const active = invitations.filter((i) => !isExpired(i) && i.status !== "revoked");
  const expired = invitations.filter((i) => isExpired(i) || i.status === "revoked");

  if (error) {
    return (
      <AppShell title="Org trial invitations">
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              Forbidden — super-admin only.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.org_name) {
      toast.error("Email and organization name are required");
      return;
    }
    setSubmitting(true);
    try {
      await createFn({
        data: {
          email: form.email.trim(),
          org_name: form.org_name.trim(),
          contact_name: form.contact_name.trim() || null,
          country_code: form.country_code.trim() || null,
          trial_days: Number(form.trial_days) || 30,
          notes: form.notes.trim() || null,
        },
      });
      toast.success("Invitation created");
      setForm({ email: "", org_name: "", contact_name: "", country_code: "", trial_days: 30, notes: "" });
      qc.invalidateQueries({ queryKey: ["platform-org-trial-invitations"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create invitation");
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this invitation? The trial link will stop working.")) return;
    try {
      await revokeFn({ data: { id } });
      toast.success("Invitation revoked");
      qc.invalidateQueries({ queryKey: ["platform-org-trial-invitations"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to revoke");
    }
  }

  async function resend(inv: Invitation) {
    try {
      const res: any = await resendFn({ data: { id: inv.id, extend_days: inv.trial_days || 30 } });
      const link = `${origin}/auth?trial=${inv.token}`;
      try { await navigator.clipboard.writeText(link); } catch {}
      toast.success(`Resent — link copied. New expiry ${new Date(res.expires_at).toLocaleDateString()}`);
      qc.invalidateQueries({ queryKey: ["platform-org-trial-invitations"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resend");
    }
  }

  function copyLink(token: string) {
    const link = `${origin}/auth?trial=${token}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success("Trial link copied"),
      () => toast.error("Could not copy"),
    );
  }

  const renderTable = (rows: Invitation[], showRevoke: boolean) => (
    rows.length === 0 ? (
      <p className="p-4 text-sm text-muted-foreground">Nothing here.</p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Trial</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((inv) => {
            const displayStatus = isExpired(inv) && inv.status === "pending" ? "expired" : inv.status;
            return (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">
                  {inv.org_name}
                  {inv.contact_name ? (
                    <div className="text-xs text-muted-foreground">{inv.contact_name}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm">{inv.email}</TableCell>
                <TableCell className="text-sm">{inv.country_code ?? "—"}</TableCell>
                <TableCell className="text-sm">{inv.trial_days} days</TableCell>
                <TableCell>
                  <Badge className={STATUS_TONE[displayStatus] ?? ""}>{displayStatus}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(inv.expires_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyLink(inv.token)}>
                      Copy link
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => resend(inv)}>
                      Resend
                    </Button>
                    {showRevoke && inv.status === "pending" && !isExpired(inv) && (
                      <Button size="sm" variant="ghost" onClick={() => revoke(inv.id)}>
                        Revoke
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  );

  return (
    <AppShell title="Org trial invitations" subtitle="Invite organizations to a free trial">
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>New trial invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Recipient email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="founder@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org_name">Organization name</Label>
                <Input id="org_name" value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} placeholder="Acme Pty Ltd" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Contact name</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country_code">Country code</Label>
                <Input id="country_code" value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} placeholder="AU" maxLength={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trial_days">Trial length (days)</Label>
                <Input id="trial_days" type="number" min={1} max={365} value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="notes">Notes (internal)</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Context, source, expectations…" rows={3} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create 30-day trial invitation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                  <TabsTrigger value="expired">Expired / revoked ({expired.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-0">{renderTable(active, true)}</TabsContent>
                <TabsContent value="expired" className="mt-0">{renderTable(expired, false)}</TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {audit.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No audit events yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Invitation</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.slice(0, 100).map((ev) => {
                    const inv = invitations.find((i) => i.id === ev.invitation_id);
                    return (
                      <TableRow key={ev.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(ev.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ev.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv ? `${inv.org_name} · ${inv.email}` : ev.invitation_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {Object.keys(ev.metadata ?? {}).length
                            ? JSON.stringify(ev.metadata)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
