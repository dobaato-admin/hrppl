// Cron-invoked: bills the just-closed calendar month for every tenant with
// an active Stripe subscription, then runs reconciliation. Any unhandled
// failure raises a super-admin alert in billing_admin_alerts.
import { createFileRoute } from '@tanstack/react-router';
import { isAuthorizedCronRequest } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/monthly-billing-cycle')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response('Unauthorized', { status: 401 });
        }
        const body = (await request.json().catch(() => ({}))) as {
          year?: number; month?: number; skipReconcile?: boolean;
        };
        const now = new Date();
        const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        const year = body.year ?? target.getUTCFullYear();
        const month = body.month ?? target.getUTCMonth() + 1;

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        try {
          const { runMonthlyBillingForAllTenants, reconcileMonth } = await import('@/lib/billing.server');
          const results = await runMonthlyBillingForAllTenants(year, month);
          const summary = {
            year, month,
            total: results.length,
            reported: results.filter((r) => r.status === 'reported').length,
            skipped: results.filter((r) => r.status === 'skipped').length,
            failed: results.filter((r) => r.status === 'failed').length,
          };

          let reconciliation: any = null;
          if (!body.skipReconcile) {
            try { reconciliation = await reconcileMonth(year, month); }
            catch (e: any) {
              await supabaseAdmin.from('billing_admin_alerts').insert({
                alert_type: 'reconciliation_run_failed',
                severity: 'error',
                title: `Reconciliation crashed for ${year}-${String(month).padStart(2, '0')}`,
                message: e?.message ?? String(e),
                context: { year, month },
              });
            }
          }

          if (summary.failed > 0) {
            await supabaseAdmin.from('billing_admin_alerts').insert({
              alert_type: 'monthly_billing_partial_failure',
              severity: 'warning',
              title: `${summary.failed} tenants failed to report usage for ${year}-${String(month).padStart(2, '0')}`,
              message: `Reported ${summary.reported}/${summary.total}; ${summary.failed} failed.`,
              context: { year, month, summary },
            });
          }

          return Response.json({ ok: true, summary, reconciliation, results });
        } catch (e: any) {
          await supabaseAdmin.from('billing_admin_alerts').insert({
            alert_type: 'monthly_billing_cron_failed',
            severity: 'error',
            title: `Monthly billing cron failed (${year}-${String(month).padStart(2, '0')})`,
            message: e?.message ?? String(e),
            context: { year, month },
          });
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500 });
        }
      },
    },
  },
});
