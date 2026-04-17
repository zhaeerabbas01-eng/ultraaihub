import { useState, useRef, useCallback, useEffect } from "react";
import {
  Wand2, Download, Loader2, Sparkles, Image as ImageIcon, X,
  Send, Plus, Link as LinkIcon, RefreshCw, Paperclip,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sizeOptions = [
  { value: "16:9", label: "16:9 — YouTube / Landscape", w: 1280, h: 720 },
  { value: "1:1", label: "1:1 — Square (Instagram)", w: 1080, h: 1080 },
  { value: "9:16", label: "9:16 — Portrait (Shorts/Reels)", w: 1080, h: 1920 },
  { value: "4:3", label: "4:3 — Standard", w: 1280, h: 960 },
  { value: "21:9", label: "21:9 — Ultra Wide", w: 1680, h: 720 },
];

type ChatMessage =
  | { id: string; role: "user"; text: string; refs: string[]; size: string; ytUrl?: string }
  | { id: string; role: "assistant"; imageUrl?: string; loading?: boolean; error?: string; fallback?: boolean; size: string };

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

export default function ThumbnailGeneratorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [refs, setRefs] = useState<{ id: string; url: string; name: string }[]>([]);
  const [size, setSize] = useState("16:9");
  const [ytUrl, setYtUrl] = useState("");
  const [showYt, setShowYt] = useState(false);
  const [loadingYt, setLoadingYt] = useState(false);
  const [generating, setGenerating] = useState(false);
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
      ytUrl: ytUrl || undefined,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      loading: true,
      size,
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    const promptCopy = prompt;
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

  const regenerate = (userMsg: Extract<ChatMessage, { role: "user" }>) => {
    setPrompt(userMsg.text);
    setSize(userMsg.size);
    toast.info("Prompt restored — tweak and hit generate");
  };

  const downloadImage = (url: string, sz: string) => {
    const link = document.createElement("a");
    link.download = `thumbnail-${sz.replace(":", "x")}-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        icon={<Wand2 className="h-5 w-5" />}
        title="AI Thumbnail Studio"
        description="Chat with AI to design viral thumbnails — add references, paste YouTube links, generate unlimited variations."
      />

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
              Describe your thumbnail, attach unlimited reference images, paste a YouTube link to copy a style, or pick an aspect ratio — then hit generate.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 max-w-xl mx-auto">
              {[
                "MrBeast-style giant cash explosion",
                "Shocked face react to news headline",
                "Tech review minimal product shot",
                "Gaming epic battle scene",
                "Tutorial bold text + arrow",
                "Cinematic movie-style poster",
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
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-secondary">{m.size}</span>
                    {m.refs.length > 0 && <span>{m.refs.length} reference(s)</span>}
                    <button onClick={() => regenerate(m)} className="ml-auto hover:text-primary flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> reuse
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] glass-panel rounded-2xl rounded-tl-sm p-3 space-y-2">
                  {m.loading ? (
                    <div
                      className="rounded-xl bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground"
                      style={{ aspectRatio: m.size.replace(":", "/"), minHeight: 200 }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-xs">Generating thumbnail...</p>
                      <p className="text-[10px] opacity-60 mt-1">Ultra Media AI · {m.size}</p>
                    </div>
                  ) : m.error ? (
                    <div className="text-sm text-destructive p-3">{m.error}</div>
                  ) : m.imageUrl ? (
                    <>
                      <div className="rounded-xl overflow-hidden relative">
                        <img
                          src={m.imageUrl}
                          alt="Generated thumbnail"
                          className="w-full object-cover"
                          style={{ aspectRatio: m.size.replace(":", "/") }}
                        />
                        <div className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-medium">MU Tech</div>
                        {m.fallback && (
                          <div className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-accent text-accent-foreground font-semibold">
                            FALLBACK
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadImage(m.imageUrl!, m.size)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Download className="h-3 w-3 mr-1" /> Download HD
                      </Button>
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
        {/* YouTube row */}
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

        {/* Reference images preview */}
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

        {/* Textarea + actions */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleGenerate(); }
          }}
          placeholder="Describe your thumbnail — e.g. 'shocked guy pointing at giant cash pile, neon background'"
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1"
            title="Attach reference images (unlimited)"
          >
            <Paperclip className="h-3 w-3" /> <span className="hidden sm:inline">Attach</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showYt ? "default" : "outline"}
            onClick={() => setShowYt(v => !v)}
            className="gap-1"
            title="Import YouTube thumbnail as reference"
          >
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

          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            size="sm"
            className="ml-auto bg-primary hover:bg-primary/90 gap-1"
          >
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Generate
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Tip: Ctrl/⌘ + Enter to generate · Attach unlimited reference images
        </p>
      </div>
    </div>
  );
}
