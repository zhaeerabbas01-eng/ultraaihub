import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Eye, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

const NICHES = [
  { value: "tech", label: "Science & Technology", cpm: 20.8, rpm: 11.44 },
  { value: "finance", label: "Finance & Business", cpm: 30.0, rpm: 16.5 },
  { value: "education", label: "Education", cpm: 12.0, rpm: 6.6 },
  { value: "gaming", label: "Gaming", cpm: 4.0, rpm: 2.2 },
  { value: "vlog", label: "Vlog / Lifestyle", cpm: 3.0, rpm: 1.65 },
  { value: "music", label: "Music", cpm: 2.5, rpm: 1.37 },
  { value: "beauty", label: "Beauty & Fashion", cpm: 7.0, rpm: 3.85 },
  { value: "food", label: "Food & Cooking", cpm: 5.5, rpm: 3.02 },
  { value: "kids", label: "Kids & Family", cpm: 1.5, rpm: 0.82 },
  { value: "sports", label: "Sports", cpm: 3.5, rpm: 1.92 },
];

export default function EarningsCalculatorPage() {
  const [viewsPerDay, setViewsPerDay] = useState(1000);
  const [avgView, setAvgView] = useState(41);
  const [engagement, setEngagement] = useState(29);
  const [niche, setNiche] = useState("tech");
  const [customCpm, setCustomCpm] = useState(3.4);

  const result = useMemo(() => {
    const n = NICHES.find(x => x.value === niche)!;
    // blended cpm: weight selected niche cpm + custom cpm equally
    const blendedCpm = (n.cpm + customCpm) / 2;
    // adjustment factor based on view% and engagement
    const factor = (avgView / 100) * (0.6 + (engagement / 100) * 0.8);
    const dailyEarn = (viewsPerDay / 1000) * blendedCpm * factor;
    const monthly = dailyEarn * 30;
    const yearly = dailyEarn * 365;
    return {
      daily: dailyEarn.toFixed(2),
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
      yearlyViews: viewsPerDay * 365,
      monthlyViews: viewsPerDay * 30,
      cpm: n.cpm,
      rpm: n.rpm,
    };
  }, [viewsPerDay, avgView, engagement, niche, customCpm]);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={<Calculator className="h-5 w-5" />} title="YouTube Earnings Calculator" description="Estimate YouTube revenue based on total views, engagement and niche CPM." />

      <div className="glass-panel rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-primary/60 p-5">
          <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">Estimated YouTube Revenue Based on Total Views</h2>
          <p className="text-xs md:text-sm text-primary-foreground/80 mt-1">Move the sliders below to adjust views, engagement and CPM. The number you enter might earn you up to a quarter of a million dollars.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Sliders */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Views/Day</span><span className="text-primary">{fmt(viewsPerDay)}</span>
              </label>
              <Slider min={1000} max={1000000} step={1000} value={[viewsPerDay]} onValueChange={v => setViewsPerDay(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>1,000</span><span>500,000</span><span>1,000,000</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Average Percentage View (%)</span><span className="text-primary">{avgView}</span>
              </label>
              <Slider min={1} max={100} step={1} value={[avgView]} onValueChange={v => setAvgView(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>1</span><span>50</span><span>100</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Average Engagement Rate (%)</span><span className="text-primary">{engagement}</span>
              </label>
              <Slider min={1} max={100} step={1} value={[engagement]} onValueChange={v => setEngagement(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>0.1</span><span>50</span><span>100</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">CPM by Category ($)</label>
              <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.label} (CPM: ${n.cpm} | RPM: ${n.rpm})</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground flex justify-between mb-2">
                <span>Custom CPM ($)</span><span className="text-primary">{customCpm.toFixed(2)}</span>
              </label>
              <Slider min={0} max={20} step={0.1} value={[customCpm]} onValueChange={v => setCustomCpm(v[0])} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>
          </div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/30">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4 text-primary" /> Daily</span>
              <span className="font-display font-bold text-foreground">${result.daily}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/30">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /> Monthly</span>
              <span className="font-display font-bold text-foreground">${result.monthly}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center border border-primary/40 bg-primary/5">
              <span className="flex items-center gap-2 text-sm text-foreground font-semibold"><TrendingUp className="h-4 w-4 text-primary" /> Yearly</span>
              <span className="font-display font-bold text-primary text-lg">${result.yearly}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Views per year</span>
              <span className="font-medium text-primary">{fmt(result.yearlyViews)}</span>
            </div>
            <div className="glass-panel rounded-xl p-4 flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Views per month</span>
              <span className="font-medium text-primary">{fmt(result.monthlyViews)}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <article className="glass-panel rounded-xl p-6 mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">YouTube Earnings Calculator — Free Online Tool</h2>
        <p>This calculator shows how much YouTube pays based on the number of views. Move the sliders to adjust views, average view percentage, engagement rate and CPM. The formula combines niche CPM with engagement and watch-time signals to estimate realistic creator earnings.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">How It Works</h3>
        <p>Earnings = (Views/1000) × Blended CPM × (AvgView% × Engagement Factor). Daily earnings are projected to monthly and yearly figures. CPM (Cost Per Mille) varies by niche — Finance and Tech earn the highest while Gaming and Music are lower.</p>

        <h3 className="font-display text-lg font-semibold text-foreground">Tips to Increase Earnings</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Choose a high-CPM niche like Finance, Tech or Education.</li>
          <li>Improve average view duration with strong intros.</li>
          <li>Boost engagement (likes, comments, shares) for better ad rates.</li>
          <li>Target US, UK, Canada and Australia audiences for higher CPM.</li>
          <li>Use mid-roll ads on videos longer than 8 minutes.</li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-foreground">Disclaimer</h3>
        <p>This is an estimate. Actual YouTube earnings depend on AdSense, audience location, ad format, watch time, and YouTube's revenue share (55% to creator).</p>
      </article>
    </div>
  );
}
