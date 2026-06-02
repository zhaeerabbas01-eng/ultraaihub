import { PageHeader } from "@/components/PageHeader";
import { BookCheck } from "lucide-react";

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<BookCheck className="h-5 w-5" />} title="Editorial Policy" description="How we research, write, review, and update content on Ultra Media AI Hub." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> June 2, 2026</p>

        <h2 className="text-foreground font-display">Our Editorial Mission</h2>
        <p className="text-muted-foreground">Every guide and tutorial published on Ultra Media AI Hub exists to genuinely help creators, marketers, and small businesses make better decisions about AI and media tools. We prioritize practical experience over hype, and we never publish a recommendation we wouldn't act on ourselves.</p>

        <h2 className="text-foreground font-display">Who Writes Our Content</h2>
        <p className="text-muted-foreground">Articles are written and edited by Muhammad Usman Zaheer (founder, MUTECH BAAR) along with vetted contributors who have first-hand experience in AI, video production, YouTube growth, or web technology. Author names and bios are attached to every long-form post.</p>

        <h2 className="text-foreground font-display">How We Research and Test Tools</h2>
        <ul className="text-muted-foreground">
          <li><strong>Hands-on use</strong> — Every tool we recommend is tested on real projects for at least one week before publication.</li>
          <li><strong>Multiple test cases</strong> — We benchmark each tool across at least 3 representative inputs (e.g., different image styles, video niches, languages).</li>
          <li><strong>Primary sources</strong> — Pricing, feature lists, and technical claims are verified against the vendor's official documentation on the date of publication.</li>
          <li><strong>Independent voice</strong> — We disclose any partnerships or affiliate relationships clearly within the article.</li>
        </ul>

        <h2 className="text-foreground font-display">Fact-Checking</h2>
        <p className="text-muted-foreground">Before publishing, every article passes a two-step review: a technical accuracy check (numbers, code snippets, API behavior) and an editorial pass for clarity, neutrality, and source attribution. Statistics older than 12 months are flagged for re-verification.</p>

        <h2 className="text-foreground font-display">Updates and Corrections</h2>
        <p className="text-muted-foreground">The AI and creator-tools space moves quickly. We audit our most-read articles at least every 6 months and add a "Last updated" date when we make substantive changes. If you spot an inaccuracy, email <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a> and we will investigate within 5 business days.</p>

        <h2 className="text-foreground font-display">Independence and Conflicts of Interest</h2>
        <p className="text-muted-foreground">We do not accept payment in exchange for positive coverage. Sponsored placements, when they occur, are clearly labeled "Sponsored" or "In partnership with". Editorial decisions are never influenced by advertisers, including programmatic ad partners such as Google AdSense.</p>

        <h2 className="text-foreground font-display">Use of AI in Our Workflow</h2>
        <p className="text-muted-foreground">We use AI assistants for research, outline drafting, and grammar checks, but every published article is reviewed, rewritten where needed, and approved by a human editor. See our <a href="/ai-policy" className="text-primary hover:underline">AI Usage Policy</a> for details.</p>

        <h2 className="text-foreground font-display">Reader Feedback</h2>
        <p className="text-muted-foreground">We welcome corrections, tips, and topic suggestions. Reach the editorial desk at <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a>.</p>
      </div>
    </div>
  );
}
