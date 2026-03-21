import { useState } from "react";
import { Scissors, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VideoToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("video/")) { toast.error("Please select a video file"); return; }
    setFile(files[0]);
    setPreview(URL.createObjectURL(files[0]));
  };

  const handleTrim = () => {
    toast.info("Video trimming requires a backend server with FFmpeg. Connect a backend to enable this feature.");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Scissors className="h-5 w-5" />} title="Video Tools" description="Trim videos, extract subtitles, and more. Supports all common video formats." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="video/*" onFiles={handleFiles} label="Drop video file here" sublabel="Supports MP4, AVI, MOV, MKV" />
        {file && preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <video src={preview} controls className="w-full rounded-lg max-h-80" />
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Start</label>
                <Input value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="00:00" className="bg-secondary border-border" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">End</label>
                <Input value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="00:30" className="bg-secondary border-border" />
              </div>
            </div>
            <Button onClick={handleTrim} className="w-full bg-primary hover:bg-primary/90">
              <Scissors className="h-4 w-4 mr-2" /> Trim Video
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
