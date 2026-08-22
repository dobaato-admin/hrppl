// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import type { Plugin } from "vite";

// Deploy target. The wrapper's zero-config default is `cloudflare-module`; we deploy to
// Vercel, so the preset is set explicitly here rather than left to `defaultPreset`.
// `vercel` emits Build Output API v3 into `.vercel/output`, which Vercel consumes
// directly — so vercel.json deliberately does NOT set outputDirectory.
// Override with NITRO_PRESET to build for somewhere else without editing this file.
const nitroPreset = process.env.NITRO_PRESET ?? "vercel";
const isCloudflarePreset = nitroPreset.startsWith("cloudflare");

/**
 * `@lovable.dev/mcp-js` dynamically imports `cloudflare:workers` to read secrets off the
 * Workers `env` binding. That specifier only exists inside the Workers runtime, so Rollup
 * fails to resolve it for any other preset and the whole build dies.
 *
 * The import is a pure fallback — `TanStackMetricRecorder.readEnv` tries `process.env`
 * first and only reaches for `cloudflare:workers` if that misses — and it is wrapped in
 * both try/catch and `.catch()`. On Vercel `process.env` always answers, so resolving the
 * specifier to an empty stub changes no behaviour; it just gives Rollup something real to
 * bundle. Skipped entirely for Cloudflare presets, where the genuine module must win.
 */
function cloudflareWorkersStub(): Plugin {
  const virtualId = "\0cloudflare-workers-stub";
  return {
    name: "cloudflare-workers-stub",
    enforce: "pre",
    resolveId(id) {
      return id === "cloudflare:workers" ? virtualId : null;
    },
    load(id) {
      if (id !== virtualId) return null;
      return "export const env = undefined;\nexport default { env: undefined };\n";
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: { preset: nitroPreset },
  vite: {
    plugins: [mcpPlugin(), ...(isCloudflarePreset ? [] : [cloudflareWorkersStub()])],
  },
});
