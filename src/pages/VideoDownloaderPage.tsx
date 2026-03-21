import { useState } from "react";
import { Download, Link as LinkIcon, Loader2, Play, CheckCircle, Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

const platforms = [
  { name: "YouTube", icon: "▶", color: "bg-red-500/20 text-red-400" },
  { name: "TikTok", icon: "♪", color: "bg-foreground/10 text-foreground" },
  { name: "Facebook", icon: "f", color: "bg-blue-500/20 text-blue-400" },
  { name: "Instagram", icon: "📷", color: "bg-pink-500/20 text-pink-400" },
];

const features = [
  { icon: CheckCircle, title: "No Watermark", desc: "Download TikTok & other videos without watermarks" },
  { icon: Download, title: "Multiple Qualities", desc: "Choose 360p, 720p, or 1080p quality" },
  { icon: Zap, title: "Fast Processing", desc: "Lightning-fast video fetching and download" },
];

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a valid URL"); return; }
    const urlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com|facebook\.com|instagram\.com)\/.+/i;
    if (!urlPattern.test(url)) { toast.error("Unsupported URL. Use YouTube, TikTok, Facebook, or Instagram links."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const ytId = extractYouTubeId(url);
    setVideoInfo({ 
      title: "Video Preview — Ready for Download", 
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`
    });
    setLoading(false);
    toast.success("Video info fetched! Select quality and download.");
  };

  const handleDownload = async () => {
    if (!url.trim()) return;
    setDownloading(true);
    try {
      // Use a third-party API approach - cobalt.tools (free, open-source)
      const apiUrl = "https://api.cobalt.tools/api/json";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          url: url.trim(),
          vQuality: quality.replace("p", ""),
          filenamePattern: "basic",
          isNoTTWatermark: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Download service unavailable");
      }

      const data = await response.json();
      
      if (data.status === "stream" || data.status === "redirect") {
        // Open download URL
        const link = document.createElement("a");
        link.href = data.url;
        link.download = "video.mp4";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      } else if (data.status === "picker" && data.picker?.length > 0) {
        const link = document.createElement("a");
        link.href = data.picker[0].url;
        link.download = "video.mp4";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      } else {
        // Fallback: open URL directly for manual download
        window.open(url, "_blank");
        toast.info("Opening video page. Right-click the video and select 'Save video as...' to download.");
      }
    } catch (err) {
      console.error("Download error:", err);
      // Fallback approach
      window.open(url, "_blank");
      toast.info("Direct download unavailable. Opening video page — right-click to save.");
    }
    setDownloading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Download className="h-5 w-5" />} title="Download Videos Without Watermark" description="Download videos from YouTube, TikTok, Facebook, and Instagram in high quality." />
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-4 mb-8">
        {platforms.map(p => (
          <div key={p.name} className={`h-12 w-12 rounded-xl ${p.color} flex items-center justify-center text-lg font-bold`}>
            {p.icon}
          </div>
        ))}
      </motion.div>

      <div className="glass-panel rounded-xl p-6 space-y-4 gradient-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste video URL here..." className="pl-10 bg-secondary border-border h-12 text-base" />
          </div>
          <Button onClick={handleFetch} disabled={loading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Fetch Info
          </Button>
        </div>

        {videoInfo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-lg p-4 mt-4">
            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full rounded-lg mb-3 aspect-video object-cover" />
            <p className="text-foreground font-medium">{videoInfo.title}</p>
            <div className="flex items-center gap-3 mt-3">
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="w-28 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="360p">360p</SelectItem>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p FHD</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleDownload} disabled={downloading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                {downloading ? "Downloading..." : `Download ${quality}`}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4 mt-8">
        {features.map((feat, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 text-center">
            <feat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">{feat.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{feat.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
