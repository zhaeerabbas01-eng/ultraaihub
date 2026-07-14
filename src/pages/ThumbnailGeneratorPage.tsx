import { useState, useRef, useCallback, useEffect } from "react";
import {
  Wand2, Download, Loader2, Sparkles, X, Upload, User, Link as LinkIcon,
  Maximize2, Copy, RefreshCw, Share2, Image as ImageIcon,
  Plus, ArrowUp, SlidersHorizontal, Type, Palette, Languages, Ratio, Layers, Ban,
  Trash2,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  { value: "16:9", label: "16:9 YouTube" },
  { value: "1:1", label: "1:1 Square" },
  { value: "9:16", label: "9:16 Shorts" },
  { value: "4:3", label: "4:3 Standard" },
  { value: "21:9", label: "21:9 Ultra" },
];
const styleOptions = ["Cinematic", "Hyper-real", "3D Render", "Anime", "Cartoon", "MrBeast Viral", "Tech / SaaS Ad", "Gaming", "Vlog", "News", "Minimal Clean", "Retro / Vintage"];
const languageOptions = ["Auto-detect", "English", "Urdu", "Hindi", "Arabic", "Spanish", "French", "German", "Portuguese", "Chinese", "Japanese", "Korean", "Russian", "Turkish"];

const loadingMessages = [
  "Understanding your prompt…",
  "Composing scene & subjects…",
  "Enhancing lighting & color…",
  "Refining facial expression…",
  "Optimizing for maximum CTR…",
  "Rendering final thumbnail…",
];

type Msg =
  | { id: string; role: "user"; text: string; title?: string; size: string; style: string; refs: string[]; face?: string }
  | { id: string; role: "assistant"; size: string; imageUrl?: string; loading?: boolean; error?: string; fallback?: boolean; sourceUserId: string };

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
const urlToDataUrl = async (url: string) => {
  const b = await (await fetch(url)).blob();
  return await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(b); });
};
const downloadDataUrl = async (dataUrl: string, filename: string) => {
  const blob = await (await fetch(dataUrl)).blob();
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = u; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};

