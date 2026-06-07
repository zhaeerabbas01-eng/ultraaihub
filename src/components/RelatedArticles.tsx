import { blogArticles } from "@/data/blogArticles";
import { Clock, ArrowRight } from "lucide-react";

export function RelatedArticles({ currentSlug, category, onSelect }: { currentSlug: string; category: string; onSelect: (slug: string) => void }) {
  const related = blogArticles
    .filter(a => a.slug !== currentSlug && a.category === category)
    .slice(0, 3);
  const filler = blogArticles.filter(a => a.slug !== currentSlug && !related.find(r => r.slug === a.slug)).slice(0, 3 - related.length);
  const items = [...related, ...filler].slice(0, 3);
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map(a => (
          <button key={a.slug} onClick={() => onSelect(a.slug)} className="text-left glass-panel rounded-xl p-4 hover:glow-sm transition-all group">
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">{a.category}</span>
            <h4 className="font-display font-semibold text-foreground text-sm mt-2 line-clamp-2 group-hover:text-primary">{a.title}</h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.readTime}</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
