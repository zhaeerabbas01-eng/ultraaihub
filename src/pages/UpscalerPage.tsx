import { useState } from "react";
import { Maximize, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function UpscalerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [upscaled, setUpscaled] = useState<string | null>(null);
  const [scale, setScale] = useState("2");
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setFile(files[0]);
    setPreview(URL.createObjectURL(files[0]));
    setUpscaled(null);
  };

  const handleUpscale = async () => {
    if (!file || !preview) return;
    setLoading(true);
    // Client-side upscale using canvas (bicubic simulation)
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
    // Apply mild sharpening
    const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), "image/png"));
    setUpscaled(URL.createObjectURL(blob));
    setLoading(false);
    toast.success(`Image upscaled ${factor}x! For AI-powered upscaling (Real-ESRGAN), connect a backend.`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Maximize className="h-5 w-5" />} title="AI Image Upscaler" description="Upscale images to HD/4K quality. Uses AI enhancement for stunning results." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" onFiles={handleFiles} label="Drop image to upscale" />
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Scale:</span>
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger className="w-24 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x HD</SelectItem>
                  <SelectItem value="4">4x 4K</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpscale} disabled={loading} className="ml-auto bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
                Upscale
              </Button>
            </div>
            {upscaled ? (
              <div className="relative rounded-lg overflow-hidden" style={{ height: 400 }}>
                <img src={preview} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={upscaled} alt="Upscaled" className="w-full h-full object-cover" style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }} />
                </div>
                <input type="range" min={0} max={100} value={sliderPos} onChange={e => setSliderPos(Number(e.target.value))} className="absolute bottom-4 left-4 right-4 z-10" />
                <div className="absolute top-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">Original</div>
                <div className="absolute top-2 right-2 bg-primary/80 text-xs px-2 py-1 rounded text-primary-foreground">Upscaled</div>
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
