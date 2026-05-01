import { useState } from "react";
import { DollarSign, Loader2, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MonResult {
  status: string;
  score: number;
  channel: { id: string; title: string; subscribers: number; views: number; videos: number };
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

  const Icon = result?.status === "Likely Monetized" ? CheckCircle2 : result?.status === "Not Monetized" ? XCircle : AlertCircle;
  const color = result?.status === "Likely Monetized" ? "text-primary" : result?.status === "Not Monetized" ? "text-destructive" : "text-amber-500";

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<DollarSign className="h-5 w-5" />} title="YouTube Monetization Checker" description="Estimate if a YouTube channel or video is monetized." />
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
            <div className="glass-panel rounded-lg p-4 flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className={`font-display font-bold text-lg ${color}`}>{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.channel.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="glass-panel rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Subscribers</p>
                <p className="font-display font-bold text-foreground">{result.channel.subscribers.toLocaleString()}</p>
              </div>
              <div className="glass-panel rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Views</p>
                <p className="font-display font-bold text-foreground">{result.channel.views.toLocaleString()}</p>
              </div>
              <div className="glass-panel rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="font-display font-bold text-foreground">{result.channel.videos.toLocaleString()}</p>
              </div>
            </div>

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
          <li>Result aap ko Likely Monetized / Possibly Monetized / Not Monetized form mein milay ga.</li>
        </ol>

        <h3 className="font-display text-lg font-semibold text-foreground">Key Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">YPP Eligibility Estimation:</strong> 1000 subs aur 4000 hours ka smart calculation.</li>
          <li><strong className="text-foreground">Content Signals:</strong> Made-for-kids aur licensed content detection.</li>
          <li><strong className="text-foreground">Channel Insights:</strong> Subscribers, views, video count ek dashboard mein.</li>
          <li><strong className="text-foreground">Fast & Free:</strong> Instant results, koi signup nahi.</li>
          <li><strong className="text-foreground">Works for Any Channel:</strong> Handle, custom URL ya channel ID — sab support.</li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-foreground">SEO Importance</h3>
        <p>Brands aur sponsors monetized channels ke saath collaboration prefer karte hain. Agar aap influencer marketing kar rahe hain ya competitor research kar rahe hain to ye tool aap ko quick filter dene mein madad deta hai. Creators apni progress track kar sakte hain aur dekh sakte hain ke wo YouTube Partner Program ke kitna qareeb hain.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">FAQ</h3>
        <div className="space-y-2">
          <p><strong className="text-foreground">Q1. Kya result 100% accurate hai?</strong><br/>Nahi, ye estimate hai. YouTube directly monetization data share nahi karta.</p>
          <p><strong className="text-foreground">Q2. Channel ka URL kis format mein de sakta hun?</strong><br/>youtube.com/@handle, /channel/UC..., /c/name — sab kaam karte hain.</p>
          <p><strong className="text-foreground">Q3. Made-for-kids ka monetization par kya asar hai?</strong><br/>Aise videos par personalized ads disabled hote hain — earnings kam hoti hain.</p>
          <p><strong className="text-foreground">Q4. Kya video URL bhi chalta hai?</strong><br/>Haan, video URL dene par hum uska channel automatically detect karte hain.</p>
          <p><strong className="text-foreground">Q5. Tool free hai?</strong><br/>100% free, koi limit nahi.</p>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground">Legal Disclaimer</h3>
        <p>Ye result sirf publicly available signals par based estimate hai. Actual monetization status sirf channel owner ke YouTube Studio mein dikhta hai. Hum koi data store nahi karte aur kisi bhi business decision ki responsibility user ki hai.</p>
      </article>
    </div>
  );
}
