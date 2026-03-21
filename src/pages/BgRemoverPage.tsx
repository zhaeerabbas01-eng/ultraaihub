import { useState } from "react";
import { Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BgRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setFile(files[0]);
    setPreview(URL.createObjectURL(files[0]));
    setResult(null);
  };

  const handleRemove = async () => {
    if (!file || !preview) return;
    setLoading(true);
    // Client-side basic background removal using canvas (threshold-based)
    const img = new window.Image();
    img.src = preview;
    await new Promise(r => { img.onload = r; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    // Simple white/light background removal
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 220 && g > 220 && b > 220) {
        data[i + 3] = 0; // Make transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), "image/png"));
    setResult(URL.createObjectURL(blob));
    setLoading(false);
    toast.success("Background removed! For AI-powered removal (U2Net), connect a backend.");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<ImageIcon className="h-5 w-5" />} title="Background Remover" description="Remove image backgrounds automatically with AI. Get transparent PNG results instantly." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" onFiles={handleFiles} label="Drop image to remove background" />
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 text-center">Original</p>
                <img src={preview} alt="Original" className="rounded-lg w-full aspect-square object-contain bg-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 text-center">Result</p>
                <div className="rounded-lg w-full aspect-square bg-[repeating-conic-gradient(hsl(var(--secondary))_0%_25%,hsl(var(--muted))_0%_50%)] bg-[length:20px_20px] flex items-center justify-center">
                  {result ? <img src={result} alt="Result" className="w-full h-full object-contain" /> : <span className="text-muted-foreground text-sm">Preview</span>}
                </div>
              </div>
            </div>
            <Button onClick={handleRemove} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
              Remove Background
            </Button>
            {result && (
              <a href={result} download="transparent.png">
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download PNG</Button>
              </a>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
