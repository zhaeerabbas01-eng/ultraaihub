import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Music, Image, Maximize, Minimize2, Wand2, Scissors, Trash2, ArrowRight, Sparkles, Zap, Shield, CheckCircle } from "lucide-react";
import logoImg from "@/assets/logo.png";

const tools = [
  { title: "Video Downloader", desc: "Download from YouTube, TikTok, Facebook, Instagram", icon: Download, url: "/video-downloader", color: "from-red-500/20 to-orange-500/20" },
  { title: "Audio Converter", desc: "Convert WAV, MP4, AAC to MP3 with bitrate control", icon: Music, url: "/audio-converter", color: "from-green-500/20 to-emerald-500/20" },
  { title: "Image Tools", desc: "Convert PNG, JPG, WEBP with batch support", icon: Image, url: "/image-tools", color: "from-blue-500/20 to-cyan-500/20" },
  { title: "AI Upscaler", desc: "Upscale images to HD/4K with AI enhancement", icon: Maximize, url: "/upscaler", color: "from-purple-500/20 to-pink-500/20" },
  { title: "Compressor", desc: "Compress images & videos while maintaining quality", icon: Minimize2, url: "/compressor", color: "from-amber-500/20 to-yellow-500/20" },
  { title: "AI Thumbnail", desc: "AI-powered thumbnail generation with Gemini", icon: Wand2, url: "/thumbnail-generator", color: "from-indigo-500/20 to-violet-500/20" },
  { title: "Video Tools", desc: "Trim videos, extract subtitles & captions", icon: Scissors, url: "/video-tools", color: "from-teal-500/20 to-cyan-500/20" },
  { title: "BG Remover", desc: "AI background removal with remove.bg", icon: Trash2, url: "/bg-remover", color: "from-rose-500/20 to-pink-500/20" },
];

const stats = [
  { value: "10M+", label: "Files Processed", color: "text-primary" },
  { value: "50+", label: "Supported Formats", color: "text-accent" },
  { value: "99.9%", label: "Uptime", color: "text-primary" },
  { value: "24/7", label: "Support", color: "text-accent" },
];

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Browser-based processing with zero upload wait times" },
  { icon: Shield, title: "100% Private", desc: "Files never leave your device for local processing" },
  { icon: Sparkles, title: "AI-Powered", desc: "Gemini AI & remove.bg for professional results" },
  { icon: CheckCircle, title: "No Registration", desc: "Start using all tools immediately, completely free" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16 relative">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">AI-Powered Media Processing</span>
        </motion.div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">ULTRA</span><br />
          <span className="gradient-text">MEDIA AI HUB</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
          The next-generation media processing platform powered by artificial intelligence. Download, convert, compress, and enhance your media files with ease.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/video-downloader" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-xl transition-all hover:scale-105">
            Explore Tools <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/about" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium px-6 py-3 rounded-xl transition-all">
            Learn More
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 text-center">
            <p className={`font-display text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tools Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={item}>
            <Link to={tool.url} className="block glass-panel rounded-xl p-5 hover:glow-sm transition-all duration-300 group h-full hover:scale-[1.02]">
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

      {/* Features */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {features.map((feat, i) => (
          <div key={i} className="glass-panel rounded-xl p-5 text-center">
            <feat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">{feat.title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{feat.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* SEO Content */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-panel rounded-xl p-8 mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Free Online Media Tools — No Registration Required</h2>
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>Welcome to <strong className="text-foreground">Ultra Media AI Hub</strong> by <strong className="text-foreground">MUTECH BAAR</strong>, the ultimate free online media toolkit powered by artificial intelligence. Whether you need to download videos from YouTube, TikTok, Facebook, or Instagram, convert audio files to MP3, compress images without losing quality, or upscale images using AI — we have you covered with professional-grade tools that work entirely in your browser.</p>
          <p>Our <strong className="text-foreground">video downloader</strong> supports all major social media platforms including YouTube, TikTok, Facebook, and Instagram. Paste any video URL and download in 360p, 720p, or 1080p quality. Download TikTok videos without watermark instantly. Our advanced URL detection automatically identifies the platform and fetches the best available quality for your download.</p>
          <p>The <strong className="text-foreground">audio converter</strong> transforms WAV, MP4, AAC, and M4A files into high-quality MP3 at your choice of 128kbps standard quality or 320kbps audiophile quality. Our conversion engine preserves audio fidelity while dramatically reducing file sizes, making it perfect for podcasters, musicians, and content creators who need reliable format conversion.</p>
          <p>Our <strong className="text-foreground">image tools suite</strong> offers powerful batch conversion between PNG, JPG, and WEBP formats with an intuitive drag-and-drop interface. Upload multiple images at once and convert them all with a single click. The built-in preview system lets you verify results before downloading, ensuring you get exactly the output you need.</p>
          <p>Need to enhance low-resolution images? Our <strong className="text-foreground">AI image upscaler</strong> uses advanced neural network algorithms to intelligently increase image resolution up to 4x, producing stunning HD and 4K quality results. The built-in before/after comparison slider lets you see the dramatic improvement in real-time.</p>
          <p>The <strong className="text-foreground">file compressor</strong> intelligently reduces image file sizes by up to 80% while maintaining optimal visual quality. Powered by the browser-image-compression library, it gives you precise control over quality settings with a simple slider interface. Perfect for optimizing images for websites, social media, and email.</p>
          <p>Our <strong className="text-foreground">AI thumbnail generator</strong>, powered by Google's Gemini AI, creates professional YouTube thumbnails with customizable text, gradient backgrounds, and AI-suggested titles that maximize click-through rates. Choose from 8 stunning gradient presets and let AI enhance your titles for maximum impact.</p>
          <p>Additional tools include a <strong className="text-foreground">video trimmer</strong> for cutting videos with precise start/end times, and our <strong className="text-foreground">AI background remover</strong> powered by remove.bg that creates professional transparent PNGs instantly. Simply upload your image and our AI neural network precisely detects and removes the background, perfect for product photography, portraits, and graphic design.</p>
          <p>Ultra Media AI Hub is developed by <strong className="text-foreground">MUTECH BAAR</strong>, founded by <strong className="text-foreground">Muhammad Usman Zaheer</strong>. Our platform is completely free, with no registration, no watermarks, and no hidden limits. We're committed to providing the best free online video downloader, image converter, audio converter, and AI media tools for content creators worldwide. Start using our professional tools today — no signup required.</p>
          <p>Our platform supports all modern browsers including Chrome, Firefox, Safari, and Edge. Whether you're on desktop or mobile, our responsive design ensures a smooth experience across all devices. With 10 million+ files processed and counting, Ultra Media AI Hub is trusted by content creators, marketers, and developers around the globe.</p>
        </div>
      </motion.section>
    </div>
  );
}
