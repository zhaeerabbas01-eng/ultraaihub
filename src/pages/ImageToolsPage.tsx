import { useState } from "react";
import { Image as ImageIcon, Download, Loader2, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ImageFile { file: File; preview: string; converted?: string; }

export default function ImageToolsPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [format, setFormat] = useState("jpeg");
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
    for (const img of images) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const bitmap = await createImageBitmap(img.file);
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      const mimeType = format === "jpeg" ? "image/jpeg" : format === "png" ? "image/png" : "image/webp";
      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), mimeType, 0.92));
      results.push({ ...img, converted: URL.createObjectURL(blob) });
    }
    setImages(results);
    setConverting(false);
    toast.success(`Converted ${results.length} image(s) to ${format.toUpperCase()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<ImageIcon className="h-5 w-5" />} title="Image Tools" description="Convert between PNG, JPG, and WEBP formats with batch support and drag-and-drop." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" multiple onFiles={handleFiles} label="Drop images here" sublabel="Supports PNG, JPG, WEBP — batch upload" />
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Convert to:</span>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-28 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={convertAll} disabled={converting} className="ml-auto bg-primary hover:bg-primary/90">
                {converting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Convert All ({images.length})
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative glass-panel rounded-lg overflow-hidden group">
                  <img src={img.preview} alt="" className="w-full aspect-square object-cover" />
                  <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                  {img.converted && (
                    <a href={img.converted} download={`converted.${format}`} className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition">
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
