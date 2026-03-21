import { useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    slug: "best-free-video-downloader-2026",
    title: "Best Free Video Downloader in 2026: Complete Guide",
    excerpt: "Looking for the best free video downloader? Learn how to download videos from YouTube, TikTok, Facebook, and Instagram without watermarks. Our comprehensive guide covers everything you need to know about online video downloading tools and techniques.",
    date: "March 21, 2026",
    category: "Video Tools",
    readTime: "8 min read",
    content: `<h2>Why You Need a Free Video Downloader</h2>
<p>In today's digital landscape, video content is king. Whether you're saving tutorials for offline viewing, archiving important content, or downloading videos for creative projects, having a reliable video downloader is essential.</p>
<h2>Top Features to Look For</h2>
<p>When choosing a video downloader, consider these key features:</p>
<ul><li><strong>Multi-platform support</strong> — Download from YouTube, TikTok, Facebook, Instagram, and more</li><li><strong>Quality options</strong> — Choose between 360p, 720p, and 1080p</li><li><strong>No watermark downloads</strong> — Especially important for TikTok videos</li><li><strong>Fast processing</strong> — No waiting in queues</li><li><strong>No registration required</strong> — Start downloading immediately</li></ul>
<h2>How to Download Videos Safely</h2>
<p>Always ensure you have the right to download content. Many platforms allow downloading for personal use, but redistributing copyrighted content is prohibited. Ultra Media AI Hub processes all downloads securely with HTTPS encryption.</p>
<h2>Step-by-Step Guide</h2>
<p>Using Ultra Media AI Hub's video downloader is simple: paste the video URL, select your preferred quality (360p, 720p, or 1080p), and click download. The tool automatically detects the platform and fetches the best available quality.</p>
<h2>Supported Platforms</h2>
<p>Our video downloader supports all major platforms including YouTube, TikTok (watermark-free), Facebook, Instagram, Twitter/X, Vimeo, and many more. Each platform has specific optimization for the best download experience.</p>`,
  },
  {
    slug: "convert-audio-mp3-free-online",
    title: "How to Convert Audio to MP3 Free Online — WAV, AAC, M4A Guide",
    excerpt: "Complete guide to converting audio files to MP3 format online for free. Learn about bitrate selection, quality preservation, and batch conversion techniques for WAV, AAC, and M4A files.",
    date: "March 20, 2026",
    category: "Audio Tools",
    readTime: "6 min read",
    content: `<h2>Understanding Audio Formats</h2>
<p>Audio files come in many formats, each with different characteristics. WAV files are uncompressed and large, AAC is Apple's preferred format, and MP3 remains the most universally compatible format for music and podcasts.</p>
<h2>Choosing the Right Bitrate</h2>
<p>Bitrate directly affects audio quality and file size:</p>
<ul><li><strong>128 kbps</strong> — Good for speech, podcasts, and casual listening. Smaller file sizes.</li><li><strong>320 kbps</strong> — Near CD quality. Ideal for music production and audiophile listening.</li></ul>
<h2>Why Convert to MP3?</h2>
<p>MP3 remains the most widely supported audio format across all devices, platforms, and media players. Converting your audio to MP3 ensures maximum compatibility while maintaining good sound quality.</p>
<h2>Batch Conversion Tips</h2>
<p>When converting multiple files, use batch processing to save time. Ultra Media AI Hub supports drag-and-drop batch uploads, allowing you to convert dozens of files simultaneously with consistent quality settings.</p>`,
  },
  {
    slug: "ai-image-upscaling-guide-2026",
    title: "AI Image Upscaling: Transform Low-Res Photos to 4K Quality",
    excerpt: "Discover how AI-powered image upscaling works and how to transform your low-resolution photos into stunning HD and 4K quality images using neural network technology.",
    date: "March 19, 2026",
    category: "AI Tools",
    readTime: "7 min read",
    content: `<h2>What is AI Image Upscaling?</h2>
<p>AI image upscaling uses deep learning neural networks to intelligently increase image resolution. Unlike traditional upscaling that simply duplicates pixels, AI upscaling predicts and generates new details, creating naturally sharp, detailed images.</p>
<h2>How Real-ESRGAN Works</h2>
<p>Real-ESRGAN (Enhanced Super-Resolution Generative Adversarial Network) is one of the most advanced AI upscaling models. It's been trained on millions of image pairs to understand how to add realistic detail when scaling up images.</p>
<h2>Best Practices for AI Upscaling</h2>
<ul><li>Start with the highest quality source image available</li><li>Use 2x upscaling for most cases, 4x for extreme enhancement</li><li>Check the before/after comparison slider to verify quality</li><li>AI upscaling works best on photographs and realistic images</li></ul>
<h2>Common Use Cases</h2>
<p>AI upscaling is invaluable for restoring old photos, preparing images for print, enhancing social media content, improving product photography, and making low-resolution screenshots presentable.</p>`,
  },
  {
    slug: "compress-images-without-quality-loss",
    title: "How to Compress Images Without Losing Quality — Expert Tips",
    excerpt: "Learn professional techniques for compressing images while maintaining visual quality. Reduce file sizes by up to 80% for faster website loading and better SEO performance.",
    date: "March 18, 2026",
    category: "Image Tools",
    readTime: "5 min read",
    content: `<h2>Why Image Compression Matters</h2>
<p>Image file size directly impacts website loading speed, user experience, and SEO rankings. Google considers page speed a ranking factor, making image optimization crucial for any website.</p>
<h2>Lossless vs Lossy Compression</h2>
<p>Lossless compression reduces file size without any quality loss but offers limited reduction. Lossy compression can dramatically reduce file sizes with minimal visible quality difference when done correctly.</p>
<h2>Optimal Quality Settings</h2>
<ul><li><strong>90-100%</strong> — Nearly indistinguishable from original. Use for photography portfolios.</li><li><strong>70-85%</strong> — Best balance of quality and size. Ideal for web use.</li><li><strong>50-70%</strong> — Noticeable quality reduction but dramatically smaller files. Good for thumbnails.</li></ul>
<h2>Format Selection for Best Compression</h2>
<p>WebP format offers 25-34% better compression than JPEG while maintaining equivalent quality. PNG should be used for images requiring transparency. JPEG remains the best choice for photographs.</p>`,
  },
  {
    slug: "remove-background-from-image-free",
    title: "Remove Background from Image Free — AI-Powered Tool Guide",
    excerpt: "Step-by-step guide to removing backgrounds from images using AI. Create professional transparent PNGs for products, logos, portraits, and social media graphics instantly.",
    date: "March 17, 2026",
    category: "AI Tools",
    readTime: "6 min read",
    content: `<h2>AI Background Removal Technology</h2>
<p>Modern AI background removal uses deep learning models like U-Net architecture to precisely detect subjects and separate them from backgrounds. This technology has revolutionized product photography, graphic design, and social media content creation.</p>
<h2>When to Use Background Removal</h2>
<ul><li>E-commerce product photos that need white or transparent backgrounds</li><li>Professional headshots and portraits</li><li>Logo and brand asset preparation</li><li>Social media graphics and overlays</li><li>Presentation slides and marketing materials</li></ul>
<h2>Tips for Best Results</h2>
<p>For optimal background removal results, use images with clear contrast between subject and background. High-resolution images produce better edge detection. Avoid images with complex hair details or transparent objects for best results.</p>`,
  },
];

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const post = blogPosts.find(p => p.slug === selectedPost);

  if (post) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setSelectedPost(null)} className="text-primary text-sm mb-4 hover:underline">← Back to Blog</button>
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{post.category}</span>
            <h1 className="font-display text-3xl font-bold text-foreground mt-3">{post.title}</h1>
            <p className="text-muted-foreground text-sm mt-2">{post.date} · {post.readTime}</p>
          </div>
          <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </motion.article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<BookOpen className="h-5 w-5" />} title="Blog" description="Tips, guides, and tutorials for video downloading, audio conversion, image processing, and AI-powered media tools." />
      <div className="space-y-4">
        {blogPosts.map((post, i) => (
          <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button onClick={() => setSelectedPost(post.slug)} className="w-full text-left glass-panel rounded-xl p-6 hover:glow-sm transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{post.category}</span>
                  <h2 className="font-display text-lg font-bold text-foreground mt-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                  <p className="text-muted-foreground text-xs mt-3">{post.date} · {post.readTime}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-6 flex-shrink-0" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
