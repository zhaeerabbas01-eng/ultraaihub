import React, { useCallback } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
}

export function FileDropZone({ accept, multiple = false, onFiles, label = "Drop files here or click to upload", sublabel }: FileDropZoneProps) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [onFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
  }, [onFiles]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`glass-panel rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${dragging ? "border-primary glow-sm" : "hover:border-primary/50"}`}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
      <p className="text-foreground font-medium">{label}</p>
      {sublabel && <p className="text-muted-foreground text-sm mt-1">{sublabel}</p>}
    </motion.div>
  );
}
