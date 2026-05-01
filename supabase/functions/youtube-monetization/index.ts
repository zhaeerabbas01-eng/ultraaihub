import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractVideoId(input: string): string | null {
  const t = input.trim();
  const s = t.match(/youtu\.be\/([\w-]{11})/);
  if (s) return s[1];
  try {
    const u = new URL(t);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const p = u.pathname.match(/^\/(shorts|embed)\/([\w-]{11})/);
      if (p) return p[2];
    }
  } catch {}
  if (/^[\w-]{11}$/.test(t)) return t;
  return null;
}

function extractChannelHandle(input: string): { type: "id" | "handle" | "user"; value: string } | null {
  const t = input.trim();
  try {
    const u = new URL(t);
    if (!u.hostname.includes("youtube.com")) return null;
    const p = u.pathname;
    let m = p.match(/^\/channel\/(UC[\w-]+)/);
    if (m) return { type: "id", value: m[1] };
    m = p.match(/^\/@([\w.\-]+)/);
    if (m) return { type: "handle", value: m[1] };
    m = p.match(/^\/(c|user)\/([\w.\-]+)/);
    if (m) return { type: "user", value: m[2] };
  } catch {}
  if (/^UC[\w-]{20,}$/.test(t)) return { type: "id", value: t };
  if (t.startsWith("@")) return { type: "handle", value: t.slice(1) };
  return null;
}

async function resolveChannelId(KEY: string, ref: { type: string; value: string }): Promise<string | null> {
  if (ref.type === "id") return ref.value;
  if (ref.type === "handle") {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${ref.value}&key=${KEY}`);
    const d = await r.json();
    if (d.items?.[0]?.id) return d.items[0].id;
  }
  if (ref.type === "user") {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${ref.value}&key=${KEY}`);
    const d = await r.json();
    if (d.items?.[0]?.id) return d.items[0].id;
  }
  // fallback search
  const s = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(ref.value)}&maxResults=1&key=${KEY}`);
  const sd = await s.json();
  return sd.items?.[0]?.snippet?.channelId || sd.items?.[0]?.id?.channelId || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!KEY) return new Response(JSON.stringify({ error: "YouTube API key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") return new Response(JSON.stringify({ error: "Provide a YouTube URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let channelId: string | null = null;
    let channelTitle = "";
    let videoMeta: { licensedContent?: boolean; madeForKids?: boolean; title?: string } = {};

    const vid = extractVideoId(url);
    if (vid) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status,contentDetails&id=${vid}&key=${KEY}`);
      const d = await r.json();
      if (!r.ok || !d.items?.length) return new Response(JSON.stringify({ error: "Video not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const it = d.items[0];
      channelId = it.snippet?.channelId;
      channelTitle = it.snippet?.channelTitle || "";
      videoMeta = {
        licensedContent: it.contentDetails?.licensedContent,
        madeForKids: it.status?.madeForKids,
        title: it.snippet?.title,
      };
    } else {
      const ref = extractChannelHandle(url);
      if (!ref) return new Response(JSON.stringify({ error: "Invalid video or channel URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      channelId = await resolveChannelId(KEY, ref);
    }

    if (!channelId) return new Response(JSON.stringify({ error: "Channel not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${KEY}`);
    const cd = await cr.json();
    if (!cd.items?.length) return new Response(JSON.stringify({ error: "Channel data unavailable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const ch = cd.items[0];
    const subs = parseInt(ch.statistics?.subscriberCount || "0", 10);
    const views = parseInt(ch.statistics?.viewCount || "0", 10);
    const videos = parseInt(ch.statistics?.videoCount || "0", 10);
    if (!channelTitle) channelTitle = ch.snippet?.title || "";

    // Heuristic monetization scoring (YouTube does not expose monetization status publicly)
    const subsOk = subs >= 1000;
    const reasonableViews = views >= 100000; // proxy for 4000h watch-time eligibility
    const hasContent = videos >= 5;
    const notKids = videoMeta.madeForKids !== true;
    const licensed = videoMeta.licensedContent === true;

    let score = 0;
    if (subsOk) score += 2;
    if (reasonableViews) score += 2;
    if (hasContent) score += 1;
    if (notKids) score += 1;
    if (licensed) score += 1;

    let status = "Unknown";
    if (score >= 5) status = "Likely Monetized";
    else if (score <= 2) status = "Not Monetized";
    else status = "Possibly Monetized";

    const reasons: string[] = [];
    reasons.push(`${subs.toLocaleString()} subscribers ${subsOk ? "✓ meets 1,000 minimum" : "✗ below 1,000 threshold"}`);
    reasons.push(`${views.toLocaleString()} total channel views ${reasonableViews ? "✓ suggests sufficient watch hours" : "✗ may be below 4,000 watch-hour estimate"}`);
    reasons.push(`${videos.toLocaleString()} uploaded videos`);
    if (videoMeta.madeForKids === true) reasons.push("⚠ Marked as made-for-kids — limited monetization");
    if (licensed) reasons.push("✓ Contains licensed/claimed content (ads typically run)");

    return new Response(JSON.stringify({
      status, score,
      channel: { id: channelId, title: channelTitle, subscribers: subs, views, videos },
      reasons,
      note: "YouTube does not expose monetization status publicly. This is an estimate based on YPP eligibility signals.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
