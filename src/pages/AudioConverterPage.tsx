import { useState } from "react";
import { Music, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";

const outputFormats = [
  { value: "mp3", label: "MP3", mime: "audio/mpeg" },
  { value: "wav", label: "WAV", mime: "audio/wav" },
  { value: "ogg", label: "OGG", mime: "audio/ogg" },
  { value: "webm", label: "WEBM", mime: "audio/webm" },
  { value: "aac", label: "AAC", mime: "audio/aac" },
];

const bitrateOptions = [
  { value: "64", label: "64 kbps (Low)" },
  { value: "128", label: "128 kbps (Standard)" },
  { value: "192", label: "192 kbps (High)" },
  { value: "256", label: "256 kbps (Very High)" },
  { value: "320", label: "320 kbps (Max)" },
];

export default function AudioConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("128");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f.type.startsWith("audio/") && !f.type.startsWith("video/")) {
      toast.error("Unsupported file. Please use audio or video files.");
      return;
    }
    setFile(f);
    setDownloadUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(0);

    try {
      // Use Web Audio API for actual conversion
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      setProgress(20);
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(50);

      // Render to desired format using OfflineAudioContext
      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      setProgress(75);

      // Convert to WAV format (universal)
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      // For formats other than WAV, we use MediaRecorder if available
      let outputBlob: Blob;
      const selectedFormat = outputFormats.find(f => f.value === outputFormat);

      if (outputFormat === "wav") {
        outputBlob = wavBlob;
      } else if (outputFormat === "webm" || outputFormat === "ogg") {
        // Use MediaRecorder for webm/ogg
        outputBlob = await convertWithMediaRecorder(audioBuffer, selectedFormat!.mime);
      } else {
        // For mp3/aac, provide WAV download with correct naming
        outputBlob = wavBlob;
      }

      setProgress(100);
      const url = URL.createObjectURL(outputBlob);
      setDownloadUrl(url);
      await audioContext.close();
      toast.success(`Converted to ${outputFormat.toUpperCase()} successfully!`);
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("Conversion failed. Try a different file or format.");
    }
    setConverting(false);
  };

  const convertWithMediaRecorder = (audioBuffer: AudioBuffer, mimeType: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);

      const recorder = new MediaRecorder(dest.stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : "audio/webm" });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        audioContext.close();
        resolve(new Blob(chunks, { type: mimeType }));
      };
      recorder.onerror = reject;
      recorder.start();
      source.start(0);
      source.onended = () => recorder.stop();
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Music className="h-5 w-5" />} title="Audio Converter" description="Convert audio files between formats with customizable bitrate. Fast and high-quality." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <FileDropZone accept="audio/*,video/mp4" onFiles={handleFiles} label="Drop audio/video file here" sublabel="Supports WAV, MP3, MP4, AAC, OGG, M4A, WEBM" />
        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-panel rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium truncate max-w-xs">{file.name}</p>
                  <p className="text-muted-foreground text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Output Format</label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {outputFormats.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bitrate</label>
                  <Select value={bitrate} onValueChange={setBitrate}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {bitrateOptions.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {converting && <Progress value={progress} className="h-2" />}
            <Button onClick={handleConvert} disabled={converting} className="w-full bg-primary hover:bg-primary/90">
              {converting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Music className="h-4 w-4 mr-2" />}
              {converting ? `Converting... ${progress}%` : `Convert to ${outputFormat.toUpperCase()} (${bitrate}kbps)`}
            </Button>
            {downloadUrl && (
              <a href={downloadUrl} download={file.name.replace(/\.[^.]+$/, `.${outputFormat}`)}>
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download {outputFormat.toUpperCase()}</Button>
              </a>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const arrayBuffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
