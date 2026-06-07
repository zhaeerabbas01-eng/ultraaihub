import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { User, Mail, CheckCircle } from "lucide-react";
import { authors } from "@/data/authors";
import { blogArticles } from "@/data/blogArticles";
import { personJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonLd";

export default function AuthorProfilePage() {
  const { slug = "usman-zaheer" } = useParams();
  const author = authors.find(a => a.slug === slug) ?? authors[0];
  const articles = blogArticles.filter((a: any) => (a.authorSlug ?? "usman-zaheer") === author.slug);

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title={`${author.name} — ${author.role}`}
        description={author.bio.slice(0, 158)}
        path={`/author/${author.slug}`}
        jsonLd={[
          personJsonLd({ name: author.name, url: `${SITE_URL}/author/${author.slug}`, jobTitle: author.role, description: author.bio }),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Authors", url: `${SITE_URL}/editorial-team` },
            { name: author.name, url: `${SITE_URL}/author/${author.slug}` },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Editorial Team", to: "/editorial-team" }, { label: author.name }]} />
      <PageHeader icon={<User className="h-5 w-5" />} title={author.name} description={author.role} />

      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-2xl flex-shrink-0">{author.initials}</div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{author.name}</h2>
            <p className="text-primary text-sm">{author.role}</p>
            {author.email && (
              <a href={`mailto:${author.email}`} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-2"><Mail className="h-3 w-3" /> {author.email}</a>
            )}
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{author.bio}</p>
          </div>
        </div>
      </div>

      <section className="glass-panel rounded-xl p-6 mb-6">
        <h3 className="font-display font-bold text-foreground mb-3">Areas of Expertise</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {author.expertise.map(e => (
            <li key={e} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> {e}</li>
          ))}
        </ul>
      </section>

      <section className="glass-panel rounded-xl p-6 mb-6">
        <h3 className="font-display font-bold text-foreground mb-3">Editorial Standards</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">Every article is researched from primary sources, drafted by domain practitioners, fact-checked, edited for clarity, and reviewed at least every 90 days. Read our full <Link to="/editorial-policy" className="text-primary hover:underline">Editorial Policy</Link> and <Link to="/content-review-process" className="text-primary hover:underline">Content Review Process</Link>.</p>
      </section>

      <section>
        <h3 className="font-display font-bold text-foreground mb-3">Articles by {author.name.split(" ")[0]}</h3>
        <div className="space-y-3">
          {articles.length === 0 && <p className="text-sm text-muted-foreground">No articles published yet.</p>}
          {articles.map(a => (
            <Link key={a.slug} to={`/blog?post=${a.slug}`} className="block glass-panel rounded-xl p-4 hover:glow-sm transition-all">
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">{a.category}</span>
              <h4 className="font-display font-semibold text-foreground text-sm mt-2">{a.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{a.date} · {a.readTime}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
