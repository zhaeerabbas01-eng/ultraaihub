import { useState } from "react";
import { Minimize2, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";

export default function CompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([80]);
  const [compressed, setCompressed] = useState<{ url: string; size: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setFile(files[0]);
    setCompressed(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: (quality[0] / 100) * (file.size / 1024 / 1024),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality[0] / 100,
      });
      const url = URL.createObjectURL(compressed);
      setCompressed({ url, size: compressed.size });
      toast.success(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
    } catch {
      toast.error("Compression failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Minimize2 className="h-5 w-5" />} title="File Compressor" description="Compress images with quality control. Reduce file sizes while maintaining visual quality." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" onFiles={handleFiles} label="Drop image to compress" sublabel="Supports PNG, JPG, WEBP" />
        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-panel rounded-lg p-4">
              <p className="text-foreground text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">Original: {(file.size / 1024).toFixed(0)} KB</p>
              <div className="mt-3">
                <label className="text-sm text-muted-foreground">Quality: {quality[0]}%</label>
                <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} className="mt-2" />
              </div>
            </div>
            <Button onClick={handleCompress} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Minimize2 className="h-4 w-4 mr-2" />}
              Compress Image
            </Button>
            {compressed && (
              <div className="glass-panel rounded-lg p-4 space-y-2">
                <p className="text-accent text-sm font-medium">Compressed: {(compressed.size / 1024).toFixed(0)} KB ({((1 - compressed.size / file.size) * 100).toFixed(0)}% smaller)</p>
                <a href={compressed.url} download={`compressed_${file.name}`}>
                  <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
