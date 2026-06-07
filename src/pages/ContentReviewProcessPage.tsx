import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { ClipboardCheck } from "lucide-react";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonLd";

const steps = [
  { n: 1, title: "Topic Research", body: "We pick topics based on real user questions, search demand, and gaps in existing coverage. Every brief includes target keywords, audience level, and intended outcome." },
  { n: 2, title: "Primary-Source Drafting", body: "A practitioner with hands-on experience drafts the article using primary sources — vendor documentation, official APIs, peer-reviewed studies, and personal testing." },
  { n: 3, title: "Fact-Checking", body: "Every claim, statistic, and product capability is verified against a primary source. We do not republish unverified vendor marketing." },
  { n: 4, title: "Editorial Review", body: "An editor checks structure, clarity, reading level, accessibility, internal linking, and EEAT signals (author attribution, last-updated date, sources)." },
  { n: 5, title: "Publishing", body: "Articles go live with full attribution, schema markup (Article, FAQ, Breadcrumb), and canonical URL. Each is added to the sitemap on publish day." },
  { n: 6, title: "90-Day Refresh", body: "Every article is re-checked at least every 90 days. Outdated facts are corrected, broken links are fixed, and the last-updated date is bumped transparently." },
  { n: 7, title: "Corrections", body: "If a reader reports an error and we confirm it, we update the article and add a visible correction note. Material changes are logged." },
];

export default function ContentReviewProcessPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <SEO
        title="Content Review Process — Ultra Media AI Hub"
        description="How we research, draft, fact-check, edit, publish, and refresh every article on Ultra Media AI Hub. Full editorial workflow."
        path="/content-review-process"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About", url: `${SITE_URL}/about` },
          { name: "Content Review Process", url: `${SITE_URL}/content-review-process` },
        ])}
      />
      <Breadcrumbs items={[{ label: "About", to: "/about" }, { label: "Content Review Process" }]} />
      <PageHeader icon={<ClipboardCheck className="h-5 w-5" />} title="Content Review Process" description="The 7-step workflow behind every article we publish." />

      <div className="space-y-3 mb-6">
        {steps.map(s => (
          <div key={s.n} className="glass-panel rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-display font-bold flex items-center justify-center flex-shrink-0">{s.n}</div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="glass-panel rounded-xl p-6 mb-4">
        <h3 className="font-display font-bold text-foreground mb-2">Publishing Guidelines</h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
          <li>Author byline on every article — never "Admin" or unsigned.</li>
          <li>Published and last-updated dates always visible.</li>
          <li>Sources linked inline; affiliate disclosure where applicable.</li>
          <li>No sponsored placements disguised as editorial.</li>
          <li>AI assistance is disclosed in our <Link to="/ai-policy" className="text-primary hover:underline">AI Usage Policy</Link>.</li>
        </ul>
      </section>

      <section className="glass-panel rounded-xl p-6">
        <h3 className="font-display font-bold text-foreground mb-2">Related Policies</h3>
        <ul className="text-sm space-y-1">
          <li><Link to="/editorial-policy" className="text-primary hover:underline">Editorial Policy</Link></li>
          <li><Link to="/ai-policy" className="text-primary hover:underline">AI Usage Policy</Link></li>
          <li><Link to="/dmca" className="text-primary hover:underline">DMCA</Link></li>
          <li><Link to="/disclaimer" className="text-primary hover:underline">Disclaimer</Link></li>
        </ul>
      </section>
    </div>
  );
}
