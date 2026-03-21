import { useState } from "react";
import { Download, Link as LinkIcon, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a valid URL"); return; }
    const urlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|instagram\.com)\/.+/i;
    if (!urlPattern.test(url)) { toast.error("Unsupported URL. Use YouTube, TikTok, Facebook, or Instagram links."); return; }
    setLoading(true);
    // Simulated metadata fetch — requires backend with yt-dlp
    await new Promise(r => setTimeout(r, 1500));
    setVideoInfo({ title: "Video Preview", thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(url) || "dQw4w9WgXcQ"}/hqdefault.jpg` });
    setLoading(false);
    toast.info("Video downloading requires a backend server with yt-dlp. Connect a backend to enable full functionality.");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Download className="h-5 w-5" />} title="Video Downloader" description="Download videos from YouTube, TikTok (no watermark), Facebook, and Instagram in multiple qualities." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste video URL here..." className="pl-10 bg-secondary border-border" />
          </div>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger className="w-28 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="360p">360p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleFetch} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          {loading ? "Fetching..." : "Fetch Video"}
        </Button>
        {videoInfo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-lg p-4 mt-4">
            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full rounded-lg mb-3 aspect-video object-cover" />
            <p className="text-foreground font-medium">{videoInfo.title}</p>
            <p className="text-muted-foreground text-sm mt-1">Quality: {quality}</p>
            <Button className="mt-3 w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download {quality}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
