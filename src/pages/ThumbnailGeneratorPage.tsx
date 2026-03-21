import { useState, useRef, useEffect } from "react";
import { Wand2, Download, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

  useEffect(() => { drawCanvas(); }, [title, subtitle, gradient, fontSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1280;
    canvas.height = 720;
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
    // Add decorative line
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
    } catch (e) {
      toast.error("AI enhancement failed. Using original text.");
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
    } catch (e) {
      toast.error("AI suggestions failed.");
    }
    setAiLoading(false);
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
      <PageHeader icon={<Wand2 className="h-5 w-5" />} title="AI Thumbnail Generator" description="Create professional thumbnails with AI-powered text suggestions, customizable gradients, and instant export." />
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Subtitle</label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Font Size</label>
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
            <label className="text-sm text-muted-foreground mb-2 block">Background</label>
            <div className="grid grid-cols-4 gap-2">
              {gradients.map((g, i) => (
                <button key={i} onClick={() => setGradient(i)} className={`h-8 rounded-lg transition-all ${gradient === i ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`} style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }} />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Button onClick={handleAiEnhance} disabled={aiLoading} variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              AI Enhance Title
            </Button>
            <Button onClick={handleAiSuggestions} disabled={aiLoading} variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
              AI Suggest Concept
            </Button>
          </div>
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
