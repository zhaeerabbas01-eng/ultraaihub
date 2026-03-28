import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Music, Image, Maximize, Minimize2, Wand2, Scissors, Trash2, ArrowRight, Sparkles, Zap, Shield, CheckCircle, Globe, Star, Users } from "lucide-react";
import logoImg from "@/assets/logo.png";

const tools = [
  { title: "YouTube Video Downloader", desc: "Download YouTube, TikTok, Facebook & Instagram videos in HD 1080p. Free online video downloader — no software needed.", icon: Download, url: "/video-downloader", color: "from-red-500/20 to-orange-500/20", badge: "Most Popular" },
  { title: "MP3 Audio Converter", desc: "Convert WAV, MP4, M4A, AAC to MP3 online free. High-quality 320kbps audio conversion for music & podcasts.", icon: Music, url: "/audio-converter", color: "from-green-500/20 to-emerald-500/20", badge: null },
  { title: "Image Format Converter", desc: "Convert PNG to JPG, JPG to WEBP, WEBP to PNG online free. Batch image converter with instant preview & download.", icon: Image, url: "/image-tools", color: "from-blue-500/20 to-cyan-500/20", badge: null },
  { title: "AI Image Upscaler", desc: "Upscale images to 4K with AI. Enhance low-resolution photos to HD quality. Best free AI image enlarger online.", icon: Maximize, url: "/upscaler", color: "from-purple-500/20 to-pink-500/20", badge: "AI Powered" },
  { title: "Image & Video Compressor", desc: "Compress images up to 80% without losing quality. Free online image compressor for websites, social media & email.", icon: Minimize2, url: "/compressor", color: "from-amber-500/20 to-yellow-500/20", badge: null },
  { title: "AI Thumbnail Generator", desc: "Create professional YouTube thumbnails with AI. Auto-generate eye-catching designs with custom text & styles.", icon: Wand2, url: "/thumbnail-generator", color: "from-indigo-500/20 to-violet-500/20", badge: "AI Powered" },
  { title: "Video Trimmer & Editor", desc: "Trim, cut & edit videos online free. Extract subtitles & captions from any video. No watermark, no signup.", icon: Scissors, url: "/video-tools", color: "from-teal-500/20 to-cyan-500/20", badge: null },
  { title: "AI Background Remover", desc: "Remove image background instantly with AI. Create transparent PNG for product photos, portraits & design projects.", icon: Trash2, url: "/bg-remover", color: "from-rose-500/20 to-pink-500/20", badge: "AI Powered" },
];

const stats = [
  { value: "10M+", label: "Files Processed Globally", icon: Globe },
  { value: "50+", label: "Formats Supported", icon: Star },
  { value: "195+", label: "Countries Served", icon: Users },
  { value: "99.9%", label: "Uptime Guaranteed", icon: Zap },
];

