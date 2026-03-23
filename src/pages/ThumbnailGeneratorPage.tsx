import { useState, useRef, useEffect } from "react";
import { Wand2, Download, Loader2, Sparkles, Upload, Image as ImageIcon, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const gradients = [
  { name: "Sunset", colors: ["#ff6b6b", "#feca57"] },
  { name: "Ocean", colors: ["#0652DD", "#1289A7"] },
  { name: "Purple", colors: ["#6c5ce7", "#a29bfe"] },
  { name: "Dark", colors: ["#2d3436", "#636e72"] },
  { name: "Fire", colors: ["#e74c3c", "#f39c12"] },
  { name: "Mint", colors: ["#00b894", "#00cec9"] },
  { name: "Neon", colors: ["#00ff87", "#60efff"] },
  { name: "Rose", colors: ["#ff0844", "#ffb199"] },
];

export default function ThumbnailGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("Amazing Video Title");
  const [subtitle, setSubtitle] = useState("Click here to watch!");
  const [gradient, setGradient] = useState(0);
  const [fontSize, setFontSize] = useState("64");
  const [aiLoading, setAiLoading] = useState(false);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("manual");

  useEffect(() => { if (activeTab === "manual") drawCanvas(); }, [title, subtitle, gradient, fontSize, bgImage, activeTab]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1280;
    canvas.height = 720;

    if (bgImage) {
      const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, gradients[gradient].colors[0]);
      g.addColorStop(1, gradients[gradient].colors[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1280, Math.random() * 720, 50 + Math.random() * 200, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize}px 'Arial'`;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 4;
    wrapText(ctx, title, 640, 300, 1100, parseInt(fontSize) * 1.2);
    ctx.font = "bold 32px 'Arial'";
    ctx.shadowBlur = 15;
    ctx.fillText(subtitle, 640, 500);
    ctx.shadowBlur = 0;

    // Watermark
    addWatermark(ctx, canvas.width, canvas.height);
  };

  const addWatermark = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText("MU Tech", w - 15, h - 12);
    ctx.restore();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) => {
    const words = text.split(" ");
    let line = "";
    let cy = y;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), x, cy);
        line = w + " ";
        cy += lineH;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, cy);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { setBgImage(img); toast.success("Background image set!"); };
    img.src = URL.createObjectURL(file);
  };

  const handleAiEnhance = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { action: "enhance-text", prompt: title },
      });
      if (error) throw error;
      if (data?.text) { setTitle(data.text); toast.success("Title enhanced with AI!"); }
    } catch { toast.error("AI enhancement failed."); }
    setAiLoading(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) { toast.error("Enter a prompt for AI thumbnail generation"); return; }
    setAiGenerating(true);
    setAiImageUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-thumbnail-generate", {
        body: { prompt: aiPrompt },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setAiImageUrl(data.imageUrl);
        toast.success("AI thumbnail generated!");
      } else {
        throw new Error("No image returned");
      }
    } catch (err: any) {
      toast.error(err.message || "AI generation failed. Try again.");
    }
    setAiGenerating(false);
  };

  const downloadManual = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadAiImage = () => {
    if (!aiImageUrl) return;
    const link = document.createElement("a");
    link.download = "ai-thumbnail.png";
    link.href = aiImageUrl;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<Wand2 className="h-5 w-5" />} title="AI Thumbnail Generator" description="Create stunning YouTube thumbnails with AI or manual editor." />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="manual" className="gap-2"><Wand2 className="h-4 w-4" /> Manual Mode</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2"><Sparkles className="h-4 w-4" /> AI Generate Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Subtitle</label>
                <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Font Size</label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48">Small</SelectItem>
                    <SelectItem value="64">Medium</SelectItem>
                    <SelectItem value="80">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Background Image</label>
                <label className="flex items-center gap-2 cursor-pointer glass-panel rounded-lg p-2 hover:bg-secondary/50 transition text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {bgImage ? "Change Image" : "Choose Image"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {bgImage && (
                  <Button variant="ghost" size="sm" onClick={() => setBgImage(null)} className="mt-1 text-xs text-muted-foreground">Remove</Button>
                )}
              </div>
              {!bgImage && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Gradient</label>
                  <div className="grid grid-cols-4 gap-2">
                    {gradients.map((g, i) => (
                      <button key={i} onClick={() => setGradient(i)} className={`h-8 rounded-lg transition-all ${gradient === i ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`} style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }} />
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleAiEnhance} disabled={aiLoading} variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary/10">
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                AI Enhance Title
              </Button>
              <Button onClick={downloadManual} className="w-full bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" /> Export PNG
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
              <canvas ref={canvasRef} className="w-full rounded-xl shadow-lg" style={{ aspectRatio: "16/9" }} />
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Describe your thumbnail</label>
                <Textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder='e.g. "man shocked face" or "gaming explosion thumbnail"'
                  className="mt-1 bg-secondary border-border min-h-[120px]"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Simple prompts are auto-enhanced for best results</p>
              </div>
              <Button onClick={handleAiGenerate} disabled={aiGenerating} className="w-full bg-primary hover:bg-primary/90">
                {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                {aiGenerating ? "Generating..." : "Generate Thumbnail"}
              </Button>
              {aiImageUrl && (
                <>
                  <Button onClick={handleAiGenerate} disabled={aiGenerating} variant="outline" className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </Button>
                  <Button onClick={downloadAiImage} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" /> Download HD
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
              {aiImageUrl ? (
                <div className="rounded-xl overflow-hidden shadow-lg relative">
                  <img src={aiImageUrl} alt="AI Generated Thumbnail" className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-2 right-3 text-white/30 text-[10px] font-medium">MU Tech</div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Enter a prompt and click Generate</p>
                    <p className="text-xs mt-1 opacity-60">AI will create a high-quality YouTube thumbnail</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
