import { Link } from "react-router-dom";
import { Map } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { blogArticles } from "@/data/blogArticles";

const tools = [
  { to: "/video-downloader", label: "YouTube Video Extractor" },
  { to: "/audio-converter", label: "Audio Converter" },
  { to: "/image-tools", label: "Image Tools" },
  { to: "/upscaler", label: "AI Image Upscaler" },
  { to: "/compressor", label: "Image Compressor" },
  { to: "/thumbnail-generator", label: "AI Thumbnail Generator" },
  { to: "/yt-tag-extractor", label: "YouTube Tag Extractor" },
  { to: "/yt-monetization-checker", label: "YouTube Monetization Checker" },
  { to: "/yt-earnings-calculator", label: "YouTube Earnings Calculator" },
  { to: "/bg-remover", label: "Background Remover" },
  { to: "/pdf-tool", label: "PDF Tool" },
];

const company = [
  { to: "/about", label: "About Us" },
  { to: "/founder", label: "Founder" },
  { to: "/editorial-team", label: "Editorial Team" },
  { to: "/content-review-process", label: "Content Review Process" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
  { to: "/help", label: "Help Center" },
];

const legal = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/gdpr", label: "GDPR" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/dmca", label: "DMCA" },
  { to: "/editorial-policy", label: "Editorial Policy" },
  { to: "/ai-policy", label: "AI Usage Policy" },
];

function Section({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <section className="glass-panel rounded-xl p-5">
      <h2 className="font-display text-lg font-semibold text-foreground mb-3">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-muted-foreground hover:text-primary transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SitemapPage() {
  const categories = Array.from(new Set(blogArticles.map((a) => a.category)));

  return (
    <div className="max-w-5xl mx-auto">
      <SEO
        title="Sitemap — All Pages, Tools & Guides"
        description="Browse every page on Ultra Media AI Hub: free AI media tools, YouTube creator utilities, guides, legal policies and company information."
        path="/sitemap"
      />
      <Breadcrumbs items={[{ label: "Sitemap" }]} />
      <PageHeader
        icon={<Map className="h-5 w-5" />}
        title="Sitemap"
        description="A complete index of every tool, guide and policy page on Ultra Media AI Hub."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Free Tools" items={tools} />
        <Section title="Company" items={company} />
        <Section title="Legal & Policies" items={legal} />
        <Section
          title="Blog Categories"
          items={categories.map((c) => ({
            to: `/category/${c.toLowerCase().replace(/\s+/g, "-")}`,
            label: c,
          }))}
        />
      </div>
      <section className="glass-panel rounded-xl p-5 mt-4">
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">All Articles</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          {blogArticles.map((a) => (
            <li key={a.slug}>
              <Link
                to={`/blog?post=${a.slug}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
