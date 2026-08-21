// Cron endpoint: processes due auto-retries for billing-ops alerts whose
// alert_type has retry policy enabled. Configure pg_cron to POST here every
// few minutes. Protected by CRON_SECRET header if set.
import { createFileRoute } from '@tanstack/react-router';
import { processDueAutoRetries } from '@/lib/billing-admin.functions';
import { isAuthorizedCronRequest } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/auto-retry-alerts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response('Unauthorized', { status: 401 });
        }
        try {
          const out = await processDueAutoRetries(50);
          return new Response(JSON.stringify({ status: 'ok', ...out }), {
            status: 200, headers: { 'content-type': 'application/json' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500, headers: { 'content-type': 'application/json' },
          });
        }
      },
    },
  },
});
