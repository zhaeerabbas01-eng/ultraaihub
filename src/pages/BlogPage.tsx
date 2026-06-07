import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ArrowRight, Search, Tag, Clock, ArrowLeft, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { blogArticles } from "@/data/blogArticles";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { AuthorBioCard } from "@/components/AuthorBioCard";
import { RelatedArticles } from "@/components/RelatedArticles";
import { articleJsonLd, breadcrumbJsonLd, SITE_URL, collectionJsonLd } from "@/lib/seo/jsonLd";
import { authors } from "@/data/authors";

const categories = ["All", ...Array.from(new Set(blogArticles.map(a => a.category)))];

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPost = searchParams.get("post");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const setSelected = (slug: string | null) => {
    if (slug) setSearchParams({ post: slug });
    else setSearchParams({});
    window.scrollTo({ top: 0 });
  };

  const post = blogArticles.find(p => p.slug === selectedPost);

  const filtered = blogArticles.filter(p => {
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!post && selectedPost) setSearchParams({});
  }, [post, selectedPost, setSearchParams]);

  if (post) {
    const author = authors.find(a => a.slug === (post.authorSlug ?? "usman-zaheer")) ?? authors[0];
    const url = `${SITE_URL}/blog?post=${post.slug}`;
    return (
      <div className="max-w-3xl mx-auto">
        <SEO
          title={post.title}
          description={post.metaDescription}
          path={`/blog?post=${post.slug}`}
          type="article"
          jsonLd={[
            articleJsonLd({
              title: post.title,
              description: post.metaDescription,
              url,
              datePublished: post.date,
              dateModified: post.lastUpdated ?? post.date,
              authorName: author.name,
              authorUrl: `${SITE_URL}/author/${author.slug}`,
            }),
            breadcrumbJsonLd([
              { name: "Home", url: SITE_URL },
              { name: "Blog", url: `${SITE_URL}/blog` },
              { name: post.category, url: `${SITE_URL}/category/${post.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
              { name: post.title, url },
            ]),
          ]}
        />
        <ReadingProgressBar />
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </button>
        <Breadcrumbs items={[
          { label: "Blog", to: "/blog" },
          { label: post.category },
          { label: post.title.length > 40 ? post.title.slice(0, 38) + "…" : post.title },
        ]} />
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">{post.category}</span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-3 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground text-sm mt-3 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published {post.date}</span>
              {post.lastUpdated && post.lastUpdated !== post.date && (
                <span className="text-primary/80">· Updated {post.lastUpdated}</span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
              <span>·</span>
              <span>By {author.name}</span>
            </div>
            {post.focusKeyword && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.focusKeyword}</span>
                {post.tags?.slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                ))}
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
              prose-a:text-primary
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <AuthorBioCard slug={author.slug} />
          <RelatedArticles currentSlug={post.slug} category={post.category} onSelect={setSelected} />
        </motion.article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="Blog — Free Media Tools, AI Guides & Tutorials"
        description="Tips, guides, and tutorials for YouTube tools, audio, image processing, and AI-powered media tools. Researched and edited by Ultra Media AI Hub."
        path="/blog"
        jsonLd={collectionJsonLd({ name: "Ultra Media AI Hub Blog", url: `${SITE_URL}/blog`, description: "Guides and tutorials for AI and media tools." })}
      />
      <PageHeader icon={<BookOpen className="h-5 w-5" />} title="Blog" description="Tips, guides, and tutorials for YouTube tools, audio conversion, image processing, and AI-powered media tools." />

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

      <div className="space-y-4">
        {filtered.map((post, i) => (
          <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <button onClick={() => setSelected(post.slug)} className="w-full text-left glass-panel rounded-xl p-5 md:p-6 hover:glow-sm transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                  <h2 className="font-display text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                  <p className="text-muted-foreground/60 text-xs mt-2">{post.date}{post.lastUpdated && post.lastUpdated !== post.date ? ` · Updated ${post.lastUpdated}` : ""}</p>
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
