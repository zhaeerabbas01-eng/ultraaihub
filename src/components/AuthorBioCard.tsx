import { Link } from "react-router-dom";
import { authors } from "@/data/authors";

export function AuthorBioCard({ slug = "usman-zaheer" }: { slug?: string }) {
  const a = authors.find(x => x.slug === slug) ?? authors[0];
  return (
    <aside className="glass-panel rounded-xl p-5 mt-8 flex items-start gap-4">
      {a.image ? (
        <img src={a.image} alt={`${a.name} — ${a.role}`} loading="lazy" className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/40 flex-shrink-0" />
      ) : (
        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-lg flex-shrink-0">
          {a.initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Written by</p>
        <Link to={`/author/${a.slug}`} className="font-display font-semibold text-foreground hover:text-primary">{a.name}</Link>
        <p className="text-xs text-muted-foreground mt-0.5">{a.role}</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a.bio}</p>
        <Link to={`/author/${a.slug}`} className="text-xs text-primary mt-2 inline-block hover:underline">View profile →</Link>
      </div>
    </aside>
  );
}
