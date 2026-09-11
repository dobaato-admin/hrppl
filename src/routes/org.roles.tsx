import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Plus, X, Mail, AlertTriangle } from "lucide-react";
import {
  listTenantMembers,
  grantRole,
  revokeRole,
  setBranchScope,
} from "@/lib/role-management.functions";
import { resendInvitation } from "@/lib/staff-invitations.functions";

export const Route = createFileRoute("/org/roles")({
  head: () => ({ meta: [{ title: "Roles & permissions — hrppl" }] }),
  component: OrgRolesPage,
});

const ASSIGNABLE_ROLES = [
  {
    value: "org_admin",
    label: "Org Admin",
    scoped: false,
    description: "Full org access except destructive actions",
  },
  {
    value: "branch_admin",
    label: "Branch Admin",
    scoped: true,
    description: "Manages a specific branch",
  },
  {
    value: "hr",
    label: "HR",
    scoped: true,
    description: "Manages people, leave, training, compliance",
  },
  {
    value: "finance",
    label: "Finance",
    scoped: true,
    description: "Manages payroll, invoices, expenses",
  },
  { value: "manager", label: "Manager", scoped: true, description: "Manages direct reports" },
  { value: "employee", label: "Employee", scoped: false, description: "Self-service only" },
] as const;

type Member = {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  job_title: string | null;
  status: string | null;
  roles: string[];
  scopes: { branch_id: string | null; country_code: string | null }[];
  /** Set only for an employee with no linked user account. See accountState(). */
  invitation: { id: string; status: string; expires_at: string | null } | null;
};

/**
 * T23 · Why this person has no roles, in the three states that are actually
 * different to an admin.
 *
 * "Roles: none" with a greyed-out button was the whole of the explanation. It
 * reads as a broken control, and the admin has no way to tell an employee
 * added by hand from one whose invitation bounced — which is the difference
 * between "invite them" and "resend it".
 */
type AccountState =
  | { kind: "active" }
  | { kind: "never_invited" }
  | { kind: "awaiting_acceptance"; invitationId: string }
  | { kind: "invitation_expired"; invitationId: string }
  | { kind: "invitation_revoked"; invitationId: string };

export function accountState(m: {
  user_id: string | null;
  invitation?: { id: string; status: string; expires_at: string | null } | null;
}): AccountState {
  if (m.user_id) return { kind: "active" };
  const inv = m.invitation ?? null;
  if (!inv) return { kind: "never_invited" };
  if (inv.status === "revoked") return { kind: "invitation_revoked", invitationId: inv.id };
  const expired = !!inv.expires_at && new Date(inv.expires_at).getTime() < Date.now();
  if (inv.status !== "pending" || expired) {
    return { kind: "invitation_expired", invitationId: inv.id };
  }
  return { kind: "awaiting_acceptance", invitationId: inv.id };
}

/** What the row says, and what the button beside it offers to do. */
export function accountStateCopy(state: AccountState): { label: string; action: string | null } {
  switch (state.kind) {
    case "active":
      return { label: "", action: null };
    case "never_invited":
      return {
        label: "No account yet — roles are granted to a person who has signed in.",
        action: "Send invitation",
      };
    case "awaiting_acceptance":
      return {
        label: "Invited, waiting for them to accept. Roles can be granted once they sign in.",
        action: "Resend invitation",
      };
    case "invitation_expired":
      return {
        label: "Their invitation expired before they accepted it.",
        action: "Resend invitation",
      };
    case "invitation_revoked":
      return { label: "Their invitation was revoked.", action: "Send a new invitation" };
  }
}

type Branch = { id: string; name: string; code: string | null };

function OrgRolesPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listTenantMembers);
  const grantFn = useServerFn(grantRole);
  const revokeFn = useServerFn(revokeRole);
  const scopeFn = useServerFn(setBranchScope);
  const resendFn = useServerFn(resendInvitation);
  // W5 · Derived from this page's nav feature key rather than a
  // hand-rolled list, so the sidebar and the page cannot give different
  // answers to "who may be here".
  const canAccess = can("org.roles", roles);

  const [grantOpen, setGrantOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState<Member | null>(null);
  const [target, setTarget] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<string>("hr");
  const [newBranch, setNewBranch] = useState<string>("");
  const [scopeBranches, setScopeBranches] = useState<Set<string>>(new Set());
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Org Admin required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-members"],
    queryFn: () => listFn({}),
    enabled: canAccess,
  });

  const members: Member[] = (data?.members ?? []) as Member[];
  const branches: Branch[] = (data?.branches ?? []) as Branch[];
  const branchById = new Map(branches.map((b) => [b.id, b]));

  function openGrant(m: Member) {
    setTarget(m);
    setNewRole("hr");
    setNewBranch("");
    setGrantOpen(true);
  }

  function openScope(m: Member) {
    setScopeBranches(new Set(m.scopes.map((s) => s.branch_id).filter((x): x is string => !!x)));
    setScopeOpen(m);
  }

  async function doGrant() {
    if (!target?.user_id) return;
    const roleMeta = ASSIGNABLE_ROLES.find((r) => r.value === newRole);
    // T23 · The label said "required" and nothing required it. A scoped role
    // granted with no branch produces a role_scope with no rows, which reads
    // as *every* branch — so an admin meaning to limit someone to one branch
    // silently gave them the organisation. Refuse while there is a branch to
    // pick; when the org has none, say plainly what the grant will mean.
    if (roleMeta?.scoped && !newBranch && branches.length > 0) {
      toast.error(`Choose a branch for ${roleMeta.label} — it decides what they can see.`);
      return;
    }
    try {
      await grantFn({
        data: {
          user_id: target.user_id,
          role: newRole as any,
          branch_id: roleMeta?.scoped && newBranch ? newBranch : null,
        },
      });
      toast.success("Role granted");
      setGrantOpen(false);
      qc.invalidateQueries({ queryKey: ["tenant-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  /**
   * Resend — or point at where to send a first invitation.
   *
   * `resendInvitation` only accepts an invitation that is still pending, so an
   * expired or revoked one, and a person never invited at all, are sent to the
   * invitations page rather than failing here with a refusal the admin cannot
   * act on.
   */
  async function resendFor(m: Member, state: ReturnType<typeof accountState>) {
    if (state.kind === "awaiting_acceptance") {
      setResendingId(m.id);
      try {
        await resendFn({ data: { id: state.invitationId } });
        toast.success(`Invitation resent to ${m.email ?? "them"}`);
        qc.invalidateQueries({ queryKey: ["tenant-members"] });
      } catch (e: any) {
        toast.error(e?.message ?? "Could not resend the invitation");
      } finally {
        setResendingId(null);
      }
      return;
    }
    navigate({ to: "/org/invitations" });
  }

  async function doRevoke(m: Member, role: string) {
    if (!m.user_id) return;
    if (!confirm(`Remove ${role} from ${m.first_name ?? m.email ?? "this user"}?`)) return;
    try {
      await revokeFn({ data: { user_id: m.user_id, role: role as any } });
      toast.success("Role removed");
      qc.invalidateQueries({ queryKey: ["tenant-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function doSaveScope() {
    if (!scopeOpen?.user_id) return;
    const role = scopeOpen.roles.find((r) =>
      ["branch_admin", "hr", "finance", "manager"].includes(r),
    );
    if (!role) {
      toast.error("This user has no branch-scoped role");
      return;
    }
    try {
      await scopeFn({
        data: {
          user_id: scopeOpen.user_id,
          role: role as any,
          branch_ids: Array.from(scopeBranches),
        },
      });
      toast.success("Branch access updated");
      setScopeOpen(null);
      qc.invalidateQueries({ queryKey: ["tenant-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }
  if (!user || !canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden.
      </main>
    );
  }

  return (
    <AppShell title="Roles & permissions" subtitle="Assign roles and branch access to your team">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Team roles</CardTitle>
            </div>
            <CardDescription>
              Assign Org Admin, Branch Admin, HR, Finance, Manager or Employee. Branch-scoped
              roles (Branch Admin, HR, Finance, Manager) are limited to the branches you choose;
              Org Admin and Employee apply across the whole organisation. Roles are granted to a
              person who has signed in, so anyone still holding an unaccepted invitation shows
              what they are waiting on instead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground">Loading members…</div>
            ) : members.length === 0 ? (
              <div className="text-muted-foreground">
                No employees yet. Invite staff from Invitations.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead className="w-48 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => {
                      const hasScopedRole = m.roles.some((r) =>
                        ["branch_admin", "hr", "finance", "manager"].includes(r),
                      );
                      const state = accountState(m);
                      const stateCopy = accountStateCopy(state);
                      const branchNames = m.scopes
                        .map((s) => (s.branch_id ? branchById.get(s.branch_id)?.name : null))
                        .filter(Boolean);
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="font-medium">
                              {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">{m.job_title ?? ""}</div>
                          </TableCell>
                          <TableCell className="text-sm">{m.email ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {m.roles.length === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  {state.kind === "active" ? "none" : "—"}
                                </span>
                              ) : (
                                m.roles.map((r) => (
                                  <Badge key={r} variant="secondary" className="gap-1">
                                    {r}
                                    {m.user_id ? (
                                      <button
                                        type="button"
                                        onClick={() => doRevoke(m, r)}
                                        className="ml-1 rounded-full hover:bg-destructive/20"
                                        aria-label={`Remove ${r}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    ) : null}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {branchNames.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                {hasScopedRole ? "all branches" : "—"}
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {branchNames.map((n) => (
                                  <Badge key={n} variant="outline">
                                    {n}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {state.kind === "active" ? (
                              <div className="flex justify-end gap-2">
                                {hasScopedRole && (
                                  <Button size="sm" variant="outline" onClick={() => openScope(m)}>
                                    Branches
                                  </Button>
                                )}
                                <Button size="sm" onClick={() => openGrant(m)} title="Grant a role">
                                  <Plus className="mr-1 h-3 w-3" />
                                  Role
                                </Button>
                              </div>
                            ) : (
                              // T23 · Say why, and offer the thing that fixes
                              // it, in the row. A disabled button with a
                              // tooltip is indistinguishable from a bug.
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-muted-foreground text-right max-w-[16rem]">
                                  {stateCopy.label}
                                </span>
                                {stateCopy.action && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={resendingId === m.id}
                                    onClick={() => resendFor(m, state)}
                                  >
                                    <Mail className="mr-1 h-3 w-3" />
                                    {resendingId === m.id ? "Sending…" : stateCopy.action}
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grant role */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Grant role to{" "}
              {target
                ? [target.first_name, target.last_name].filter(Boolean).join(" ") || target.email
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col">
                        <span>{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ASSIGNABLE_ROLES.find((r) => r.value === newRole)?.scoped &&
              (branches.length === 0 ? (
                // The org has no branches at all. Granting anyway is correct —
                // a one-site organisation should not have to invent a branch —
                // but the admin must be told that is what they are doing.
                <div className="flex items-start gap-2 rounded-md border border-status-stuck/40 bg-status-stuck/5 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-stuck" />
                  <span>
                    This organisation has no branches, so this role will cover the whole
                    organisation. Create branches under Organization → Branches first if you meant
                    to limit it.
                  </span>
                </div>
              ) : (
                <div>
                  <Label htmlFor="grant-branch">
                    Branch <span className="text-destructive">*</span>
                  </Label>
                  <Select value={newBranch} onValueChange={setNewBranch}>
                    <SelectTrigger id="grant-branch" aria-invalid={!newBranch}>
                      <SelectValue placeholder="Select branch…" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newBranch
                      ? "Use the Branches button later to add more branches."
                      : "Without a branch this role would cover the whole organisation."}
                  </p>
                </div>
              ))}
            {!ASSIGNABLE_ROLES.find((r) => r.value === newRole)?.scoped && (
              // Confirms the other half of T23: Org Admin and Employee are not
              // branch-scoped and are assignable to somebody with no branch.
              <p className="text-xs text-muted-foreground">
                {ASSIGNABLE_ROLES.find((r) => r.value === newRole)?.label} is not branch-scoped — it
                applies across the organisation and needs no branch.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doGrant}>Grant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branch scope */}
      <Dialog open={!!scopeOpen} onOpenChange={(v) => !v && setScopeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Branch access for{" "}
              {scopeOpen
                ? [scopeOpen.first_name, scopeOpen.last_name].filter(Boolean).join(" ") ||
                  scopeOpen.email
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {branches.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No branches yet. Create branches in Organization → Branches first.
              </div>
            ) : (
              branches.map((b) => (
                <label key={b.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={scopeBranches.has(b.id)}
                    onCheckedChange={(v) => {
                      setScopeBranches((prev) => {
                        const next = new Set(prev);
                        if (v) next.add(b.id);
                        else next.delete(b.id);
                        return next;
                      });
                    }}
                  />
                  <span>{b.name}</span>
                  {b.code && <span className="text-xs text-muted-foreground">({b.code})</span>}
                </label>
              ))
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty to grant access to all branches in your organization.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScopeOpen(null)}>
              Cancel
            </Button>
            <Button onClick={doSaveScope}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
