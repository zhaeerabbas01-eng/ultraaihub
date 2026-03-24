import { useState, useEffect } from "react";
import { BookOpen, ArrowRight, Search, Tag, Clock, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { blogArticles } from "@/data/blogArticles";

const categories = ["All", ...Array.from(new Set(blogArticles.map(a => a.category)))];

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const post = blogArticles.find(p => p.slug === selectedPost);

  const filtered = blogArticles.filter(p => {
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (post) {
    return (
      <div className="max-w-3xl mx-auto">
        <Helmet>
          <title>{post.title} | Ultra Media AI Hub</title>
          <meta name="description" content={post.metaDescription} />
          <meta name="keywords" content={post.keywords.join(", ")} />
        </Helmet>
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-primary text-sm mb-6 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </button>
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">{post.category}</span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-3 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground text-sm mt-3">
              <span>{post.date}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
            </div>
            {post.focusKeyword && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.focusKeyword}</span>
              </div>
            )}
          </div>
          <div
            className="glass-panel rounded-xl p-6 md:p-8 prose prose-invert prose-sm max-w-none
              prose-headings:font-display prose-headings:text-foreground
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet>
        <title>Blog — Free Media Tools Tips & Guides | Ultra Media AI Hub</title>
        <meta name="description" content="Tips, guides, and tutorials for YouTube tools, audio conversion, image processing, and AI-powered media tools. SEO-optimized articles updated for 2026." />
      </Helmet>
      <PageHeader icon={<BookOpen className="h-5 w-5" />} title="Blog" description="Tips, guides, and tutorials for YouTube tools, audio conversion, image processing, and AI-powered media tools." />

      {/* Search & Filter */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {filtered.map((post, i) => (
          <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <button onClick={() => setSelectedPost(post.slug)} className="w-full text-left glass-panel rounded-xl p-5 md:p-6 hover:glow-sm transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                  <h2 className="font-display text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                  <p className="text-muted-foreground/60 text-xs mt-2">{post.date}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-4 flex-shrink-0" />
              </div>
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No articles found matching your search.</p>
        )}
      </div>
    </div>
  );
}
