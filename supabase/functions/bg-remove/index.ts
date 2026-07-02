import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter (best-effort; per-instance). Uses trusted Cloudflare-provided IP only.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const BG_RATE_LIMIT = 5;
const BG_RATE_WINDOW_MS = 60_000;
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const e = rateLimitMap.get(ip);
  if (!e || now > e.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + BG_RATE_WINDOW_MS }); return true; }
  e.count++;
  return e.count <= BG_RATE_LIMIT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const clientIP = req.headers.get("cf-connecting-ip") || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const REMOVEBG_API_KEY = Deno.env.get("REMOVEBG_API_KEY");
    if (!REMOVEBG_API_KEY) throw new Error("REMOVEBG_API_KEY is not configured");

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    if (!imageFile) throw new Error("No image file provided");

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(JSON.stringify({ error: "Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file size (max 10 MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image too large (max 10 MB)" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const removeBgForm = new FormData();
    removeBgForm.append("image_file", imageFile);
    removeBgForm.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": REMOVEBG_API_KEY },
      body: removeBgForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("remove.bg error:", response.status, errorText);
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Remove.bg API credits exhausted. Please add credits to your remove.bg account." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Background removal failed: ${errorText}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultBuffer = await response.arrayBuffer();
    return new Response(resultBuffer, {
      headers: { ...corsHeaders, "Content-Type": "image/png" },
    });
  } catch (e) {
    console.error("bg-remove error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
