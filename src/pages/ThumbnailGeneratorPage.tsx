import { useState, useRef, useCallback, useEffect } from "react";
import {
  Wand2, Download, Loader2, Sparkles, X, Plus,
  Send, Link as LinkIcon, RefreshCw, Maximize2, Copy, DownloadCloud, Image as ImageIcon, ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sizeOptions = [
  { value: "16:9", label: "16:9 YouTube", w: 1280, h: 720 },
  { value: "1:1", label: "1:1 Square", w: 1080, h: 1080 },
  { value: "9:16", label: "9:16 Shorts", w: 1080, h: 1920 },
  { value: "4:3", label: "4:3 Standard", w: 1280, h: 960 },
  { value: "21:9", label: "21:9 Ultra", w: 1680, h: 720 },
];
const sizeMeta = (v: string) => sizeOptions.find(s => s.value === v) ?? sizeOptions[0];

type GenItem = {
  id: string;
  prompt: string;
  size: string;
  titleText?: string;
  refs: string[];
  loading?: boolean;
  imageUrl?: string;
  error?: string;
  fallback?: boolean;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const urlToDataUrl = async (url: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

const slugify = (s: string) =>
  (s || "thumbnail").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "thumbnail";

const downloadDataUrl = async (dataUrl: string, filename: string) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export default function ThumbnailGeneratorPage() {
  const [items, setItems] = useState<GenItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [titleText, setTitleText] = useState("");
  const [refs, setRefs] = useState<{ id: string; url: string; name: string }[]>([]);
  const [size, setSize] = useState("16:9");
  const [ytUrl, setYtUrl] = useState("");
  const [showYt, setShowYt] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [loadingYt, setLoadingYt] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const active = items.find(i => i.id === activeId) || items[items.length - 1];

  useEffect(() => {
    if (items.length && !activeId) setActiveId(items[items.length - 1].id);
  }, [items, activeId]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return;
    const newRefs: { id: string; url: string; name: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} > 4MB — skipped`);
        continue;
      }
      try {
        const url = await fileToDataUrl(file);
        newRefs.push({ id: crypto.randomUUID(), url, name: file.name });
      } catch {
        toast.error(`Could not read ${file.name}`);
      }
    }
    if (newRefs.length) {
      setRefs(prev => [...prev, ...newRefs]);
      toast.success(`${newRefs.length} reference(s) added`);
    }
  }, []);

  const removeRef = (id: string) => setRefs(prev => prev.filter(r => r.id !== id));

  const handleYtExtract = async () => {
    if (!ytUrl.trim()) { toast.error("Paste a YouTube URL"); return; }
    setLoadingYt(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-video", { body: { url: ytUrl } });
      if (error) throw error;
      const video = data?.video;
      if (!video) throw new Error("No video data");
      const thumb = video.thumbnails?.maxres?.url || video.thumbnails?.high?.url || video.thumbnails?.medium?.url;
      if (thumb) {
        const dataUrl = await urlToDataUrl(thumb);
        setRefs(prev => [...prev, { id: crypto.randomUUID(), url: dataUrl, name: `YT: ${video.title.slice(0, 30)}` }]);
      }
      toast.success("YouTube reference imported");
      setShowYt(false);
      setYtUrl("");
    } catch (err: any) {
      toast.error(err.message || "Could not extract");
    }
    setLoadingYt(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Describe your thumbnail"); return; }
    const id = crypto.randomUUID();
    const item: GenItem = {
      id,
      prompt,
      size,
      titleText: titleText.trim() || undefined,
      refs: refs.map(r => r.url),
      loading: true,
    };
    setItems(prev => [...prev, item]);
    setActiveId(id);
    const promptCopy = prompt;
    const titleCopy = titleText.trim();
    const refsCopy = refs.map(r => r.url);
    const sizeCopy = size;
    setPrompt("");
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-thumbnail-generate", {
        body: {
          prompt: promptCopy,
          size: sizeCopy,
          referenceImages: refsCopy,
          titleText: titleCopy || undefined,
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image returned");
      setItems(prev => prev.map(m =>
        m.id === id ? { ...m, loading: false, imageUrl: data.imageUrl, fallback: !!data.fallback } : m
      ));
      if (data.fallback) toast.warning(data.message || "AI was busy — fallback shown");
      else toast.success("Thumbnail generated!");
    } catch (err: any) {
      setItems(prev => prev.map(m =>
        m.id === id ? { ...m, loading: false, error: err.message || "Generation failed" } : m
      ));
      toast.error(err.message || "Generation failed");
    }
    setGenerating(false);
  };

  const downloadOne = async (url: string, sz: string, headline?: string) => {
    const filename = `thumbnail-${slugify(headline || "")}-${sz.replace(":", "x")}-${Date.now()}.png`;
    try {
      await downloadDataUrl(url, filename);
      toast.success("Downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  const copyImage = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success("Image copied");
    } catch {
      toast.error("Copy not supported");
    }
  };

  const downloadAll = async () => {
    const ready = items.filter(i => i.imageUrl);
    if (!ready.length) { toast.error("Nothing to download yet"); return; }
    toast.info(`Downloading ${ready.length}...`);
    for (let i = 0; i < ready.length; i++) {
      const m = ready[i];
      await downloadDataUrl(m.imageUrl!, `thumbnail-${i + 1}-${m.size.replace(":", "x")}-${Date.now()}.png`);
      await new Promise(r => setTimeout(r, 350));
    }
    toast.success("All downloads triggered");
  };

  const generatedCount = items.filter(i => i.imageUrl).length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      <PageHeader
        icon={<Wand2 className="h-5 w-5" />}
        title="AI Thumbnail Studio"
        description="Describe in any language or style — the AI will generate a viral thumbnail."
      />

      {/* Preview area (output above input) */}
      <div className="flex-1 flex flex-col gap-3 py-4">
        {!active ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-10 text-center flex-1 flex flex-col items-center justify-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Describe your thumbnail</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Write a prompt in any language and any style. Add reference images, set a headline, pick an aspect ratio — your generated thumbnail will appear here.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-3 sm:p-4 space-y-3"
          >
            {/* Image / state */}
            {active.loading ? (
              <div
                className="rounded-2xl bg-secondary/40 flex flex-col items-center justify-center text-muted-foreground"
                style={{ aspectRatio: active.size.replace(":", "/"), minHeight: 240 }}
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm font-medium">Generating thumbnail…</p>
                <p className="text-[11px] opacity-60 mt-1">Ultra Media AI · {active.size}</p>
              </div>
            ) : active.error ? (
              <div className="rounded-2xl bg-destructive/10 text-destructive p-6 text-sm text-center">
                {active.error}
              </div>
            ) : active.imageUrl ? (
              <div className="rounded-2xl overflow-hidden relative group ring-1 ring-border">
                <img
                  src={active.imageUrl}
                  alt="Generated thumbnail"
                  className="w-full object-cover cursor-zoom-in"
                  style={{ aspectRatio: active.size.replace(":", "/") }}
                  onClick={() => setLightbox({ url: active.imageUrl!, size: active.size })}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setLightbox({ url: active.imageUrl!, size: active.size })} className="bg-background/80 backdrop-blur hover:bg-primary hover:text-primary-foreground rounded-md p-1.5">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => copyImage(active.imageUrl!)} className="bg-background/80 backdrop-blur hover:bg-primary hover:text-primary-foreground rounded-md p-1.5">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-background/70 backdrop-blur font-medium">
                  {active.size} · {sizeMeta(active.size).w}×{sizeMeta(active.size).h}
                </div>
                <div className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-medium">MU Tech</div>
                {active.fallback && (
                  <div className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-accent text-accent-foreground font-semibold">FALLBACK</div>
                )}
              </div>
            ) : null}

            {/* Action row */}
            {active.imageUrl && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => downloadOne(active.imageUrl!, active.size, active.titleText)} className="flex-1 min-w-[160px] bg-primary hover:bg-primary/90">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download HD PNG
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyImage(active.imageUrl!)}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => setLightbox({ url: active.imageUrl!, size: active.size })}>
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Prompt echo */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              <span className="text-foreground/80 font-medium">Prompt:</span> {active.prompt}
            </p>
          </motion.div>
        )}

        {/* History strip */}
        {items.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-muted-foreground shrink-0">History:</span>
            {items.map(it => (
              <button
                key={it.id}
                onClick={() => setActiveId(it.id)}
                className={`relative shrink-0 h-12 w-20 rounded-lg overflow-hidden border-2 transition ${active?.id === it.id ? "border-primary" : "border-border hover:border-primary/50"}`}
                title={it.prompt}
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    {it.loading ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <X className="h-3 w-3 text-destructive" />}
                  </div>
                )}
              </button>
            ))}
            {generatedCount > 1 && (
              <Button onClick={downloadAll} size="sm" variant="outline" className="ml-auto gap-1 shrink-0">
                <DownloadCloud className="h-3 w-3" /> All ({generatedCount})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Unified Composer (Gemini-style) */}
      <div className="sticky bottom-3 z-10">
        <div className="glass-panel rounded-3xl p-3 shadow-xl border-border/60 backdrop-blur-xl">
          {/* YouTube row */}
          <AnimatePresence>
            {showYt && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 mb-2">
                <Input
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="Paste YouTube URL to use as reference..."
                  className="bg-secondary border-border text-sm h-9"
                />
                <Button onClick={handleYtExtract} disabled={loadingYt} size="sm" variant="outline">
                  {loadingYt ? <Loader2 className="h-3 w-3 animate-spin" /> : "Import"}
                </Button>
                <Button onClick={() => { setShowYt(false); setYtUrl(""); }} size="sm" variant="ghost"><X className="h-3 w-3" /></Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Headline row */}
          <AnimatePresence>
            {showTitle && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2">
                <Input
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder='Headline text on thumbnail (any language)'
                  maxLength={40}
                  className="bg-secondary border-border text-sm h-9"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reference thumbs */}
          {refs.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
              {refs.map((r) => (
                <div key={r.id} className="relative shrink-0 group">
                  <img src={r.url} alt={r.name} className="h-12 w-12 object-cover rounded-lg border border-border" />
                  <button onClick={() => removeRef(r.id)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Prompt */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
            }}
            placeholder="Describe your thumbnail in any language or style..."
            rows={2}
            className="w-full bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground px-2 py-1.5 focus:ring-0"
          />

          {/* Bottom toolbar */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
              className="hidden"
            />

            {/* + add menu (merges all options) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary/70 border border-border flex items-center justify-center transition"
                  title="Add references and options"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Add</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-4 w-4 mr-2" /> Upload images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowYt(v => !v)}>
                  <LinkIcon className="h-4 w-4 mr-2" /> YouTube reference
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTitle(v => !v)}>
                  <Sparkles className="h-4 w-4 mr-2" /> {showTitle ? "Hide" : "Add"} on-image headline
                </DropdownMenuItem>
                {active && active.imageUrl && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setPrompt(active.prompt); if (active.titleText) { setTitleText(active.titleText); setShowTitle(true); } setSize(active.size); }}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Reuse last prompt
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Aspect ratio */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 px-3 rounded-full bg-secondary hover:bg-secondary/70 border border-border flex items-center gap-1.5 text-xs font-medium transition"
                  title="Aspect ratio"
                >
                  {size} <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {sizeOptions.map(s => (
                  <DropdownMenuItem key={s.value} onClick={() => setSize(s.value)} className="text-xs">
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status chips */}
            <div className="hidden sm:flex items-center gap-1 ml-1 text-[10px] text-muted-foreground">
              {refs.length > 0 && <span className="px-1.5 py-0.5 rounded bg-secondary">{refs.length} ref</span>}
              {showTitle && titleText && <span className="px-1.5 py-0.5 rounded bg-secondary truncate max-w-[100px]">"{titleText}"</span>}
            </div>

            {/* Send */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              size="icon"
              className="ml-auto h-9 w-9 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40"
              title="Generate (Enter)"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Enter to generate · Shift+Enter for new line · Works in any language
        </p>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-2 bg-background/95 border-border">
          {lightbox && (
            <div className="space-y-2">
              <img
                src={lightbox.url}
                alt="Full thumbnail"
                className="w-full h-auto rounded-lg"
                style={{ aspectRatio: lightbox.size.replace(":", "/") }}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => copyImage(lightbox.url)}>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
                <Button size="sm" onClick={() => downloadOne(lightbox.url, lightbox.size)}>
                  <Download className="h-3 w-3 mr-1" /> Download HD
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
