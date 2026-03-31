/**
 * Health check Edge Function
 *
 * GET /functions/v1/health        → Liveness (is the function alive?)
 * GET /functions/v1/health/ready  → Readiness (can it talk to Supabase DB?)
 *
 * Used by:
 *  - Load balancers / uptime monitors (liveness)
 *  - Deployment pipelines (readiness before routing traffic)
 *  - GitHub Actions CI smoke tests
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Health endpoints are public by design
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const isReady = url.pathname.endsWith("/ready");

  // ── Liveness: Is the function process alive? ──────────────────────────────
  if (!isReady) {
    return json({
      status: "ok",
      uptime: performance.now() / 1000,
      timestamp: new Date().toISOString(),
      service: "wearables-atelier-api",
    });
  }

  // ── Readiness: Can we reach the database? ─────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return json(
      {
        status: "not ready",
        timestamp: new Date().toISOString(),
        checks: { database: "unconfigured" },
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set",
      },
      503
    );
  }

  const checks: Record<string, "ok" | "down" | string> = {};

  // Database ping
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.from("site_settings").select("id").limit(1);
    checks.database = error ? `down: ${error.message}` : "ok";
  } catch (err) {
    checks.database = `down: ${err instanceof Error ? err.message : String(err)}`;
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return json(
    {
      status: allOk ? "ready" : "not ready",
      timestamp: new Date().toISOString(),
      checks,
    },
    allOk ? 200 : 503
  );
});
