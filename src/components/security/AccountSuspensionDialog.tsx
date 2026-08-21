import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { suspendAccount, reinstateAccount } from "@/lib/account-suspension.functions";

export interface SuspensionTarget {
  /** auth user id — NOT the employee id. Suspension is keyed on profiles.id. */
  userId: string;
  displayName: string;
  suspended: boolean;
  reason?: string | null;
}

/**
 * Suspend / reinstate a user account (§1 #4).
 *
 * Shared by the org admin employee list and the platform tenant console so both
 * surfaces behave identically. Server-side scoping in
 * account-suspension.functions.ts is the real boundary — this only shapes the
 * interaction:
 *   - suspending demands a reason (it is shown to the user on /suspended);
 *   - reinstating is a single confirm.
 *
 * Callers must refresh their own list via onDone; this component holds no
 * list state.
 */
export function AccountSuspensionDialog({
  target,
  open,
  onOpenChange,
  onDone,
}: {
  target: SuspensionTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void | Promise<void>;
}) {
  const suspend = useServerFn(suspendAccount);
  const reinstate = useServerFn(reinstateAccount);
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);

  if (!target) return null;
  const isSuspended = target.suspended;

  async function run() {
    if (!target) return;
    if (!isSuspended && !reason.trim()) {
      toast.error("A reason is required — the user sees it on the suspended screen.");
      return;
    }
    setWorking(true);
    try {
      if (isSuspended) {
        await reinstate({ data: { userId: target.userId } });
        toast.success(`${target.displayName} can sign in again`);
      } else {
        const res = (await suspend({
          data: { userId: target.userId, reason: reason.trim() },
        })) as { sessionsRevoked?: number };
        const revoked = res?.sessionsRevoked ?? 0;
        toast.success(
          revoked > 0
            ? `${target.displayName} suspended — ${revoked} active session${revoked === 1 ? "" : "s"} ended`
            : `${target.displayName} suspended`,
        );
      }
      setReason("");
      onOpenChange(false);
      await onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change account status");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuspended ? (
              <ShieldCheck className="h-4 w-4 text-status-done" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-status-stuck" />
            )}
            {isSuspended ? "Restore access" : "Suspend account"}
          </DialogTitle>
          <DialogDescription>
            {isSuspended
              ? `${target.displayName} will be able to sign in and use hrppl again immediately.`
              : `${target.displayName} will be signed out everywhere and blocked from every page and API call until an administrator restores access.`}
          </DialogDescription>
        </DialogHeader>

        {isSuspended ? (
          target.reason ? (
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suspended for
              </p>
              <p className="mt-1 text-sm">{target.reason}</p>
            </div>
          ) : null
        ) : (
          <div className="space-y-2">
            <Label htmlFor="suspension-reason">Reason</Label>
            <Textarea
              id="suspension-reason"
              rows={3}
              value={reason}
              maxLength={500}
              placeholder="Shown to the user on the suspended screen, e.g. Offboarded — pending exit checklist"
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={working}>
            Cancel
          </Button>
          <Button
            variant={isSuspended ? "default" : "destructive"}
            onClick={run}
            disabled={working || (!isSuspended && !reason.trim())}
          >
            {working ? "Working…" : isSuspended ? "Restore access" : "Suspend account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
