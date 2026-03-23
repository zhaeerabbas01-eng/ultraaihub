import { useState } from "react";
import { Link as LinkIcon, Loader2, Play, Eye, ThumbsUp, MessageSquare, Calendar, Copy, Download, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface VideoData {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: Record<string, { url: string; width: number; height: number }>;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

const formatNumber = (n: string) => {
  const num = parseInt(n, 10);
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return d; }
};

export default function VideoExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoData | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a YouTube URL"); return; }
    setLoading(true);
    setVideo(null);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-video", {
        body: { url: url.trim() },
      });
      if (error || data?.error) throw new Error(data?.error || "Failed to fetch video info");
      setVideo(data.video);
      toast.success("Video info extracted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch video info");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const downloadThumbnail = async () => {
    if (!video) return;
    const thumbUrl = video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.medium?.url;
    if (!thumbUrl) { toast.error("No thumbnail available"); return; }
    try {
      const res = await fetch(thumbUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `thumbnail-${video.id}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Thumbnail downloaded!");
    } catch {
      window.open(thumbUrl, "_blank");
    }
  };

  const getBestThumbnail = () => {
    if (!video) return "";
    return video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.standard?.url || video.thumbnails.medium?.url || "";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Play className="h-5 w-5" />} title="YouTube Video Extractor" description="Extract thumbnail, title, and description from any YouTube video instantly." />

      <div className="glass-panel rounded-xl p-6 space-y-4 gradient-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFetch()}
              placeholder="Paste YouTube URL or video ID..."
              className="pl-10 bg-secondary border-border h-12 text-base"
            />
          </div>
          <Button onClick={handleFetch} disabled={loading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Extract
          </Button>
        </div>
      </div>

      {video && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          {/* Large Thumbnail Preview */}
          <div className="glass-panel rounded-xl overflow-hidden gradient-border">
            <div className="relative group">
              <img
                src={getBestThumbnail()}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button onClick={downloadThumbnail} variant="secondary" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Download Thumbnail
                </Button>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="glass-panel rounded-xl p-5 gradient-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Video Title</p>
                <h2 className="text-foreground font-display font-bold text-lg leading-tight">{video.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">{video.channelTitle}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(video.title, "Title")} className="flex-shrink-0 text-muted-foreground hover:text-primary">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-full"><Eye className="h-3.5 w-3.5" />{formatNumber(video.viewCount)}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-full"><ThumbsUp className="h-3.5 w-3.5" />{formatNumber(video.likeCount)}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-full"><MessageSquare className="h-3.5 w-3.5" />{formatNumber(video.commentCount)}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-2.5 py-1 rounded-full"><Calendar className="h-3.5 w-3.5" />{formatDate(video.publishedAt)}</span>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="glass-panel rounded-xl p-5 gradient-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Description</p>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(video.description, "Description")} className="text-muted-foreground hover:text-primary h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm whitespace-pre-line max-h-64 overflow-y-auto leading-relaxed">{video.description}</p>
            </div>
          )}

          {/* Embedded Player */}
          <div className="glass-panel rounded-xl overflow-hidden gradient-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium p-4 pb-0">Watch Video</p>
            <div className="aspect-video p-4 pt-2">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>

          {/* Retry */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => { setVideo(null); setUrl(""); }} className="text-muted-foreground gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Extract Another Video
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
