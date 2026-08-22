let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
const ALLOW = {
  // Google Fonts stylesheet (__root.tsx) + Swagger UI css (admin.api-docs).
  style: ["https://fonts.googleapis.com", "https://unpkg.com"],
  font: ["https://fonts.gstatic.com"],
  // Google Maps JS (GoogleMapPicker) + Swagger UI bundle (admin.api-docs).
  script: ["https://maps.googleapis.com", "https://unpkg.com"],
  // Maps tiles/geocoding + the AU public-holiday feed.
  connect: ["https://maps.googleapis.com", "https://data.gov.au"],
  frame: ["https://www.youtube.com"]
};
function buildCsp(options = {}) {
  const { supabaseUrl, dev = false } = options;
  const connect = ["'self'", ...ALLOW.connect];
  if (supabaseUrl) {
    connect.push(supabaseUrl);
    connect.push(supabaseUrl.replace(/^https:/, "wss:"));
  }
  if (dev) connect.push("ws:", "wss:");
  const script = ["'self'", "'unsafe-inline'", ...ALLOW.script];
  if (dev) script.push("'unsafe-eval'");
  const directives = [
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
    ["form-action", ["'self'"]]
  ];
  const value = directives.map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
  return dev ? value : `${value}; upgrade-insecure-requests`;
}
function buildSecurityHeaders(options = {}) {
  const { reportOnly = false, https = true, ...cspOptions } = options;
  const headers = {
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
      "interest-cohort=()"
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Permitted-Cross-Domain-Policies": "none"
  };
  if (https) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
  const header = reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
  headers[header] = buildCsp(cspOptions);
  return headers;
}
function withSecurityHeaders(response, options = {}) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(buildSecurityHeaders(options))) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./server-BOi2EjMN.mjs").then((n) => n.s).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
function securityOptionsFor(request) {
  const isHttps = new URL(request.url).protocol === "https:";
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? null,
    dev: false,
    https: isHttps,
    // Escape hatch for staged rollout: set CSP_REPORT_ONLY=1 to observe
    // violations without breaking anything, then unset it to enforce.
    reportOnly: process.env.CSP_REPORT_ONLY === "1"
  };
}
const server = {
  async fetch(request, env, ctx) {
    const security = securityOptionsFor(request);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withSecurityHeaders(normalized, security);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" }
        }),
        security
      );
    }
  }
};
export {
  server as default,
  renderErrorPage as r
};
