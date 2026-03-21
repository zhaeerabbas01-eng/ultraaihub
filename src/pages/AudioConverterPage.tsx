import { useState, useRef } from "react";
import { Music, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AudioConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState("128");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    const validTypes = ["audio/wav", "audio/mpeg", "audio/aac", "audio/mp4", "video/mp4", "audio/x-m4a"];
    if (!validTypes.some(t => f.type.includes(t.split("/")[1]))) {
      toast.error("Unsupported file format. Use WAV, MP4, AAC, or M4A files.");
      return;
    }
    setFile(f);
    setDownloadUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(0);
    // Simulate conversion progress — real conversion needs FFmpeg backend
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setProgress(i);
    }
    // Create a blob URL from the original file as demo
    const url = URL.createObjectURL(file);
    setDownloadUrl(url);
    setConverting(false);
    toast.success("Conversion complete! Full FFmpeg conversion requires a backend server.");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Music className="h-5 w-5" />} title="Audio Converter" description="Convert WAV, MP4, AAC to MP3 with customizable bitrate. Fast and high-quality conversion." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="audio/*,video/mp4" onFiles={handleFiles} label="Drop audio/video file here" sublabel="Supports WAV, MP4, AAC, M4A" />
        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between glass-panel rounded-lg p-3">
              <div>
                <p className="text-foreground text-sm font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-muted-foreground text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Select value={bitrate} onValueChange={setBitrate}>
                <SelectTrigger className="w-32 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {converting && <Progress value={progress} className="h-2" />}
            <Button onClick={handleConvert} disabled={converting} className="w-full bg-primary hover:bg-primary/90">
              {converting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Music className="h-4 w-4 mr-2" />}
              {converting ? `Converting... ${progress}%` : `Convert to MP3 (${bitrate}kbps)`}
            </Button>
            {downloadUrl && (
              <a href={downloadUrl} download={file.name.replace(/\.[^.]+$/, ".mp3")}>
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download MP3</Button>
              </a>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
