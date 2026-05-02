import { useState, useRef, useCallback, useEffect } from "react";
import {
  Wand2, Download, Loader2, Sparkles, X,
  Send, Link as LinkIcon, RefreshCw, Paperclip, Maximize2, Copy, DownloadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sizeOptions = [
  { value: "16:9", label: "16:9 — YouTube", w: 1280, h: 720 },
  { value: "1:1", label: "1:1 — Square", w: 1080, h: 1080 },
  { value: "9:16", label: "9:16 — Shorts/Reels", w: 1080, h: 1920 },
  { value: "4:3", label: "4:3 — Standard", w: 1280, h: 960 },
  { value: "21:9", label: "21:9 — Ultra Wide", w: 1680, h: 720 },
];

const sizeMeta = (v: string) => sizeOptions.find(s => s.value === v) ?? sizeOptions[0];

type ChatMessage =
  | { id: string; role: "user"; text: string; refs: string[]; size: string; titleText?: string; ytUrl?: string }
  | { id: string; role: "assistant"; imageUrl?: string; loading?: boolean; error?: string; fallback?: boolean; size: string; titleText?: string };

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [titleText, setTitleText] = useState("");
  const [refs, setRefs] = useState<{ id: string; url: string; name: string }[]>([]);
  const [size, setSize] = useState("16:9");
  const [ytUrl, setYtUrl] = useState("");
  const [showYt, setShowYt] = useState(false);
  const [loadingYt, setLoadingYt] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, generating]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return;
    const newRefs: { id: string; url: string; name: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} is over 4MB — skipped`);
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
      toast.success(`${newRefs.length} reference image(s) added`);
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
      if (!prompt.trim()) setPrompt(`Thumbnail in the style of: ${video.title}`);
      toast.success("YouTube thumbnail imported as reference!");
      setShowYt(false);
      setYtUrl("");
    } catch (err: any) {
      toast.error(err.message || "Could not extract YouTube data");
    }
    setLoadingYt(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Describe your thumbnail"); return; }
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: prompt,
      refs: refs.map(r => r.url),
      size,
      titleText: titleText.trim() || undefined,
      ytUrl: ytUrl || undefined,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      loading: true,
      size,
      titleText: titleText.trim() || undefined,
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
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
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id
          ? { ...m, loading: false, imageUrl: data.imageUrl, fallback: !!data.fallback }
          : m
      ));
      if (data.fallback) toast.warning(data.message || "AI was busy — fallback shown");
      else toast.success("Thumbnail generated!");
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, loading: false, error: err.message || "Generation failed" } : m
      ));
      toast.error(err.message || "Generation failed");
    }
    setGenerating(false);
  };

  const reuse = (userMsg: Extract<ChatMessage, { role: "user" }>) => {
    setPrompt(userMsg.text);
    setSize(userMsg.size);
    if (userMsg.titleText) setTitleText(userMsg.titleText);
    toast.info("Prompt restored — tweak and hit generate");
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
      // @ts-ignore - ClipboardItem may be missing in TS lib
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success("Image copied to clipboard");
    } catch {
      toast.error("Copy not supported in this browser");
    }
  };

  const downloadAll = async () => {
    const items = messages.filter((m): m is Extract<ChatMessage, { role: "assistant" }> => m.role === "assistant" && !!m.imageUrl);
    if (!items.length) { toast.error("No generated thumbnails yet"); return; }
    toast.info(`Downloading ${items.length} thumbnail(s)...`);
    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      await downloadDataUrl(m.imageUrl!, `thumbnail-${i + 1}-${m.size.replace(":", "x")}-${Date.now()}.png`);
      await new Promise(r => setTimeout(r, 350));
    }
    toast.success("All downloads triggered");
  };

  const generatedCount = messages.filter(m => m.role === "assistant" && m.imageUrl).length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        icon={<Wand2 className="h-5 w-5" />}
        title="AI Thumbnail Studio"
        description="Chat with AI to design viral thumbnails — add references, paste YouTube links, generate unlimited variations."
      />

      {generatedCount > 0 && (
        <div className="flex justify-end mb-2">
          <Button onClick={downloadAll} size="sm" variant="outline" className="gap-1">
            <DownloadCloud className="h-3 w-3" /> Download all ({generatedCount})
          </Button>
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-8 text-center"
          >
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Start designing</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Describe your thumbnail, optionally pin a headline text, attach unlimited reference images, paste a YouTube link to copy a style, and pick an aspect ratio.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 max-w-xl mx-auto">
              {[
                "Viral SaaS launch — shocked founder + dashboard",
                "Free Shopify alternative reveal",
                "AI tool unboxing — futuristic neon",
                "MrBeast giant cash explosion",
                "Tech review minimal product shot",
                "Tutorial bold text + arrow",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-xs glass-panel rounded-lg p-2 hover:border-primary/50 transition text-left text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "user" ? (
                <div className="max-w-[85%] glass-panel rounded-2xl rounded-tr-sm p-3 space-y-2 border-primary/30">
                  {m.refs.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {m.refs.map((url, i) => (
                        <img key={i} src={url} alt="ref" className="w-full h-14 object-cover rounded-md" />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap">{m.text}</p>
                  {m.titleText && (
                    <p className="text-[11px] text-primary/90 font-semibold">Headline: "{m.titleText}"</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-secondary">{m.size}</span>
                    {m.refs.length > 0 && <span>{m.refs.length} reference(s)</span>}
                    <button onClick={() => reuse(m)} className="ml-auto hover:text-primary flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> reuse
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-[90%] w-full glass-panel rounded-2xl rounded-tl-sm p-3 space-y-2">
                  {m.loading ? (
                    <div
                      className="rounded-xl bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground"
                      style={{ aspectRatio: m.size.replace(":", "/"), minHeight: 220 }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-xs">Generating thumbnail...</p>
                      <p className="text-[10px] opacity-60 mt-1">Ultra Media AI · {m.size}</p>
                    </div>
                  ) : m.error ? (
                    <div className="text-sm text-destructive p-3">{m.error}</div>
                  ) : m.imageUrl ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-xl overflow-hidden relative group ring-1 ring-border"
                      >
                        <img
                          src={m.imageUrl}
                          alt="Generated thumbnail"
                          className="w-full object-cover cursor-zoom-in"
                          style={{ aspectRatio: m.size.replace(":", "/") }}
                          onClick={() => setLightbox({ url: m.imageUrl!, size: m.size })}
                        />

                        {/* Hover toolbar */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setLightbox({ url: m.imageUrl!, size: m.size })}
                            className="bg-background/80 backdrop-blur hover:bg-primary hover:text-primary-foreground rounded-md p-1.5 transition"
                            title="View full size"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => copyImage(m.imageUrl!)}
                            className="bg-background/80 backdrop-blur hover:bg-primary hover:text-primary-foreground rounded-md p-1.5 transition"
                            title="Copy image"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => downloadOne(m.imageUrl!, m.size, m.titleText)}
                            className="bg-background/80 backdrop-blur hover:bg-primary hover:text-primary-foreground rounded-md p-1.5 transition"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Aspect chip */}
                        <div className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-background/70 backdrop-blur text-foreground/80 font-medium">
                          {m.size} · {sizeMeta(m.size).w}×{sizeMeta(m.size).h}
                        </div>
                        <div className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-medium">MU Tech</div>
                        {m.fallback && (
                          <div className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-accent text-accent-foreground font-semibold">
                            FALLBACK
                          </div>
                        )}
                      </motion.div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => downloadOne(m.imageUrl!, m.size, m.titleText)}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <Download className="h-3 w-3 mr-1" /> Download HD PNG
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLightbox({ url: m.imageUrl!, size: m.size })}
                          title="Open full size"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="glass-panel rounded-2xl p-3 mt-3 space-y-2">
        {showYt && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
            <Input
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="bg-secondary border-border text-sm"
            />
            <Button onClick={handleYtExtract} disabled={loadingYt} size="sm" variant="outline">
              {loadingYt ? <Loader2 className="h-3 w-3 animate-spin" /> : "Import"}
            </Button>
            <Button onClick={() => { setShowYt(false); setYtUrl(""); }} size="sm" variant="ghost">
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
        )}

        {refs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {refs.map((r) => (
              <div key={r.id} className="relative shrink-0 group">
                <img src={r.url} alt={r.name} className="h-14 w-14 object-cover rounded-lg border border-border" />
                <button
                  onClick={() => removeRef(r.id)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground self-end pb-1">{refs.length} ref(s)</span>
          </div>
        )}

        <Input
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder='Optional headline on thumbnail (e.g. "FREE SHOPIFY KILLER")'
          maxLength={40}
          className="bg-secondary border-border text-sm h-9"
        />

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleGenerate(); }
          }}
          placeholder="Describe your thumbnail — e.g. 'shocked founder pointing at sales dashboard, neon SaaS background'"
          className="bg-secondary border-border min-h-[60px] resize-none text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
          <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1" title="Attach reference images (unlimited)">
            <Paperclip className="h-3 w-3" /> <span className="hidden sm:inline">Attach</span>
          </Button>
          <Button type="button" size="sm" variant={showYt ? "default" : "outline"} onClick={() => setShowYt(v => !v)} className="gap-1" title="Import YouTube thumbnail as reference">
            <LinkIcon className="h-3 w-3" /> <span className="hidden sm:inline">YouTube</span>
          </Button>

          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="bg-secondary border-border h-9 text-xs w-auto min-w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map(s => (
                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} size="sm" className="ml-auto bg-primary hover:bg-primary/90 gap-1">
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Generate
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Tip: Ctrl/⌘ + Enter to generate · Add a headline for sharper on-thumbnail text · Unlimited references
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
