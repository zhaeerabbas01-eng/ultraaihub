import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, ImagePlus, FileUp, Camera, X, Bot, User, Sparkles, Loader2, StopCircle, Trash2, Youtube, PenTool, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamChat, detectTool, extractYouTubeId, type ChatMessage } from "@/lib/chatStream";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";

const SUGGESTIONS = [
  { icon: PenTool, label: "Write SEO Article", prompt: "Write an SEO-optimized article about " },
  { icon: BookOpen, label: "Write Blog Post", prompt: "Write a blog post about " },
  { icon: Youtube, label: "Summarize YouTube", prompt: "Summarize this YouTube video: " },
  { icon: Sparkles, label: "Explain a topic", prompt: "Explain in simple terms: " },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; content: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setAttachedFiles(prev => [...prev, { name: file.name, type: file.type, content }]);
      };
      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setAttachedImages(prev => [...prev, dataUrl]);
      stream.getTracks().forEach(t => t.stop());
      toast.success("Photo captured!");
    } catch {
      toast.error("Camera access denied");
    }
  };

  const fetchYouTubeTranscript = async (videoId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("youtube-transcript", {
        body: { url: `https://www.youtube.com/watch?v=${videoId}` },
      });
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text && attachedImages.length === 0 && attachedFiles.length === 0) return;
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      images: [...attachedImages],
      files: [...attachedFiles],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachedImages([]);
    setAttachedFiles([]);
    setIsLoading(true);

    const tool = detectTool(text);

    // Build message content for API
    let apiContent: any = text;
    const contentParts: any[] = [];

    if (attachedImages.length > 0 || attachedFiles.length > 0) {
      contentParts.push({ type: "text", text });
      for (const img of userMsg.images || []) {
        contentParts.push({ type: "image_url", image_url: { url: img } });
      }
      for (const file of userMsg.files || []) {
        if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          contentParts.push({ type: "text", text: `\n\n[File: ${file.name}]\n${file.content}` });
        } else {
          contentParts.push({ type: "text", text: `\n\n[Attached file: ${file.name} (${file.type})]` });
          contentParts.push({ type: "image_url", image_url: { url: file.content } });
        }
      }
      apiContent = contentParts;
    }

    // If YouTube link detected, fetch transcript
    const ytId = extractYouTubeId(text);
    if (ytId && tool === "youtube") {
      const ytData = await fetchYouTubeTranscript(ytId);
      if (ytData?.transcript) {
        const ytContext = `\n\n[YouTube Video Data]\nTitle: ${ytData.title || "Unknown"}\nLanguage: ${ytData.language || "Unknown"}\n\nTranscript:\n${ytData.transcript.slice(0, 8000)}`;
        if (typeof apiContent === "string") {
          apiContent = text + ytContext;
        } else {
          contentParts.push({ type: "text", text: ytContext });
        }
      }
    }

    // Build history for context
    const apiMessages = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
    apiMessages.push({ role: "user", content: apiContent });

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";
    const assistantId = crypto.randomUUID();

    await streamChat({
      messages: apiMessages,
      tool,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === assistantId) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar, timestamp: new Date() }];
        });
        scrollToBottom();
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        toast.error(err);
        setIsLoading(false);
      },
      signal: controller.signal,
    });
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Ultra AI Chat</h1>
            <p className="text-[10px] text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <img src={logoImg} alt="Ultra AI" className="h-16 w-16 mx-auto mb-4 rounded-2xl" />
              <h2 className="text-xl font-bold text-foreground mb-1">Welcome to Ultra AI</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Your all-in-one AI assistant. Ask anything, upload images, analyze documents, or use built-in tools.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setInput(s.prompt)}
                  className="glass-panel rounded-lg p-3 text-left hover:border-primary/50 transition-all group"
                >
                  <s.icon className="h-4 w-4 text-primary mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-foreground">{s.label}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-primary/15 border border-primary/20 rounded-2xl rounded-br-md px-4 py-2.5"
                      : "bg-secondary/50 rounded-2xl rounded-bl-md px-4 py-2.5"
                  }`}>
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img} alt="attached" className="h-20 w-20 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {msg.files.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{f.name}</Badge>
                        ))}
                      </div>
                    )}
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Attachments Preview */}
      {(attachedImages.length > 0 || attachedFiles.length > 0) && (
        <div className="flex gap-2 px-2 py-2 flex-wrap">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="h-14 w-14 object-cover rounded-lg border border-border" />
              <button onClick={() => setAttachedImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {attachedFiles.map((f, i) => (
            <div key={i} className="relative flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
              <FileUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-foreground max-w-[80px] truncate">{f.name}</span>
              <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))}>
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/30 pt-3">
        <div className="glass-panel rounded-xl p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (paste YouTube link, request articles, upload images)"
            className="border-0 bg-transparent resize-none min-h-[44px] max-h-[120px] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            rows={1}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex gap-1">
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.csv" className="hidden" onChange={handleFileUpload} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => imageInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}>
                <FileUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handleCamera}>
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            {isLoading ? (
              <Button size="sm" variant="destructive" onClick={stopGeneration} className="h-8 px-3">
                <StopCircle className="h-4 w-4 mr-1" /> Stop
              </Button>
            ) : (
              <Button size="sm" onClick={() => sendMessage()}
                disabled={!input.trim() && attachedImages.length === 0 && attachedFiles.length === 0}
                className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          Ultra AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
