import { useState } from "react";
import { Minimize2, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";

const sizeUnits = [
  { value: "bytes", label: "Bytes", multiplier: 1 },
  { value: "kb", label: "KB", multiplier: 1024 },
  { value: "mb", label: "MB", multiplier: 1024 * 1024 },
  { value: "gb", label: "GB", multiplier: 1024 * 1024 * 1024 },
];

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} Bytes`;
}

export default function CompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([80]);
  const [targetSize, setTargetSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("kb");
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
      const unit = sizeUnits.find(u => u.value === sizeUnit)!;
      const targetBytes = targetSize ? parseFloat(targetSize) * unit.multiplier : undefined;
      const maxSizeMB = targetBytes 
        ? targetBytes / (1024 * 1024) 
        : (quality[0] / 100) * (file.size / 1024 / 1024);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: Math.max(0.001, maxSizeMB),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality[0] / 100,
      });
      const url = URL.createObjectURL(compressedFile);
      setCompressed({ url, size: compressedFile.size });
      toast.success(`Compressed: ${formatSize(file.size)} → ${formatSize(compressedFile.size)}`);
    } catch {
      toast.error("Compression failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Minimize2 className="h-5 w-5" />} title="File Compressor" description="Compress images with quality and target size control." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="image/*" onFiles={handleFiles} label="Drop image to compress" sublabel="Supports PNG, JPG, WEBP" />
        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-panel rounded-lg p-4 space-y-3">
              <div>
                <p className="text-foreground text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">Original: {formatSize(file.size)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Quality: {quality[0]}%</label>
                <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} className="mt-2" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Target Size (optional)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={targetSize}
                    onChange={e => setTargetSize(e.target.value)}
                    placeholder="e.g. 500"
                    className="flex-1 bg-secondary border-border"
                    min="1"
                  />
                  <Select value={sizeUnit} onValueChange={setSizeUnit}>
                    <SelectTrigger className="w-24 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sizeUnits.map(u => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleCompress} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Minimize2 className="h-4 w-4 mr-2" />}
              Compress Image
            </Button>
            {compressed && (
              <div className="glass-panel rounded-lg p-4 space-y-2">
                <p className="text-accent text-sm font-medium">
                  Compressed: {formatSize(compressed.size)} ({((1 - compressed.size / file.size) * 100).toFixed(0)}% smaller)
                </p>
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
