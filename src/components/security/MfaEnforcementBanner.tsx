import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { getMyMfaStatus } from "@/lib/mfa-policy.functions";
import { useAuth } from "@/hooks/use-auth";

export function MfaEnforcementBanner() {
  const { user, rolesLoaded } = useAuth();
  const fn = useServerFn(getMyMfaStatus);
  const { data } = useQuery({
    queryKey: ["my-mfa-status", user?.id],
    queryFn: () => fn(),
    enabled: !!user && rolesLoaded,
    staleTime: 60_000,
    retry: false,
  });

  if (!data?.required || data.enrolled) return null;

  const isBlocking = data.blocking;
  const days = data.grace_remaining_days;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 border-b px-4 py-3 text-sm ${
        isBlocking
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
      }`}
    >
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <div className="flex-1">
        <strong className="font-semibold">
          {isBlocking ? "MFA required for your role." : "MFA required soon."}
        </strong>{" "}
        {isBlocking
          ? "Configure multi-factor authentication to continue accessing sensitive areas."
          : `Set up MFA within ${days} day${days === 1 ? "" : "s"} to keep access.`}
      </div>
      <Link
        to="/settings/notifications"
        className="font-medium underline underline-offset-4"
      >
        Set up MFA
      </Link>
    </div>
  );
}
