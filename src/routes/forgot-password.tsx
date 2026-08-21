import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { describeOAuthError, readOAuthErrorFromUrl } from "@/lib/oauth-errors";
import { buildGoogleRedirectUri } from "@/lib/oauth-config";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — hrppl" },
      { name: "description", content: "Reset your hrppl account password." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Forgot password — hrppl" },
      { property: "og:description", content: "Reset your hrppl account password." },
      { property: "og:url", content: "https://hrppl.io/forgot-password" },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io/forgot-password" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const info = readOAuthErrorFromUrl();
    if (info) {
      toast.error(info.title, { description: info.message });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      const info = describeOAuthError(error);
      return toast.error(info.title, { description: info.message });
    }
    setSent(true);
    toast.success("Check your email for a reset link.");
  }

  async function signInGoogle() {
    const { redirectUri, validation } = buildGoogleRedirectUri("/dashboard");
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description:
          `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. ` +
          `Open the app from an approved URL, or ask your administrator to add it.`,
      });
      return;
    }
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account" },
      });
      if (result.redirected) return;
      setLoading(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        toast.error(info.title, { description: info.message });
      }
    } catch (err) {
      setLoading(false);
      const info = describeOAuthError(err);
      toast.error(info.title, { description: info.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="font-display text-sm font-bold">h</span>
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we’ll send you a link to get back into your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, you’ll receive a password-reset email shortly.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/auth">Back to Sign in</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInGoogle}
                disabled={loading}
              >
                Continue with Google
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                If you originally signed up with Google, use this instead of resetting a password.
              </p>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or reset by email</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/auth" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
