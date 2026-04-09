import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= 10;
}

function enhancePrompt(simple: string, size?: string): string {
  const base = simple.trim().toLowerCase();
  const sizeHint = size ? `, ${size} aspect ratio` : "";
  if (base.length > 50) {
    return `${simple}${sizeHint}. YouTube thumbnail style, ultra high quality, 4K, vibrant colors, high contrast, sharp focus, professional composition, click-worthy`;
  }
  return `Highly detailed cinematic YouTube thumbnail of ${simple}${sizeHint}, dramatic lighting, vibrant saturated colors, high contrast, ultra realistic, 4K quality, expressive and engaging, sharp focus, professional composition, viral YouTube style, click-worthy thumbnail design`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, referenceImage, size } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Please provide a prompt." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Prompt too long (max 2000 chars)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

    const enhancedPrompt = enhancePrompt(prompt, size);
    console.log("Enhanced prompt:", enhancedPrompt);

    // Build prompt text
    let finalPrompt = enhancedPrompt;
    if (referenceImage && typeof referenceImage === "string") {
      finalPrompt = `Using the provided reference image as inspiration, create a new thumbnail: ${enhancedPrompt}`;
    }

    // Build request parts
    const parts: any[] = [{ text: finalPrompt }];

    if (referenceImage && typeof referenceImage === "string") {
      // Extract base64 data and mime type from data URL
      const match = referenceImage.match(/^data:(.+?);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    // Use a currently supported Gemini image-generation model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      if (response.status === 404) throw new Error("Image model not found or unavailable. The model endpoint was updated.");
      if (response.status === 410) throw new Error("Image model deprecated. Please try again in a moment.");
      if (response.status === 429) throw new Error("Rate limited by Gemini. Please try again later.");
      if (response.status === 403) throw new Error("Invalid Gemini API key. Please update your key.");
      throw new Error(`Generation failed (${response.status})`);
    }

    const data = await response.json();
    console.log("Gemini response structure:", JSON.stringify(data).substring(0, 500));

    let imageUrl: string | null = null;
    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content?.parts) {
        for (const part of content.parts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image was generated. Try a different prompt.");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-thumbnail-generate error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("Rate limited") ? 429 : message.includes("Invalid") ? 403 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
