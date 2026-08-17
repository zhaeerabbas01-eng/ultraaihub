import { defineMcp, auth } from "@lovable.dev/mcp-js";
import generateThumbnail from "./tools/generate-thumbnail";
import extractYoutubeTags from "./tools/extract-youtube-tags";
import checkMonetization from "./tools/check-monetization";
import youtubeVideoInfo from "./tools/youtube-video-info";

const SUPABASE_URL = "https://jkkbxzsgnskqnpzwbapw.supabase.co";

export default defineMcp({
  name: "ultra-media-ai-hub",
  title: "Ultra Media AI Hub",
  version: "0.1.0",
  instructions:
    "Tools from Ultra Media AI Hub. Use `generate_thumbnail` to create viral YouTube/social thumbnails from any-language prompts. Use `get_youtube_video_info`, `extract_youtube_tags`, and `check_youtube_monetization` for public YouTube metadata and creator research. All tools require an authenticated OAuth session.",
  auth: auth.oauth.issuer({
    issuer: `${SUPABASE_URL}/auth/v1`,
    jwksUri: `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    acceptedAudiences: ["authenticated"],
    resource: `${SUPABASE_URL}/functions/v1/mcp`,
    resourceName: "Ultra Media AI Hub MCP",
  }),
  tools: [generateThumbnail, extractYoutubeTags, checkMonetization, youtubeVideoInfo],
});

