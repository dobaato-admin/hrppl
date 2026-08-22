import { S as Stripe } from "../_libs/stripe.mjs";
import "crypto";
import "os";
import "events";
import "http";
import "https";
let _stripe = null;
function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
    appInfo: { name: "HRPPL Billing", version: "1.0.0" }
  });
  return _stripe;
}
function paymentMethodTypesFor(regions, allowCardFallback) {
  const out = /* @__PURE__ */ new Set();
  for (const r of regions) {
    switch (r) {
      case "ach":
        out.add("us_bank_account");
        break;
      case "becs":
        out.add("au_becs_debit");
        break;
      case "sepa":
        out.add("sepa_debit");
        break;
      case "bacs":
        out.add("bacs_debit");
        break;
    }
  }
  if (allowCardFallback) out.add("card");
  if (out.size === 0) out.add("card");
  return Array.from(out);
}
const STRIPE_PRICE_STARTER_ENV = "STRIPE_PRICE_STARTER";
const STRIPE_PRICE_PRO_ENV = "STRIPE_PRICE_PRO";
const STRIPE_PRICE_ADDON_AU_ENV = "STRIPE_PRICE_ADDON_AU";
export {
  STRIPE_PRICE_ADDON_AU_ENV,
  STRIPE_PRICE_PRO_ENV,
  STRIPE_PRICE_STARTER_ENV,
  getStripe,
  paymentMethodTypesFor
};
