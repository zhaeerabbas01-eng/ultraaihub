import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Download, Loader2, X, Lock, Unlock, Layers, Scissors, Minimize2, Droplet, FileImage, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  mergePdfs, splitPdf, compressPdf, lockPdf, unlockPdf,
  watermarkPdf, imagesToPdf, pdfToWord, wordToPdf, downloadBytes,
} from "./pdfFunctions";
import "./pdfStyles.css";

const TABS = [
  { id: "convert",   label: "Convert",   icon: FileType },
  { id: "compress",  label: "Compress",  icon: Minimize2 },
  { id: "merge",     label: "Merge",     icon: Layers },
  { id: "split",     label: "Split",     icon: Scissors },
  { id: "lock",      label: "Lock",      icon: Lock },
  { id: "watermark", label: "Watermark", icon: Droplet },
];

export default function PdfTool() {
  const [tab, setTab] = useState("convert");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [password, setPassword] = useState("");
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [ranges, setRanges] = useState("");
  const [convertMode, setConvertMode] = useState("img2pdf");
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = "PDF Tool — Convert, Merge, Split, Compress, Lock, Watermark | Ultra Media AI Hub";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Free online PDF Tool: convert PDF to Word, Word/Image to PDF, merge, split, compress, lock and watermark PDFs — 100% in your browser.");
  }, []);

  const accept = tab === "convert"
    ? (convertMode === "img2pdf" ? "image/png,image/jpeg" : convertMode === "word2pdf" ? ".docx" : "application/pdf")
    : tab === "merge" ? "application/pdf"
    : tab === "watermark" || tab === "compress" || tab === "split" || tab === "lock" ? "application/pdf"
    : "*/*";

  const multiple = tab === "merge" || (tab === "convert" && convertMode === "img2pdf");

  const onPick = (list) => {
    const arr = Array.from(list || []);
    setFiles(multiple ? arr : arr.slice(0, 1));
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    onPick(e.dataTransfer.files);
  };

  const process = async () => {
    if (!files.length) { toast({ title: "Upload a file first" }); return; }
    setBusy(true);
    try {
      if (tab === "merge") {
        const out = await mergePdfs(files);
        downloadBytes(out, "merged.pdf");
      } else if (tab === "split") {
        const parts = await splitPdf(files[0], ranges || `1-${999}`);
        parts.forEach((p) => downloadBytes(p.bytes, p.name));
      } else if (tab === "compress") {
        const out = await compressPdf(files[0]);
        downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + "-compressed.pdf");
      } else if (tab === "lock") {
        if (!password) { toast({ title: "Enter a password" }); setBusy(false); return; }
        const out = await lockPdf(files[0], password);
        downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + "-locked.pdf");
      } else if (tab === "watermark") {
        const out = await watermarkPdf(files[0], watermark || "WATERMARK");
        downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + "-watermarked.pdf");
      } else if (tab === "convert") {
        if (convertMode === "img2pdf") {
          const out = await imagesToPdf(files);
          downloadBytes(out, "images.pdf");
        } else if (tab === "convert" && convertMode === "pdf2word") {
          const out = await pdfToWord(files[0]);
          downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + ".doc", "application/msword");
        } else if (convertMode === "pdf2word") {
          const out = await pdfToWord(files[0]);
          downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + ".doc", "application/msword");
        } else if (convertMode === "word2pdf") {
          const out = await wordToPdf(files[0]);
          downloadBytes(out, files[0].name.replace(/\.docx$/i, "") + ".pdf");
        } else if (convertMode === "unlock") {
          const out = await unlockPdf(files[0], password);
          downloadBytes(out, files[0].name.replace(/\.pdf$/i, "") + "-unlocked.pdf");
        }
      }
      toast({ title: "Done!", description: "Your file has been downloaded." });
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast({ title: "Processing failed", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pdf-tool-root max-w-3xl mx-auto pdf-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">PDF Tool</h1>
          <p className="text-sm text-muted-foreground">Convert, merge, split, compress, lock & watermark — 100% private, in your browser.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 md:p-6 space-y-5">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setFiles([]); }}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto gap-1 bg-muted/40 p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="flex flex-col md:flex-row gap-1 md:gap-2 py-2 text-xs md:text-sm">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-5 space-y-4">
            {tab === "convert" && (
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "img2pdf", label: "Image → PDF", icon: FileImage },
                  { id: "word2pdf", label: "Word → PDF", icon: FileType },
                  { id: "pdf2word", label: "PDF → Word", icon: FileText },
                  { id: "unlock", label: "Unlock PDF", icon: Unlock },
                ].map((m) => (
                  <button key={m.id} onClick={() => { setConvertMode(m.id); setFiles([]); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${convertMode === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                    <m.icon className="inline h-3.5 w-3.5 mr-1" />{m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Dropzone */}
            <div
              className={`pdf-dropzone ${drag ? "drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => onPick(e.target.files)} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Drop {multiple ? "files" : "a file"} here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">{accept.replace(/application\//g, "").toUpperCase()}</p>
            </div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="pdf-file-row">
                      <span className="text-sm truncate">{f.name} <span className="text-muted-foreground">({(f.size / 1024).toFixed(1)} KB)</span></span>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab-specific options */}
            {tab === "split" && (
              <Input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="Page ranges, e.g. 1-3,5,7-9" />
            )}
            {tab === "lock" && (
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
            )}
            {tab === "convert" && convertMode === "unlock" && (
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current PDF password" />
            )}
            {tab === "watermark" && (
              <Input value={watermark} onChange={(e) => setWatermark(e.target.value)} placeholder="Watermark text" />
            )}

            <Button onClick={process} disabled={busy || !files.length} className="w-full">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><Download className="h-4 w-4" /> Process & Download</>}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">🔐 All processing happens locally. Files are auto-discarded after download.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
