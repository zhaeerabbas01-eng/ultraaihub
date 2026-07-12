import { useState, useRef, useCallback, useEffect } from "react";
import {
  Wand2, Download, Loader2, Sparkles, X, Upload, User, Link as LinkIcon,
  Maximize2, Copy, RefreshCw, Share2, Trash2, Image as ImageIcon,
  Plus, ArrowUp, Settings2, Type, Palette, Languages, Ratio, Layers, Ban,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import demoVideo from "@/assets/thumb-magic.mp4.asset.json";

const sizeOptions = [
  { value: "16:9", label: "16:9 YouTube", w: 1280, h: 720 },
  { value: "1:1", label: "1:1 Square", w: 1080, h: 1080 },
  { value: "9:16", label: "9:16 Shorts", w: 1080, h: 1920 },
  { value: "4:3", label: "4:3 Standard", w: 1280, h: 960 },
  { value: "21:9", label: "21:9 Ultra", w: 1680, h: 720 },
];

const styleOptions = [
  "Cinematic", "Hyper-real", "3D Render", "Anime", "Cartoon", "MrBeast Viral",
  "Tech / SaaS Ad", "Gaming", "Vlog", "News", "Minimal Clean", "Retro / Vintage",
];

const languageOptions = [
  "Auto-detect", "English", "Urdu", "Hindi", "Arabic", "Spanish", "French",
  "German", "Portuguese", "Chinese", "Japanese", "Korean", "Russian", "Turkish",
];

const loadingMessages = [
  "🧠 Understanding your prompt…",
  "🎨 Composing scene & subjects…",
  "✨ Enhancing lighting & color…",
  "😊 Refining facial expression…",
  "🚀 Optimizing for maximum CTR…",
  "📸 Rendering final thumbnail…",
];

type GenItem = {
  id: string;
  prompt: string;
  size: string;
  title?: string;
  imageUrl?: string;
  loading?: boolean;
  error?: string;
  fallback?: boolean;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const urlToDataUrl = async (url: string) => {
  const b = await (await fetch(url)).blob();
  return await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });
};

const downloadDataUrl = async (dataUrl: string, filename: string) => {
  const blob = await (await fetch(dataUrl)).blob();
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};

