import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const providerRetryLimit = 1;
const maxRetryDelayMs = 6_000;

const sizeDimensions: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "4:3": { width: 1280, height: 960 },
  "21:9": { width: 1680, height: 720 },
};

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
  const sizeHint = size ? `, ${size} aspect ratio` : "";
  return `You are a professional YouTube thumbnail designer AI.

Task: Generate a high CTR, viral-quality YouTube thumbnail.

Topic: ${simple}${sizeHint}

Rules:
- Match reference image style, lighting, and composition if a reference is provided
- Keep subject centered and expressive
- Use bold, readable text (max 3-5 words)
- High contrast colors for clickability
- 4K ultra sharp quality
- Emotional facial expressions (surprise, shock, excitement)
- Clickbait but professional look
- No blur, no low quality, no watermark

Output: One final thumbnail image, cinematic, dramatic lighting, vibrant saturated colors, ultra realistic`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });
}

function wrapTitleLines(text: string, maxChars = 18, maxLines = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return ["SMART THUMBNAIL"];
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    } else {
      currentLine = nextLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, maxLines).map((line) => line.toUpperCase());
}

function createFallbackThumbnail(prompt: string, size?: string): string {
  const { width, height } = sizeDimensions[size || "16:9"] || sizeDimensions["16:9"];
  const titleLines = wrapTitleLines(prompt);
  const titleSize = Math.max(52, Math.round(height * 0.1));
  const subtitleSize = Math.max(20, Math.round(height * 0.04));
  const badgeSize = Math.max(18, Math.round(height * 0.03));
  const startY = Math.round(height * 0.38);
  const lineGap = Math.round(titleSize * 1.05);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1d4ed8" />
          <stop offset="100%" stop-color="#22c55e" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.04)" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="rgba(15,23,42,0.45)" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="${Math.round(width * 0.82)}" cy="${Math.round(height * 0.18)}" r="${Math.round(height * 0.18)}" fill="rgba(255,255,255,0.12)" />
      <circle cx="${Math.round(width * 0.12)}" cy="${Math.round(height * 0.88)}" r="${Math.round(height * 0.24)}" fill="rgba(255,255,255,0.08)" />
      <rect x="${Math.round(width * 0.05)}" y="${Math.round(height * 0.08)}" rx="${Math.round(height * 0.03)}" ry="${Math.round(height * 0.03)}" width="${Math.round(width * 0.9)}" height="${Math.round(height * 0.84)}" fill="url(#panel)" stroke="rgba(255,255,255,0.18)" filter="url(#shadow)" />
      <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.16)}" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${badgeSize}" font-weight="700" letter-spacing="2">AI PREVIEW</text>
      ${titleLines.map((line, index) => `<text x="${Math.round(width * 0.08)}" y="${startY + index * lineGap}" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900">${escapeXml(line)}</text>`).join("")}
      <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.82)}" fill="rgba(255,255,255,0.92)" font-family="Arial, Helvetica, sans-serif" font-size="${subtitleSize}" font-weight="600">Generated fallback thumbnail while AI provider is busy</text>
      <text x="${Math.round(width * 0.92)}" y="${Math.round(height * 0.92)}" text-anchor="end" fill="rgba(255,255,255,0.42)" font-family="Arial, Helvetica, sans-serif" font-size="${badgeSize}" font-weight="700">MU Tech</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function generateWithLovableAI(
  userContent: any[],
  apiKey: string,
): Promise<{ imageUrl?: string; fallbackMessage?: string; status?: number }> {
  const requestBody = JSON.stringify({
    model: "google/gemini-3.1-flash-image-preview",
    messages: [{ role: "user", content: userContent }],
    modalities: ["image", "text"],
  });

  for (let attempt = 0; attempt <= providerRetryLimit; attempt++) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Lovable AI response keys:", Object.keys(data));
      const message = data.choices?.[0]?.message;
      const images = message?.images;
      if (Array.isArray(images) && images.length > 0) {
        const url = images[0]?.image_url?.url;
        if (typeof url === "string" && url.startsWith("data:")) {
          return { imageUrl: url };
        }
      }
      return { fallbackMessage: "No image was generated by the AI provider, so a fallback thumbnail was created instead." };
    }

    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);

    if (response.status === 429) {
      if (attempt < providerRetryLimit) {
        await sleep(Math.min(1_500 * (attempt + 1), maxRetryDelayMs));
        continue;
      }
      return { status: 429, fallbackMessage: "AI provider is rate limited right now. A fallback thumbnail was generated instead." };
    }

    if (response.status === 402) {
      return { status: 402, fallbackMessage: "Lovable AI workspace credits are exhausted. Please add credits in Settings → Workspace → Usage. A fallback thumbnail was generated." };
    }

    return { fallbackMessage: `AI generation failed (${response.status}), so a fallback thumbnail was generated instead.` };
  }

  return { fallbackMessage: "AI generation is temporarily unavailable, so a fallback thumbnail was generated instead." };
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

    const { prompt, referenceImage, referenceImages, size } = await req.json();
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

    // Normalize references — accept array or single
    const refs: string[] = Array.isArray(referenceImages)
      ? referenceImages.filter((r: unknown) => typeof r === "string" && (r as string).startsWith("data:"))
      : (referenceImage && typeof referenceImage === "string" && referenceImage.startsWith("data:") ? [referenceImage] : []);

    const enhancedPrompt = enhancePrompt(prompt, size);
    console.log("Enhanced prompt:", enhancedPrompt, "refs:", refs.length);

    const finalPrompt = refs.length
      ? `Using the ${refs.length} provided reference image(s) as visual inspiration (style, lighting, composition, subject), create a brand new thumbnail: ${enhancedPrompt}`
      : enhancedPrompt;

    // Build OpenAI-compatible multimodal content
    const userContent: any[] = [{ type: "text", text: finalPrompt }];
    for (const ref of refs) {
      userContent.push({ type: "image_url", image_url: { url: ref } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      const imageUrl = createFallbackThumbnail(prompt, size);
      return new Response(JSON.stringify({ imageUrl, fallback: true, message: "AI gateway is not configured, so a fallback thumbnail was generated instead." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await generateWithLovableAI(userContent, LOVABLE_API_KEY);
    if (!result.imageUrl) {
      const imageUrl = createFallbackThumbnail(prompt, size);
      return new Response(JSON.stringify({ imageUrl, fallback: true, message: result.fallbackMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl: result.imageUrl, fallback: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-thumbnail-generate error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
