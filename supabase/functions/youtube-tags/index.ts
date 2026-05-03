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

function extractChannelRef(input: string): { type: "id" | "handle" | "user"; value: string } | null {
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
    if (!url) return new Response(JSON.stringify({ error: "Provide a YouTube URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const vid = extractVideoId(url);

    // Single video
    if (vid) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vid}&key=${KEY}`);
      const data = await r.json();
      if (!r.ok || !data.items?.length) return new Response(JSON.stringify({ error: "Video not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const sn = data.items[0].snippet || {};
      return new Response(JSON.stringify({
        source: "video",
        title: sn.title || "",
        tags: Array.isArray(sn.tags) ? sn.tags : [],
        channelTitle: sn.channelTitle || "",
        thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Channel — aggregate tags from latest videos
    const ref = extractChannelRef(url);
    if (!ref) return new Response(JSON.stringify({ error: "Invalid YouTube video or channel URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const channelId = await resolveChannelId(KEY, ref);
    if (!channelId) return new Response(JSON.stringify({ error: "Channel not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${KEY}`);
    const cd = await cr.json();
    const cSnip = cd.items?.[0]?.snippet || {};

    const sr = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=15&key=${KEY}`);
    const sd = await sr.json();
    const ids = (sd.items || []).map((x: any) => x.id?.videoId).filter(Boolean).join(",");
    let aggregated: Record<string, number> = {};
    if (ids) {
      const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${KEY}`);
      const vd = await vr.json();
      for (const it of vd.items || []) {
        const tags: string[] = it.snippet?.tags || [];
        for (const t of tags) {
          const k = t.toLowerCase().trim();
          if (!k) continue;
          aggregated[k] = (aggregated[k] || 0) + 1;
        }
      }
    }
    const ranked = Object.entries(aggregated).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 60);

    return new Response(JSON.stringify({
      source: "channel",
      title: cSnip.title || "",
      channelTitle: cSnip.title || "",
      thumbnail: cSnip.thumbnails?.medium?.url || cSnip.thumbnails?.default?.url || "",
      tags: ranked,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
