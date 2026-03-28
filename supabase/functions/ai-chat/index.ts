import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tool } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt based on detected tool
    let systemPrompt = `You are Ultra AI, a powerful AI assistant built into Ultra Media AI Hub. You are helpful, conversational, and knowledgeable. You respond in a human-like, engaging tone.

You have built-in capabilities:
- Analyze images and documents shared by users
- Write SEO-optimized articles and blog posts
- Summarize content from YouTube videos when transcripts are provided
- Generate creative content, code, and more

When writing articles or blog posts:
- Use proper headings (H1, H2, H3)
- Include SEO keywords naturally
- Write in engaging, plagiarism-free human tone
- Structure with intro, body paragraphs, and conclusion

When analyzing YouTube content:
- Provide clear summaries
- Extract key points
- Identify main topics and themes

Always be concise but thorough. Use markdown formatting for structured responses.`;

    if (tool === "youtube") {
      systemPrompt += `\n\nThe user has provided YouTube video data. Analyze the transcript, title, and metadata. Provide a comprehensive summary with key points, main topics, and insights.`;
    } else if (tool === "article") {
      systemPrompt += `\n\nThe user wants you to write an SEO-optimized article. Write a comprehensive, well-structured article with:
- Compelling title with target keyword
- Meta description suggestion
- Proper H2/H3 headings
- Natural keyword placement
- Engaging introduction and conclusion
- 1000-2000 words minimum`;
    } else if (tool === "blog") {
      systemPrompt += `\n\nThe user wants a Blogger-optimized blog post. Write with:
- SEO-friendly title
- Proper HTML-compatible heading structure
- Short paragraphs for readability
- Internal linking suggestions
- Call-to-action at the end`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
