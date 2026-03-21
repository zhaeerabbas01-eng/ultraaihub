import { useState } from "react";
import { Image as ImageIcon, Download, Loader2, X, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formats = [
  { value: "jpeg", label: "JPG", mime: "image/jpeg" },
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "webp", label: "WEBP", mime: "image/webp" },
  { value: "bmp", label: "BMP", mime: "image/bmp" },
  { value: "gif", label: "GIF", mime: "image/gif" },
  { value: "ico", label: "ICO", mime: "image/x-icon" },
  { value: "avif", label: "AVIF", mime: "image/avif" },
];

interface ImageFile { file: File; preview: string; converted?: string; convertedName?: string; }

export default function ImageToolsPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState([85]);
  const [resizePercent, setResizePercent] = useState([100]);
  const [converting, setConverting] = useState(false);

  const handleFiles = (files: File[]) => {
    const newImages = files.filter(f => f.type.startsWith("image/")).map(f => ({
      file: f, preview: URL.createObjectURL(f),
    }));
    if (!newImages.length) { toast.error("Please select valid image files"); return; }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const convertAll = async () => {
    setConverting(true);
    const results: ImageFile[] = [];
    const selectedFormat = formats.find(f => f.value === format)!;

    for (const img of images) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const bitmap = await createImageBitmap(img.file);
      const scale = resizePercent[0] / 100;
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((res) => 
        canvas.toBlob(b => res(b!), selectedFormat.mime, quality[0] / 100)
      );
      const name = img.file.name.replace(/\.[^.]+$/, `.${format === "jpeg" ? "jpg" : format}`);
      results.push({ ...img, converted: URL.createObjectURL(blob), convertedName: name });
    }
    setImages(results);
    setConverting(false);
    toast.success(`Converted ${results.length} image(s) to ${format.toUpperCase()}`);
  };

  const downloadAll = () => {
    images.forEach(img => {
      if (img.converted) {
        const a = document.createElement("a");
        a.href = img.converted;
        a.download = img.convertedName || `converted.${format}`;
        a.click();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<ImageIcon className="h-5 w-5" />} title="Image Tools" description="Convert images between PNG, JPG, WEBP, BMP, AVIF & more with quality and resize controls." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" multiple onFiles={handleFiles} label="Drop images here" sublabel="Supports PNG, JPG, WEBP, BMP, GIF, AVIF — batch upload" />
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-panel rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Conversion Settings</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Output Format</label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {formats.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quality: {quality[0]}%</label>
                  <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} className="mt-3" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Resize: {resizePercent[0]}%</label>
                  <Slider value={resizePercent} onValueChange={setResizePercent} min={10} max={200} step={5} className="mt-3" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={convertAll} disabled={converting} className="flex-1 bg-primary hover:bg-primary/90">
                {converting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Convert All ({images.length})
              </Button>
              {images.some(i => i.converted) && (
                <Button onClick={downloadAll} variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Download All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative glass-panel rounded-lg overflow-hidden group">
                  <img src={img.preview} alt="" className="w-full aspect-square object-cover" />
                  <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                  {img.converted && (
                    <a href={img.converted} download={img.convertedName || `converted.${format}`} className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition">
                      <Download className="h-6 w-6 text-primary" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
