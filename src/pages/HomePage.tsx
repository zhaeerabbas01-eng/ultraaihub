import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Music, Image, Maximize, Minimize2, Wand2, Scissors, Trash2, ArrowRight } from "lucide-react";

const tools = [
  { title: "Video Downloader", desc: "Download from YouTube, TikTok, Facebook, Instagram", icon: Download, url: "/video-downloader", color: "from-red-500/20 to-orange-500/20" },
  { title: "Audio Converter", desc: "Convert WAV, MP4, AAC to MP3 with bitrate control", icon: Music, url: "/audio-converter", color: "from-green-500/20 to-emerald-500/20" },
  { title: "Image Tools", desc: "Convert PNG, JPG, WEBP with batch support", icon: Image, url: "/image-tools", color: "from-blue-500/20 to-cyan-500/20" },
  { title: "AI Upscaler", desc: "Upscale images to HD/4K with AI enhancement", icon: Maximize, url: "/upscaler", color: "from-purple-500/20 to-pink-500/20" },
  { title: "Compressor", desc: "Compress images & videos while maintaining quality", icon: Minimize2, url: "/compressor", color: "from-amber-500/20 to-yellow-500/20" },
  { title: "AI Thumbnail", desc: "Auto-generate thumbnails with text overlays", icon: Wand2, url: "/thumbnail-generator", color: "from-indigo-500/20 to-violet-500/20" },
  { title: "Video Tools", desc: "Trim videos, extract subtitles & captions", icon: Scissors, url: "/video-tools", color: "from-teal-500/20 to-cyan-500/20" },
  { title: "BG Remover", desc: "Remove image backgrounds with AI automatically", icon: Trash2, url: "/bg-remover", color: "from-rose-500/20 to-pink-500/20" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="gradient-text">ULTRA MEDIA</span>{" "}
          <span className="text-foreground">AI HUB</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your all-in-one toolkit for video downloading, audio conversion, image processing, and AI-powered media enhancement — completely free.
        </p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={item}>
            <Link to={tool.url} className="block glass-panel rounded-xl p-5 hover:glow-sm transition-all duration-300 group h-full">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                <tool.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{tool.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">{tool.desc}</p>
              <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Open tool <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 glass-panel rounded-xl p-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Free Online Media Tools — No Registration Required</h2>
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>Welcome to <strong className="text-foreground">Ultra Media AI Hub</strong>, the ultimate free online media toolkit. Whether you need to download videos from YouTube, TikTok, Facebook, or Instagram, convert audio files to MP3, compress images without losing quality, or upscale images using AI — we have you covered.</p>
          <p>Our <strong className="text-foreground">video downloader</strong> supports all major platforms. Paste any URL and download in 360p, 720p, or 1080p quality. Download TikTok videos without watermark. Our <strong className="text-foreground">audio converter</strong> transforms WAV, MP4, and AAC files into high-quality MP3 at 128kbps or 320kbps bitrate.</p>
          <p>The <strong className="text-foreground">image tools</strong> suite offers batch conversion between PNG, JPG, and WEBP formats with drag-and-drop support. Use our <strong className="text-foreground">AI image upscaler</strong> to enhance low-resolution images to stunning HD and 4K quality using cutting-edge neural networks.</p>
          <p>Need to reduce file sizes? Our <strong className="text-foreground">compressor</strong> intelligently reduces image and video file sizes while maintaining optimal quality. The <strong className="text-foreground">AI thumbnail generator</strong> creates professional YouTube thumbnails with customizable text, colors, and fonts.</p>
          <p>Additional tools include a <strong className="text-foreground">video trimmer</strong>, subtitle downloader, TikTok caption extractor, and an AI-powered <strong className="text-foreground">background remover</strong> that creates transparent PNGs instantly. All tools work directly in your browser — no software installation needed.</p>
          <p>Ultra Media AI Hub is completely free, with no registration, no watermarks, and no limits. Start using the best free online video downloader, image converter, and AI media tools today.</p>
        </div>
      </motion.section>
    </div>
  );
}
