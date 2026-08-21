/**
 * Security response headers (Finalization Plan §5 "General Hardening").
 *
 * The repository previously set none of these — no CSP, HSTS or X-Frame-Options
 * anywhere. Applied centrally in src/server.ts so every SSR, API and asset
 * response carries them.
 *
 * Pure and dependency-free so it can be unit tested without booting a server.
 */

/** Origins the app genuinely loads from. Anything absent here is blocked. */
const ALLOW = {
  // Google Fonts stylesheet (__root.tsx) + Swagger UI css (admin.api-docs).
  style: ["https://fonts.googleapis.com", "https://unpkg.com"],
  font: ["https://fonts.gstatic.com"],
  // Google Maps JS (GoogleMapPicker) + Swagger UI bundle (admin.api-docs).
  script: ["https://maps.googleapis.com", "https://unpkg.com"],
  // Maps tiles/geocoding + the AU public-holiday feed.
  connect: ["https://maps.googleapis.com", "https://data.gov.au"],
  frame: ["https://www.youtube.com"],
};

export type CspOptions = {
  /** Supabase project URL — needed in connect-src for REST/auth/realtime. */
  supabaseUrl?: string | null;
  /** Vite dev server needs websockets + eval for HMR. */
  dev?: boolean;
};

/**
 * Build the CSP value.
 *
 * `'unsafe-inline'` remains on script-src: TanStack Start emits inline
 * hydration scripts and __root.tsx emits inline JSON-LD, so a nonce-based
 * policy is a separate refactor. The directives that block the highest-value
 * attacks — frame-ancestors, object-src, base-uri, form-action, and the
 * origin allowlists — are enforced now rather than waiting for it.
 */
export function buildCsp(options: CspOptions = {}): string {
  const { supabaseUrl, dev = false } = options;

  const connect = ["'self'", ...ALLOW.connect];
  if (supabaseUrl) {
    connect.push(supabaseUrl);
    // Realtime uses the same host over websockets.
    connect.push(supabaseUrl.replace(/^https:/, "wss:"));
  }
  if (dev) connect.push("ws:", "wss:");

  const script = ["'self'", "'unsafe-inline'", ...ALLOW.script];
  if (dev) script.push("'unsafe-eval'");

  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    ["script-src", script],
    // Tailwind and Radix both set inline styles at runtime.
    ["style-src", ["'self'", "'unsafe-inline'", ...ALLOW.style]],
    ["font-src", ["'self'", "data:", ...ALLOW.font]],
    // User avatars, tenant white-label logos and map tiles are arbitrary https.
    ["img-src", ["'self'", "data:", "blob:", "https:"]],
    ["connect-src", connect],
    ["frame-src", ["'self'", ...ALLOW.frame]],
    ["worker-src", ["'self'", "blob:"]],
    ["media-src", ["'self'", "data:", "blob:"]],
    // Clickjacking: the modern equivalent of X-Frame-Options.
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
  ];

  const value = directives.map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
  // Only meaningful over https; harmless in dev where the browser ignores it.
  return dev ? value : `${value}; upgrade-insecure-requests`;
}

export type SecurityHeaderOptions = CspOptions & {
  /** Emit CSP as report-only, for staged rollout. */
  reportOnly?: boolean;
  /** Skip HSTS for plain-http requests (dev, health checks). */
  https?: boolean;
};

/** The full header set as a plain object. */
export function buildSecurityHeaders(options: SecurityHeaderOptions = {}): Record<string, string> {
  const { reportOnly = false, https = true, ...cspOptions } = options;

  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    // Legacy companion to frame-ancestors, for browsers that predate CSP3.
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Deny hardware the app never uses. Geolocation IS used (geofenced
    // clock-in), so it stays self-permitted.
    "Permissions-Policy": [
      "geolocation=(self)",
      "camera=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "interest-cohort=()",
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Permitted-Cross-Domain-Policies": "none",
  };

  if (https) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  const header = reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
  headers[header] = buildCsp(cspOptions);

  return headers;
}

/**
 * Apply the headers to a Response without clobbering anything the handler
 * already set deliberately (e.g. a route that needs its own CSP).
 *
 * Returns a new Response; the original body is reused, not buffered.
 */
export function withSecurityHeaders(
  response: Response,
  options: SecurityHeaderOptions = {},
): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(buildSecurityHeaders(options))) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
