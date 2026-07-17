import { defineMcp } from "@lovable.dev/mcp-js";
import generateThumbnail from "./tools/generate-thumbnail";
import extractYoutubeTags from "./tools/extract-youtube-tags";
import checkMonetization from "./tools/check-monetization";
import youtubeVideoInfo from "./tools/youtube-video-info";

export default defineMcp({
  name: "ultra-media-ai-hub",
  title: "Ultra Media AI Hub",
  version: "0.1.0",
  instructions:
    "Tools from Ultra Media AI Hub. Use `generate_thumbnail` to create viral YouTube/social thumbnails from any-language prompts. Use `get_youtube_video_info`, `extract_youtube_tags`, and `check_youtube_monetization` for public YouTube metadata and creator research. All tools operate on public data; no authentication required.",
  tools: [generateThumbnail, extractYoutubeTags, checkMonetization, youtubeVideoInfo],
});
