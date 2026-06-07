import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Folder, Clock, ArrowRight } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";
import { collectionJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonLd";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const articles = blogArticles.filter(a => slugify(a.category) === slug);
  const categoryName = articles[0]?.category ?? slug.replace(/-/g, " ");
  const url = `${SITE_URL}/category/${slug}`;

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title={`${categoryName} — Articles & Guides`}
        description={`Browse all ${categoryName} guides, tutorials, and tool reviews on Ultra Media AI Hub. Updated regularly by our editorial team.`}
        path={`/category/${slug}`}
        jsonLd={[
          collectionJsonLd({ name: categoryName, url, description: `${categoryName} guides on Ultra Media AI Hub` }),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Blog", url: `${SITE_URL}/blog` },
            { name: categoryName, url },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: categoryName }]} />
      <PageHeader icon={<Folder className="h-5 w-5" />} title={categoryName} description={`${articles.length} article${articles.length === 1 ? "" : "s"} in this category.`} />

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-sm">No articles in this category yet. <Link to="/blog" className="text-primary hover:underline">Browse all articles</Link>.</p>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <Link key={a.slug} to={`/blog?post=${a.slug}`} className="block glass-panel rounded-xl p-5 hover:glow-sm transition-all group">
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">{a.category}</span>
              <h3 className="font-display font-semibold text-foreground mt-2 group-hover:text-primary">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {a.readTime} · {a.date}</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