export default function ThumbnailGeneratorPage() {
  // Inputs
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [language, setLanguage] = useState("Auto-detect");
  const [size, setSize] = useState("16:9");
  const [variations, setVariations] = useState(1);
  const [negative, setNegative] = useState("");
  const [showNegative, setShowNegative] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refImages, setRefImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [faceImage, setFaceImage] = useState<{ url: string; name: string } | null>(null);

  // State
  const [items, setItems] = useState<GenItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lightbox, setLightbox] = useState<{ url: string; size: string } | null>(null);

  const refInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const active = items.find(i => i.id === activeId) || items[items.length - 1];

  // Rotate loading messages + progress
  useEffect(() => {
    if (!generating) { setLoadingMsgIdx(0); setProgress(0); return; }
    const msgTimer = setInterval(() => setLoadingMsgIdx(i => (i + 1) % loadingMessages.length), 1400);
    const progTimer = setInterval(() => setProgress(p => (p < 92 ? p + Math.random() * 5 : p)), 400);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [generating]);

  const handleRefFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const next: typeof refImages = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 4 * 1024 * 1024) { toast.error(`${f.name} > 4MB`); continue; }
      try { next.push({ id: crypto.randomUUID(), url: await fileToDataUrl(f), name: f.name }); } catch {}
    }
    if (next.length) { setRefImages(p => [...p, ...next]); toast.success(`${next.length} added`); }
  }, []);

  const handleFaceFile = useCallback(async (files: FileList | null) => {
    const f = files?.[0]; if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast.error("Face image > 4MB"); return; }
    try { setFaceImage({ url: await fileToDataUrl(f), name: f.name }); toast.success("Face image added"); } catch {}
  }, []);

  const importYouTube = async () => {
    if (!ytUrl.trim()) { toast.error("Paste a YouTube URL"); return; }
    try {
      const { data, error } = await supabase.functions.invoke("youtube-video", { body: { url: ytUrl } });
      if (error) throw error;
      const t = data?.video?.thumbnails;
      const thumb = t?.maxres?.url || t?.high?.url || t?.medium?.url;
      if (!thumb) throw new Error("No thumbnail");
      const url = await urlToDataUrl(thumb);
      setRefImages(p => [...p, { id: crypto.randomUUID(), url, name: `YT: ${data.video.title.slice(0, 30)}` }]);
      toast.success("YouTube reference imported");
      setYtUrl("");
    } catch (e: any) { toast.error(e.message || "Failed to import"); }
  };

  const buildPrompt = () => {
    const parts = [prompt.trim()];
    if (style) parts.push(`Style: ${style}.`);
    if (language && language !== "Auto-detect") parts.push(`Language of text: ${language}.`);
    if (negative.trim()) parts.push(`Avoid: ${negative.trim()}.`);
    if (faceImage) parts.push("Use the provided face reference for the main subject.");
    return parts.filter(Boolean).join(" ");
  };

  const generateOne = async (idx: number, total: number) => {
    const id = crypto.randomUUID();
    const item: GenItem = { id, prompt: buildPrompt(), size, title: title.trim() || undefined, loading: true };
    setItems(p => [...p, item]);
    setActiveId(id);
    const refs = [...refImages.map(r => r.url), ...(faceImage ? [faceImage.url] : [])];
    try {
      const { data, error } = await supabase.functions.invoke("ai-thumbnail-generate", {
        body: {
          prompt: `${item.prompt}${total > 1 ? ` (Variation ${idx + 1} of ${total} — vary composition & angle)` : ""}`,
          size,
          referenceImages: refs,
          titleText: title.trim() || undefined,
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image returned");
      setItems(p => p.map(m => m.id === id ? { ...m, loading: false, imageUrl: data.imageUrl, fallback: !!data.fallback } : m));
      if (data.fallback) toast.warning(data.message || "Fallback shown");
    } catch (e: any) {
      setItems(p => p.map(m => m.id === id ? { ...m, loading: false, error: e.message || "Failed" } : m));
      throw e;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Describe your thumbnail"); return; }
    setGenerating(true);
    try {
      for (let i = 0; i < variations; i++) await generateOne(i, variations);
      setProgress(100);
      toast.success(`${variations} thumbnail${variations > 1 ? "s" : ""} generated!`);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setTimeout(() => setGenerating(false), 300);
    }
  };

  const downloadImg = async (url: string, sz: string) => {
    try { await downloadDataUrl(url, `ultra-thumbnail-${sz.replace(":", "x")}-${Date.now()}.png`); toast.success("Downloaded"); }
    catch { toast.error("Download failed"); }
  };

  const copyImg = async (url: string) => {
    try {
      const b = await (await fetch(url)).blob();
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ [b.type]: b })]);
      toast.success("Copied");
    } catch { toast.error("Copy not supported"); }
  };

  const shareImg = async (url: string) => {
    try {
      const b = await (await fetch(url)).blob();
      const file = new File([b], "thumbnail.png", { type: b.type });
      // @ts-ignore
      if (navigator.canShare?.({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ files: [file], title: "Ultra Media AI Thumbnail" });
      } else {
        await copyImg(url);
      }
    } catch {}
  };

  const reusePrompt = (it: GenItem) => {
    setPrompt(it.prompt);
    if (it.title) setTitle(it.title);
    setSize(it.size);
  };

  const deleteItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  return (
    <div className="relative min-h-[calc(100vh-6rem)]">
      <SEO title="AI Thumbnail Generator — Ultra Media AI" description="Generate high-CTR YouTube thumbnails with AI. Any language, any style, unlimited reference images." path="/thumbnail-generator" />

      {/* Animated aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-24 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[120px] animate-pulse" style={{ animationDelay: "2.5s" }} />
        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-300/40"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-[0_0_30px_-4px_rgba(34,211,238,0.6)]">
          <Wand2 className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">AI Thumbnail Generator</h1>
          <p className="text-xs text-muted-foreground">Generate high-CTR YouTube thumbnails with AI · Ultra Media AI</p>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]">
        {/* LEFT: Controls */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-[0_0_40px_-15px_rgba(34,211,238,0.4)] space-y-4 h-fit lg:sticky lg:top-4"
        >
          <div>
            <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Prompt</Label>
            <Textarea
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your thumbnail — any language. E.g. 'Shocked developer face, glowing laptop, neon SaaS launch banner'"
              rows={4}
              className="bg-black/40 border-white/10 focus:border-cyan-400/60 focus:ring-cyan-400/30 resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input ref={refInputRef} type="file" accept="image/*" multiple hidden onChange={e => { handleRefFiles(e.target.files); e.target.value = ""; }} />
            <input ref={faceInputRef} type="file" accept="image/*" hidden onChange={e => { handleFaceFile(e.target.files); e.target.value = ""; }} />
            <Button variant="outline" size="sm" onClick={() => refInputRef.current?.click()} className="border-white/10 bg-black/30 hover:bg-white/5 justify-start">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Image
            </Button>
            <Button variant="outline" size="sm" onClick={() => faceInputRef.current?.click()} className="border-white/10 bg-black/30 hover:bg-white/5 justify-start">
              <User className="h-3.5 w-3.5 mr-1.5" /> Upload Face
            </Button>
          </div>

          {(refImages.length > 0 || faceImage) && (
            <div className="flex flex-wrap gap-2">
              {refImages.map(r => (
                <div key={r.id} className="relative group">
                  <img src={r.url} alt={r.name} className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10" />
                  <button onClick={() => setRefImages(p => p.filter(x => x.id !== r.id))} className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
              {faceImage && (
                <div className="relative">
                  <img src={faceImage.url} alt="face" className="h-12 w-12 rounded-lg object-cover ring-2 ring-cyan-400/70" />
                  <button onClick={() => setFaceImage(null)} className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-cyan-400 text-slate-950 px-1 rounded font-bold">FACE</span>
                </div>
              )}
            </div>
          )}

          <div>
            <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block flex items-center gap-1.5">
              <LinkIcon className="h-3 w-3" /> YouTube URL
            </Label>
            <div className="flex gap-2">
              <Input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-black/40 border-white/10 text-sm" />
              <Button size="sm" variant="secondary" onClick={importYouTube}>Import</Button>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Thumbnail Title (optional)</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bold headline on thumbnail" maxLength={40} className="bg-black/40 border-white/10 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-black/40 border-white/10 text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{styleOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-black/40 border-white/10 text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{languageOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Aspect Ratio</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="bg-black/40 border-white/10 text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{sizeOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1.5 block">Variations</Label>
              <Select value={String(variations)} onValueChange={v => setVariations(Number(v))}>
                <SelectTrigger className="bg-black/40 border-white/10 text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Collapsibles */}
          <button onClick={() => setShowNegative(v => !v)} className="w-full flex items-center justify-between text-xs text-cyan-300/80 hover:text-cyan-300 pt-2">
            <span className="uppercase tracking-wider">Negative Prompt</span>
            {showNegative ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>{showNegative && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Textarea value={negative} onChange={e => setNegative(e.target.value)} placeholder="Blurry, low quality, extra fingers, watermark..." rows={2} className="bg-black/40 border-white/10 text-sm resize-none" />
            </motion.div>
          )}</AnimatePresence>

          <button onClick={() => setShowAdvanced(v => !v)} className="w-full flex items-center justify-between text-xs text-cyan-300/80 hover:text-cyan-300">
            <span className="uppercase tracking-wider">Advanced Settings</span>
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>{showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-muted-foreground bg-black/20 rounded-lg p-3 space-y-1">
              <p>• References sent: <b>{refImages.length + (faceImage ? 1 : 0)}</b></p>
              <p>• Output size: <b>{sizeOptions.find(s => s.value === size)?.w}×{sizeOptions.find(s => s.value === size)?.h}</b></p>
              <p>• Model: <b>Gemini 3.1 Flash Image (via Lovable AI)</b></p>
            </motion.div>
          )}</AnimatePresence>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 hover:opacity-90 text-slate-950 shadow-[0_0_40px_-8px_rgba(34,211,238,0.8)] rounded-2xl"
            >
              {generating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
              {generating ? "Generating…" : "Generate Thumbnail"}
            </Button>
          </motion.div>
        </motion.aside>

        {/* RIGHT: Preview */}
        <motion.section
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6 shadow-[0_0_40px_-15px_rgba(217,70,239,0.35)] min-h-[500px] flex flex-col"
        >
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-6">
                <motion.div
                  className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 blur-xl absolute inset-0"
                  animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center">
                  <ImageIcon className="h-14 w-14 text-cyan-300/70" />
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Your AI Thumbnail will appear here</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Fill in your prompt on the left, add reference images, and hit <b className="text-cyan-300">Generate Thumbnail</b>.
              </p>
              <div className="w-full max-w-lg rounded-2xl overflow-hidden ring-1 ring-white/10">
                <video src={demoVideo.url} autoPlay loop muted playsInline className="w-full h-auto" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Live preview of what Ultra Media AI can generate</p>
            </div>
          ) : (
            <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {active.loading ? (
                <div className="rounded-2xl bg-black/40 flex items-center justify-center" style={{ aspectRatio: active.size.replace(":", "/"), minHeight: 300 }}>
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                </div>
              ) : active.error ? (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 p-8 text-center">{active.error}</div>
              ) : (
                <div className="relative group rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400/40 to-fuchsia-500/40 blur-md -z-10" />
                  <img
                    src={active.imageUrl}
                    alt="AI generated thumbnail"
                    className="w-full object-cover cursor-zoom-in"
                    style={{ aspectRatio: active.size.replace(":", "/") }}
                    onClick={() => setLightbox({ url: active.imageUrl!, size: active.size })}
                  />
                  {active.fallback && <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">FALLBACK</span>}
                  <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white/80">Ultra Media AI · {active.size}</span>
                </div>
              )}

              {active.imageUrl && (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => downloadImg(active.imageUrl!, active.size)} className="flex-1 min-w-[140px] bg-cyan-500 hover:bg-cyan-400 text-slate-950">
                    <Download className="h-4 w-4 mr-1.5" /> Download HD
                  </Button>
                  <Button variant="outline" onClick={handleGenerate} className="border-white/10">
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Regenerate
                  </Button>
                  <Button variant="outline" onClick={() => reusePrompt(active)} className="border-white/10">
                    <Wand2 className="h-4 w-4 mr-1.5" /> Edit
                  </Button>
                  <Button variant="outline" onClick={() => setLightbox({ url: active.imageUrl!, size: active.size })} className="border-white/10">
                    <Maximize2 className="h-4 w-4 mr-1.5" /> Upscale View
                  </Button>
                  <Button variant="outline" onClick={() => shareImg(active.imageUrl!)} className="border-white/10">
                    <Share2 className="h-4 w-4 mr-1.5" /> Share
                  </Button>
                  <Button variant="outline" onClick={() => copyImg(active.imageUrl!)} className="border-white/10">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* History strip */}
          {items.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-cyan-300/70 mb-2">Recent Generations</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {items.slice().reverse().map(it => (
                  <div key={it.id} className="relative shrink-0 group">
                    <button
                      onClick={() => setActiveId(it.id)}
                      className={`h-16 w-28 rounded-lg overflow-hidden border-2 transition ${active?.id === it.id ? "border-cyan-400 shadow-[0_0_15px_-2px_rgba(34,211,238,0.6)]" : "border-white/10 hover:border-cyan-400/50"}`}
                    >
                      {it.imageUrl ? <img src={it.imageUrl} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full bg-black/40 flex items-center justify-center">
                          {it.loading ? <Loader2 className="h-3 w-3 animate-spin text-cyan-400" /> : <X className="h-3 w-3 text-red-400" />}
                        </div>}
                    </button>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/60 rounded-lg flex items-center justify-center gap-1">
                      {it.imageUrl && <button onClick={() => downloadImg(it.imageUrl!, it.size)} className="p-1 rounded bg-white/10 hover:bg-white/20"><Download className="h-3 w-3 text-white" /></button>}
                      <button onClick={() => reusePrompt(it)} className="p-1 rounded bg-white/10 hover:bg-white/20"><RefreshCw className="h-3 w-3 text-white" /></button>
                      <button onClick={() => deleteItem(it.id)} className="p-1 rounded bg-red-500/70 hover:bg-red-500"><Trash2 className="h-3 w-3 text-white" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* LOADING OVERLAY */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-10 max-w-md w-[90%] text-center shadow-[0_0_80px_-20px_rgba(34,211,238,0.6)]"
            >
              {/* Orb */}
              <div className="relative h-32 w-32 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{ borderTopColor: "rgb(34 211 238)", borderRightColor: "rgb(217 70 239)" }}
                  animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border-4 border-transparent"
                  style={{ borderBottomColor: "rgb(56 189 248)", borderLeftColor: "rgb(232 121 249)" }}
                  animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 blur-md"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400/80 to-fuchsia-500/80 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                {/* orbiting particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 top-1/2 left-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${40 + i * 8}px 0px` }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="text-lg font-medium mb-4"
                >
                  {loadingMessages[loadingMsgIdx]}
                </motion.p>
              </AnimatePresence>

              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-cyan-300/80 font-mono">{Math.floor(progress)}%</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={o => !o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-2 bg-background/95 border-white/10">
          {lightbox && (
            <div className="space-y-2">
              <img src={lightbox.url} alt="Full" className="w-full h-auto rounded-lg" style={{ aspectRatio: lightbox.size.replace(":", "/") }} />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => copyImg(lightbox.url)}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
                <Button size="sm" onClick={() => downloadImg(lightbox.url, lightbox.size)}><Download className="h-3 w-3 mr-1" /> Download HD</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
