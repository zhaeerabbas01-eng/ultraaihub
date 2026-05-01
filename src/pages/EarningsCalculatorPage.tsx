import { useState, useMemo } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const NICHES = [
  { value: "tech", label: "Tech & Gadgets", low: 4, high: 9 },
  { value: "gaming", label: "Gaming", low: 1.5, high: 4 },
  { value: "education", label: "Education", low: 5, high: 12 },
  { value: "vlog", label: "Vlog / Lifestyle", low: 1, high: 3 },
  { value: "finance", label: "Finance & Business", low: 12, high: 30 },
];

export default function EarningsCalculatorPage() {
  const [views, setViews] = useState("100000");
  const [niche, setNiche] = useState("tech");

  const result = useMemo(() => {
    const v = parseInt(views.replace(/,/g, ""), 10);
    const n = NICHES.find(x => x.value === niche)!;
    if (isNaN(v) || v <= 0) return null;
    const k = v / 1000;
    return {
      low: (k * n.low).toFixed(2),
      high: (k * n.high).toFixed(2),
      cpmLow: n.low,
      cpmHigh: n.high,
      label: n.label,
    };
  }, [views, niche]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<Calculator className="h-5 w-5" />} title="YouTube Earnings Calculator" description="Estimate potential ad revenue based on views and niche CPM." />
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Total Views</label>
            <Input type="number" value={views} onChange={e => setViews(e.target.value)} placeholder="100000" className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Niche</label>
            <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="glass-panel rounded-lg p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Estimated Earnings ({result.label})</p>
              <p className="font-display text-3xl md:text-4xl font-bold gradient-text">${result.low} – ${result.high}</p>
              <p className="text-xs text-muted-foreground mt-2">CPM Range: ${result.cpmLow} – ${result.cpmHigh}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/70 italic text-center">Formula: (Views ÷ 1000) × CPM. Actual earnings vary by audience location, watch time, ad format, and YouTube's revenue share (55% to creator).</p>
          </motion.div>
        )}
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Earnings Calculator — Free Online Tool</h2>
        <p><strong className="text-foreground">YouTube Earnings Calculator</strong> aap ko batata hai ke aap ki video ya channel approximately kitna earn kar sakta hai. Calculation simple formula par based hai: <em>Earnings = (Views ÷ 1000) × CPM</em>. CPM (Cost Per Mille) niche ke hisab se change hota hai — Finance niche ka CPM Gaming se kayi guna zyada hota hai.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">How to Use</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Total views enter karein (jitne views aap ne earn kiye).</li>
          <li>Apni niche dropdown se select karein (Tech, Gaming, Education, Vlog, Finance).</li>
          <li>Result automatically low aur high estimate ke sath show ho jaye ga.</li>
          <li>Different niches try kar ke compare karein.</li>
          <li>Ye estimated revenue hai — actual amount AdSense dashboard mein milta hai.</li>
        </ol>

        <h3 className="font-display text-lg font-semibold text-foreground">Key Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Niche-Based CPM:</strong> 5 popular niches ke real-world CPM ranges.</li>
          <li><strong className="text-foreground">Instant Calculation:</strong> Type karte hi result update hota hai.</li>
          <li><strong className="text-foreground">Low to High Range:</strong> Realistic minimum aur maximum estimate.</li>
          <li><strong className="text-foreground">100% Free:</strong> Koi signup, koi limit, koi ad waiting time.</li>
          <li><strong className="text-foreground">Mobile Optimized:</strong> Phone aur desktop dono par smooth.</li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-foreground">SEO Importance</h3>
        <p>Earnings calculator creators ko goal setting mein madad deta hai. Aap dekh sakte hain ke 1 million views se kitna earning hoga aur usi hisab se apni content strategy plan kar sakte hain. Sponsorship deals negotiate karte waqt bhi ye numbers helpful hote hain. SEO experts is tool ko niche selection ke liye bhi use karte hain — jis niche ka CPM zyada hai us mein content banana zyada profitable hota hai.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">FAQ</h3>
        <div className="space-y-2">
          <p><strong className="text-foreground">Q1. Result kitna accurate hai?</strong><br/>Industry standard CPM ke base par estimate hai. Actual earnings audience country, ad format aur watch time par depend karti hain.</p>
          <p><strong className="text-foreground">Q2. CPM aur RPM mein farq?</strong><br/>CPM advertiser ka cost hai, RPM creator ki actual earning hoti hai (YouTube apna 45% rakhta hai).</p>
          <p><strong className="text-foreground">Q3. Konsi niche sab se zyada earn karti hai?</strong><br/>Finance, Insurance aur B2B niches ka CPM sab se highest hota hai.</p>
          <p><strong className="text-foreground">Q4. Shorts ka calculation alag hota hai?</strong><br/>Haan, YouTube Shorts ka revenue model alag hai aur CPM bohot kam hota hai.</p>
          <p><strong className="text-foreground">Q5. Tool free hai?</strong><br/>100% free, koi hidden charges nahi.</p>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground">Legal Disclaimer</h3>
        <p>Ye calculator sirf estimation purpose ke liye hai. Actual YouTube earnings YouTube Studio AdSense dashboard mein dikhti hain. Hum koi guarantee nahi dete aur kisi bhi financial decision ki responsibility user ki hoti hai.</p>
      </article>
    </div>
  );
}
