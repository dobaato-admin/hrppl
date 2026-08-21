// Stripe webhook receiver. Verifies signature then records key billing
// events into billing_audit_log + tenant_invoices, updates tenant_subscriptions,
// and raises super-admin alerts on failed payments / unhandled errors.
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/hooks/stripe-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response('Webhook secret not configured', { status: 500 });

        const sig = request.headers.get('stripe-signature');
        if (!sig) return new Response('Missing signature', { status: 400 });
        const body = await request.text();

        const { getStripe } = await import('@/lib/stripe.server');
        const stripe = getStripe();
        let event: any;
        try {
          event = stripe.webhooks.constructEvent(body, sig, secret);
        } catch (e: any) {
          return new Response(`Invalid signature: ${e?.message}`, { status: 400 });
        }

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        // Idempotency
        const { data: dup } = await supabaseAdmin
          .from('billing_audit_log')
          .select('id')
          .eq('stripe_event_id', event.id)
          .maybeSingle();
        if (dup) return Response.json({ ok: true, duplicate: true });

        const obj = event.data?.object ?? {};
        const customerId: string | undefined = obj.customer ?? undefined;
        const subscriptionId: string | undefined = obj.subscription ?? obj.id ?? undefined;

        let tenantId: string | null = null;
        if (customerId) {
          const { data: t } = await supabaseAdmin
            .from('tenant_subscriptions')
            .select('tenant_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          tenantId = t?.tenant_id ?? null;
        }

        try {
          switch (event.type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.created': {
              const status: string = obj.status;
              const mapped =
                status === 'canceled' ? 'cancelled' :
                status === 'trialing' ? 'trialing' :
                status === 'past_due' ? 'past_due' :
                status === 'active' ? 'active' : undefined;
              await supabaseAdmin
                .from('tenant_subscriptions')
                .update({
                  ...(mapped ? { status: mapped as any } : {}),
                  current_period_start: new Date(obj.current_period_start * 1000).toISOString().slice(0, 10),
                  current_period_end: new Date(obj.current_period_end * 1000).toISOString().slice(0, 10),
                  trial_ends_at: obj.trial_end ? new Date(obj.trial_end * 1000).toISOString().slice(0, 10) : null,
                })
                .eq('stripe_subscription_id', obj.id);
              break;
            }
            case 'customer.subscription.deleted': {
              await supabaseAdmin
                .from('tenant_subscriptions')
                .update({ status: 'cancelled' as any })
                .eq('stripe_subscription_id', obj.id);
              break;
            }
            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed':
            case 'invoice.finalized':
            case 'invoice.paid': {
              if (tenantId) {
                const lastErr = obj.last_finalization_error?.message
                  ?? obj.last_payment_error?.message
                  ?? null;
                await supabaseAdmin.from('tenant_invoices').upsert({
                  tenant_id: tenantId,
                  stripe_invoice_id: obj.id,
                  stripe_customer_id: customerId ?? null,
                  stripe_subscription_id: obj.subscription ?? null,
                  status: obj.status,
                  amount_due: obj.amount_due ?? 0,
                  amount_paid: obj.amount_paid ?? 0,
                  currency: obj.currency ?? null,
                  hosted_invoice_url: obj.hosted_invoice_url ?? null,
                  invoice_pdf: obj.invoice_pdf ?? null,
                  period_start: obj.period_start ? new Date(obj.period_start * 1000).toISOString().slice(0, 10) : null,
                  period_end: obj.period_end ? new Date(obj.period_end * 1000).toISOString().slice(0, 10) : null,
                  attempt_count: obj.attempt_count ?? 0,
                  last_payment_error: lastErr,
                  invoice_created_at: obj.created ? new Date(obj.created * 1000).toISOString() : null,
                  paid_at: obj.status_transitions?.paid_at
                    ? new Date(obj.status_transitions.paid_at * 1000).toISOString() : null,
                }, { onConflict: 'stripe_invoice_id' });

                if (event.type === 'invoice.payment_failed') {
                  await supabaseAdmin.from('billing_admin_alerts').insert({
                    tenant_id: tenantId,
                    alert_type: 'invoice_payment_failed',
                    severity: 'error',
                    title: `Invoice payment failed (${(obj.amount_due ?? 0) / 100} ${obj.currency ?? ''})`,
                    message: lastErr ?? 'Stripe reports payment failure',
                    context: { invoice_id: obj.id, attempt_count: obj.attempt_count, hosted_invoice_url: obj.hosted_invoice_url },
                  });
                }
              }
              break;
            }
            case 'setup_intent.succeeded':
            case 'payment_method.attached': {
              const pmId = obj.payment_method ?? obj.id;
              const pmType = obj.payment_method_types?.[0] ?? obj.type ?? null;
              if (customerId) {
                const { data: beforeSub } = await supabaseAdmin
                  .from('tenant_subscriptions')
                  .select('mandate_status, mandate_payment_method_id')
                  .eq('stripe_customer_id', customerId).maybeSingle();
                await supabaseAdmin
                  .from('tenant_subscriptions')
                  .update({
                    mandate_status: 'active',
                    mandate_payment_method_id: pmId,
                    mandate_last_checked_at: new Date().toISOString(),
                  })
                  .eq('stripe_customer_id', customerId);
                await supabaseAdmin.from('billing_audit_log').insert({
                  tenant_id: tenantId,
                  event_type: 'mandate.attached',
                  stripe_event_id: event.id + ':mandate',
                  payload: { payment_method: pmId, type: pmType },
                });
                await supabaseAdmin.from('billing_ops_audit').insert({
                  action: 'mandate.update', target_type: 'mandate',
                  target_id: pmId, tenant_id: tenantId,
                  before: beforeSub,
                  after: { mandate_status: 'active', mandate_payment_method_id: pmId },
                  metadata: { source: 'stripe_webhook', event_type: event.type, type: pmType },
                });
              }
              break;
            }
            case 'mandate.updated': {
              if (customerId) {
                const { data: beforeSub } = await supabaseAdmin
                  .from('tenant_subscriptions')
                  .select('mandate_status, mandate_payment_method_id')
                  .eq('stripe_customer_id', customerId).maybeSingle();
                await supabaseAdmin
                  .from('tenant_subscriptions')
                  .update({
                    mandate_status: obj.status,
                    mandate_last_checked_at: new Date().toISOString(),
                  })
                  .eq('stripe_customer_id', customerId);
                await supabaseAdmin.from('billing_ops_audit').insert({
                  action: 'mandate.update', target_type: 'mandate',
                  target_id: obj.id ?? null, tenant_id: tenantId,
                  before: beforeSub,
                  after: { mandate_status: obj.status },
                  metadata: { source: 'stripe_webhook', event_type: event.type },
                });
              }
              break;
            }
            default:
              break;
          }
        } catch (e: any) {
          await supabaseAdmin.from('billing_admin_alerts').insert({
            tenant_id: tenantId,
            alert_type: 'stripe_webhook_handler_error',
            severity: 'error',
            title: `Webhook handler error: ${event.type}`,
            message: e?.message ?? String(e),
            context: { event_id: event.id, event_type: event.type },
          });
        }

        await supabaseAdmin.from('billing_audit_log').insert({
          tenant_id: tenantId,
          event_type: event.type,
          stripe_event_id: event.id,
          payload: {
            id: obj.id,
            status: obj.status,
            amount_due: obj.amount_due,
            amount_paid: obj.amount_paid,
            subscription: subscriptionId,
            customer: customerId,
          },
        });

        return Response.json({ ok: true });
      },
    },
  },
});
