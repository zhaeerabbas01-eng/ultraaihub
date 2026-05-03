import { useState } from "react";
import { DollarSign, Loader2, Search, CheckCircle2, XCircle, AlertCircle, Users, Eye, Video, Globe, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MonResult {
  status: string;
  score: number;
  channel: {
    id: string; title: string; subscribers: number; views: number; videos: number;
    thumbnail?: string; banner?: string; country?: string; customUrl?: string; publishedAt?: string; description?: string;
  };
  reasons: string[];
  note: string;
}

export default function MonetizationCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MonResult | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) { toast.error("Please enter a video or channel URL"); return; }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-monetization", { body: { url: url.trim() } });
      if (error || data?.error) throw new Error(data?.error || "Failed to check");
      setResult(data);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setLoading(false);
  };

  const isMonetized = result?.status === "Likely Monetized";
  const isNot = result?.status === "Not Monetized";
  const Icon = isMonetized ? CheckCircle2 : isNot ? XCircle : AlertCircle;
  const statusColor = isMonetized ? "text-primary" : isNot ? "text-destructive" : "text-amber-500";
  const ringColor = isMonetized ? "ring-primary/40" : isNot ? "ring-destructive/40" : "ring-amber-500/40";
  const bgGrad = isMonetized
    ? "from-primary/20 to-primary/5"
    : isNot ? "from-destructive/20 to-destructive/5"
    : "from-amber-500/20 to-amber-500/5";

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader icon={<DollarSign className="h-5 w-5" />} title="YouTube Monetization Checker" description="Estimate if a YouTube channel or video is monetized — with channel insights." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Video URL or channel URL (e.g. youtube.com/@channel)" className="bg-secondary border-border flex-1" onKeyDown={e => e.key === "Enter" && handleCheck()} />
          <Button onClick={handleCheck} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Check Status
          </Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Hero card with channel logo + status */}
            <div className={`relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br ${bgGrad}`}>
              {result.channel.banner && (
                <div className="absolute inset-0 opacity-20">
                  <img src={result.channel.banner} alt={result.channel.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {result.channel.thumbnail && (
                  <img
                    src={result.channel.thumbnail}
                    alt={`${result.channel.title} channel logo`}
                    className={`w-24 h-24 rounded-full object-cover ring-4 ${ringColor} shadow-xl`}
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-2xl font-bold text-foreground">{result.channel.title}</h3>
                  {result.channel.customUrl && <p className="text-xs text-muted-foreground">@{result.channel.customUrl.replace(/^@/, "")}</p>}
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur border border-border">
                    <Icon className={`h-5 w-5 ${statusColor}`} />
                    <span className={`font-semibold ${statusColor}`}>{result.status}</span>
                    <span className="text-xs text-muted-foreground ml-2">Score {result.score}/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Users className="h-4 w-4" />} label="Subscribers" value={fmt(result.channel.subscribers)} />
              <StatCard icon={<Eye className="h-4 w-4" />} label="Total Views" value={fmt(result.channel.views)} />
              <StatCard icon={<Video className="h-4 w-4" />} label="Videos" value={fmt(result.channel.videos)} />
              <StatCard icon={<Globe className="h-4 w-4" />} label="Country" value={result.channel.country || "—"} />
            </div>

            {result.channel.publishedAt && (
              <div className="glass-panel rounded-lg p-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Channel created: {new Date(result.channel.publishedAt).toLocaleDateString()}
              </div>
            )}

            <div className="glass-panel rounded-lg p-4 space-y-1">
              <p className="text-xs font-semibold text-foreground mb-2">Signals analyzed:</p>
              {result.reasons.map((r, i) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
            </div>

            <p className="text-[11px] text-muted-foreground/70 italic">{result.note}</p>
          </motion.div>
        )}
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Monetization Checker — Free Tool</h2>
        <p><strong className="text-foreground">YouTube Monetization Checker</strong> aap ko batata hai ke koi channel ya video monetized hone ke chances rakhti hai ya nahi. YouTube directly monetization status public nahi karta, lekin hum smart indicators use karte hain — subscribers, total watch hours estimation, content type, made-for-kids status aur licensed content signals — jin se aap ek reliable estimate le sakte hain.</p>
        <h3 className="font-display text-lg font-semibold text-foreground">How to Use</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Koi YouTube video ya channel ka URL copy karein.</li>
          <li>Upar input box mein paste karein.</li>
          <li>"Check Status" button click karein.</li>
          <li>Tool subscribers, views aur eligibility signals analyze kare ga.</li>
          <li>Result aap ko channel logo, name aur status ke sath milay ga.</li>
        </ol>
        <h3 className="font-display text-lg font-semibold text-foreground">FAQ</h3>
        <p><strong className="text-foreground">Q. Kya result 100% accurate hai?</strong> Nahi, ye estimate hai. YouTube directly monetization data share nahi karta.</p>
        <p><strong className="text-foreground">Q. Channel URL kis format mein de sakta hun?</strong> youtube.com/@handle, /channel/UC..., /c/name — sab kaam karte hain.</p>
      </article>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-panel rounded-xl p-4 text-center hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">{icon}<span>{label}</span></div>
      <p className="font-display font-bold text-lg text-foreground truncate">{value}</p>
    </div>
  );
}
