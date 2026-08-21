import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notification-preferences.functions";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({ meta: [{ title: "Notification Settings — WorldPay HRMS" }] }),
  component: NotificationSettings,
});

type Prefs = {
  notify_leave_submitted: boolean;
  notify_leave_decision: boolean;
  notify_leave_cancelled: boolean;
  notify_review_self_pending: boolean;
  notify_review_manager_pending: boolean;
  notify_review_acknowledgment: boolean;
  notify_review_calibration: boolean;
  notify_onboarding_overdue: boolean;
  notify_onboarding_task: boolean;
  notify_timesheet: boolean;
  review_reminder_min_interval_days: number | null;
  review_reminder_business_days_only: boolean;
};

function NotificationSettings() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const getPrefs = useServerFn(getNotificationPreferences);
  const updatePrefs = useServerFn(updateNotificationPreferences);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    getPrefs().then((p) => setPrefs(p as Prefs)).catch(() => toast.error("Failed to load preferences"));
  }, [user, getPrefs]);

  const isManager = roles.includes("manager") || roles.includes("org_admin") || roles.includes("super_admin");

  async function toggle(key: keyof Prefs, value: boolean) {
    if (!prefs) return;
    const prev = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await updatePrefs({ data: { [key]: value } as any });
    } catch {
      setPrefs(prev);
      toast.error("Could not save preference");
    } finally {
      setSaving(false);
    }
  }

  async function saveInterval(value: number | null) {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, review_reminder_min_interval_days: value });
    setSaving(true);
    try {
      await updatePrefs({ data: { review_reminder_min_interval_days: value } as any });
    } catch {
      setPrefs(prev);
      toast.error("Could not save preference");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user || !prefs) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  return (
    <AppShell title="Notification settings" subtitle="Choose which emails you receive.">

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave email notifications</CardTitle>
            <CardDescription>
              Choose which leave-related emails you'd like to receive. Changes apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Row
              id="notify_leave_submitted"
              title="New leave requests"
              description={
                isManager
                  ? "Confirmation when you submit a request, plus alerts when your team submits one."
                  : "Confirmation when you submit a leave request."
              }
              value={prefs.notify_leave_submitted}
              disabled={saving}
              onChange={(v) => toggle("notify_leave_submitted", v)}
            />
            <Row
              id="notify_leave_decision"
              title="Approval & rejection updates"
              description="When a manager approves or rejects one of your leave requests."
              value={prefs.notify_leave_decision}
              disabled={saving}
              onChange={(v) => toggle("notify_leave_decision", v)}
            />
            {isManager && (
              <Row
                id="notify_leave_cancelled"
                title="Cancelled requests"
                description="When an employee cancels a pending leave request you would have approved."
                value={prefs.notify_leave_cancelled}
                disabled={saving}
                onChange={(v) => toggle("notify_leave_cancelled", v)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance review reminders</CardTitle>
            <CardDescription>
              Nudges sent while a review cycle is active. In-app notifications still appear
              when email is turned off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Row
              id="notify_review_self_pending"
              title="Self-review pending"
              description="Reminders when your self-review is still in draft during an active cycle."
              value={prefs.notify_review_self_pending}
              disabled={saving}
              onChange={(v) => toggle("notify_review_self_pending", v)}
            />
            {isManager && (
              <Row
                id="notify_review_manager_pending"
                title="Manager review pending"
                description="Reminders when a direct report has submitted their self-review and yours is still pending."
                value={prefs.notify_review_manager_pending}
                disabled={saving}
                onChange={(v) => toggle("notify_review_manager_pending", v)}
              />
            )}
            <Row
              id="notify_review_acknowledgment"
              title="Acknowledge finalized review"
              description="Reminders to sign off on your finalized review."
              value={prefs.notify_review_acknowledgment}
              disabled={saving}
              onChange={(v) => toggle("notify_review_acknowledgment", v)}
            />
            {isManager && (
              <Row
                id="notify_review_calibration"
                title="Calibration ready"
                description="Daily digest when manager reviews in an active cycle are awaiting calibration."
                value={prefs.notify_review_calibration}
                disabled={saving}
                onChange={(v) => toggle("notify_review_calibration", v)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding reminders</CardTitle>
            <CardDescription>
              Nudges when onboarding tasks pass their due date. In-app notifications still appear when email is turned off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Row
              id="notify_onboarding_overdue"
              title="Overdue onboarding checklists"
              description={
                isManager
                  ? "Reminders for your own overdue onboarding, plus alerts when a direct report's checklist is overdue."
                  : "Reminders when one of your onboarding checklists is past its due date."
              }
              value={prefs.notify_onboarding_overdue}
              disabled={saving}
              onChange={(v) => toggle("notify_onboarding_overdue", v)}
            />
            <Row
              id="notify_onboarding_task"
              title="Onboarding task activity"
              description="Emails when an onboarding control-room task is created, completed, or changes status — plus due-soon and overdue reminders."
              value={prefs.notify_onboarding_task}
              disabled={saving}
              onChange={(v) => toggle("notify_onboarding_task", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timesheet email notifications</CardTitle>
            <CardDescription>
              Emails when a timesheet is submitted, approved, or rejected. In-app notifications still appear when email is turned off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Row
              id="notify_timesheet"
              title="Timesheet status updates"
              description={
                isManager
                  ? "Alerts when an employee submits a timesheet for your approval, plus decisions on your own timesheets."
                  : "Confirmations when you submit a timesheet, and when it is approved or rejected."
              }
              value={prefs.notify_timesheet}
              disabled={saving}
              onChange={(v) => toggle("notify_timesheet", v)}
            />
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Reminder cadence</CardTitle>
            <CardDescription>
              Personal overrides on top of each cycle's reminder settings. We always use the
              longer interval between yours and the cycle's.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="review_reminder_min_interval_days" className="text-sm font-medium">Minimum days between reminders</Label>
                <p className="text-sm text-muted-foreground">Leave blank to follow the cycle's interval (1–60 days).</p>
              </div>
              <Input
                id="review_reminder_min_interval_days"
                type="number"
                min={1}
                max={60}
                placeholder="Cycle default"
                disabled={saving}
                value={prefs.review_reminder_min_interval_days ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (v === "") { saveInterval(null); return; }
                  const n = parseInt(v, 10);
                  if (!Number.isFinite(n)) return;
                  saveInterval(Math.max(1, Math.min(60, n)));
                }}
                className="w-32"
              />
            </div>
            <Row
              id="review_reminder_business_days_only"
              title="Business days only"
              description="Skip Saturday and Sunday reminders (UTC). Cycle setting still applies on top of this."
              value={prefs.review_reminder_business_days_only}
              disabled={saving}
              onChange={(v) => toggle("review_reminder_business_days_only", v)}
            />
          </CardContent>
        </Card>




        <p className="text-xs text-muted-foreground">
          Critical account emails (sign-in, security, password resets) are always sent and can't be turned off.
        </p>

        <Button variant="outline" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function Row({
  id, title, description, value, onChange, disabled,
}: {
  id: string; title: string; description: string;
  value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
