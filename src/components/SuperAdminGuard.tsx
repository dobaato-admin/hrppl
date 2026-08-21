import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logBlogAccessAttempt } from "@/lib/blog.functions";
import { useEffect, useRef } from "react";

interface Props {
  title: string;
  route: string;
  children: ReactNode;
}

/**
 * Renders a clear "Super admin only" denied screen for non–super-admin users
 * and records every unauthorized attempt to the blog access audit log.
 */
export function SuperAdminGuard({ title, route, children }: Props) {
  const { user, roles, loading } = useAuth();
  const isSuper = roles.includes("super_admin");
  const logFn = useServerFn(logBlogAccessAttempt);
  const logged = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user && !isSuper && !logged.current) {
      logged.current = true;
      void logFn({ data: { route, reason: "non_super_admin_ui_access" } }).catch(() => {});
    }
  }, [loading, user, isSuper, route, logFn]);

  if (loading) {
    return (
      <AppShell title={title}>
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title={title}>
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You must be signed in to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link to="/auth">Go to sign in</Link></Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!isSuper) {
    return (
      <AppShell title={title}>
        <Card className="border-destructive/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Super admin only</CardTitle>
                <CardDescription>
                  The Blog CMS, API keys and webhook management are restricted to super administrators.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your access attempt to <code className="font-mono">{route}</code> has been recorded.
              If you believe you should have access, contact a super administrator.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return <>{children}</>;
}
