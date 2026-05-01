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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!KEY) return new Response(JSON.stringify({ error: "YouTube API key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { url } = await req.json();
    const id = url ? extractVideoId(url) : null;
    if (!id) return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${KEY}`);
    const data = await r.json();
    if (!r.ok || !data.items?.length) return new Response(JSON.stringify({ error: "Video not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sn = data.items[0].snippet || {};
    return new Response(JSON.stringify({
      title: sn.title || "",
      tags: Array.isArray(sn.tags) ? sn.tags : [],
      channelTitle: sn.channelTitle || "",
      thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
