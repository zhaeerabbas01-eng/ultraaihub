import { useState, useRef, useEffect } from "react";
import { Wand2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const gradients = [
  { name: "Sunset", colors: ["#ff6b6b", "#feca57"] },
  { name: "Ocean", colors: ["#0652DD", "#1289A7"] },
  { name: "Purple", colors: ["#6c5ce7", "#a29bfe"] },
  { name: "Dark", colors: ["#2d3436", "#636e72"] },
  { name: "Fire", colors: ["#e74c3c", "#f39c12"] },
  { name: "Mint", colors: ["#00b894", "#00cec9"] },
];

export default function ThumbnailGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("Amazing Video Title");
  const [subtitle, setSubtitle] = useState("Click here to watch!");
  const [gradient, setGradient] = useState(0);
  const [fontSize, setFontSize] = useState("64");

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
    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(200, 600, 300, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1100, 100, 200, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize}px 'Arial'`;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    wrapText(ctx, title, 640, 300, 1100, parseInt(fontSize) * 1.2);
    // Subtitle
    ctx.font = "32px 'Arial'";
    ctx.shadowBlur = 10;
    ctx.fillText(subtitle, 640, 500);
    ctx.shadowBlur = 0;
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
      <PageHeader icon={<Wand2 className="h-5 w-5" />} title="AI Thumbnail Generator" description="Create professional thumbnails with customizable text, colors, and gradients." />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-5 space-y-4">
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
            <div className="grid grid-cols-3 gap-2">
              {gradients.map((g, i) => (
                <button key={i} onClick={() => setGradient(i)} className={`h-10 rounded-lg transition-all ${gradient === i ? "ring-2 ring-primary scale-105" : ""}`} style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }} />
              ))}
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" /> Export PNG
          </Button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl shadow-lg" style={{ aspectRatio: "16/9" }} />
        </motion.div>
      </div>
    </div>
  );
}
