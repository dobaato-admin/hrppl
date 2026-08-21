import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — hrppl" }] }),
  component: ResetPasswordPage,
});

/**
 * Apply whatever credential a Supabase recovery link carries.
 *
 * Accepts a full URL so it can be driven either by the current address bar or
 * by a link the user pastes in. Returns null on success, or a message.
 *
 * Four shapes, because Supabase emits different ones depending on the project's
 * email template and flow type:
 *   ?code=…                              PKCE
 *   #access_token=…&refresh_token=…      implicit
 *   ?token_hash=…&type=recovery          token-hash (no redirect needed)
 *   #error=…                             already-expired
 */
async function applyRecoveryFromUrl(rawUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return "That doesn't look like a link. Paste the whole URL, starting with https://";
  }

  const hash = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const search = url.searchParams;

  const hashError = hash.get("error_description") || hash.get("error");
  if (hashError) {
    return hash.get("error_code") === "otp_expired"
      ? "This reset link has expired. Please request a new one."
      : decodeURIComponent(hashError).replace(/\+/g, " ");
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return error ? "This reset link is invalid or has expired. Please request a new one." : null;
  }

  // token_hash works without any redirect-URL allowlisting, which is why a
  // pasted link from another environment can still be redeemed here.
  const tokenHash = search.get("token_hash") || hash.get("token_hash");
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    return error ? error.message : null;
  }

  const code = search.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? "This reset link has expired or is invalid. Please request a new one." : null;
  }

  return "No reset token found in that link.";
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [pastedLink, setPastedLink] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyLink() {
      const message = await applyRecoveryFromUrl(window.location.href);
      if (message) {
        // Not fatal: the paste-a-link fallback below can still redeem a token
        // that arrived in a different environment.
        const { data } = await supabase.auth.getSession();
        if (!data.session) setError(message);
      } else {
        // Clean the URL so a refresh doesn't re-process a spent token.
        window.history.replaceState(null, "", window.location.pathname);
      }
      setVerifying(false);
    }

    verifyLink();
  }, []);

  async function redeemPastedLink() {
    if (!pastedLink.trim()) return;
    setRedeeming(true);
    const message = await applyRecoveryFromUrl(pastedLink);
    setRedeeming(false);
    if (message) return toast.error(message);
    setError(null);
    setPastedLink("");
    toast.success("Link accepted — choose a new password.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) return toast.error(updateError.message);

    toast.success("Password updated successfully!");
    navigate({ to: "/dashboard" });
  }

  if (verifying) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">Verifying your reset link…</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">Link expired</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link to="/forgot-password">Request new link</Link>
            </Button>

            {/* A recovery link only lands here if this origin is in the
                project's redirect allowlist. When it is not — running on
                localhost, or a preview build — Supabase sends the user to the
                configured Site URL instead, with the token still attached.
                Pasting that URL redeems it here. */}
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 text-left">
              <Label htmlFor="paste-link" className="text-xs font-medium">
                Landed on the wrong site? Paste the link here
              </Label>
              <Input
                id="paste-link"
                value={pastedLink}
                onChange={(e) => setPastedLink(e.target.value)}
                placeholder="https://…/reset-password#access_token=…"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Copy the whole address from your browser after opening the email link, including
                everything after the <code>#</code>.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={redeemPastedLink}
                disabled={redeeming || !pastedLink.trim()}
              >
                {redeeming ? "Checking…" : "Use this link"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="font-display text-sm font-bold">h</span>
          </div>
          <CardTitle className="text-xl">Choose a new password</CardTitle>
          <CardDescription>Make sure it’s at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Reset password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
