import { useState, useRef, useEffect } from "react";
import { Wand2, Download, Loader2, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
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

  useEffect(() => { drawCanvas(); }, [title, subtitle, gradient, fontSize, bgImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1280;
    canvas.height = 720;

    if (bgImage) {
      // Draw uploaded image as background
      const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      // Dark overlay for text readability
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
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(440, 540);
    ctx.lineTo(840, 540);
    ctx.stroke();
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
    img.onload = () => {
      setBgImage(img);
      toast.success("Background image set!");
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAiEnhance = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { action: "enhance-text", prompt: title },
      });
      if (error) throw error;
      if (data?.text) {
        setTitle(data.text);
        toast.success("Title enhanced with AI!");
      }
    } catch {
      toast.error("AI enhancement failed.");
    }
    setAiLoading(false);
  };

  const handleAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { action: "thumbnail-suggestions", title },
      });
      if (error) throw error;
      if (data?.suggestions?.length > 0) {
        const suggestion = data.suggestions[0];
        if (suggestion.textOverlay) setTitle(suggestion.textOverlay);
        if (suggestion.fontSize) setFontSize(String(suggestion.fontSize));
        toast.success("AI thumbnail concept applied!");
      }
    } catch {
      toast.error("AI suggestions failed.");
    }
    setAiLoading(false);
  };

  const handleAiGenerateImage = async () => {
    if (!aiPrompt.trim()) { toast.error("Enter a prompt for AI image generation"); return; }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { action: "generate-thumbnail-image", prompt: aiPrompt },
      });
      if (error) throw error;
      if (data?.imageDescription) {
        // Use the AI description to set the title and suggest a concept
        setTitle(data.imageDescription);
        toast.success("AI generated thumbnail concept! Customize further with the controls.");
      }
    } catch {
      toast.error("AI image generation failed.");
    }
    setAiGenerating(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<Wand2 className="h-5 w-5" />} title="AI Thumbnail Generator" description="Create thumbnails with AI, custom images, gradients, and text overlays." />
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5 space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="text" className="text-xs">Text & Style</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">AI Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 mt-3">
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
                <label className="text-xs text-muted-foreground mb-1 block">Upload Background Image</label>
                <label className="flex items-center gap-2 cursor-pointer glass-panel rounded-lg p-2 hover:bg-secondary/50 transition text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {bgImage ? "Change Image" : "Choose Image"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {bgImage && (
                  <Button variant="ghost" size="sm" onClick={() => setBgImage(null)} className="mt-1 text-xs text-muted-foreground">
                    Remove Image
                  </Button>
                )}
              </div>
              {!bgImage && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Background Gradient</label>
                  <div className="grid grid-cols-4 gap-2">
                    {gradients.map((g, i) => (
                      <button key={i} onClick={() => setGradient(i)} className={`h-8 rounded-lg transition-all ${gradient === i ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`} style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-3 mt-3">
              <div>
                <label className="text-xs text-muted-foreground">AI Prompt</label>
                <Textarea 
                  value={aiPrompt} 
                  onChange={e => setAiPrompt(e.target.value)} 
                  placeholder="Describe thumbnail: e.g. 'Gaming video with explosion effects'" 
                  className="mt-1 bg-secondary border-border min-h-[80px]" 
                />
              </div>
              <Button onClick={handleAiGenerateImage} disabled={aiGenerating} className="w-full bg-primary hover:bg-primary/90">
                {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                Generate with AI
              </Button>
              <div className="border-t border-border pt-3 space-y-2">
                <Button onClick={handleAiEnhance} disabled={aiLoading} variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10" size="sm">
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  AI Enhance Title
                </Button>
                <Button onClick={handleAiSuggestions} disabled={aiLoading} variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10" size="sm">
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
                  AI Suggest Concept
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleDownload} className="w-full bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" /> Export PNG
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl shadow-lg" style={{ aspectRatio: "16/9" }} />
        </motion.div>
      </div>
    </div>
  );
}
