declare const Deno: { env: { get(key: string): string | undefined } };

import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "generate_thumbnail",
  title: "Generate AI Thumbnail",
  description:
    "Generate a high-CTR YouTube/social thumbnail image from a text prompt in any language. Returns a data URL of the generated image.",
  inputSchema: {
    prompt: z.string().min(1).max(2000).describe("Topic or description of the thumbnail (any language)."),
    size: z
      .enum(["16:9", "1:1", "9:16", "4:3", "21:9"])
      .optional()
      .describe("Aspect ratio. Defaults to 16:9."),
    titleText: z
      .string()
      .max(120)
      .optional()
      .describe("Optional exact headline text to render on the thumbnail."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ prompt, size, titleText }, ctx) => {
    // Paid-credit consuming tool: require a verified caller identity.
    const subject = ctx?.isAuthenticated ? (ctx.getClaims()?.sub as string | undefined) : undefined;
    if (!subject) {
      return {
        content: [{ type: "text", text: "Authentication required: sign in to generate thumbnails." }],
        isError: true,
      };
    }
    if (!allowRequest(subject)) {
      return {
        content: [{ type: "text", text: "Rate limit exceeded. Try again in a minute." }],
        isError: true,
      };
    }
    const base = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    if (!base || !anon) {
      return { content: [{ type: "text", text: "Server not configured (missing SUPABASE_URL/anon key)." }], isError: true };
    }

    const res = await fetch(`${base}/functions/v1/ai-thumbnail-generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify({ prompt, size: size ?? "16:9", titleText }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.imageUrl) {
      return {
        content: [{ type: "text", text: data?.error || `Thumbnail generation failed (${res.status}).` }],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text", text: data.fallback ? "Fallback thumbnail returned (AI provider unavailable)." : "Thumbnail generated." },
        { type: "image", data: data.imageUrl.split(",")[1] ?? "", mimeType: "image/png" },
      ],
      structuredContent: { imageUrl: data.imageUrl, fallback: !!data.fallback },
    };
  },
});
