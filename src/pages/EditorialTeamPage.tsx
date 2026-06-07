import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Users, CheckCircle } from "lucide-react";
import { authors } from "@/data/authors";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonLd";

export default function EditorialTeamPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="Editorial Team — Ultra Media AI Hub"
        description="Meet the editorial team behind Ultra Media AI Hub. Researchers, fact-checkers, and editors who maintain every guide and tool review."
        path="/editorial-team"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About", url: `${SITE_URL}/about` },
          { name: "Editorial Team", url: `${SITE_URL}/editorial-team` },
        ])}
      />
      <Breadcrumbs items={[{ label: "About", to: "/about" }, { label: "Editorial Team" }]} />
      <PageHeader icon={<Users className="h-5 w-5" />} title="Editorial Team" description="The people responsible for the accuracy of every article on Ultra Media AI Hub." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {authors.map(a => (
          <Link key={a.slug} to={`/author/${a.slug}`} className="glass-panel rounded-xl p-5 hover:glow-sm transition-all flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary flex-shrink-0">{a.initials}</div>
            <div>
              <h3 className="font-display font-semibold text-foreground">{a.name}</h3>
              <p className="text-primary text-xs">{a.role}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{a.bio}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="glass-panel rounded-xl p-6 mb-6">
        <h3 className="font-display font-bold text-foreground mb-3">Editorial Standards</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "Every article is drafted by a practitioner with hands-on experience in the topic.",
            "Claims are verified against primary sources (vendor docs, official APIs, peer-reviewed research).",
            "Tool reviews are based on real, repeated testing — not press releases.",
            "Articles are reviewed and updated at least every 90 days.",
            "AI assistance is disclosed; editorial responsibility always stays with a named human.",
          ].map(t => (
            <li key={t} className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {t}</li>
          ))}
        </ul>
      </section>

      <section className="glass-panel rounded-xl p-6">
        <h3 className="font-display font-bold text-foreground mb-3">Get in Touch</h3>
        <p className="text-sm text-muted-foreground">Spot an error? Suggest a correction via our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>. Read the full <Link to="/editorial-policy" className="text-primary hover:underline">Editorial Policy</Link> and <Link to="/content-review-process" className="text-primary hover:underline">Content Review Process</Link>.</p>
      </section>
    </div>
  );
}
