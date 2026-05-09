import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Eye, Calendar, Youtube, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NICHES = [
  { value: "tech", label: "Science & Technology", cpm: 20.8, rpm: 11.44, kw: ["tech", "technology", "ai", "software", "coding", "programming", "developer", "gadget", "review"] },
  { value: "finance", label: "Finance & Business", cpm: 30.0, rpm: 16.5, kw: ["finance", "money", "invest", "stock", "crypto", "business", "trading", "forex", "bank"] },
  { value: "education", label: "Education", cpm: 12.0, rpm: 6.6, kw: ["education", "learn", "tutorial", "course", "study", "school", "lesson", "academy"] },
  { value: "gaming", label: "Gaming", cpm: 4.0, rpm: 2.2, kw: ["game", "gaming", "gameplay", "minecraft", "fortnite", "pubg", "esports"] },
  { value: "vlog", label: "Vlog / Lifestyle", cpm: 3.0, rpm: 1.65, kw: ["vlog", "lifestyle", "daily", "travel", "family"] },
  { value: "music", label: "Music", cpm: 2.5, rpm: 1.37, kw: ["music", "song", "audio", "remix", "beats", "cover"] },
  { value: "beauty", label: "Beauty & Fashion", cpm: 7.0, rpm: 3.85, kw: ["beauty", "makeup", "fashion", "skincare", "hair", "style"] },
  { value: "food", label: "Food & Cooking", cpm: 5.5, rpm: 3.02, kw: ["food", "cook", "recipe", "kitchen", "chef", "baking"] },
  { value: "kids", label: "Kids & Family", cpm: 1.5, rpm: 0.82, kw: ["kids", "children", "toy", "cartoon", "nursery"] },
  { value: "sports", label: "Sports", cpm: 3.5, rpm: 1.92, kw: ["sport", "football", "cricket", "basketball", "fitness", "workout", "gym"] },
];

function detectNiche(text: string): string {
  const lower = text.toLowerCase();
  let best = "vlog";
  let bestScore = 0;
  for (const n of NICHES) {
    let score = 0;
    for (const k of n.kw) if (lower.includes(k)) score++;
    if (score > bestScore) { bestScore = score; best = n.value; }
  }
  return best;
}

