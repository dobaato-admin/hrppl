import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { getMfaPolicy, updateMfaPolicy } from "@/lib/mfa-policy.functions";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "org_admin", label: "Org admin" },
  { value: "hr", label: "HR" },
  { value: "finance", label: "Finance" },
  { value: "branch_admin", label: "Branch admin" },
  { value: "manager", label: "Manager" },
];

export const Route = createFileRoute("/org/settings/mfa-policy")({
  head: () => ({ meta: [{ title: "MFA policy — HRPPL" }] }),
  component: MfaPolicyPage,
});

function MfaPolicyPage() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const qc = useQueryClient();
  const getFn = useServerFn(getMfaPolicy);
  const updateFn = useServerFn(updateMfaPolicy);
  const { data, isLoading } = useQuery({
    queryKey: ["mfa-policy"],
    queryFn: () => getFn(),
    enabled: canAccess,
  });

  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);
  const [grace, setGrace] = useState(7);
  const [enforced, setEnforced] = useState(false);

  useEffect(() => {
    if (data?.policy) {
      setRequiredRoles(data.policy.required_roles ?? []);
      setGrace(data.policy.grace_period_days ?? 7);
      setEnforced(!!data.policy.is_enforced);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: { required_roles: requiredRoles as any, grace_period_days: grace, is_enforced: enforced },
      }),
    onSuccess: () => {
      toast.success("MFA policy updated");
      qc.invalidateQueries({ queryKey: ["mfa-policy"] });
      qc.invalidateQueries({ queryKey: ["my-mfa-status"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  return (
    <AppShell title="MFA policy" subtitle="Require multi-factor authentication for selected roles">
      <div className="p-4 max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enforcement</CardTitle>
            <CardDescription>Users in selected roles must enrol MFA within the grace period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enf">Enforce policy</Label>
              <Switch id="enf" checked={enforced} onCheckedChange={setEnforced} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label>Required roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((r) => {
                  const checked = requiredRoles.includes(r.value);
                  return (
                    <label key={r.value} className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setRequiredRoles((prev) =>
                            v ? Array.from(new Set([...prev, r.value])) : prev.filter((x) => x !== r.value),
                          )
                        }
                      />
                      <span className="text-sm">{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grace">Grace period (days)</Label>
              <Input
                id="grace"
                type="number"
                min={0}
                max={90}
                value={grace}
                onChange={(e) => setGrace(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Users have this many days from account creation before access is blocked.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save policy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
