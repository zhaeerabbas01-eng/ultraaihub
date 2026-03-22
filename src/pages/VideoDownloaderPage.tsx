import { useState } from "react";
import { Link as LinkIcon, Loader2, Play, Eye, ThumbsUp, MessageSquare, Calendar } from "lucide-react";
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

export default function VideoPreviewPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoData | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a YouTube URL"); return; }
    const urlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    const isId = /^[\w-]{11}$/.test(url.trim());
    if (!urlPattern.test(url) && !isId) { toast.error("Please enter a valid YouTube URL or video ID."); return; }

    setLoading(true);
    setVideo(null);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-video", {
        body: { url: url.trim() },
      });
      if (error || data?.error) throw new Error(data?.error || "Failed to fetch video info");
      setVideo(data.video);
      toast.success("Video loaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch video info");
    }
    setLoading(false);
  };

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

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Play className="h-5 w-5" />} title="YouTube Video Preview" description="Preview any YouTube video with details — no downloads, just instant info." />

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
            Preview
          </Button>
        </div>

        {video && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
            {/* Embedded player */}
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Title & Channel */}
            <div>
              <h2 className="text-foreground font-display font-bold text-lg leading-tight">{video.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">{video.channelTitle}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Eye className="h-4 w-4" />{formatNumber(video.viewCount)} views</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><ThumbsUp className="h-4 w-4" />{formatNumber(video.likeCount)} likes</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="h-4 w-4" />{formatNumber(video.commentCount)} comments</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDate(video.publishedAt)}</span>
            </div>

            {/* Description */}
            {video.description && (
              <div className="glass-panel rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-muted-foreground text-sm whitespace-pre-line">{video.description}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
