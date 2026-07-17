import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "check_youtube_monetization",
  title: "Check YouTube Monetization",
  description: "Check whether a YouTube channel meets monetization criteria (subs, watch hours, eligibility).",
  inputSchema: {
    channelUrl: z.string().min(3).describe("YouTube channel URL, @handle, or channel ID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ channelUrl }) => {
    const base = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    if (!base || !anon) {
      return { content: [{ type: "text", text: "Server not configured." }], isError: true };
    }
    const res = await fetch(`${base}/functions/v1/youtube-monetization`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify({ channelUrl }),
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
