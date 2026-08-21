import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DestructiveConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** User must type this string exactly to enable the action. */
  typedToken: string;
  /** If true, the current user's password is re-verified before running. */
  requirePassword?: boolean;
  /** Label shown on the confirm button. */
  actionLabel?: string;
  /** Action to run when confirmation passes. */
  onConfirm: () => Promise<void> | void;
}

/**
 * Typed-confirmation modal for destructive actions.
 * - User must type the exact `typedToken` (e.g. organization name).
 * - If `requirePassword`, we call signInWithPassword on the current user's
 *   email to verify before invoking onConfirm.
 */
export function DestructiveConfirm({
  open,
  onOpenChange,
  title,
  description,
  typedToken,
  requirePassword = false,
  actionLabel = "Delete permanently",
  onConfirm,
}: DestructiveConfirmProps) {
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const canConfirm = typed === typedToken && (!requirePassword || password.length > 0);

  async function reset() {
    setTyped("");
    setPassword("");
    setBusy(false);
  }

  async function handle() {
    setBusy(true);
    try {
      if (requirePassword) {
        const { data: u } = await supabase.auth.getUser();
        const email = u?.user?.email;
        if (!email) throw new Error("Could not verify your session — sign in again.");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Password verification failed.");
      }
      await onConfirm();
      onOpenChange(false);
      void reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not complete the action");
      setBusy(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          onOpenChange(next);
          if (!next) void reset();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="dc-token">
              Type <span className="font-mono font-semibold text-foreground">{typedToken}</span> to confirm
            </Label>
            <Input
              id="dc-token"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              placeholder={typedToken}
            />
          </div>
          {requirePassword && (
            <div className="space-y-1">
              <Label htmlFor="dc-pw">Confirm with your password</Label>
              <Input
                id="dc-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || busy}
            onClick={(e) => {
              e.preventDefault();
              void handle();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Working…" : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
