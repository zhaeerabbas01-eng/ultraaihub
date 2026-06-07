import { PageHeader } from "@/components/PageHeader";
import { Building2, Mail, Globe, Users, ShieldCheck, BookCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="About Ultra Media AI Hub — MUTECH BAAR & Muhammad Usman Zaheer"
        description="About Ultra Media AI Hub: independent AI media tools and editorial publication by MUTECH BAAR, founded by Muhammad Usman Zaheer."
        path="/about"
      />
      <Breadcrumbs items={[{ label: "About" }]} />
      <PageHeader
        icon={<Building2 className="h-5 w-5" />}
        title="About Ultra Media AI Hub"
        description="An independent AI tools platform built and edited by working creators — not a content farm."
      />

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link to="/founder" className="text-primary hover:underline">Founder profile →</Link>
        <Link to="/editorial-team" className="text-primary hover:underline">Editorial team →</Link>
        <Link to="/content-review-process" className="text-primary hover:underline">Content review process →</Link>
      </div>


      <div className="space-y-6">
        {/* Mission */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ultra Media AI Hub is operated by <strong className="text-foreground">MUTECH BAAR</strong>, a small independent studio founded in 2024 by <strong className="text-foreground">Muhammad Usman Zaheer</strong>. We build privacy-first AI utilities for YouTubers, marketers, designers, and small businesses — and we publish honest, hands-on guides to the AI tools we use every day.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We are not a VC-funded startup or a faceless content farm. Every tool on this site is shipped, tested, and maintained by a human team. Every article is written or edited by a named author. If something breaks, you can email the founder directly.
          </p>
        </motion.section>

        {/* Founder */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Meet the Founder</h2>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-display font-bold shrink-0">
              MU
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-foreground">Muhammad Usman Zaheer</strong> — Founder &amp; lead engineer, MUTECH BAAR. Background in full-stack web development and applied AI, with hands-on experience in YouTube content production, media processing pipelines, and client-side image/audio tooling.
              </p>
              <p>
                Usman writes and reviews the technical guides on this site, designs the tools, and operates the editorial workflow. Reach him at <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a>.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Why trust us */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Why Trust Ultra Media AI Hub</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Named human author and editor on every long-form article.",
              "All tools tested by our team before public release — no auto-generated tool listings.",
              "Privacy-first architecture: image and audio processing runs client-side wherever technically possible.",
              "No hidden affiliate manipulation — sponsored content is labeled clearly.",
              "Public Editorial, AI Usage, and DMCA policies governing how we publish.",
              "Direct, responsive support from the founder — not an outsourced ticket queue.",
            ].map((line, i) => (
              <li key={i} className="flex gap-3"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{line}</span></li>
            ))}
          </ul>
        </motion.section>

        {/* How we test */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">How We Test AI Tools</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h3 className="text-foreground font-semibold mb-1">1. Real-world use</h3>
              <p>We use each tool on actual projects — YouTube thumbnails we publish, podcasts we edit, images we ship — for at least one week before writing about it.</p>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">2. Benchmark inputs</h3>
              <p>Every tool is run against a fixed set of test prompts, audio clips, and reference images so reviews can be compared apples-to-apples.</p>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">3. Primary-source verification</h3>
              <p>Pricing, limits, and feature claims are checked against the vendor's own documentation on the publication date.</p>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">4. Re-audit every 6 months</h3>
              <p>Our most-read guides are revisited at least twice a year. Updates are dated and changelogged.</p>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Users, title: "Creator-first", desc: "Built for YouTubers, marketers, and indie founders." },
            { icon: Globe, title: "Global, free", desc: "Available worldwide without paywalls or signup." },
            { icon: ShieldCheck, title: "Privacy-first", desc: "Most processing runs client-side in your browser." },
          ].map((item, i) => (
            <div key={i} className="glass-panel rounded-xl p-6 text-center">
              <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Policies */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Public Policies</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link to="/editorial-policy" className="flex items-center gap-2 text-primary hover:underline"><BookCheck className="h-4 w-4" /> Editorial Policy</Link>
            <Link to="/ai-policy" className="flex items-center gap-2 text-primary hover:underline"><Sparkles className="h-4 w-4" /> AI Usage Policy</Link>
            <Link to="/dmca" className="flex items-center gap-2 text-primary hover:underline"><ShieldCheck className="h-4 w-4" /> DMCA Policy</Link>
            <Link to="/privacy" className="flex items-center gap-2 text-primary hover:underline"><ShieldCheck className="h-4 w-4" /> Privacy Policy</Link>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact</h2>
          <p className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
          <p className="text-muted-foreground mt-2">Company: MUTECH BAAR</p>
          <p className="text-muted-foreground mt-2">Founder &amp; Editor: Muhammad Usman Zaheer</p>
        </motion.section>
      </div>
    </div>
  );
}
