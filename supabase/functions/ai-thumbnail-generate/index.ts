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
    ? `\nON-THUMBNAIL HEADLINE — render EXACTLY this text (preserve wording, spelling, case; do NOT translate or rewrite): "${titleText.trim()}". Give it dominant typographic hierarchy: huge heavy display type, black outline + deep drop shadow, one accent-colored keyword, never covering the face or the main object.`
    : `\nON-THUMBNAIL HEADLINE — DO NOT copy the user's sentence onto the image. Internally derive the strongest 2–6 word hook from the topic's core promise (e.g. "How to Make Money Online" -> "MAKE MONEY" + smaller "ONLINE" + curiosity badge "$100/DAY?"). Rules: short, punchy, curiosity-creating, strongest keyword biggest, secondary word smaller, optional small badge/result number, no paragraphs, no long titles, perfectly readable at small mobile size.`;

  return `ROLE: You are a professional YouTube thumbnail designer + creative director + CTR strategist producing ONE final, flat, upload-ready thumbnail image. NOT a generic AI image generator.

UNIVERSAL LANGUAGE: The topic may be in ANY language. Detect it, understand the intent, and internally translate the concept to English for accurate rendering. NEVER refuse based on language.

TOPIC (any language): ${simple}${sizeHint}${titleLine}

STEP 1 — CONCEPT ANALYSIS (internal, before drawing): determine the topic, target audience, viewer intent, core emotional trigger, main promise, curiosity angle, key keywords, visual story, main subject, supporting objects, correct facial expression, background environment, best text opportunity, CTA/badge opportunity, and the visual hierarchy. Then design a deliberate thumbnail concept from that analysis.

STEP 2 — CATEGORY: Identify the niche (Finance, Business, Investing, AI, Tech, Programming, Motivation, Education, Documentary, Crime, Gaming, Sports, News, Health, Fitness, Food, Travel, Real Estate, Luxury, Cars, Fashion, Beauty, Kids, Movie Review, Podcast, Tutorial, Product Review, Ecommerce, Crypto, SaaS, Cybersecurity, etc.) and art-direct accordingly. High-CPM niches (finance, AI, software, business, insurance, real estate, legal, marketing, crypto) get a premium/luxury, corporate-authority treatment.

ATTENTION PATH (mandatory hierarchy):
1. PRIMARY — face or main object.
2. SECONDARY — large thumbnail headline text.
3. TERTIARY — money / product / result / supporting visual.
4. FINAL — small badge, CTA, arrow or curiosity element.
The topic must be understandable within one second.

RICH VISUAL DETAIL (never a plain background with one person and text): build layered visual storytelling with topic-relevant elements only — money, laptop, phone, charts, rising graphs, website/AI/UI panels, social icons, arrows, circles, badges, checkmarks, notifications, documents, products, before/after halves, result numbers, contextual props, foreground objects, depth layers, atmospheric lighting. Every element must support the topic; never add irrelevant objects just to add detail, and never create clutter.

COMPOSITION: deliberately decide subject position, text position, object position, negative space, foreground/background layers, perspective, depth, framing and crop. Text must never collide with the face, hands, or key objects; icons, arrows and badges must never fight the subject. It must look intentionally art-directed, not randomly generated.

HUMAN SUBJECTS: when a person fits, make them extremely expressive with a topic-correct emotion — money/success: excitement and awe; tutorial: confident and explanatory; warning: shock and worry; comparison: contrasting expressions; mystery: intrigue. Faces must be sharp, realistic, well lit, emotionally readable, correctly framed, and clearly separated from the background.

LIGHTING & DEPTH: cinematic thumbnail lighting — strong subject separation, rim light, realistic highlights, controlled shadows, dramatic contrast, subtle glow, foreground/background separation, professional color grading. No flat lighting, no muddy background, no excessive blur.

COLOR PSYCHOLOGY (choose by topic, never the same scheme every time): money = green/gold/black/white; tech = blue/cyan/white on dark; warning = red/yellow/black; success = green/gold on dark; AI = blue/cyan/purple on dark; education = blue/yellow/white; luxury = gold/black; crime/mystery = desaturated dark with one accent.

MICRO-DETAILS (use only where they strengthen the story): hand-drawn arrows, circles, highlight rings, glow, badges, checkmarks, mini labels, result numbers, icons, small contextual UI, subtle particles, light streaks, depth shadows, realistic reflections.

CTR TRIGGERS: include 2–4 of the strongest for this topic — human emotion, large readable text, curiosity gap, visible result, money/value number, before/after contrast, highlighted object, directional arrow, unexpected visual, extreme contrast. Do not use all of them.

MOBILE CHECK: evaluate the design at small size — face recognizable, headline readable, main object obvious, contrast surviving, tiny decorations not overpowering. Drop details that die at thumbnail size.

FACE REFERENCE: if a face image is provided, preserve identity, hair, skin tone and features exactly; only adapt the expression to the topic's emotional beat.

QUALITY: ultra HD, 8K, hyper-detailed, sharp micro-texture, realistic skin, accurate reflections, crisp typography, premium commercial thumbnail finish.

NEVER PRODUCE: plain background, generic person, tiny text, the user's long title copied verbatim, weak expression, flat lighting, random or irrelevant objects, excessive empty space, unreadable or misspelled text, cluttered composition, weak contrast, boring stock-photo look, watermarks, borders, letterboxing, extra fingers, distorted anatomy.

FINAL QUALITY CHECK before rendering: topic obvious in one second? headline short, powerful and mobile-readable? subject emotionally expressive? one strong focal point? enough useful, topic-relevant detail? balanced composition? subject separated from background? professional lighting and contrast? real curiosity created? nothing cluttering? Would it beat competing high-quality YouTube thumbnails? If any answer is no, improve the concept before generating.

OUTPUT: ONE final flat thumbnail image in the requested aspect ratio (default 16:9, 1280x720), professionally designed, high visual density with clear hierarchy, optimized for maximum click-through rate. No borders, no frames, no letterboxing.`;
}



