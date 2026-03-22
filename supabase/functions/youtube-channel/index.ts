import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  // youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/watch?v=VIDEO_ID
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      // youtube.com/shorts/VIDEO_ID or /embed/VIDEO_ID
      const pathMatch = url.pathname.match(/^\/(shorts|embed)\/([\w-]{11})/);
      if (pathMatch) return pathMatch[2];
    }
  } catch { /* not a URL */ }
  return null;
}

function extractChannelIdentifier(input: string): { type: "id" | "handle" | "username" | "video"; value: string } | null {
  const trimmed = input.trim();

  // Direct channel ID (starts with UC)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  // @handle format
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed };
  }

  // Check for video URL first (before generic URL parsing)
  const videoId = extractVideoId(trimmed);
  if (videoId) {
    return { type: "video", value: videoId };
  }

  // URL patterns
  try {
    const url = new URL(trimmed);
    const path = url.pathname;

    // youtube.com/channel/UCxxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return { type: "id", value: channelMatch[1] };

    // youtube.com/@handle
    const handleMatch = path.match(/^\/@([\w.-]+)/);
    if (handleMatch) return { type: "handle", value: `@${handleMatch[1]}` };

    // youtube.com/c/CustomName or youtube.com/user/Username
    const customMatch = path.match(/^\/(c|user)\/([\w.-]+)/);
    if (customMatch) return { type: "username", value: customMatch[2] };

    // youtube.com/CustomName (legacy vanity URL)
    const vanityMatch = path.match(/^\/([\w.-]+)$/);
    if (vanityMatch && !["watch", "feed", "playlist", "shorts", "results", "embed"].includes(vanityMatch[1])) {
      return { type: "username", value: vanityMatch[1] };
    }
  } catch {
    // Not a URL, treat as username or handle
    if (/^[\w.-]+$/.test(trimmed)) {
      return { type: "username", value: trimmed };
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";

  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0 || input.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid input. Provide a YouTube channel URL or ID." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identifier = extractChannelIdentifier(input);
    if (!identifier) {
      return new Response(JSON.stringify({ error: "Could not parse channel from input. Use a channel URL, @handle, or channel ID." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BASE = "https://www.googleapis.com/youtube/v3/channels";
    const parts = "snippet,statistics,brandingSettings,contentDetails";
    let apiUrl: string;

    if (identifier.type === "video") {
      // Resolve video to channel ID first
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(identifier.value)}&key=${YOUTUBE_API_KEY}`;
      const videoRes = await fetch(videoUrl);
      const videoData = await videoRes.json();
      if (!videoRes.ok || !videoData.items?.length) {
        return new Response(JSON.stringify({ error: "Video not found. Could not resolve channel." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const channelId = videoData.items[0].snippet.channelId;
      apiUrl = `${BASE}?part=${parts}&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    } else if (identifier.type === "id") {
      apiUrl = `${BASE}?part=${parts}&id=${encodeURIComponent(identifier.value)}&key=${YOUTUBE_API_KEY}`;
    } else if (identifier.type === "handle") {
      // Use search to resolve handle, then fetch channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(identifier.value)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (!searchRes.ok || !searchData.items?.length) {
        // Try forHandle parameter (newer API)
        apiUrl = `${BASE}?part=${parts}&forHandle=${encodeURIComponent(identifier.value.replace("@", ""))}&key=${YOUTUBE_API_KEY}`;
      } else {
        const channelId = searchData.items[0].snippet.channelId;
        apiUrl = `${BASE}?part=${parts}&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      }
    } else {
      // username - try forUsername first
      apiUrl = `${BASE}?part=${parts}&forUsername=${encodeURIComponent(identifier.value)}&key=${YOUTUBE_API_KEY}`;
    }

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok) {
      console.error("YouTube API error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "YouTube API error. Please try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data.items?.length) {
      // Fallback: try search
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.trim())}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.items?.length) {
        const channelId = searchData.items[0].snippet.channelId;
        const retryUrl = `${BASE}?part=${parts}&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        const retryRes = await fetch(retryUrl);
        const retryData = await retryRes.json();

        if (retryData.items?.length) {
          return new Response(JSON.stringify({ channel: formatChannel(retryData.items[0]) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ error: "Channel not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ channel: formatChannel(data.items[0]) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatChannel(item: any) {
  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const branding = item.brandingSettings?.channel || {};

  return {
    id: item.id,
    title: snippet.title || "",
    description: snippet.description || "",
    customUrl: snippet.customUrl || "",
    publishedAt: snippet.publishedAt || "",
    country: snippet.country || "",
    thumbnails: snippet.thumbnails || {},
    bannerUrl: item.brandingSettings?.image?.bannerExternalUrl || "",
    subscriberCount: stats.subscriberCount || "0",
    videoCount: stats.videoCount || "0",
    viewCount: stats.viewCount || "0",
    hiddenSubscriberCount: stats.hiddenSubscriberCount || false,
    keywords: branding.keywords || "",
  };
}
