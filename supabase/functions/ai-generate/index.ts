import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter: max 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

async function callAI(messages: { role: string; content: string }[], jsonMode = false) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const body: any = {
    model: "google/gemini-2.5-flash",
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("AI gateway error:", response.status, err);
    if (response.status === 429) throw new Error("Rate limited. Please try again later.");
    if (response.status === 402) throw new Error("Credits exhausted. Please add funds.");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input
    const body = await req.json();
    const { action, prompt, title } = body;

    if (!action || typeof action !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate prompt/title length to prevent abuse
    if (prompt && typeof prompt === "string" && prompt.length > 5000) {
      return new Response(JSON.stringify({ error: "Input too long (max 5000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (title && typeof title === "string" && title.length > 500) {
      return new Response(JSON.stringify({ error: "Title too long (max 500 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "thumbnail-suggestions") {
      const text = await callAI([
        { role: "system", content: "You are a professional YouTube thumbnail designer. Given a video title, suggest 4 creative thumbnail concepts. Return a JSON object with a \"suggestions\" array, each with: title (short concept name), colors (array of 2 hex colors), textOverlay (main text), fontSize (48-80)." },
        { role: "user", content: `Video title: "${title}"` },
      ], true);

      let suggestions;
      try {
        const parsed = JSON.parse(text);
        suggestions = parsed.suggestions || parsed;
      } catch {
        suggestions = [];
      }

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "enhance-text") {
      const text = await callAI([
        { role: "system", content: "Rewrite the given text to be more engaging and professional for a YouTube thumbnail. Keep it SHORT (max 6 words). Return only the improved text, nothing else." },
        { role: "user", content: prompt },
      ]);

      return new Response(JSON.stringify({ text: text.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate-thumbnail-image") {
      const text = await callAI([
        { role: "system", content: "You are a creative YouTube thumbnail designer. Given a description, generate a compelling thumbnail concept. Return a short, punchy title text (max 5 words) that would work as overlay text on the thumbnail. Return only the text, nothing else." },
        { role: "user", content: `Create thumbnail text for: "${prompt}"` },
      ]);

      return new Response(JSON.stringify({ imageDescription: text.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "extract-subtitles") {
      const text = await callAI([
        { role: "system", content: "You are a professional subtitle generator. Based on the video information provided, generate realistic SRT format subtitles. Include timestamps and natural dialogue/narration. Generate 10-20 subtitle entries covering the video duration. Use proper SRT format with sequential numbering, timestamps (HH:MM:SS,mmm --> HH:MM:SS,mmm), and text." },
        { role: "user", content: prompt },
      ]);

      return new Response(JSON.stringify({ subtitles: text.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "blog-generate") {
      const content = await callAI([
        { role: "system", content: "Write a professional, SEO-optimized blog article. Include proper headings, paragraphs, and make it 500-800 words. Focus on practical tips and value. Return as HTML with h2, h3, p, ul, li tags only." },
        { role: "user", content: `Write about: "${prompt}"` },
      ]);

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("Rate limited") ? 429 : message.includes("Credits") ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
