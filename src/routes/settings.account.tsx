import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { describeOAuthError } from "@/lib/oauth-errors";
import { buildGoogleRedirectUri } from "@/lib/oauth-config";

export const Route = createFileRoute("/settings/account")({
  head: () => ({ meta: [{ title: "Account — hrppl" }] }),
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runDelete = useServerFn(deleteMyAccount);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  type Identity = { id: string; provider: string; identity_data?: Record<string, unknown> | null };
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);

  async function refreshIdentities() {
    const { data } = await supabase.auth.getUserIdentities();
    setIdentities((data?.identities ?? []) as Identity[]);
  }

  useEffect(() => {
    void refreshIdentities();
  }, [user?.id]);

  const googleIdentity = identities.find((i) => i.provider === "google");
  const hasPassword = identities.some((i) => i.provider === "email");

  async function linkGoogle() {
    const { redirectUri, validation } = buildGoogleRedirectUri("/settings/account");
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description:
          `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. ` +
          `Open Settings from an approved URL to link Google.`,
      });
      return;
    }
    setLinkLoading(true);
    try {
      // Supabase native identity linking: ties the new Google identity to the
      // current signed-in user, so no duplicate auth user is created.
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        const info = describeOAuthError(error);
        toast.error(info.title, { description: info.message });
        setLinkLoading(false);
      }
      // On success Supabase redirects the browser to Google.
    } catch (err) {
      const info = describeOAuthError(err);
      toast.error(info.title, { description: info.message });
      setLinkLoading(false);
    }
  }

  async function unlinkGoogle() {
    if (!googleIdentity) return;
    if (identities.length < 2) {
      toast.error("Can't unlink", {
        description: "You need at least one other sign-in method before removing Google.",
      });
      return;
    }
    setLinkLoading(true);
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity as never);
    setLinkLoading(false);
    if (error) {
      const info = describeOAuthError(error);
      return toast.error(info.title, { description: info.message });
    }
    toast.success("Google account unlinked.");
    await refreshIdentities();
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await runDelete({});
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Account deleted. You can sign up again any time.");
      navigate({ to: "/auth", replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete account");
      setLoading(false);
    }
  }

  return (
    <AppShell title="Account" subtitle="Manage your account">
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
            <CardDescription>Signed in as {user?.email ?? "—"}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected sign-in methods</CardTitle>
            <CardDescription>
              Link Google to your existing account so you can sign in either way — no
              duplicate accounts are created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Email & password</p>
                  {hasPassword && <Badge variant="secondary">Active</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasPassword ? "You can sign in with your email and password." : "Not configured."}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Google</p>
                  {googleIdentity ? (
                    <Badge variant="secondary">Connected</Badge>
                  ) : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {googleIdentity
                    ? `Linked to ${String(googleIdentity.identity_data?.email ?? "your Google account")}.`
                    : "Connect your Google account to sign in with one click."}
                </p>
              </div>
              {googleIdentity ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unlinkGoogle}
                  disabled={linkLoading || identities.length < 2}
                >
                  Unlink
                </Button>
              ) : (
                <Button size="sm" onClick={linkGoogle} disabled={linkLoading}>
                  {linkLoading ? "Connecting…" : "Connect Google"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Delete account</CardTitle>
            <CardDescription>
              This permanently deletes your login and personal profile. Organization data
              you created (tenants, employee records, payroll history) is preserved for
              compliance and is detached from your user. You can sign up again later with
              the same email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete my account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Type <span className="font-mono font-semibold">DELETE</span> to
                    confirm. You'll be signed out immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor="confirm">Confirmation</Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={loading || confirmText !== "DELETE"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  >
                    {loading ? "Deleting…" : "Delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
