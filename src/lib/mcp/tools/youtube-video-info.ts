import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_youtube_video_info",
  title: "Get YouTube Video Info",
  description: "Fetch public metadata (title, channel, thumbnails, description) for a YouTube video URL.",
  inputSchema: {
    url: z.string().url().describe("Full YouTube video URL."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ url }) => {
    const base = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    if (!base || !anon) {
      return { content: [{ type: "text", text: "Server not configured." }], isError: true };
    }
    const res = await fetch(`${base}/functions/v1/youtube-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { content: [{ type: "text", text: data?.error || `Failed (${res.status}).` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  },
});
