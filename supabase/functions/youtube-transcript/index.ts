import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const pathMatch = url.pathname.match(/^\/(shorts|embed)\/([\w-]{11})/);
      if (pathMatch) return pathMatch[2];
    }
  } catch {}
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const e = rateLimitMap.get(ip);
  if (!e || now > e.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  e.count++;
  return e.count <= 20;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const clientIP = req.headers.get("cf-connecting-ip") || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Please provide a YouTube URL." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Could not extract video ID from the URL." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    let title = "";

    // Get video title via API
    if (YOUTUBE_API_KEY) {
      try {
        const apiRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        const apiData = await apiRes.json();
        if (apiData.items?.[0]) {
          title = apiData.items[0].snippet.title || "";
        }
      } catch {}
    }

    // Use YouTube's innertube API to get player response (more reliable than scraping)
    const innertubeRes = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "en",
          },
        },
      }),
    });

    if (!innertubeRes.ok) {
      console.error("Innertube API failed:", innertubeRes.status);
      return new Response(JSON.stringify({ error: "Transcript not available for this video." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const playerResponse = await innertubeRes.json();

    // Get title from player response if not from API
    if (!title) {
      title = playerResponse?.videoDetails?.title || "";
    }

    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      return new Response(JSON.stringify({ error: "Transcript not available for this video. No captions found." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick the first track (original language)
    const track = captionTracks[0];
    const language = track.name?.simpleText || track.languageCode || "Unknown";
    const captionUrl = track.baseUrl;

    // Fetch the timed text XML
    const captionRes = await fetch(captionUrl);
    if (!captionRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch transcript data." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const captionXml = await captionRes.text();

    // Parse XML to extract text
    const textSegments: string[] = [];
    const regex = /<text[^>]*>(.*?)<\/text>/gs;
    let match;
    while ((match = regex.exec(captionXml)) !== null) {
      let text = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, " ")
        .trim();
      if (text) textSegments.push(text);
    }

    if (textSegments.length === 0) {
      return new Response(JSON.stringify({ error: "Transcript not available for this video." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = textSegments.join("\n");

    return new Response(JSON.stringify({ transcript, title, language }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Transcript error:", err);
    return new Response(JSON.stringify({ error: "Failed to extract transcript. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
