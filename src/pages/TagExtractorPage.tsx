import { useState, useMemo } from "react";
import { Tag, Loader2, Copy, Search, CheckSquare, Square, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface TagsData { title: string; tags: string[]; channelTitle: string; thumbnail: string; source?: string; }

export default function TagExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TagsData | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a YouTube video or channel URL"); return; }
    setLoading(true); setData(null); setSelected(new Set());
    try {
      const { data: res, error } = await supabase.functions.invoke("youtube-tags", { body: { url: url.trim() } });
      if (error || res?.error) throw new Error(res?.error || "Failed to fetch tags");
      setData(res);
      if (!res.tags?.length) toast.info("No public tags found");
      else toast.success(`Found ${res.tags.length} ${res.source === "channel" ? "channel" : "viral"} tags`);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch");
    }
    setLoading(false);
  };

  const toggle = (t: string) => {
    const ns = new Set(selected);
    ns.has(t) ? ns.delete(t) : ns.add(t);
    setSelected(ns);
  };

  const selectAll = () => data && setSelected(new Set(data.tags));
  const clearSel = () => setSelected(new Set());

  const copyAll = () => {
    if (!data?.tags?.length) return;
    navigator.clipboard.writeText(data.tags.join(", "));
    toast.success(`${data.tags.length} tags copied`);
  };
  const copySelected = () => {
    if (!selected.size) { toast.error("Select tags first"); return; }
    navigator.clipboard.writeText(Array.from(selected).join(", "));
    toast.success(`${selected.size} selected tags copied`);
  };
  const copyOne = (t: string) => { navigator.clipboard.writeText(t); toast.success(`Copied: ${t}`); };

  const totalChars = useMemo(() => data?.tags.join(", ").length ?? 0, [data]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader icon={<Tag className="h-5 w-5" />} title="YouTube Tag Extractor" description="Extract viral tags from any YouTube video or channel — copy all, single, or multi-select." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Video URL or channel URL (e.g. youtube.com/@channel)" className="bg-secondary border-border flex-1" onKeyDown={e => e.key === "Enter" && handleFetch()} />
          <Button onClick={handleFetch} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Extract Tags
          </Button>
        </div>

        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 glass-panel rounded-xl p-3">
              {data.thumbnail && <img src={data.thumbnail} alt={data.title} className={`object-cover ${data.source === "channel" ? "w-14 h-14 rounded-full" : "w-24 h-14 rounded"}`} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{data.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {data.channelTitle}
                  {data.source === "channel" && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Aggregated viral tags</span>}
                </p>
              </div>
            </div>

            {data.tags.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{data.tags.length} tags · {totalChars}/500 chars · {selected.size} selected</span>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Button onClick={selectAll} size="sm" variant="outline"><CheckSquare className="h-3 w-3 mr-1" /> Select all</Button>
                    {selected.size > 0 && <Button onClick={clearSel} size="sm" variant="outline"><X className="h-3 w-3 mr-1" /> Clear</Button>}
                    <Button onClick={copySelected} size="sm" variant="outline" disabled={!selected.size}><Copy className="h-3 w-3 mr-1" /> Copy selected ({selected.size})</Button>
                    <Button onClick={copyAll} size="sm" className="bg-primary hover:bg-primary/90"><Copy className="h-3 w-3 mr-1" /> Copy all</Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.tags.map((t, i) => {
                    const sel = selected.has(t);
                    return (
                      <div key={i} className={`group flex items-center gap-1 rounded-full border transition-all ${sel ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border hover:border-primary/50"}`}>
                        <button onClick={() => toggle(t)} className="pl-3 py-1.5 flex items-center gap-1.5 text-xs">
                          {sel ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3 opacity-50" />}
                          <span>{t}</span>
                        </button>
                        <button onClick={() => copyOne(t)} className="pr-3 py-1.5 opacity-60 hover:opacity-100" title="Copy this tag">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {!data.tags.length && <p className="text-sm text-muted-foreground text-center py-6">No public tags found for this video/channel.</p>}
          </motion.div>
        )}
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Tag Extractor — Viral Tags by Video or Channel</h2>
        <p>Extract real, viral YouTube tags from any video URL — or paste a channel URL to get aggregated, frequency-ranked tags from the channel's latest 15 videos. Click a tag to copy it instantly, or use multi-select to build your own optimized tag list.</p>
        <h3 className="font-display text-lg font-semibold text-foreground">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Works for both video URL and channel URL.</li>
          <li>Multi-select with checkbox — copy only the tags you want.</li>
          <li>Single-tag copy with one click.</li>
          <li>Live character counter (YouTube's 500-char limit).</li>
          <li>Channel mode: aggregated viral tags ranked by frequency.</li>
        </ul>
      </article>
    </div>
  );
}
