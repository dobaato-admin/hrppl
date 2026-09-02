import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { ShieldCheck, Plus, X } from "lucide-react";
import {
  listTenantMembers,
  grantRole,
  revokeRole,
  setBranchScope,
} from "@/lib/role-management.functions";

export const Route = createFileRoute("/org/roles")({
  head: () => ({ meta: [{ title: "Roles & permissions — WorldPay HRMS" }] }),
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
};

type Branch = { id: string; name: string; code: string | null };

function OrgRolesPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listTenantMembers);
  const grantFn = useServerFn(grantRole);
  const revokeFn = useServerFn(revokeRole);
  const scopeFn = useServerFn(setBranchScope);
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");

  const [grantOpen, setGrantOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState<Member | null>(null);
  const [target, setTarget] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<string>("hr");
  const [newBranch, setNewBranch] = useState<string>("");
  const [scopeBranches, setScopeBranches] = useState<Set<string>>(new Set());

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
    try {
      const roleMeta = ASSIGNABLE_ROLES.find((r) => r.value === newRole);
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
              Assign Org Admin, Branch Admin, HR, Finance, Manager or Employee. Branch-scoped roles
              (Branch Admin, HR, Finance, Manager) require one or more branches.
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
                                <span className="text-xs text-muted-foreground">none</span>
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
                            <div className="flex justify-end gap-2">
                              {hasScopedRole && (
                                <Button size="sm" variant="outline" onClick={() => openScope(m)}>
                                  Branches
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => openGrant(m)}
                                disabled={!m.user_id}
                                title={!m.user_id ? "User has not signed in yet" : "Grant a role"}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Role
                              </Button>
                            </div>
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
            {ASSIGNABLE_ROLES.find((r) => r.value === newRole)?.scoped && (
              <div>
                <Label>Branch (required for scoped roles)</Label>
                <Select value={newBranch} onValueChange={setNewBranch}>
                  <SelectTrigger>
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
                  Use the Branches button later to assign multiple branches.
                </p>
              </div>
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
