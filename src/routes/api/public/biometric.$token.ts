import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ingestPunches } from "@/lib/biometric.functions";

const PunchSchema = z.object({
  raw_user_id: z.string().min(1).max(80),
  punch_at: z.string(),
  punch_type: z.enum(["in","out","break_in","break_out","unknown"]).default("unknown"),
  raw: z.record(z.string(), z.any()).default({}),
});
const BodySchema = z.object({
  punches: z.array(PunchSchema).min(1).max(2000),
});

export const Route = createFileRoute("/api/public/biometric/$token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Device-Secret",
      } }),
      POST: async ({ request, params }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: device } = await supabaseAdmin.from("biometric_devices")
          .select("id,shared_secret,is_active").eq("webhook_token", (params as any).token).maybeSingle();
        if (!device || !device.is_active) return new Response("Not found", { status: 404 });

        const secret = request.headers.get("x-device-secret") ?? "";
        if (secret.length !== device.shared_secret.length) return new Response("Unauthorized", { status: 401 });
        let ok = 0;
        for (let i = 0; i < secret.length; i++) ok |= secret.charCodeAt(i) ^ device.shared_secret.charCodeAt(i);
        if (ok !== 0) return new Response("Unauthorized", { status: 401 });

        let body: unknown;
        try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });

        try {
          const result = await ingestPunches(device.id, "webhook", parsed.data.punches);
          return Response.json(result, { headers: { "Access-Control-Allow-Origin": "*" } });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});
