import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthRouteGate } from "@/components/AuthRouteGate";
import { RouteLoadingBar } from "@/components/RouteLoadingBar";
import { perfBus } from "@/lib/perf-bus";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "hrppl — Global HRMS & Payroll Platform" },
      { name: "description", content: "hrppl is the modern global HRMS, payroll and practice management platform. Multi-country payroll, compliant payslips, performance reviews and a full developer API for finance and HR teams worldwide." },
      { name: "keywords", content: "global payroll, HRMS, HRIS, multi-country payroll, payroll software, HR platform, practice management, payroll API, international HR" },
      { name: "author", content: "hrppl" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { property: "og:description", content: "Run multi-country payroll, HR and compliance from one platform. Built for global finance and HR teams." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "hrppl" },
      { property: "og:url", content: "https://hrppl.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "hrppl — Global HRMS & Payroll Platform" },
      { name: "twitter:description", content: "Run multi-country payroll, HR and compliance from one platform." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "hrppl",
          url: "https://hrppl.io",
          logo: "https://hrppl.io/favicon.ico",
          description: "Global HRMS, payroll and practice management platform.",
          sameAs: ["https://hrppl.io"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "hrppl",
          url: "https://hrppl.io",
          inLanguage: "en",
          publisher: { "@type": "Organization", name: "hrppl", url: "https://hrppl.io" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://hrppl.io/blog?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let start = performance.now();
    let path = typeof window !== "undefined" ? window.location.pathname : "/";
    const unsubBefore = router.subscribe("onBeforeNavigate", (e: any) => {
      start = performance.now();
      path = e?.toLocation?.pathname ?? path;
    });
    const unsubResolved = router.subscribe("onResolved", () => {
      perfBus.recordNav({
        id: path,
        path,
        ms: Math.round(performance.now() - start),
        at: Date.now(),
      });
    });
    return () => {
      unsubBefore?.();
      unsubResolved?.();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoadingBar />
      {/* Global gate enforces tenant/setup routing across every page. */}
      <AuthRouteGate>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AuthRouteGate>
      <Toaster />
    </QueryClientProvider>
  );
}
