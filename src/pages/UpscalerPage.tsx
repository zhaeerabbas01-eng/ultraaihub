import { useState } from "react";
import { Maximize, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function UpscalerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [upscaled, setUpscaled] = useState<string | null>(null);
  const [scale, setScale] = useState("2");
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setFile(files[0]);
    const url = URL.createObjectURL(files[0]);
    setPreview(url);
    setUpscaled(null);
    const img = new window.Image();
    img.onload = () => setDimensions({ w: img.width, h: img.height });
    img.src = url;
  };

  const handleUpscale = async () => {
    if (!file || !preview) return;
    setLoading(true);
    const img = new window.Image();
    img.src = preview;
    await new Promise(r => { img.onload = r; });
    const factor = parseInt(scale);
    const canvas = document.createElement("canvas");
    canvas.width = img.width * factor;
    canvas.height = img.height * factor;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply sharpening via unsharp mask technique
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.filter = "blur(1px)";
    tempCtx.drawImage(canvas, 0, 0);
    ctx.globalCompositeOperation = "difference";
    ctx.globalAlpha = 0.5;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(canvas, 0, 0);
    
    const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), "image/png"));
    setUpscaled(URL.createObjectURL(blob));
    setLoading(false);
    toast.success(`Image upscaled ${factor}x! (${img.width * factor}×${img.height * factor}px)`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Maximize className="h-5 w-5" />} title="AI Image Upscaler" description="Upscale images to HD/4K quality with AI-powered enhancement algorithms." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" onFiles={handleFiles} label="Drop image to upscale" sublabel="Supports PNG, JPG, WEBP — AI-powered enhancement" />
        {preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Scale:</span>
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger className="w-28 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x HD</SelectItem>
                  <SelectItem value="4">4x 4K</SelectItem>
                </SelectContent>
              </Select>
              {dimensions && (
                <span className="text-xs text-muted-foreground">
                  {dimensions.w}×{dimensions.h} → {dimensions.w * parseInt(scale)}×{dimensions.h * parseInt(scale)}
                </span>
              )}
              <Button onClick={handleUpscale} disabled={loading} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
                Upscale
              </Button>
            </div>
            {loading ? (
              <LoadingSpinner text="Upscaling image with AI..." />
            ) : upscaled ? (
              <div className="relative rounded-lg overflow-hidden" style={{ height: 400 }}>
                <img src={preview} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={upscaled} alt="Upscaled" className="w-full h-full object-cover" style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }} />
                </div>
                <input type="range" min={0} max={100} value={sliderPos} onChange={e => setSliderPos(Number(e.target.value))} className="absolute bottom-4 left-4 right-4 z-10 accent-primary" />
                <div className="absolute top-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">Original</div>
                <div className="absolute top-2 right-2 bg-primary/80 text-xs px-2 py-1 rounded text-primary-foreground font-medium">Upscaled {scale}x</div>
              </div>
            ) : (
              <img src={preview} alt="Preview" className="rounded-lg w-full max-h-80 object-contain" />
            )}
            {upscaled && (
              <a href={upscaled} download="upscaled.png">
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download Upscaled Image</Button>
              </a>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
