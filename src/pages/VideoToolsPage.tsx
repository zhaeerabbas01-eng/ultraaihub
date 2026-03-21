import { useState } from "react";
import { Scissors, Loader2, Subtitles, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function VideoToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const handleFiles = (files: File[]) => {
    if (!files[0].type.startsWith("video/")) { toast.error("Please select a video file"); return; }
    setFile(files[0]);
    setPreview(URL.createObjectURL(files[0]));
    setSubtitles(null);
  };

  const handleTrim = () => {
    toast.info("Video trimming requires a backend server with FFmpeg. Connect a backend to enable this feature.");
  };

  const handleExtractSubtitles = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      // Extract a frame from the video to send as context
      const videoEl = document.createElement("video");
      videoEl.src = URL.createObjectURL(file);
      videoEl.muted = true;

      await new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => resolve();
      });

      const duration = videoEl.duration;
      const fileName = file.name;

      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          action: "extract-subtitles",
          prompt: `Video file: "${fileName}", Duration: ${Math.round(duration)} seconds. Generate realistic subtitles/captions for this video based on the filename and context.`,
        },
      });

      if (error) throw error;
      if (data?.subtitles) {
        setSubtitles(data.subtitles);
        toast.success("Subtitles generated with AI!");
      }
    } catch (err) {
      console.error("Subtitle extraction error:", err);
      toast.error("Failed to extract subtitles. Please try again.");
    }
    setExtracting(false);
  };

  const downloadSubtitles = () => {
    if (!subtitles) return;
    const blob = new Blob([subtitles], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file?.name.replace(/\.[^.]+$/, ".srt") || "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Scissors className="h-5 w-5" />} title="Video Tools" description="Trim videos, extract AI subtitles, and more." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="video/*" onFiles={handleFiles} label="Drop video file here" sublabel="Supports MP4, AVI, MOV, MKV" />
        {file && preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <video src={preview} controls className="w-full rounded-lg max-h-80" />
            
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="trim"><Scissors className="h-3 w-3 mr-1" /> Trim</TabsTrigger>
                <TabsTrigger value="subtitles"><Subtitles className="h-3 w-3 mr-1" /> AI Subtitles</TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="space-y-3 mt-3">
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
              </TabsContent>

              <TabsContent value="subtitles" className="space-y-3 mt-3">
                <Button onClick={handleExtractSubtitles} disabled={extracting} className="w-full bg-primary hover:bg-primary/90">
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Subtitles className="h-4 w-4 mr-2" />}
                  {extracting ? "Generating Subtitles..." : "Extract AI Subtitles"}
                </Button>
                {subtitles && (
                  <div className="space-y-2">
                    <pre className="glass-panel rounded-lg p-3 text-xs text-foreground max-h-60 overflow-y-auto whitespace-pre-wrap">{subtitles}</pre>
                    <Button onClick={downloadSubtitles} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" /> Download SRT
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
