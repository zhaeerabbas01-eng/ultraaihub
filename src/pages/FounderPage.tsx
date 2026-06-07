import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Award, Briefcase, GraduationCap, Target } from "lucide-react";
import { personJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonLd";

export default function FounderPage() {
  const founder = {
    name: "Muhammad Usman Zaheer",
    role: "Founder & CEO, MUTECH BAAR",
    bio: "Muhammad Usman Zaheer is the founder of MUTECH BAAR and the lead architect behind Ultra Media AI Hub. He has spent years building consumer-facing creator tools, AI-assisted workflows, and content platforms used by tens of thousands of creators worldwide.",
  };
  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="Muhammad Usman Zaheer — Founder, MUTECH BAAR"
        description="Meet Muhammad Usman Zaheer — founder of MUTECH BAAR and editor-in-chief of Ultra Media AI Hub. Background, expertise, and editorial leadership."
        path="/founder"
        jsonLd={[
          personJsonLd({ name: founder.name, url: `${SITE_URL}/founder`, jobTitle: founder.role, description: founder.bio }),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "About", url: `${SITE_URL}/about` },
            { name: "Founder", url: `${SITE_URL}/founder` },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "About", to: "/about" }, { label: "Founder" }]} />
      <PageHeader icon={<Award className="h-5 w-5" />} title="Meet the Founder" description="Muhammad Usman Zaheer · Founder & CEO, MUTECH BAAR" />

      <div className="glass-panel rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-start gap-5">
        <img
          src="/__l5e/assets-v1/225c5f66-f298-4f76-8ce0-ed254cf64932/founder-usman.png"
          alt="Muhammad Usman Zaheer — Founder & CEO, MUTECH BAAR"
          loading="lazy"
          className="h-32 w-32 rounded-2xl object-cover ring-2 ring-primary/40 shadow-lg flex-shrink-0"
        />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{founder.name}</h2>
          <p className="text-primary">{founder.role}</p>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{founder.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass-panel rounded-xl p-5">
          <Briefcase className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-display font-semibold text-foreground mb-2">Experience</h3>
          <p className="text-sm text-muted-foreground">Founder of MUTECH BAAR. Builder of MUTECHAI marketplace. Product lead on multiple creator and AI tooling launches with global users.</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <GraduationCap className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-display font-semibold text-foreground mb-2">Expertise</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• AI tools, prompt engineering, workflow automation</li>
            <li>• YouTube growth, monetization, and SEO</li>
            <li>• Image & video processing pipelines</li>
            <li>• Technical SEO and EEAT publishing</li>
          </ul>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <Target className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-display font-semibold text-foreground mb-2">Mission</h3>
          <p className="text-sm text-muted-foreground">Make professional-grade AI and media tools free, private, and genuinely useful for creators, students, and small businesses — no signups, no dark patterns.</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <Award className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-display font-semibold text-foreground mb-2">Editorial Role</h3>
          <p className="text-sm text-muted-foreground">As editor-in-chief, oversees research, fact-checking, and the 90-day refresh cycle for every guide on the site. See <Link to="/editorial-policy" className="text-primary hover:underline">Editorial Policy</Link>.</p>
        </div>
      </div>

      <section className="glass-panel rounded-xl p-6">
        <h3 className="font-display font-bold text-foreground mb-3">Contact & Connect</h3>
        <p className="text-sm text-muted-foreground">Email: <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
        <p className="text-sm text-muted-foreground mt-2">For editorial questions, see the <Link to="/content-review-process" className="text-primary hover:underline">Content Review Process</Link> or the <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
      </section>
    </div>
  );
}
