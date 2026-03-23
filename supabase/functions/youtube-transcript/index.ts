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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    // Fetch video page to get caption tracks
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept-Language": "*" },
    });
    const pageHtml = await pageRes.text();

    // Extract video title
    const titleMatch = pageHtml.match(/<title>(.+?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(" - YouTube", "").trim() : "";

    // Try to get title from YouTube API if available
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (YOUTUBE_API_KEY) {
      try {
        const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        const apiData = await apiRes.json();
        if (apiData.items?.[0]) {
          title = apiData.items[0].snippet.title || title;
        }
      } catch {}
    }

    // Extract captions from player response
    const playerMatch = pageHtml.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (!playerMatch) {
      return new Response(JSON.stringify({ error: "Transcript not available for this video. The video may have captions disabled." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let playerResponse: any;
    try {
      playerResponse = JSON.parse(playerMatch[1]);
    } catch {
      return new Response(JSON.stringify({ error: "Transcript not available for this video." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
