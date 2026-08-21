import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const TITLE = "Pricing — hrppl Global HRMS & Payroll";
const DESCRIPTION =
  "Simple, transparent pricing for hrppl. Multi-country payroll, HRMS and practice management with per-employee plans for teams of every size.";
const URL = "https://hrppl.io/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PricingPage,
});

const TIERS = [
  { name: "Starter", price: "$4", per: "per employee / month", features: ["Up to 25 employees", "Single-country payroll", "Self-serve onboarding", "Email support"] },
  { name: "Growth", price: "$8", per: "per employee / month", features: ["Unlimited employees", "Multi-country payroll", "Performance & reviews", "Priority support"] },
  { name: "Enterprise", price: "Custom", per: "Talk to sales", features: ["SAML SSO & SCIM", "Dedicated CSM", "Custom integrations", "99.95% SLA"] },
];

function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl">Pricing built for global teams</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          One platform for HR, payroll and practice management. Pay only for active employees.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-xl border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">{t.name}</div>
              <div className="mt-2 text-3xl font-semibold">{t.price}</div>
              <div className="text-xs text-muted-foreground">{t.per}</div>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-primary" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Questions? <Link to="/contact" className="underline">Contact our team</Link>.
        </p>
      </section>
    </main>
  );
}
