import { useState } from "react";
import { Youtube, Search, Loader2, Users, Eye, Video, Calendar, Globe, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  country: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  bannerUrl: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  hiddenSubscriberCount: boolean;
  keywords: string;
}

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

export default function YouTubeChannelPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<ChannelData | null>(null);

  const handleFetch = async () => {
    if (!input.trim()) {
      toast.error("Please enter a YouTube channel URL or ID");
      return;
    }
    setLoading(true);
    setChannel(null);

    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel", {
        body: { input: input.trim() },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.channel) {
        setChannel(data.channel);
        toast.success(`Found channel: ${data.channel.title}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch channel info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon={<Youtube className="h-5 w-5" />}
        title="YouTube Channel Lookup"
        description="Enter a YouTube channel URL, @handle, or channel ID to instantly fetch channel details."
      />

      <div className="glass-panel rounded-xl p-6 space-y-4 gradient-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="e.g. https://youtube.com/@MrBeast or UCxxxxxx"
              className="pl-10 bg-secondary border-border h-12 text-base"
            />
          </div>
          <Button
            onClick={handleFetch}
            disabled={loading}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Fetch
          </Button>
        </div>
      </div>

      {channel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Banner */}
          {channel.bannerUrl && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={channel.bannerUrl + "=w1280"}
                alt="Channel banner"
                className="w-full h-36 md:h-48 object-cover"
              />
            </div>
          )}

          {/* Profile section */}
          <div className="glass-panel rounded-xl p-6 gradient-border">
            <div className="flex items-start gap-4">
              <img
                src={channel.thumbnails.high?.url || channel.thumbnails.medium?.url || channel.thumbnails.default?.url || ""}
                alt={channel.title}
                className="h-20 w-20 rounded-full border-2 border-primary/30 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-display font-bold text-foreground truncate">{channel.title}</h2>
                {channel.customUrl && (
                  <p className="text-sm text-muted-foreground">{channel.customUrl}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {channel.country && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      <Globe className="h-3 w-3" /> {channel.country}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    <Calendar className="h-3 w-3" /> Joined {new Date(channel.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <a
                href={`https://youtube.com/channel/${channel.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex-shrink-0"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-secondary rounded-lg p-3 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">
                  {channel.hiddenSubscriberCount ? "Hidden" : formatNumber(channel.subscriberCount)}
                </p>
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <Video className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">{formatNumber(channel.videoCount)}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <Eye className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">{formatNumber(channel.viewCount)}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>

            {/* Description */}
            {channel.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">About</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6">
                  {channel.description}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
