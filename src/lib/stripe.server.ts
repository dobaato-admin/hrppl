// Server-only Stripe client. NEVER import this from a route or component file
// at module scope — import inside server-function/server-route handlers only.
// The package's `exports` map resolves to the worker-targeted ESM entry under
// the workerd condition, so a plain root import works on Cloudflare Workers.
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  _stripe = new Stripe(key, {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
    appInfo: { name: 'HRPPL Billing', version: '1.0.0' },
  });
  return _stripe;
}

/** Map our debit_regions slugs to Stripe payment_method_types. */
export function paymentMethodTypesFor(regions: string[], allowCardFallback: boolean): string[] {
  const out = new Set<string>();
  for (const r of regions) {
    switch (r) {
      case 'ach': out.add('us_bank_account'); break;
      case 'becs': out.add('au_becs_debit'); break;
      case 'sepa': out.add('sepa_debit'); break;
      case 'bacs': out.add('bacs_debit'); break;
    }
  }
  if (allowCardFallback) out.add('card');
  if (out.size === 0) out.add('card');
  return Array.from(out);
}

export const STRIPE_PRICE_STARTER_ENV = 'STRIPE_PRICE_STARTER';
export const STRIPE_PRICE_PRO_ENV = 'STRIPE_PRICE_PRO';
export const STRIPE_PRICE_ADDON_AU_ENV = 'STRIPE_PRICE_ADDON_AU';
