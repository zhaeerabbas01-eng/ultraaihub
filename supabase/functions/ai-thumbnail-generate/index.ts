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

function enhancePrompt(simple: string, size?: string, titleText?: string): string {
  const sizeHint = size ? `, ${size} aspect ratio (YouTube/social safe margins)` : "";
  const titleLine = titleText && titleText.trim()
    ? `\nOn-thumbnail headline — render EXACTLY this text (preserve wording, spelling, case; do NOT translate or rewrite), 2–5 words, huge bold 3D typography with black outline + heavy drop shadow, white/yellow/red fill for maximum mobile readability: "${titleText.trim()}"`
    : `\nOn-thumbnail headline: extract a punchy 2–5 word viral English hook from the topic (e.g. "AI Changed Everything", "$10K/Month", "Don't Miss This", "Secret Strategy"). Render in huge bold 3D typography with black outline + heavy shadow, white/yellow/red fill.`;

  return `ROLE: You are an elite AI Thumbnail Prompt Engineer and Viral Thumbnail Strategist producing ONE final flat thumbnail image ready to upload.

UNIVERSAL LANGUAGE: The user topic may be in ANY language (English, Urdu, Hindi, Arabic, Spanish, French, German, Chinese, Japanese, Korean, Russian, Portuguese, Turkish, Bengali, Tamil, Telugu, Punjabi, etc.). Detect the language, understand intent, and internally translate the topic to English — AI image models render English concepts most accurately. NEVER refuse based on language.

TOPIC (any language): ${simple}${sizeHint}${titleLine}

AUTO CATEGORY DETECTION: Identify the niche (Finance, Business, Investing, AI, Tech, Programming, Motivation, Self-Improvement, Education, History, Documentary, Crime, Mystery, Horror, Gaming, Sports, Football, Cricket, UFC, News, Politics, Health, Fitness, Medical, Food, Travel, Nature, Wildlife, Real Estate, Luxury, Cars, Motorcycles, Fashion, Beauty, Kids, Animation, Movie Review, Celebrity, Podcast, Vlog, Tutorial, Product Review, Ecommerce, Crypto, SaaS, Cybersecurity, Cloud, etc.) and adapt style accordingly.

HIGH-CPM UPGRADE: If the topic falls in Finance / Investing / Stocks / Trading / AI / Software / Business / Insurance / Real Estate / Legal / Marketing / SEO / Credit Cards / Taxes / Passive Income / SaaS / Cybersecurity / Cloud / Enterprise — automatically apply a premium look: luxury palette, corporate authority, expensive lighting, trust-building composition.

VIRAL CTR RULES (mandatory):
- Large expressive face with strong emotion (shock, awe, excitement, confidence, curiosity, urgency) — unless topic is object-focused.
- Clear visual story: conflict, transformation, before-vs-after, big-object focus, or mystery hook.
- Rule-of-thirds composition, subject on one side, headline on the other, strong foreground/background separation.
- Cinematic key lighting, dramatic contrast, shallow depth of field, sharp micro-detail, crisp edges.
- Bold high-contrast colors selected by topic psychology (blue = business/trust, gold = luxury, red = urgency, green = finance/growth, purple = AI/tech, orange = energy, dark cinematic = mystery/crime/horror).
- Add attention motifs when they help: red/yellow circles around the subject's face, arrows pointing to money/graphs, glowing UI/dashboard overlays, sparks, light rays, chart lines going up.
- Minimal clutter — maximum readability on a small mobile preview.

STYLE (auto-pick best fit): Photorealistic / Hyper-Realistic / Cinematic / 3D / Digital Art / Documentary / Luxury / Corporate / Gaming / Anime / Illustration / Fantasy / Sci-fi.

HUMAN SUBJECTS:
- If a reference face image is provided: preserve identity, hair, skin tone, clothes, pose, camera angle, and lighting exactly. Only intensify the expression to match the emotional beat of the topic.
- If no face is provided: generate the most fitting subject automatically (person, object, scenery, product) for the detected niche.

BACKGROUND: Always highly relevant to the topic — never random. Reinforce the story (dashboard/charts for finance, neon circuits for AI, stadium for sports, kitchen for food, luxury interior for real estate, dark alley for crime, etc.).

QUALITY: Ultra HD, 8K, hyper-detailed, professional commercial quality, perfect skin, natural reflections, crisp typography.

NEGATIVE (avoid): low quality, blur, noise, JPEG artifacts, extra fingers, bad anatomy, distorted faces, cropped heads, duplicate objects, flat lighting, low contrast, watermarks, fake logos, misspelled text, unreadable text, messy composition, overexposure, underexposure.

OUTPUT: ONE final flat 16:9-style thumbnail image (or the requested aspect ratio), print-ready and optimized for maximum click-through rate on YouTube and social feeds. No borders, no frames, no letterboxing.`;
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

async function generateWithGemini(
  prompt: string,
  refs: string[],
  apiKey: string,
): Promise<{ imageUrl?: string; fallbackMessage?: string; status?: number }> {
  const parts: any[] = [{ text: prompt }];
  for (const ref of refs) {
    const m = ref.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
  }
  const body = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const models = ["gemini-2.5-flash-image", "gemini-2.0-flash-exp-image-generation"];
  // AQ.* keys are OAuth access tokens → Authorization: Bearer. AIza* keys → ?key= query.
  const isBearer = apiKey.startsWith("AQ.");
  for (const model of models) {
    const url = isBearer
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isBearer) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await fetch(url, { method: "POST", headers, body });

    if (res.ok) {
      const data = await res.json();
      const partsOut = data?.candidates?.[0]?.content?.parts || [];
      for (const p of partsOut) {
        if (p?.inlineData?.data) {
          const mime = p.inlineData.mimeType || "image/png";
          return { imageUrl: `data:${mime};base64,${p.inlineData.data}` };
        }
      }
      continue; // try next model
    }
    const errText = await res.text();
    console.error(`Gemini ${model} error ${res.status}:`, errText);
    if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(errText)) {
      return { status: 401, fallbackMessage: "Gemini API key is invalid or malformed. Please update GEMINI_API_KEY." };
    }
    if (res.status === 401 || res.status === 403) {
      return { status: res.status, fallbackMessage: "Gemini API key is unauthorized or missing required permissions." };
    }
    if (res.status === 429) {
      return { status: 429, fallbackMessage: "Gemini quota exceeded. Please try again later or upgrade your Gemini plan." };
    }
  }
  return { fallbackMessage: "Gemini image generation is temporarily unavailable — fallback shown." };
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
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: requestBody,
    });

    if (response.ok) {
      const data = await response.json();
      const message = data.choices?.[0]?.message;
      const images = message?.images;
      if (Array.isArray(images) && images.length > 0) {
        const url = images[0]?.image_url?.url;
        if (typeof url === "string" && url.startsWith("data:")) return { imageUrl: url };
      }
      return { fallbackMessage: "No image returned by Lovable AI." };
    }

    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    if (response.status === 429) {
      if (attempt < providerRetryLimit) { await sleep(1500 * (attempt + 1)); continue; }
      return { status: 429, fallbackMessage: "Lovable AI is rate-limited." };
    }
    if (response.status === 402) return { status: 402, fallbackMessage: "Lovable AI credits exhausted." };
    return { fallbackMessage: `Lovable AI failed (${response.status}).` };
  }
  return { fallbackMessage: "Lovable AI unavailable." };
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientIP = req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, referenceImage, referenceImages, size, titleText } = await req.json();
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

    const enhancedPrompt = enhancePrompt(prompt, size, typeof titleText === "string" ? titleText : undefined);
    console.log("Enhanced prompt:", enhancedPrompt, "refs:", refs.length);

    const finalPrompt = refs.length
      ? `Using the ${refs.length} provided reference image(s) as visual inspiration (style, lighting, composition, subject), create a brand new thumbnail: ${enhancedPrompt}`
      : enhancedPrompt;

    // Build OpenAI-compatible multimodal content
    const userContent: any[] = [{ type: "text", text: finalPrompt }];
    for (const ref of refs) {
      userContent.push({ type: "image_url", image_url: { url: ref } });
    }

    // Prefer user's own Gemini API key (unlimited by Lovable credits). Fall back to Lovable AI Gateway.
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        error: "No AI API key configured. Please add GEMINI_API_KEY in Settings → Secrets.",
        code: "missing_api_key",
      }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate Gemini key shape early (Google keys start with AIza or AQ.)
    if (GEMINI_API_KEY && !/^(AIza|AQ\.)/.test(GEMINI_API_KEY)) {
      return new Response(JSON.stringify({
        error: "GEMINI_API_KEY looks malformed. Google keys start with 'AIza' or 'AQ.'.",
        code: "malformed_api_key",
      }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let result: { imageUrl?: string; fallbackMessage?: string; status?: number } = {};
    if (GEMINI_API_KEY) {
      result = await generateWithGemini(finalPrompt, refs, GEMINI_API_KEY);
      // On any Gemini failure (auth, quota, etc.) silently fall through to Lovable AI Gateway.
    }

    if (!result.imageUrl && LOVABLE_API_KEY) {
      result = await generateWithLovableAI(userContent, LOVABLE_API_KEY);
    }

    if (!result.imageUrl) {
      const imageUrl = createFallbackThumbnail(prompt, size);
      return new Response(JSON.stringify({ imageUrl, fallback: true, message: result.fallbackMessage || "AI unavailable — fallback shown." }), {
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
