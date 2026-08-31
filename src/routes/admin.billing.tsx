import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  startTenantSubscription,
  createBillingSetupLink,
  reportMonthlyUsageForTenant,
  previewTenantHeadcount,
  listTenantBillingSnapshots,
  getMyBilling,
} from '@/lib/billing.functions';
import { seedStripePrices } from '@/lib/billing-admin.functions';
import { SUPER_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute('/admin/billing')({
  head: () => ({
    meta: [
      { title: 'Direct-debit billing — hrppl' },
      { name: 'description', content: 'Configure direct-debit billing, manage mandates, and view monthly net-employee usage.' },
    ],
  }),
  // AdminGate was imported but never wired up — this page had no route-level
  // gate at all (found while giving it a nav entry per the W4 IA redesign).
  component: () => (
    <AdminGate allow={SUPER_ADMIN_ONLY}>
      <AdminBilling />
    </AdminGate>
  ),
});

const REGIONS = [
  { id: 'ach', label: 'ACH (US)' },
  { id: 'becs', label: 'BECS (Australia)' },
  { id: 'sepa', label: 'SEPA (EU)' },
  { id: 'bacs', label: 'BACS (UK)' },
] as const;

function AdminBilling() {
  const billingQ = useQuery({ queryKey: ['my-billing'], queryFn: () => getMyBilling() });
  const snapsQ = useQuery({ queryKey: ['my-snapshots'], queryFn: () => listTenantBillingSnapshots() });

  const sub = (billingQ.data as any)?.subscription ?? null;
  const [plan, setPlan] = useState<'starter_v2' | 'pro_v2'>(sub?.plan_id ? (sub.plan_code as any) : 'starter_v2');
  const [addon, setAddon] = useState<boolean>(sub?.au_payroll_addon ?? false);
  const [regions, setRegions] = useState<string[]>(sub?.debit_regions ?? ['ach', 'becs', 'sepa', 'bacs']);
  const [cardFallback, setCardFallback] = useState<boolean>(sub?.allow_card_fallback ?? true);

  const startFn = useServerFn(startTenantSubscription);
  const setupFn = useServerFn(createBillingSetupLink);
  const reportFn = useServerFn(reportMonthlyUsageForTenant);
  const previewFn = useServerFn(previewTenantHeadcount);
  const seedFn = useServerFn(seedStripePrices);

  const start = useMutation({
    mutationFn: () =>
      startFn({
        data: {
          planCode: plan,
          addAuPayrollAddon: addon,
          debitRegions: regions as any,
          allowCardFallback: cardFallback,
        },
      }),
    onSuccess: () => { toast.success('Subscription started — 1 month free trial active'); billingQ.refetch(); },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to start subscription'),
  });

  const setup = useMutation({
    mutationFn: () => setupFn({ data: {} as any }),
    onSuccess: (r: any) => { if (r?.url) window.location.href = r.url; },
    onError: (e: any) => toast.error(e?.message ?? 'Failed'),
  });

  const seed = useMutation({
    mutationFn: () => seedFn({ data: {} as any }),
    onSuccess: () => toast.success('Stripe prices ready'),
    onError: (e: any) => toast.error(e?.message ?? 'Failed'),
  });

  const preview = useMutation({
    mutationFn: () => previewFn({ data: {} as any }),
    onSuccess: (r: any) =>
      toast.success(`Net employees this month: ${r.net_employees} (joined ${r.joined_count}, left ${r.left_count})`),
  });

  const tenantId: string | null = (billingQ.data as any)?.tenant?.id ?? null;
  const now = new Date();
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const report = useMutation({
    mutationFn: () =>
      reportFn({
        data: {
          tenantId: tenantId!,
          year: lastMonth.getUTCFullYear(),
          month: lastMonth.getUTCMonth() + 1,
          dryRun: false,
        },
      }),
    onSuccess: (r: any) =>
      toast.success(`Reported ${r.baseUnits} base + ${r.addonUnits} addon units (${r.status})`),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to report usage'),
  });

  return (
    <AppShell title="Billing">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Direct-debit billing</h1>
          <p className="text-sm text-muted-foreground">
            Pay monthly by bank debit based on the net active employees in your account each calendar month.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Starter is $1/employee/month, Pro is $3/employee/month. AU Payroll add-on is $2/employee/month
              (billed from day 1). Your base plan is free for the first month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button variant={plan === 'starter_v2' ? 'default' : 'outline'} onClick={() => setPlan('starter_v2')}>
                Starter · $1/emp/mo
              </Button>
              <Button variant={plan === 'pro_v2' ? 'default' : 'outline'} onClick={() => setPlan('pro_v2')}>
                Pro · $3/emp/mo
              </Button>
              <label className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Checkbox checked={addon} onCheckedChange={(v) => setAddon(!!v)} />
                <span className="text-sm">AU Payroll add-on (+$2/emp/mo)</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Debit regions</Label>
              <div className="flex flex-wrap gap-3">
                {REGIONS.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Checkbox
                      checked={regions.includes(r.id)}
                      onCheckedChange={(v) =>
                        setRegions((cur) => (v ? [...new Set([...cur, r.id])] : cur.filter((x) => x !== r.id)))
                      }
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 pt-1">
                <Checkbox checked={cardFallback} onCheckedChange={(v) => setCardFallback(!!v)} />
                <span className="text-sm">Allow card as fallback when bank debit is unavailable</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => start.mutate()} disabled={start.isPending || regions.length === 0}>
                {start.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sub?.stripe_subscription_id ? 'Update subscription' : 'Start subscription (1 month free)'}
              </Button>
              <Button variant="outline" onClick={() => setup.mutate()} disabled={setup.isPending || !sub?.stripe_customer_id}>
                {setup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set up bank-debit mandate
              </Button>
              <Button variant="ghost" onClick={() => preview.mutate()}>
                Preview this month's headcount
              </Button>
            </div>

            {sub?.stripe_subscription_id && (
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Status: {sub.status}</Badge>
                {sub.trial_ends_at && !sub.trial_consumed && (
                  <Badge>Trial ends {new Date(sub.trial_ends_at).toLocaleDateString()}</Badge>
                )}
                <Badge variant="outline">Customer {sub.stripe_customer_id}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Monthly usage</CardTitle>
              <CardDescription>Net active employees billed per calendar month.</CardDescription>
            </div>
            {tenantId && (
              <Button size="sm" variant="outline" disabled={report.isPending} onClick={() => report.mutate()}>
                Report previous month now
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="text-right">Left</TableHead>
                  <TableHead className="text-right">Base units</TableHead>
                  <TableHead className="text-right">Add-on units</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(snapsQ.data as any)?.items?.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.period_year}-{String(s.period_month).padStart(2, '0')}</TableCell>
                    <TableCell className="text-right">{s.net_employees}</TableCell>
                    <TableCell className="text-right">{s.joined_count}</TableCell>
                    <TableCell className="text-right">{s.left_count}</TableCell>
                    <TableCell className="text-right">{s.base_units}{s.trial_applied ? ' (trial)' : ''}</TableCell>
                    <TableCell className="text-right">{s.addon_units}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'reported' ? 'default' : s.status === 'failed' ? 'destructive' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!snapsQ.data || (snapsQ.data as any).items?.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No usage reported yet. The monthly cron reports on day 1 of each month.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Super-admin tools</CardTitle>
            <CardDescription>One-time Stripe setup and operational dashboards.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={seed.isPending} onClick={() => seed.mutate()}>
              {seed.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Stripe products & prices
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/billing-ops">Billing operations dashboard →</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
