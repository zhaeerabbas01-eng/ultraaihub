import { useState } from "react";
import { FileText, Search, Loader2, Copy, RefreshCw, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function TranscriptPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState("");

  const handleFetch = async () => {
    if (!url.trim()) { toast.error("Please enter a YouTube URL"); return; }
    setLoading(true);
    setTranscript(null);
    setError(null);
    setVideoTitle("");
    setDetectedLang("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("youtube-transcript", {
        body: { url: url.trim() },
      });
      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
      } else {
        setTranscript(data.transcript || "");
        setVideoTitle(data.title || "");
        setDetectedLang(data.language || "");
        toast.success("Transcript extracted!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to extract transcript");
    }
    setLoading(false);
  };

  const copyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    toast.success("Transcript copied to clipboard!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<FileText className="h-5 w-5" />} title="YouTube Transcript Extractor" description="Extract transcripts from any YouTube video in the original language." />

      <div className="glass-panel rounded-xl p-6 space-y-4 gradient-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFetch()}
              placeholder="Paste YouTube video URL..."
              className="pl-10 bg-secondary border-border h-12 text-base"
            />
          </div>
          <Button onClick={handleFetch} disabled={loading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Extract
          </Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass-panel rounded-xl p-6 gradient-border">
          <div className="flex items-start gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Transcript not available</p>
              <p className="text-sm mt-1">{error}</p>
              <Button variant="ghost" size="sm" onClick={handleFetch} className="mt-3 gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {transcript !== null && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          {/* Video info */}
          <div className="glass-panel rounded-xl p-5 gradient-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground font-display font-bold text-lg leading-tight">{videoTitle}</h2>
                {detectedLang && (
                  <span className="inline-block mt-1 text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                    Language: {detectedLang}
                  </span>
                )}
              </div>
              <Button onClick={copyTranscript} variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                <Copy className="h-4 w-4" /> Copy All
              </Button>
            </div>
          </div>

          {/* Transcript content */}
          <div className="glass-panel rounded-xl p-5 gradient-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Transcript</p>
            <div className="max-h-[500px] overflow-y-auto">
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{transcript}</p>
            </div>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => { setTranscript(null); setUrl(""); setError(null); }} className="text-muted-foreground gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Extract Another
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