export default function EarningsCalculatorPage() {
  const [viewsPerDay, setViewsPerDay] = useState(1000);
  const [avgView, setAvgView] = useState(41);
  const [engagement, setEngagement] = useState(29);
  const [niche, setNiche] = useState("tech");
  const [customCpm, setCustomCpm] = useState(3.4);

  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const handleAutoCalc = async () => {
    if (!channelUrl.trim()) { toast.error("Enter a YouTube channel or video URL"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel", { body: { input: channelUrl.trim() } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const ch = data.channel;
      setChannel(ch);

      const totalViews = parseInt(ch.viewCount || "0", 10);
      const published = ch.publishedAt ? new Date(ch.publishedAt).getTime() : Date.now();
      const daysLive = Math.max(30, Math.floor((Date.now() - published) / 86400000));
      const dailyViews = Math.max(100, Math.round(totalViews / daysLive));

      const detected = detectNiche(`${ch.title} ${ch.description} ${ch.keywords}`);
      const nicheObj = NICHES.find(n => n.value === detected)!;

      setViewsPerDay(Math.min(1000000, dailyViews));
      setNiche(detected);
      setCustomCpm(nicheObj.cpm);
      setAvgView(45);
      setEngagement(35);

      toast.success(`Auto-calculated for ${ch.title} — Niche: ${nicheObj.label}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch channel");
    } finally {
      setLoading(false);
    }
  };

  const result = useMemo(() => {
    const n = NICHES.find(x => x.value === niche)!;
    const blendedCpm = (n.cpm + customCpm) / 2;
    const factor = (avgView / 100) * (0.6 + (engagement / 100) * 0.8);
    const dailyEarn = (viewsPerDay / 1000) * blendedCpm * factor;
    const monthly = dailyEarn * 30;
    const yearly = dailyEarn * 365;
    return {
      daily: dailyEarn.toFixed(2),
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
      yearlyViews: viewsPerDay * 365,
      monthlyViews: viewsPerDay * 30,
      cpm: n.cpm,
      rpm: n.rpm,
    };
  }, [viewsPerDay, avgView, engagement, niche, customCpm]);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={<Calculator className="h-5 w-5" />} title="YouTube Earnings Calculator" description="Paste a channel URL for instant auto-calculation, or use the sliders manually." />

      {/* Auto-calc card */}
      <div className="glass-panel rounded-xl p-5 mb-6 border border-primary/30">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" /> Auto-Calculate from YouTube Channel
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Youtube className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAutoCalc()}
              placeholder="https://youtube.com/@channel  or  channel/video URL"
              className="w-full h-11 pl-10 pr-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleAutoCalc}
            disabled={loading}
            className="h-11 px-5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Fetching…</> : <><Sparkles className="h-4 w-4" /> Auto Calculate</>}
          </button>
        </div>
        {channel && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            {channel.thumbnails?.default?.url && (
              <img src={channel.thumbnails.default.url} alt={channel.title} className="h-12 w-12 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{channel.title}</div>
              <div className="text-xs text-muted-foreground">
                {parseInt(channel.subscriberCount).toLocaleString()} subs · {parseInt(channel.viewCount).toLocaleString()} views · {parseInt(channel.videoCount).toLocaleString()} videos
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">{NICHES.find(n => n.value === niche)?.label}</span>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-primary/60 p-5">
          <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">Estimated YouTube Revenue Based on Total Views</h2>
          <p className="text-xs md:text-sm text-primary-foreground/80 mt-1">Move the sliders below to adjust views, engagement and CPM.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Views/Day</span><span className="text-primary">{fmt(viewsPerDay)}</span>
              </label>
              <Slider min={1000} max={1000000} step={1000} value={[viewsPerDay]} onValueChange={v => setViewsPerDay(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>1,000</span><span>500,000</span><span>1,000,000</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Average Percentage View (%)</span><span className="text-primary">{avgView}</span>
              </label>
              <Slider min={1} max={100} step={1} value={[avgView]} onValueChange={v => setAvgView(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>1</span><span>50</span><span>100</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Average Engagement Rate (%)</span><span className="text-primary">{engagement}</span>
              </label>
              <Slider min={1} max={100} step={1} value={[engagement]} onValueChange={v => setEngagement(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>0.1</span><span>50</span><span>100</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">CPM by Category ($)</label>
              <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.label} (CPM: ${n.cpm} | RPM: ${n.rpm})</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Custom CPM ($)</span><span className="text-primary">{customCpm.toFixed(2)}</span>
              </label>
              <Slider min={0} max={20} step={0.1} value={[customCpm]} onValueChange={v => setCustomCpm(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/30">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4 text-primary" /> Daily</span>
              <span className="font-display font-bold text-foreground">${result.daily}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/30">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /> Monthly</span>
              <span className="font-display font-bold text-foreground">${result.monthly}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/40 bg-primary/5">
              <span className="flex items-center gap-2 text-sm text-foreground font-semibold"><TrendingUp className="h-4 w-4 text-primary" /> Yearly</span>
              <span className="font-display font-bold text-primary text-lg">${result.yearly}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Views per year</span>
              <span className="font-medium text-primary">{fmt(result.yearlyViews)}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Views per month</span>
              <span className="font-medium text-primary">{fmt(result.monthlyViews)}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Earnings Calculator — Free Online Tool</h2>
        <p>Paste any YouTube channel or video URL to instantly auto-detect niche, average daily views and estimate earnings. Or move the sliders manually to model your own scenario.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">How It Works</h3>
        <p>Earnings = (Views/1000) × Blended CPM × (AvgView% × Engagement Factor). The auto-calculator divides total channel views by days since channel creation to estimate average daily views, then matches keywords to a niche CPM.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">Tips to Increase Earnings</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Choose a high-CPM niche like Finance, Tech or Education.</li>
          <li>Improve average view duration with strong intros.</li>
          <li>Boost engagement (likes, comments, shares) for better ad rates.</li>
          <li>Target US, UK, Canada and Australia audiences for higher CPM.</li>
          <li>Use mid-roll ads on videos longer than 8 minutes.</li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-foreground">Disclaimer</h3>
        <p>This is an estimate. Actual YouTube earnings depend on AdSense, audience location, ad format, watch time, and YouTube's revenue share (55% to creator).</p>
      </article>
    </div>
  );
}
