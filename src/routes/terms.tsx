import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Terms of Service — hrppl";
const DESCRIPTION =
  "The terms that govern your use of hrppl's global HRMS, payroll and practice management platform.";
const URL = "https://hrppl.io/terms";

export const Route = createFileRoute("/terms")({
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
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-slate dark:prose-invert">
        <h1>Terms of Service</h1>
        <p>Last updated: June 2026</p>
        <p>
          These Terms of Service govern your access to and use of the hrppl platform.
          By using hrppl you agree to these terms.
        </p>
        <h2>1. Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
        <h2>2. Acceptable use</h2>
        <p>You agree not to misuse the service, attempt to access it using methods other than the interfaces we provide, or use it to violate any applicable law.</p>
        <h2>3. Subscription &amp; billing</h2>
        <p>Paid plans renew automatically. You may cancel at any time from your billing settings.</p>
        <h2>4. Data &amp; privacy</h2>
        <p>Our handling of personal data is described in our Privacy Policy.</p>
        <h2>5. Termination</h2>
        <p>We may suspend or terminate accounts that violate these terms.</p>
        <h2>6. Contact</h2>
        <p>Questions about these terms? Email legal@hrppl.io.</p>
      </article>
    </main>
  );
}
