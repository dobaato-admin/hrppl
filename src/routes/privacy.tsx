import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Privacy Policy — hrppl";
const DESCRIPTION =
  "How hrppl collects, uses and protects personal data across our global HRMS, payroll and practice management platform.";
const URL = "https://hrppl.io/privacy";

export const Route = createFileRoute("/privacy")({
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
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-slate dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 2026</p>
        <p>
          This policy explains what data hrppl collects, why we collect it, and the rights you have over your data.
        </p>
        <h2>Data we collect</h2>
        <p>Account info you provide (name, email, organization), employee records you upload, and usage telemetry needed to operate the service.</p>
        <h2>How we use it</h2>
        <p>To deliver payroll, HR and practice-management features, comply with legal obligations, and improve the product.</p>
        <h2>Sharing</h2>
        <p>We don't sell personal data. We share only with sub-processors required to operate the service.</p>
        <h2>Your rights</h2>
        <p>You can request access, correction or deletion of your personal data by contacting privacy@hrppl.io.</p>
        <h2>Security</h2>
        <p>Data is encrypted in transit and at rest. Access is least-privilege and audited.</p>
      </article>
    </main>
  );
}
