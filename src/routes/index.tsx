import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Globe2,
  ShieldCheck,
  Sparkles,
  Workflow,
  Receipt,
  Users,
  Clock,
  Building2,
  PlugZap,
  Star,
  ChevronDown,
} from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import hrpplIcon from "@/assets/hrppl-icon.webp";
import hrpplWordmark from "@/assets/hrppl-wordmark.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "hrppl — Global HRMS, Payroll & Practice Management Platform" },
      {
        name: "description",
        content:
          "Run global HR, multi-country payroll, performance, time and invoicing from one platform. hrppl gives finance and HR teams compliant payslips, white-label practice management and a full API in 40+ countries.",
      },
      { name: "keywords", content: "global payroll, HRMS, multi-country payroll, payroll software, HR platform, practice management, payroll API, payslip software, international HR, HRIS" },
      { property: "og:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { property: "og:description", content: "Multi-country payroll, HR, performance and practice management. Built for global finance and HR teams." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hrppl.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { name: "twitter:description", content: "Multi-country payroll, HR, performance and practice management." },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "hrppl",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Global HRMS, payroll and practice management platform for finance and HR teams.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "128",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Which countries does hrppl support?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "hrppl supports payroll, leave and compliance rules across 40+ countries with locale-aware payslips, tax codes, overtime and holiday calendars.",
              },
            },
            {
              "@type": "Question",
              name: "Is there an API?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every UI action has a matching REST endpoint, with OAuth 2.0, signed webhooks, SCIM 2.0 and an OpenAPI 3.1 spec.",
              },
            },
            {
              "@type": "Question",
              name: "Can accountants and outsourced HR firms white-label hrppl?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Practice firms get clients, projects, jobs, time tracking and invoicing under their own brand and custom domain.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

const MARKETING_FONT_VARS = {
  ["--font-sans" as never]: "'Manrope', system-ui, sans-serif",
  ["--font-display" as never]: "'Sora', 'Manrope', sans-serif",
} as React.CSSProperties;

function Landing() {
  return (
    <main
      style={MARKETING_FONT_VARS}
      className="min-h-screen text-[oklch(0.15_0.02_255)]"
    >
      <style>{`
        .hrppl-marketing { font-family: 'Manrope', system-ui, sans-serif; }
        .hrppl-marketing h1, .hrppl-marketing h2, .hrppl-marketing h3, .hrppl-marketing h4 {
          font-family: 'Sora', 'Manrope', sans-serif; letter-spacing: -0.02em;
        }
        .hrppl-emerald { background: linear-gradient(135deg, oklch(0.18 0.04 255) 0%, oklch(0.12 0.03 255) 100%); color: oklch(0.96 0 0); }
        .hrppl-gold { color: oklch(0.78 0.10 220); }
        .hrppl-gold-bg { background: oklch(0.78 0.10 220); color: oklch(0.15 0.02 255); }
        .hrppl-cream-bg { background: oklch(0.96 0.008 255); }
        .hrppl-grid {
          background-image:
            linear-gradient(oklch(1 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.05) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        @keyframes hrppl-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .hrppl-float { animation: hrppl-float 6s ease-in-out infinite; }
      `}</style>

      <div className="hrppl-marketing">
        <Nav />
        <Hero />
        <Logos />
        <Bento />
        <Stats />
        <Practice />
        <Testimonials />
        <Pricing />
        <FAQ />
        <LeadSection />
        <Footer />
      </div>
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[oklch(0.92_0.01_255)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg shadow-sm">
            <img src={hrpplIcon} alt="hrppl" width={36} height={36} className="h-full w-full object-cover" />
          </span>
          <img src={hrpplWordmark} alt="hrppl" width={56} height={24} className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[oklch(0.35_0.02_255)] md:flex">
          <a href="#features" className="transition hover:text-[oklch(0.55_0.16_255)]">Features</a>
          <a href="#practice" className="transition hover:text-[oklch(0.55_0.16_255)]">Practice</a>
          <a href="#pricing" className="transition hover:text-[oklch(0.55_0.16_255)]">Pricing</a>
          <a href="#faq" className="transition hover:text-[oklch(0.55_0.16_255)]">FAQ</a>
          <Link to="/blog" className="transition hover:text-[oklch(0.55_0.16_255)]">Blog</Link>
          <Link to="/developers" className="transition hover:text-[oklch(0.55_0.16_255)]">Developers</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/auth" className="rounded-md px-3 py-2 text-sm font-medium text-[oklch(0.55_0.16_255)] transition hover:bg-[oklch(0.55_0.16_255)]/5">Sign in</Link>
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.55_0.16_255)] bg-white px-3 py-2 text-sm font-semibold text-[oklch(0.55_0.16_255)] shadow-sm transition hover:bg-[oklch(0.55_0.16_255)]/5">
            Sign up
          </Link>
          <a href="#contact" className="hidden items-center gap-2 rounded-md hrppl-gold-bg px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 sm:inline-flex">
            Book a demo <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden hrppl-emerald text-[oklch(0.98_0.01_255)]">
      <div className="absolute inset-0 hrppl-grid opacity-40" aria-hidden />
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-[oklch(0.78_0.10_220)] opacity-20 blur-3xl hrppl-float" aria-hidden />
      <div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-[oklch(0.55_0.16_255)] opacity-30 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.1fr_1fr] lg:py-32">
        <div className="flex flex-col gap-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[oklch(0.85_0.01_255)]/25 bg-[oklch(0.95_0.01_255)]/12 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full hrppl-gold-bg" />
            Trusted by global teams in 40+ countries
          </span>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            One platform for <span className="hrppl-gold">global HR</span>, payroll &amp; practice management
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[oklch(0.85_0.01_255)]">
            Run multi-country payroll, manage your people and bill your clients — all from a single, beautifully designed workspace. Built for finance leaders, HR teams and outsourced practice firms.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#contact" className="inline-flex items-center gap-2 rounded-md hrppl-gold-bg px-6 py-3 text-base font-semibold shadow-lg transition hover:opacity-90">
              Book a demo <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/developers" className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.85_0.01_255)]/40 bg-[oklch(0.95_0.01_255)]/8 px-6 py-3 text-base font-semibold text-[oklch(0.98_0.01_255)] backdrop-blur-sm transition hover:bg-[oklch(0.95_0.01_255)]/12">
              Explore the API
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-[oklch(0.78_0.01_255)]">
            {["No-code setup", "Compliant payslips", "REST + Webhooks"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 hrppl-gold" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-[oklch(0.85_0.01_255)]/25 bg-[oklch(0.95_0.01_255)]/8 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[oklch(0.85_0.01_255)]/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <span className="text-xs text-[oklch(0.72_0.01_255)]">payroll · october 2026</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { c: "🇬🇧 United Kingdom", e: 142, a: "£284,500", st: "Approved" },
                { c: "🇮🇳 India", e: 480, a: "₹2.1 Cr", st: "Processing" },
                { c: "🇦🇪 UAE", e: 36, a: "AED 412k", st: "Ready" },
                { c: "🇺🇸 United States", e: 78, a: "$398,210", st: "Approved" },
                { c: "🇸🇬 Singapore", e: 22, a: "S$ 184,000", st: "Ready" },
              ].map((r) => (
                <div key={r.c} className="flex items-center justify-between rounded-lg bg-[oklch(0.95_0.01_255)]/10 px-4 py-3 text-sm">
                  <span className="font-medium text-[oklch(0.98_0.01_255)]">{r.c}</span>
                  <span className="text-[oklch(0.72_0.01_255)]">{r.e} emp</span>
                  <span className="font-mono text-[oklch(0.96_0.01_255)]/90">{r.a}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.st === "Approved" ? "bg-[oklch(0.78_0.10_220)] text-[oklch(0.15_0.02_255)]" : r.st === "Processing" ? "bg-blue-400/20 text-blue-100" : "bg-[oklch(0.95_0.01_255)]/15 text-[oklch(0.98_0.01_255)]"}`}>{r.st}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg hrppl-gold-bg px-4 py-3 text-sm font-semibold">
              <span>Total run</span>
              <span className="font-mono">$1.84M USD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const items = ["Zoho", "BambooHR", "Workday", "QuickBooks", "Okta", "Slack", "Xero", "Stripe"];
  return (
    <section className="border-y border-[oklch(0.92_0.01_255)] hrppl-cream-bg py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-[oklch(0.45_0.02_255)]">
          Plays nicely with your existing stack
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 opacity-60 sm:grid-cols-4 lg:grid-cols-8">
          {items.map((i) => (
            <div key={i} className="text-center font-display text-lg font-semibold tracking-tight text-[oklch(0.55_0.16_255)]">
              {i}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-[oklch(0.55_0.16_255)] bg-[oklch(0.55_0.16_255)]/5 px-3 py-1 text-xs font-medium text-[oklch(0.55_0.16_255)]">
          Everything in one workspace
        </span>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Designed for global HR &amp; finance teams
        </h2>
        <p className="mt-4 text-lg text-[oklch(0.45_0.02_255)]">
          Stop stitching together five SaaS tools. hrppl ships HR, payroll, performance, time and billing as one tightly integrated platform.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-3">
        {/* Big tile */}
        <article className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-[oklch(0.92_0.01_255)] hrppl-emerald p-8 text-[oklch(0.98_0.01_255)] shadow-lg">
          <div className="absolute inset-0 hrppl-grid opacity-25" aria-hidden />
          <div className="relative">
            <Globe2 className="h-10 w-10 hrppl-gold" />
            <h3 className="mt-5 text-3xl font-bold">Multi-country payroll</h3>
            <p className="mt-3 max-w-md text-[oklch(0.85_0.01_255)]">
              Locale-aware payslips, tax codes, statutory contributions, overtime and holiday calendars across 40+ countries. Bank files in one click.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["🇬🇧", "🇺🇸", "🇮🇳", "🇦🇪", "🇸🇬", "🇦🇺", "🇪🇺", "🇨🇦"].map((f) => (
                <div key={f} className="rounded-lg bg-[oklch(0.95_0.01_255)]/12 px-3 py-2 text-center text-2xl backdrop-blur-sm">{f}</div>
              ))}
            </div>
          </div>
        </article>

        <BentoCard icon={Sparkles} title="Performance & 360°" body="Cycles, calibration, peer feedback and goals in one place." />
        <BentoCard icon={Clock} title="Time & attendance" body="Smart timesheets with locale overtime rules baked in." />
        <BentoCard icon={Users} title="HRIS & onboarding" body="Profiles, documents, e-sign and country-specific fields." />
        <BentoCard icon={ShieldCheck} title="Compliance-ready" body="SOC 2 controls, audit trails, RLS on every record." />
        <BentoCard icon={PlugZap} title="REST API + Webhooks" body="OpenAPI 3.1, OAuth 2.0, signed events for every change." featured />
      </div>
    </section>
  );
}

function BentoCard({
  icon: Icon,
  title,
  body,
  featured,
}: {
  icon: typeof Globe2;
  title: string;
  body: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
        featured
          ? "border-[oklch(0.78_0.10_220)] hrppl-cream-bg"
          : "border-[oklch(0.92_0.01_255)] bg-white"
      }`}
    >
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${featured ? "hrppl-gold-bg" : "bg-[oklch(0.55_0.16_255)]/10 text-[oklch(0.55_0.16_255)]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[oklch(0.45_0.02_255)]">{body}</p>
    </article>
  );
}

function Stats() {
  const stats = [
    { v: "40+", l: "Countries supported" },
    { v: "99.99%", l: "Payroll accuracy" },
    { v: "$1.8B+", l: "Processed yearly" },
    { v: "4.9/5", l: "Customer rating" },
  ];
  return (
    <section className="hrppl-cream-bg py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-4xl font-bold text-[oklch(0.55_0.16_255)] sm:text-5xl">{s.v}</div>
            <div className="mt-2 text-sm text-[oklch(0.45_0.02_255)]">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Practice() {
  const items = [
    { i: Building2, t: "Clients & projects", b: "Centralise every engagement with budgets and stages." },
    { i: Receipt, t: "Time → invoice", b: "Convert tracked hours into branded invoices with PDF preview." },
    { i: Workflow, t: "Jobs & tasks", b: "Recurring workflows for monthly payroll, year-end and audits." },
    { i: ShieldCheck, t: "White-label", b: "Your logo, colours and custom domain across every client login." },
  ];
  return (
    <section id="practice" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center rounded-full hrppl-gold-bg px-3 py-1 text-xs font-semibold">
            For practice firms
          </span>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            White-label practice management built in
          </h2>
          <p className="mt-4 text-lg text-[oklch(0.45_0.02_255)]">
            Accounting, payroll bureau and HR-outsourcing firms run the whole engagement from hrppl — clients, projects, jobs, time tracking and invoicing — under your brand.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Custom domain and brand tokens per tenant",
              "Multi-currency invoicing with manual FX rates",
              "Per-client RLS — staff only see what they should",
              "Built-in PDF preview before download",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.16_255)]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {items.map(({ i: Icon, t, b }) => (
            <div key={t} className="rounded-xl border border-[oklch(0.92_0.01_255)] bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-[oklch(0.55_0.16_255)]" />
              <h4 className="mt-3 font-semibold">{t}</h4>
              <p className="mt-1 text-sm text-[oklch(0.45_0.02_255)]">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const tt = [
    { q: "We replaced four tools with hrppl. Month-end is now a single Friday afternoon instead of a five-day scramble.", a: "Priya M.", r: "Head of Finance, fintech scale-up" },
    { q: "The API is the cleanest I've seen in HR tech. Webhooks are signed, documented and just work.", a: "James K.", r: "CTO, B2B SaaS" },
    { q: "White-labelling let us launch our payroll bureau in two weeks. Clients think it's our own product.", a: "Sara A.", r: "Partner, accounting practice" },
  ];
  return (
    <section className="hrppl-emerald py-24 text-[oklch(0.98_0.01_255)]">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-balance text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Loved by global teams
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tt.map((t) => (
            <figure key={t.a} className="rounded-2xl border border-[oklch(0.85_0.01_255)]/20 bg-[oklch(0.95_0.01_255)]/10 p-6 backdrop-blur-sm">
              <div className="flex hrppl-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-[oklch(0.96_0.01_255)]/90">"{t.q}"</blockquote>
              <figcaption className="mt-5 border-t border-[oklch(0.85_0.01_255)]/15 pt-4 text-sm">
                <div className="font-semibold">{t.a}</div>
                <div className="text-[oklch(0.72_0.01_255)]">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      n: "Starter",
      p: "$1",
      desc: "Per employee / month — 1 month free, billed monthly on net headcount.",
      f: [
        "1 month free, then $1 / net employee / month",
        "Unlimited employees",
        "Core HR, leave & onboarding",
        "Documents, e-sign & timesheets",
        "Payroll free in every country except Australia",
        "Community support",
      ],
    },
    {
      n: "Pro",
      p: "$3",
      desc: "Per net employee / month — 1 month free, billed on net headcount.",
      f: [
        "1 month free, then $3 / net employee / month",
        "Everything in Starter",
        "Performance & 360 reviews",
        "Recruitment & onboarding workflows",
        "Assets, expenses & advanced reports",
        "API, webhooks & integrations",
        "Priority support",
      ],
      featured: true,
    },
    {
      n: "AU Payroll add-on",
      p: "$2",
      desc: "Add fully compliant Australian payroll, STP & Super to Starter or Pro — $2 / employee / month.",
      f: [
        "STP Phase 2 lodgement",
        "SuperStream & Payday Super",
        "Award interpretation & minimum-wage audit",
        "Single Touch Payroll finalisation",
        "Dedicated AU payroll support",
      ],
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h2>
        <p className="mt-4 text-lg text-[oklch(0.45_0.02_255)]">
          Try Starter or Pro free for 1 month. After that, you’re billed monthly by direct debit on your <strong>net employee count</strong> — only employees who were active during the calendar month, net of joiners and leavers. Australian payroll is a $2 / employee / month add-on due to STP &amp; Super compliance.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((pl) => (
          <article key={pl.n} className={`rounded-2xl border p-8 ${pl.featured ? "hrppl-emerald text-[oklch(0.98_0.01_255)] shadow-2xl scale-105" : "border-[oklch(0.92_0.01_255)] bg-white"}`}>
            <h3 className={`text-xl font-semibold ${pl.featured ? "" : "text-[oklch(0.55_0.16_255)]"}`}>{pl.n}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold">{pl.p}</span>
              <span className={pl.featured ? "text-[oklch(0.78_0.01_255)]" : "text-[oklch(0.45_0.02_255)]"}>/emp/mo</span>
            </div>
            <p className={`mt-3 text-sm ${pl.featured ? "text-[oklch(0.85_0.01_255)]" : "text-[oklch(0.45_0.02_255)]"}`}>{pl.desc}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {pl.f.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${pl.featured ? "hrppl-gold" : "text-[oklch(0.55_0.16_255)]"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#contact" className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition ${pl.featured ? "hrppl-gold-bg hover:opacity-90" : "border border-[oklch(0.55_0.16_255)] text-[oklch(0.55_0.16_255)] hover:bg-[oklch(0.55_0.16_255)]/5"}`}>
              Get started <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}


function FAQ() {
  const qs = [
    { q: "Which countries does hrppl support?", a: "40+ countries with locale-aware payslips, statutory tax codes, overtime and holiday calendars. New countries onboard every quarter." },
    { q: "Do you offer an API?", a: "Yes — every UI action has a matching REST endpoint, with OAuth 2.0, signed webhooks, SCIM 2.0 and an OpenAPI 3.1 spec." },
    { q: "Can we white-label hrppl?", a: "Practice firms get their own logo, colours and custom domain across every client login, plus per-tenant governance." },
    { q: "How is data secured?", a: "Encryption at rest and in transit, row-level security on every record, full audit trails and SOC 2-aligned controls." },
    { q: "Can we migrate from another HRMS?", a: "Yes — bulk CSV imports, async jobs and dedicated migration support for Growth and Practice plans." },
  ];
  return (
    <section id="faq" className="hrppl-cream-bg py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked</h2>
        <div className="mt-12 space-y-3">
          {qs.map((item, i) => (
            <details key={i} className="group rounded-xl border border-[oklch(0.92_0.01_255)] bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-[oklch(0.55_0.16_255)] transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[oklch(0.45_0.02_255)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadSection() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 rounded-3xl hrppl-emerald p-8 text-[oklch(0.98_0.01_255)] shadow-2xl lg:grid-cols-2 lg:p-14">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center rounded-full hrppl-gold-bg px-3 py-1 text-xs font-semibold">
            Talk to sales
          </span>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            See hrppl in your country, in 30 minutes
          </h2>
          <p className="mt-4 text-lg text-[oklch(0.85_0.01_255)]">
            Tell us a bit about your team and we'll tailor a live demo around your countries, payroll calendar and integrations.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Live walk-through with a solutions engineer", "Pricing built around your headcount", "Migration plan from your current system"].map((t) => (
              <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 hrppl-gold" /> {t}</li>
            ))}
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}

function LeadForm() {
  const submit = useServerFn(submitLead);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const empRaw = String(fd.get("employee_count") ?? "").trim();

    const payload = {
      full_name: String(fd.get("full_name") ?? "").trim(),
      work_email: String(fd.get("work_email") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim() || null,
      role: String(fd.get("role") ?? "").trim() || null,
      company_size: String(fd.get("company_size") ?? "").trim() || null,
      employee_count: empRaw ? Number(empRaw) : null,
      current_payroll_system: String(fd.get("current_payroll_system") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim() || null,
      source: "landing_hero_form",
    };

    setLoading(true);
    try {
      await submit({ data: payload });
      setDone(true);
      form.reset();
      toast.success("Thanks — we'll be in touch within one business day.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[oklch(0.95_0.01_255)]/12 p-10 text-center backdrop-blur-md">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full hrppl-gold-bg">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-2xl font-bold">Thanks — message received</h3>
        <p className="mt-2 text-[oklch(0.85_0.01_255)]">A specialist will reach out within one business day.</p>
        <button onClick={() => setDone(false)} className="mt-6 text-sm font-medium hrppl-gold underline-offset-4 hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 text-[oklch(0.15_0.02_255)] shadow-2xl sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" name="full_name" required />
        <Field label="Work email" name="work_email" type="email" required />
        <Field label="Company" name="company" required />
        <Field label="Country" name="country" placeholder="e.g. United Kingdom" />
        <Field label="Your role" name="role" placeholder="Head of People" />
        <SelectField
          label="Company size"
          name="company_size"
          options={["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"]}
        />
        <Field label="# of employees" name="employee_count" type="number" min={0} />
        <Field label="Current payroll system" name="current_payroll_system" placeholder="Excel, ADP, Zoho..." />
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium" htmlFor="message">What are you trying to solve?</label>
        <textarea id="message" name="message" rows={3} maxLength={2000} className="mt-1 w-full rounded-md border border-[oklch(0.88_0.01_255)] bg-white px-3 py-2 text-sm focus:border-[oklch(0.55_0.16_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_255)]/20" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md hrppl-emerald px-4 py-3 text-base font-semibold text-[oklch(0.98_0.01_255)] shadow-lg transition hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Sending..." : <>Request demo <ArrowRight className="h-4 w-4" /></>}
      </button>
      <p className="mt-3 text-center text-xs text-[oklch(0.45_0.02_255)]">
        We respect your inbox. Your info is only used to follow up about hrppl.
      </p>
    </form>
  );
}

function Field({
  label, name, type = "text", required, placeholder, min,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; min?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}{required && <span className="hrppl-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        maxLength={255}
        className="mt-1 w-full rounded-md border border-[oklch(0.88_0.01_255)] bg-white px-3 py-2 text-sm focus:border-[oklch(0.55_0.16_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_255)]/20"
      />
    </div>
  );
}

function SelectField({
  label, name, options,
}: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="mt-1 w-full rounded-md border border-[oklch(0.88_0.01_255)] bg-white px-3 py-2 text-sm focus:border-[oklch(0.55_0.16_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_255)]/20"
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[oklch(0.92_0.01_255)] bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md hrppl-emerald text-[oklch(0.98_0.01_255)]">
              <span className="font-display text-sm font-bold">h</span>
            </span>
            <span className="text-lg font-semibold">hrppl</span>
          </div>
          <p className="mt-3 text-sm text-[oklch(0.45_0.02_255)]">
            Global HRMS, payroll &amp; practice management — one platform.
          </p>
        </div>
        <FooterCol title="Product" items={[
          { l: "Features", h: "#features" },
          { l: "Practice", h: "#practice" },
          { l: "Pricing", h: "#pricing" },
        ]} />
        <FooterCol title="Developers" items={[
          { l: "API reference", h: "/developers" },
          { l: "OpenAPI spec", h: "/api/v1/openapi.json" },
          { l: "Status", h: "/api/v1/health" },
        ]} />
        <FooterCol title="Company" items={[
          { l: "Contact sales", h: "#contact" },
          { l: "Sign in", h: "/auth" },
        ]} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-[oklch(0.92_0.01_255)] px-6 pt-6 text-center text-xs text-[oklch(0.45_0.02_255)]">
        © {new Date().getFullYear()} hrppl. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { l: string; h: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.l}>
            <a href={i.h} className="text-[oklch(0.45_0.02_255)] transition hover:text-[oklch(0.55_0.16_255)]">{i.l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
