import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Building2, UserPlus, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyOrgStatus } from "@/lib/org-signup.functions";
import { acceptInvitation, getInvitationByToken } from "@/lib/staff-invitations.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — hrppl" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getMyOrgStatus);
  const acceptFn = useServerFn(acceptInvitation);
  const lookupFn = useServerFn(getInvitationByToken);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const { data: status, isLoading } = useQuery({
    queryKey: ["my-org-status"],
    queryFn: () => fetchStatus({}),
    enabled: !!user,
  });

  useEffect(() => {
    if (!status) return;
    // Already in an org: route based on role / onboarding state
    if (status.tenantId) {
      if (status.employee && !status.onboardingProfile?.submitted_at) {
        navigate({ to: "/onboarding/profile" });
      } else if (status.roles.includes("org_admin") && !status.setupProgress?.completed_at) {
        navigate({ to: "/org/setup" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } else if (status.pendingTrialInvitation) {
      navigate({ to: "/org/setup" });
    }
  }, [status, navigate]);

  async function acceptPending() {
    if (!status?.pendingInvitation) return;
    setBusy(true);
    try {
      await acceptFn({ data: { token: status.pendingInvitation.token } });
      toast.success("Welcome aboard!");
      navigate({ to: "/onboarding/profile" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not accept invitation");
    } finally {
      setBusy(false);
    }
  }

  async function acceptByToken(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    setBusy(true);
    try {
      const lookup = await lookupFn({ data: { token: t } });
      if (!lookup.invitation || lookup.invitation.status !== "pending") {
        throw new Error("Invitation link is invalid or no longer active.");
      }
      await acceptFn({ data: { token: t } });
      toast.success("Welcome aboard!");
      navigate({ to: "/onboarding/profile" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not accept invitation");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (loading || isLoading || !status) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to hrppl</h1>
          <p className="mt-2 text-muted-foreground">
            Hi {user?.email}. Let's get you set up. Are you joining an existing organization, or starting a new one?
          </p>
        </div>

        {status.pendingInvitation && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">You have a pending invitation</CardTitle>
              <CardDescription>
                {status.pendingInvitation.first_name ? `${status.pendingInvitation.first_name}, you've` : "You've"} been invited
                {status.pendingInvitation.job_title ? ` as ${status.pendingInvitation.job_title}` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={acceptPending} disabled={busy}>
                {busy ? "Joining…" : "Accept invitation"}
              </Button>
            </CardContent>
          </Card>
        )}

        {status.pendingTrialInvitation && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Your trial workspace is ready to set up</CardTitle>
              <CardDescription>
                {status.pendingTrialInvitation.org_name
                  ? `Finish setting up ${status.pendingTrialInvitation.org_name} to activate your trial.`
                  : "Finish setting up your organization to activate your trial."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate({ to: "/org/setup" })} disabled={busy}>
                Continue setup
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><UserPlus className="h-5 w-5" /></div>
                <CardTitle className="text-base">Join an organization</CardTitle>
              </div>
              <CardDescription>Paste the invitation code from your email.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={acceptByToken} className="space-y-3">
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Invitation code or token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button type="submit" variant="outline" className="w-full" disabled={busy || !token.trim()}>
                  {busy ? "Joining…" : "Join organization"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/20 p-2 text-accent-foreground"><Building2 className="h-5 w-5" /></div>
                <CardTitle className="text-base">Create a new organization</CardTitle>
              </div>
              <CardDescription>You'll become the organization administrator and walk through a short setup.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/org/setup">
                <Button className="w-full">Get started</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </main>
  );
}
