import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Globe2 } from "lucide-react";

const TITLE = "Contact hrppl — Sales & Support";
const DESCRIPTION =
  "Get in touch with the hrppl team. Talk to sales about global payroll, ask product questions, or reach support.";
const URL = "https://hrppl.io/contact";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl">Contact us</h1>
        <p className="mt-3 text-muted-foreground">We typically reply within one business day.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <a href="mailto:sales@hrppl.io" className="rounded-xl border bg-card p-5 hover:border-primary transition">
            <Mail className="h-5 w-5 text-primary" />
            <div className="mt-3 font-medium">Sales</div>
            <div className="text-sm text-muted-foreground">sales@hrppl.io</div>
          </a>
          <a href="mailto:support@hrppl.io" className="rounded-xl border bg-card p-5 hover:border-primary transition">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div className="mt-3 font-medium">Support</div>
            <div className="text-sm text-muted-foreground">support@hrppl.io</div>
          </a>
          <a href="mailto:partners@hrppl.io" className="rounded-xl border bg-card p-5 hover:border-primary transition">
            <Globe2 className="h-5 w-5 text-primary" />
            <div className="mt-3 font-medium">Partners</div>
            <div className="text-sm text-muted-foreground">partners@hrppl.io</div>
          </a>
        </div>
      </section>
    </main>
  );
}
