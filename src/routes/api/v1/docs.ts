import { createFileRoute } from "@tanstack/react-router";

// Public Swagger UI is disabled. Super admins access the API reference at
// /admin/api-docs, which authenticates the OpenAPI spec request with their
// Supabase bearer token.
export const Route = createFileRoute("/api/v1/docs")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Not Found", {
          status: 404,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
