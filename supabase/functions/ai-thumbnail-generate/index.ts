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
  const base = simple.trim().toLowerCase();
  const sizeHint = size ? `, ${size} aspect ratio` : "";
  if (base.length > 50) {
    return `${simple}${sizeHint}. YouTube thumbnail style, ultra high quality, 4K, vibrant colors, high contrast, sharp focus, professional composition, click-worthy`;
  }
  return `Highly detailed cinematic YouTube thumbnail of ${simple}${sizeHint}, dramatic lighting, vibrant saturated colors, high contrast, ultra realistic, 4K quality, expressive and engaging, sharp focus, professional composition, viral YouTube style, click-worthy thumbnail design`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRetryDelayMs(errorText: string): number | null {
  const retryInfoMatch = errorText.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryInfoMatch) return Number(retryInfoMatch[1]) * 1000;

  const messageMatch = errorText.match(/Please retry in\s+([\d.]+)s/i);
  if (messageMatch) return Math.ceil(Number(messageMatch[1]) * 1000);

  return null;
}

function isHardQuotaFailure(errorText: string): boolean {
  return /GenerateRequestsPerDay|limit:\s*0|quota exceeded/i.test(errorText);
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
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

  const remainingWords = words.slice(lines.join(" ").split(/\s+/).filter(Boolean).length);
  if (currentLine) lines.push(currentLine);

  if (remainingWords.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${remainingWords.join(" ")}`.slice(0, maxChars + 10);
  }

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

async function generateWithGemini(parts: any[], apiKey: string): Promise<{ imageUrl?: string; fallbackMessage?: string }> {
  const requestBody = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  for (let attempt = 0; attempt <= providerRetryLimit; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Gemini response structure:", JSON.stringify(data).substring(0, 500));

      const candidates = data.candidates;
      if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content?.parts) {
          for (const part of content.parts) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || "image/png";
              return { imageUrl: `data:${mimeType};base64,${part.inlineData.data}` };
            }
          }
        }
      }

      return { fallbackMessage: "No image was generated by the AI provider, so a fallback thumbnail was created instead." };
    }

    const errText = await response.text();
    console.error("Gemini API error:", response.status, errText);

    if (response.status === 429) {
      const hardQuotaFailure = isHardQuotaFailure(errText);
      if (!hardQuotaFailure && attempt < providerRetryLimit) {
        const retryDelay = Math.min(extractRetryDelayMs(errText) ?? 1_500 * (attempt + 1), maxRetryDelayMs);
        await sleep(retryDelay);
        continue;
      }

      return {
        fallbackMessage: hardQuotaFailure
          ? "Gemini image quota is exhausted for the configured API key, so a fallback thumbnail was generated instead."
          : "Gemini is temporarily rate limited, so a fallback thumbnail was generated instead.",
      };
    }

    if (response.status === 404) throw new Error("Image model not found or unavailable. The model endpoint was updated.");
    if (response.status === 410) throw new Error("Image model deprecated. Please try again in a moment.");
    if (response.status === 403) throw new Error("Invalid Gemini API key. Please update your key.");
    throw new Error(`Generation failed (${response.status})`);
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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      const imageUrl = createFallbackThumbnail(prompt, size);
      return new Response(JSON.stringify({ imageUrl, fallback: true, message: "Gemini API key is not configured, so a fallback thumbnail was generated instead." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await generateWithGemini(parts, GEMINI_API_KEY);
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
    const status = message.includes("Rate limited") ? 429 : message.includes("Invalid") ? 403 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
