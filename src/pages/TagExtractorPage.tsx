import { useState } from "react";
import { Tag, Loader2, Copy, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface TagsData { title: string; tags: string[]; channelTitle: string; thumbnail: string; }

export default function TagExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TagsData | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a YouTube URL"); return; }
    setLoading(true); setData(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("youtube-tags", { body: { url: url.trim() } });
      if (error || res?.error) throw new Error(res?.error || "Failed to fetch tags");
      setData(res);
      if (!res.tags?.length) toast.info("No public tags found for this video");
      else toast.success(`Found ${res.tags.length} tags`);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch");
    }
    setLoading(false);
  };

  const copyAll = () => {
    if (!data?.tags?.length) return;
    navigator.clipboard.writeText(data.tags.join(", "));
    toast.success("Tags copied to clipboard");
  };

  const copyOne = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<Tag className="h-5 w-5" />} title="YouTube Tag Extractor" description="Extract hidden tags from any YouTube video instantly." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="bg-secondary border-border flex-1" onKeyDown={e => e.key === "Enter" && handleFetch()} />
          <Button onClick={handleFetch} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Extract Tags
          </Button>
        </div>

        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-3">
              {data.thumbnail && <img src={data.thumbnail} alt={data.title} className="w-24 h-14 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{data.title}</p>
                <p className="text-xs text-muted-foreground">{data.channelTitle}</p>
              </div>
              {data.tags.length > 0 && (
                <Button onClick={copyAll} size="sm" variant="outline"><Copy className="h-3 w-3 mr-1" /> Copy All</Button>
              )}
            </div>
            {data.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((t, i) => (
                  <button key={i} onClick={() => copyOne(t)} className="text-xs bg-secondary hover:bg-primary/20 hover:text-primary border border-border px-3 py-1.5 rounded-full transition-all">
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">This video has no public tags or tags are hidden by the creator.</p>
            )}
          </motion.div>
        )}
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Tag Extractor — Free Online Tool</h2>
        <p><strong className="text-foreground">YouTube Tag Extractor</strong> aik free online tool hai jo kisi bhi YouTube video ke hidden tags ko instantly fetch karta hai. Tags YouTube ke search algorithm ka important part hain — ye decide karte hain ke aap ka video kaunse keywords par rank kare ga. Agar aap content creator hain, SEO specialist hain ya kisi competitor ki video strategy samajhna chahte hain to ye tool aap ke liye perfect hai.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">How to Use</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>YouTube par koi bhi video open karein aur uska URL copy karein.</li>
          <li>Upar diye gaye input box mein URL paste karein.</li>
          <li>"Extract Tags" button par click karein.</li>
          <li>Tool ek second mein video ke saare public tags fetch kar de ga.</li>
          <li>"Copy All" button se saare tags ek sath copy karein ya individual tag par click kar ke single copy karein.</li>
        </ol>

        <h3 className="font-display text-lg font-semibold text-foreground">Key Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">100% Free & Unlimited:</strong> Koi signup, koi limit, koi watermark nahi.</li>
          <li><strong className="text-foreground">Official YouTube Data API v3:</strong> Authentic aur real-time tags.</li>
          <li><strong className="text-foreground">One-Click Copy:</strong> Saare tags ya individual tag instantly clipboard par.</li>
          <li><strong className="text-foreground">Mobile Friendly:</strong> Phone, tablet aur desktop par fully responsive.</li>
          <li><strong className="text-foreground">Privacy First:</strong> Koi data store nahi hota, sirf public information fetch hoti hai.</li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-foreground">SEO Importance</h3>
        <p>YouTube tags aap ki video ko sahi audience tak pahunchane mein madad dete hain. Right tags use kar ke aap apni reach 3x tak barha sakte hain. Competitor analysis ke liye ye tool bohat powerful hai — top ranking videos ke tags dekh kar aap apni strategy improve kar sakte hain. SEO experts is tool ko keyword research aur niche discovery ke liye daily use karte hain.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">FAQ</h3>
        <div className="space-y-2">
          <p><strong className="text-foreground">Q1. Kya ye tool free hai?</strong><br/>Ji haan, 100% free hai aur koi registration required nahi.</p>
          <p><strong className="text-foreground">Q2. Kya tags hamesha milte hain?</strong><br/>Agar creator ne tags add kiye hain to milenge. Kuch creators tags hide ya skip karte hain.</p>
          <p><strong className="text-foreground">Q3. Kya ye legal hai?</strong><br/>Bilkul. Ye sirf public data YouTube Data API se fetch karta hai.</p>
          <p><strong className="text-foreground">Q4. Mobile par chalta hai?</strong><br/>Haan, har device par smoothly chalta hai.</p>
          <p><strong className="text-foreground">Q5. Kya unlimited videos check kar sakta hun?</strong><br/>Haan, daily limit nahi hai.</p>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground">Legal Disclaimer</h3>
        <p>Ye tool sirf YouTube ki publicly available information dikhata hai using official YouTube Data API v3. Hum koi copyrighted content download nahi karte aur na hi koi personal data store karte hain. Use karne ki responsibility user par hai.</p>
      </article>
    </div>
  );
}