const features = [
  { icon: Zap, title: "Lightning Fast Processing", desc: "Browser-based engine — no uploads, zero wait time. Process files instantly on any device." },
  { icon: Shield, title: "100% Private & Secure", desc: "Your files never leave your device. No data stored on servers. Complete privacy guaranteed." },
  { icon: Sparkles, title: "AI-Powered Technology", desc: "Powered by Google Gemini AI & advanced neural networks for professional-grade results." },
  { icon: CheckCircle, title: "Free Forever — No Signup", desc: "All tools completely free. No registration, no watermarks, no hidden fees. Use instantly." },
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
          <span className="text-sm text-primary font-medium">Free AI-Powered Media Tools — Used in 195+ Countries</span>
        </motion.div>
        <motion.img src={logoImg} alt="Ultra Media AI Hub - Free Online Video Downloader & AI Tools" className="h-24 w-24 md:h-32 md:w-32 mx-auto mb-6 rounded-2xl object-cover" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} />
        <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">ULTRA</span><br />
          <span className="gradient-text">MEDIA AI HUB</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-4">
          The #1 free online video downloader, image converter, AI upscaler & media toolkit. Download YouTube videos, compress images, remove backgrounds — all powered by AI.
        </p>
        <p className="text-muted-foreground/70 text-sm max-w-xl mx-auto mb-8">
          Trusted by millions worldwide — USA, UK, Canada, Australia, Germany, India, UAE & 190+ countries.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/video-downloader" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-xl transition-all hover:scale-105">
            Start Using Free Tools <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/about" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium px-6 py-3 rounded-xl transition-all">
            About MUTECH BAAR
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 text-center">
            <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="font-display text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Section Title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">All-in-One Free Online Media Tools</h2>
        <p className="text-muted-foreground text-sm">Professional-grade AI tools — 100% free, no registration required</p>
      </motion.div>

      {/* Tools Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={item}>
            <Link to={tool.url} className="block glass-panel rounded-xl p-5 hover:glow-sm transition-all duration-300 group h-full hover:scale-[1.02] relative">
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {tool.badge}
                </span>
              )}
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                <tool.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1 text-sm">{tool.title}</h3>
              <p className="text-muted-foreground text-xs mb-3 leading-relaxed">{tool.desc}</p>
              <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Use Free Tool <ArrowRight className="h-3 w-3" />
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

      {/* SEO Content — International Targeting */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-panel rounded-xl p-8 mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Best Free Online Video Downloader & AI Media Tools 2026</h2>
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>Welcome to <strong className="text-foreground">Ultra Media AI Hub</strong> by <strong className="text-foreground">MUTECH BAAR</strong> — the world's most powerful free online media toolkit. Whether you're in the <strong className="text-foreground">United States, United Kingdom, Canada, Australia, Germany, France, India, UAE, Saudi Arabia, Pakistan</strong>, or anywhere else globally — our AI-powered platform delivers professional-grade media processing completely free, with no registration required.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🎬 Free YouTube Video Downloader Online</h3>
          <p>Download videos from <strong className="text-foreground">YouTube, TikTok, Facebook, Instagram, Twitter/X, Reddit, and Vimeo</strong> in HD 720p, 1080p, and 4K quality. Our <strong className="text-foreground">free online video downloader</strong> works on all devices — desktop, mobile, tablet — without installing any software. Download TikTok videos without watermark instantly. Simply paste the video URL, select your quality, and download in seconds.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🎵 Free MP3 Audio Converter Online</h3>
          <p>Convert audio files between WAV, MP4, M4A, AAC, OGG, and MP3 formats with our <strong className="text-foreground">free online audio converter</strong>. Choose between 128kbps standard quality or 320kbps studio-grade quality. Perfect for musicians, podcasters, DJs, and content creators who need reliable, high-quality audio format conversion.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🖼️ Free Image Converter & Compressor</h3>
          <p>Convert between <strong className="text-foreground">PNG, JPG, JPEG, WEBP, BMP, GIF, and SVG</strong> formats with our batch image converter. Our <strong className="text-foreground">free image compressor</strong> reduces file sizes by up to 80% without visible quality loss — perfect for website optimization, social media posting, and email attachments. Supports drag-and-drop with instant preview.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🤖 AI Image Upscaler — Enhance Photos to 4K</h3>
          <p>Transform low-resolution images into stunning HD and 4K quality with our <strong className="text-foreground">free AI image upscaler</strong>. Powered by advanced neural networks, our upscaler intelligently enhances details, sharpens edges, and removes noise. Ideal for restoring old photos, enhancing product images, and preparing images for print.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">✂️ AI Background Remover — Instant Transparent PNG</h3>
          <p>Remove image backgrounds in one click with our <strong className="text-foreground">free AI background remover</strong>. Create professional transparent PNG files instantly — perfect for e-commerce product photos, portrait photography, graphic design, and social media content creation.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🎨 AI YouTube Thumbnail Generator</h3>
          <p>Create professional <strong className="text-foreground">YouTube thumbnails with AI</strong>. Our generator uses Google's Gemini AI to design eye-catching thumbnails with customizable text, gradients, and styles. Supports multiple aspect ratios including 16:9 for YouTube, 1:1 for Instagram, and 9:16 for Shorts/Reels.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🎞️ Free Online Video Trimmer & Editor</h3>
          <p>Trim, cut, and edit videos online without any software. Extract subtitles and captions from any video file. Our <strong className="text-foreground">free video editor</strong> supports MP4, MOV, AVI, MKV, and WEBM formats with no watermark on output.</p>

          <h3 className="font-display text-lg font-semibold text-foreground pt-2">🌍 Trusted Worldwide</h3>
          <p><strong className="text-foreground">Ultra Media AI Hub</strong> is developed by <strong className="text-foreground">MUTECH BAAR</strong>, founded by <strong className="text-foreground">Muhammad Usman Zaheer</strong>. Our platform serves millions of users across <strong className="text-foreground">195+ countries</strong> including the USA, UK, Canada, Australia, Germany, France, Spain, Italy, Netherlands, Sweden, Japan, South Korea, Brazil, Mexico, India, Pakistan, Bangladesh, Turkey, Saudi Arabia, UAE, Egypt, Nigeria, South Africa, Philippines, Indonesia, and Malaysia. All tools are 100% free with no registration, no watermarks, and no hidden limits.</p>

          <p>Compatible with <strong className="text-foreground">Chrome, Firefox, Safari, Edge, Opera, and Brave</strong> on Windows, macOS, Linux, Android, and iOS. Start using our professional AI-powered media tools today — completely free.</p>
        </div>
      </motion.section>
    </div>
  );
}