function buildReverseEngineerPrompt(refCount: number, hasFace: boolean, titleText?: string): string {
  const faceBlock = hasFace
    ? `FACE REPLACEMENT (a separate user face reference IS provided — it is the LAST image):
- Replace ONLY the facial identity of the primary foreground subject with the user's face.
- Match the user's identity with maximum possible accuracy (bone structure, eyes, nose, lips, skin tone, facial hair, age).
- PRESERVE from the reference: exact expression, emotional intensity, head angle, body pose, lighting direction, shadows, camera perspective, crop, hairstyle, clothing, body proportions.
- Do NOT beautify, reshape, stylize, age, de-age, slim, or otherwise alter the user's face.
- The result must look naturally photographed in the original scene — seamless skin tone, matching grain, matching color grade.
- Do not replace faces of secondary/background subjects.`
    : `FACE REPLACEMENT: No user face reference provided — keep the reference subject's identity intact.`;

  const textBlock = titleText && titleText.trim()
    ? `TEXT RULES: The user explicitly requested this on-thumbnail text — render EXACTLY: "${titleText.trim()}" (preserve wording, spelling, case; do not translate). Bold, instantly readable, dominant hierarchy, clean outline/shadow, placed in the reference's text zone if one exists. No other text.`
    : `TEXT RULES:
- If the reference contains text: preserve the EXACT wording, font style, weight, color, outline, shadow, placement and hierarchy. Fix distorted, misspelled, duplicated or unreadable lettering. Never invent extra text.
- If the reference has no text: add NO text at all.`;

  return `ROLE: You are an expert YouTube Thumbnail Reverse Engineer and Thumbnail Optimization AI.

TASK: Analyze the ${refCount} provided reference thumbnail image(s) and generate an improved, highly clickable YouTube thumbnail while PRESERVING the original concept, subject identity, composition and visual intent. This is a faithful recreation + enhancement — NOT a new invented scene.

REFERENCE ANALYSIS (do this internally before generating): main subject and identity; facial expression and emotional intensity; head angle and body pose; subject placement and crop; number/position of secondary subjects; background environment; foreground/background depth; camera perspective; lighting direction; color palette; contrast; existing text and its hierarchy; visual focal point; negative space; motion/directional flow; story-communicating objects; overall thumbnail style.

${faceBlock}

IMPROVEMENT (only where it raises CTR, never destroying the concept): stronger focal point, clearer subject separation, more readable expression, better contrast, cleaner hierarchy, stronger color separation, more cinematic lighting, more intentional depth, better edge definition, more powerful composition, better readability at small sizes. Do NOT randomly add objects, people, text, effects or clutter.

${textBlock}

COMPOSITION: maintain the reference's core composition; primary subject stays the dominant focal point; preserve left/right positioning unless a change clearly improves it; keep faces and key objects away from unnecessary cropping; maintain natural foreground/midground/background depth; keep leading lines and directional movement present in the reference.

VISUAL QUALITY: photorealistic, ultra-sharp detail, high dynamic range, strong but realistic contrast, clean edges, natural skin texture, accurate shadows, cinematic lighting, professional color grading, premium YouTube-thumbnail aesthetic, excellent readability at 1280x720 and on small mobile screens.

AVOID: plastic skin, over-smoothing, unnatural anatomy, extra fingers/limbs, duplicate people, duplicate objects, distorted faces, random background changes, unnecessary blur, excessive glow or HDR, oversaturation, AI artifacts, incorrect text, watermarks, logos not in the reference, unwanted borders or captions.

CTR PRIORITIES: immediate comprehension, strong emotional reaction, clear subject/story, high contrast, face/emotion visibility, simple hierarchy, curiosity, mobile readability. The idea must land within one second.

OUTPUT: ONE flat 16:9 landscape image, 1280x720, professional commercial quality, no watermark, no unnecessary text or elements.

FINAL INSTRUCTION: Recreate the reference as accurately as possible, then intelligently enhance its visual impact and CTR potential while preserving the original story and identity.`;
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

    const { prompt, referenceImage, referenceImages, referenceThumbnails, faceImage, size, titleText } = await req.json();
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

    const isData = (r: unknown) => typeof r === "string" && (r as string).startsWith("data:");

    // Normalize references — accept array or single
    const refs: string[] = Array.isArray(referenceImages)
      ? referenceImages.filter(isData)
      : (isData(referenceImage) ? [referenceImage] : []);

    const thumbRefs: string[] = Array.isArray(referenceThumbnails) ? referenceThumbnails.filter(isData) : [];
    const hasFace = isData(faceImage);

    const enhancedPrompt = enhancePrompt(prompt, size, typeof titleText === "string" ? titleText : undefined);
    console.log("refs:", refs.length, "thumbRefs:", thumbRefs.length, "face:", hasFace);

    const finalPrompt = refs.length
      ? `${buildReverseEngineerPrompt(thumbRefs.length || refs.length, hasFace, typeof titleText === "string" ? titleText : undefined)}

USER BRIEF / TOPIC (any language — detect, understand, apply): ${prompt}

SUPPORTING STYLE GUIDANCE (apply only where it does not contradict the reference recreation rules above):
${enhancedPrompt}`
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
