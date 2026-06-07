import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-primary inline-flex items-center gap-1"><Home className="h-3 w-3" /> Home</Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {c.to ? <Link to={c.to} className="hover:text-primary">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