export default function ThumbnailGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [language, setLanguage] = useState("Auto-detect");
  const [size, setSize] = useState("16:9");
  const [variations, setVariations] = useState(1);
  const [negative, setNegative] = useState("");
  const [refImages, setRefImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [faceImage, setFaceImage] = useState<{ url: string; name: string } | null>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; size: string } | null>(null);

  const refInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, generating]);
  useEffect(() => { textareaRef.current?.focus(); }, []);
  useEffect(() => {
    if (!generating) { setLoadingMsgIdx(0); return; }
    const t = setInterval(() => setLoadingMsgIdx(i => (i + 1) % loadingMessages.length), 1400);
    return () => clearInterval(t);
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

  const buildPrompt = (text: string) => {
    const parts = [text.trim()];
    if (style) parts.push(`Style: ${style}.`);
    if (language && language !== "Auto-detect") parts.push(`Language of text: ${language}.`);
    if (negative.trim()) parts.push(`Avoid: ${negative.trim()}.`);
    if (faceImage) parts.push("Use the provided face reference for the main subject.");
    return parts.filter(Boolean).join(" ");
  };

  const handleSend = async () => {
    const text = prompt.trim();
    if (!text) { toast.error("Describe your thumbnail"); return; }
    const userId = crypto.randomUUID();
    const userMsg: Msg = {
      id: userId, role: "user", text, title: title.trim() || undefined, size, style,
      refs: refImages.map(r => r.url), face: faceImage?.url,
    };
    setMessages(p => [...p, userMsg]);
    setPrompt("");
    setGenerating(true);

    const finalPrompt = buildPrompt(text);
    const refs = [...refImages.map(r => r.url), ...(faceImage ? [faceImage.url] : [])];

    try {
      for (let i = 0; i < variations; i++) {
        const aid = crypto.randomUUID();
        setMessages(p => [...p, { id: aid, role: "assistant", size, loading: true, sourceUserId: userId }]);
        try {
          const { data, error } = await supabase.functions.invoke("ai-thumbnail-generate", {
            body: {
              prompt: `${finalPrompt}${variations > 1 ? ` (Variation ${i + 1} of ${variations} — vary composition & angle)` : ""}`,
              size, referenceImages: refs, titleText: title.trim() || undefined,
            },
          });
          if (error) throw error;
          if (!data?.imageUrl) throw new Error("No image returned");
          setMessages(p => p.map(m => m.id === aid ? { ...m, loading: false, imageUrl: data.imageUrl, fallback: !!data.fallback } as Msg : m));
          if (data.fallback) toast.warning(data.message || "Fallback shown");
        } catch (e: any) {
          setMessages(p => p.map(m => m.id === aid ? { ...m, loading: false, error: e.message || "Failed" } as Msg : m));
        }
      }
    } finally {
      setGenerating(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const downloadImg = async (url: string, sz: string) => {
    try { await downloadDataUrl(url, `ultra-thumbnail-${sz.replace(":", "x")}-${Date.now()}.png`); toast.success("Downloaded"); }
    catch { toast.error("Download failed"); }
  };
  const copyImg = async (url: string) => {
    try { const b = await (await fetch(url)).blob(); // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ [b.type]: b })]); toast.success("Copied");
    } catch { toast.error("Copy not supported"); }
  };
  const shareImg = async (url: string) => {
    try {
      const b = await (await fetch(url)).blob();
      const file = new File([b], "thumbnail.png", { type: b.type });
      // @ts-ignore
      if (navigator.canShare?.({ files: [file] })) { // @ts-ignore
        await navigator.share({ files: [file], title: "Ultra Media AI Thumbnail" });
      } else { await copyImg(url); }
    } catch {}
  };
  const regenerate = async (sourceUserId: string) => {
    const u = messages.find(m => m.id === sourceUserId);
    if (!u || u.role !== "user") return;
    setPrompt(u.text);
    setTimeout(() => handleSend(), 0);
  };
  const clearChat = () => { setMessages([]); toast.success("Chat cleared"); };

  return (
    <div className="relative flex flex-col h-[calc(100vh-6rem)]">
      <SEO title="AI Thumbnail Generator — Ultra Media AI" description="Chat with AI to generate high-CTR YouTube thumbnails in any language or style." path="/thumbnail-generator" />

      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-[0_0_25px_-4px_rgba(34,211,238,0.6)]">
            <Wand2 className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold leading-tight">AI Thumbnail Chat</h1>
            <p className="text-[11px] text-muted-foreground">Describe. Generate. Download. In any language.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearChat} className="text-xs text-muted-foreground hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Chat thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6 scroll-smooth">
        {messages.length === 0 && !generating ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6">
              <motion.div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 blur-xl absolute inset-0"
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-cyan-300/70" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Start a thumbnail conversation</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-5">
              Type your idea below and tap send. Add reference images, faces, or a YouTube URL from the <b className="text-cyan-300">+</b> menu.
            </p>
            <div className="w-full max-w-md rounded-2xl overflow-hidden ring-1 ring-white/10">
              <video src={demoVideo.url} autoPlay loop muted playsInline className="w-full h-auto" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-xl">
              {["MrBeast style $10,000 challenge", "Cinematic AI tech ad thumbnail", "Shocking finance headline", "Gaming stream face-cam"].map(s => (
                <button key={s} onClick={() => setPrompt(s)} className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-2 sm:px-4 space-y-6">
            {messages.map(m => m.role === "user" ? (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-gradient-to-br from-cyan-500/90 to-sky-500/90 text-slate-950 px-4 py-3 shadow-[0_4px_20px_-6px_rgba(34,211,238,0.5)]">
                  {(m.refs.length > 0 || m.face) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {m.refs.map((r, i) => <img key={i} src={r} className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-950/20" />)}
                      {m.face && <div className="relative"><img src={m.face} className="h-12 w-12 rounded-lg object-cover ring-2 ring-slate-950/40" /><span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-slate-950 text-cyan-300 px-1 rounded font-bold">FACE</span></div>}
                    </div>
                  )}
                  <p className="text-sm font-medium whitespace-pre-wrap break-words">{m.text}</p>
                  {m.title && <p className="text-[11px] mt-1 opacity-80">Title: “{m.title}”</p>}
                  <p className="text-[10px] mt-1 opacity-70">{m.style} · {m.size}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(217,70,239,0.6)]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[85%] flex-1">
                  {m.loading ? (
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                      <AnimatePresence mode="wait">
                        <motion.span key={loadingMsgIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="text-sm text-muted-foreground">{loadingMessages[loadingMsgIdx]}</motion.span>
                      </AnimatePresence>
                    </div>
                  ) : m.error ? (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 p-4 text-sm">{m.error}</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative group rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-fuchsia-500/30 blur-md -z-10" />
                        <img src={m.imageUrl} alt="AI thumbnail" className="w-full object-cover cursor-zoom-in" style={{ aspectRatio: m.size.replace(":", "/") }}
                          onClick={() => setLightbox({ url: m.imageUrl!, size: m.size })} />
                        {m.fallback && <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">FALLBACK</span>}
                        <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white/80">Ultra Media AI · {m.size}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" onClick={() => downloadImg(m.imageUrl!, m.size)} className="h-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs">
                          <Download className="h-3.5 w-3.5 mr-1" /> Download HD
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => regenerate(m.sourceUserId)} className="h-8 border-white/10 text-xs">
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setLightbox({ url: m.imageUrl!, size: m.size })} className="h-8 border-white/10 text-xs">
                          <Maximize2 className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => shareImg(m.imageUrl!)} className="h-8 border-white/10 text-xs">
                          <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyImg(m.imageUrl!)} className="h-8 w-8 p-0 border-white/10">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="pt-3 border-t border-white/5 max-w-3xl mx-auto w-full">
        <input ref={refInputRef} type="file" accept="image/*" multiple hidden onChange={e => { handleRefFiles(e.target.files); e.target.value = ""; }} />
        <input ref={faceInputRef} type="file" accept="image/*" hidden onChange={e => { handleFaceFile(e.target.files); e.target.value = ""; }} />

        {(refImages.length > 0 || faceImage) && (
          <div className="flex flex-wrap gap-2 px-2 pb-2">
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

        <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(34,211,238,0.4)] focus-within:border-cyan-400/50 focus-within:shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)] transition-all">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message Ultra Media AI… (any language)"
            rows={2}
            className="bg-transparent border-0 focus-visible:ring-0 resize-none text-sm px-5 pt-3.5 pb-1 min-h-[64px] max-h-40"
          />

          {/* Visible quick toolbar — all controls in one line */}
          <div className="flex flex-wrap items-center gap-1.5 px-2.5 pt-1 pb-1.5 border-t border-white/5">
            <button onClick={() => refInputRef.current?.click()} title="Upload reference image"
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/40 text-muted-foreground hover:text-cyan-200 transition">
              <Upload className="h-3 w-3" /> Image
            </button>
            <button onClick={() => faceInputRef.current?.click()} title="Add face reference"
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] bg-white/5 hover:bg-fuchsia-400/15 border border-white/10 hover:border-fuchsia-400/40 text-muted-foreground hover:text-fuchsia-200 transition">
              <User className="h-3 w-3" /> Face
            </button>

            {/* YouTube popover trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button title="Import YouTube thumbnail"
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] bg-white/5 hover:bg-red-400/15 border border-white/10 hover:border-red-400/40 text-muted-foreground hover:text-red-200 transition">
                  <LinkIcon className="h-3 w-3" /> YouTube
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-white/10">
                <SheetHeader><SheetTitle className="text-left">Import from YouTube</SheetTitle></SheetHeader>
                <div className="flex gap-2 mt-4">
                  <Input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" className="bg-black/40 border-white/10 text-sm h-10" />
                  <Button onClick={importYouTube} className="h-10">Import</Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">The video's thumbnail will be added as a reference image.</p>
              </SheetContent>
            </Sheet>

            <div className="h-4 w-px bg-white/10 mx-0.5" />

            {/* Style */}
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-7 w-auto gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 text-[11px] hover:bg-white/10 [&>svg]:h-3 [&>svg]:w-3">
                <Palette className="h-3 w-3 text-cyan-300 mr-0.5" /><SelectValue />
              </SelectTrigger>
              <SelectContent>{styleOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>

            {/* Language */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-7 w-auto gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 text-[11px] hover:bg-white/10 [&>svg]:h-3 [&>svg]:w-3">
                <Languages className="h-3 w-3 text-cyan-300 mr-0.5" /><SelectValue />
              </SelectTrigger>
              <SelectContent>{languageOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>

            {/* Aspect */}
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="h-7 w-auto gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 text-[11px] hover:bg-white/10 [&>svg]:h-3 [&>svg]:w-3">
                <Ratio className="h-3 w-3 text-cyan-300 mr-0.5" /><SelectValue />
              </SelectTrigger>
              <SelectContent>{sizeOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>

            {/* Variations */}
            <Select value={String(variations)} onValueChange={v => setVariations(Number(v))}>
              <SelectTrigger className="h-7 w-auto gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 text-[11px] hover:bg-white/10 [&>svg]:h-3 [&>svg]:w-3">
                <Layers className="h-3 w-3 text-cyan-300 mr-0.5" />×<SelectValue />
              </SelectTrigger>
              <SelectContent>{[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n} variation{n > 1 ? "s" : ""}</SelectItem>)}</SelectContent>
            </Select>

            <div className="h-4 w-px bg-white/10 mx-0.5" />

            {/* Title + Negative (advanced) */}
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <button title="Headline & advanced"
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border transition ${title || negative ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-200" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"}`}>
                  <Type className="h-3 w-3" /> {title ? `“${title.slice(0, 14)}${title.length > 14 ? "…" : ""}”` : "Headline"}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-white/10 w-full sm:max-w-md overflow-y-auto">
                <SheetHeader><SheetTitle>Headline & Advanced</SheetTitle></SheetHeader>
                <div className="mt-6 space-y-5">
                  <div>
                    <Label className="text-xs mb-1.5 flex items-center gap-1.5"><Type className="h-3.5 w-3.5 text-cyan-300" /> On-thumbnail Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bold headline shown ON the thumbnail (optional)" maxLength={40} className="bg-black/40 border-white/10" />
                    <p className="text-[10px] text-muted-foreground mt-1">Exact text preserved — any language. Max 40 chars.</p>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 flex items-center gap-1.5"><Ban className="h-3.5 w-3.5 text-cyan-300" /> Negative Prompt</Label>
                    <Textarea value={negative} onChange={e => setNegative(e.target.value)} placeholder="blurry, low quality, extra fingers, distorted…" rows={3} className="bg-black/40 border-white/10 resize-none" />
                  </div>
                  <Button onClick={() => setSettingsOpen(false)} className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white">Done</Button>
                </div>
              </SheetContent>
            </Sheet>

            {(refImages.length + (faceImage ? 1 : 0)) > 0 && (
              <span className="ml-auto rounded-full px-2 py-1 text-[10px] bg-fuchsia-400/15 text-fuchsia-300 border border-fuchsia-400/30">
                📎 {refImages.length + (faceImage ? 1 : 0)} attached
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
            <p className="text-[10px] text-muted-foreground pl-2">Enter to send · Shift+Enter for newline</p>
            <Button
              onClick={handleSend}
              disabled={generating || !prompt.trim()}
              size="icon"
              className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 hover:opacity-90 text-slate-950 shadow-[0_0_25px_-4px_rgba(34,211,238,0.7)] disabled:opacity-40"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-2 mb-1">
          All controls above · Any language · Enter to generate
        </p>
      </div>




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
