import { createFileRoute } from "@tanstack/react-router";

// Whitelist of files we serve as forced-attachment downloads.
// Files live in public/_dl so the static handler doesn't shadow this route.
const ALLOWED: Record<string, string> = {
  "HRPPL-Admin-Setup-Playbook.docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "HRPPL-Go-Live-Checklist.docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "HRPPL-Go-Live-Checklist.pdf": "application/pdf",
};

export const Route = createFileRoute("/downloads/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const filename = (params._splat ?? "").split("/").pop() ?? "";
        const contentType = ALLOWED[filename];
        if (!contentType) {
          return new Response("Not found", { status: 404 });
        }

        // Fetch the bundled static asset from the same origin.
        const assetUrl = new URL(`/_dl/${filename}`, request.url);
        const upstream = await fetch(assetUrl.toString());
        if (!upstream.ok) {
          return new Response("Not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set("content-type", contentType);
        headers.set(
          "content-disposition",
          `attachment; filename="${filename}"`,
        );
        headers.set("cache-control", "public, max-age=3600");
        headers.set("x-content-type-options", "nosniff");
        const len = upstream.headers.get("content-length");
        if (len) headers.set("content-length", len);

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
