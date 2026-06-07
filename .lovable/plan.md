## Phase 2 + Phase 3 — AdSense Authority, SEO Trust & Content Expansion

**Guardrail:** No tool page, edge function, API, business logic, or user-facing functionality will be modified. All work is in content, SEO metadata, structured data, new informational pages, and homepage trust sections.

---

### 1. Content Authority — 7 New Long-Form Articles

Append to `src/data/blogArticles.ts`. Each article: 1800–3000 words, human-tone, EEAT-aligned, plagiarism-free, with intro → 5–7 H2 sections → tables/lists where useful → FAQ block (4–6 Qs) → conclusion → 3–5 internal links to existing tools/articles → 1–3 outbound authority links (Google, OpenAI, W3C, MIT etc.) → author byline, published date, last-updated date, focusKeyword, tags, category.

Topics:
1. Best Free AI Tools for Students in 2026
2. How AI Is Changing Content Creation
3. Complete Beginner Guide to Prompt Engineering
4. Best AI Video Generators Compared (2026)
5. AI Productivity Tools for Freelancers
6. The Future of Artificial Intelligence in Daily Life
7. AI Tools for Small Business Owners

Extend the `BlogArticle` type with `lastUpdated`, `author`, `authorSlug`, `tags[]`, `relatedSlugs[]` (backfill optional fields for older articles).

---

### 2. Author & Editorial Authority Pages

New routes + pages:
- `/author/usman-zaheer` → `src/pages/AuthorProfilePage.tsx` (dynamic by slug; founder is first author)
- `/founder` → `src/pages/FounderPage.tsx` (Muhammad Usman Zaheer — bio, expertise, credentials, photo from `src/assets/founder-usman.png`)
- `/editorial-team` → `src/pages/EditorialTeamPage.tsx` (team roles, expertise areas, contact)
- `/content-review-process` → `src/pages/ContentReviewProcessPage.tsx` (research → draft → fact-check → edit → publish → 90-day review)
- `/category/:slug` → `src/pages/CategoryPage.tsx` (lists articles per category for SEO-friendly category hubs)

Each page covers: expertise, editorial standards, fact-checking, content update policy, publishing guidelines, corrections policy.

Register all routes in `src/App.tsx` and link from `Footer.tsx` + About page.

---

### 3. Reading UX (Blog Only)

In `src/pages/BlogPage.tsx` article view:
- `ReadingProgressBar` component (fixed top, scroll-driven, primary color)
- `Breadcrumbs` component: Home › Blog › {Category} › {Title}
- Estimated reading time (already present — keep)
- "Last updated" line beside published date
- Author bio card under content (avatar, name, role, link to author page)
- "Related articles" grid (3 cards) from same category / matching tags

New components: `src/components/ReadingProgressBar.tsx`, `src/components/Breadcrumbs.tsx`, `src/components/AuthorBioCard.tsx`, `src/components/RelatedArticles.tsx`.

---

### 4. Structured Data (JSON-LD)

Install `react-helmet-async` and wrap app in `HelmetProvider` (`src/main.tsx`).

Inject JSON-LD via `<Helmet>` per page type:
- **Organization** + **WebSite** (with SearchAction) — `index.html` (sitewide static)
- **Article** + **BreadcrumbList** + **FAQPage** — blog article view
- **BreadcrumbList** — all inner pages
- **Person** — founder + author pages
- **CollectionPage** — category pages

Helper: `src/lib/seo/jsonLd.ts` with typed builders.

---

### 5. Per-Page SEO Meta

Using `react-helmet-async`, add unique title / description / canonical / OG / Twitter Card tags to every route. Remove duplicate canonical from `index.html` (keep sitewide OG as fallback).

Apply to: Home, all 10 tool pages, Blog list, Blog article (dynamic), About, Contact, Help, Founder, Author, Editorial Team, Content Review, Category, all legal pages.

Helper: `src/components/SEO.tsx` (props: title, description, canonical, ogImage?, type?, jsonLd?).

---

### 6. Homepage Trust Rebuild

Edit `src/pages/HomePage.tsx` — add new sections (keep existing tool grid + stats intact):
- **Mission statement** band (1 paragraph, value proposition)
- **Why trust us** (4 cards: transparent ownership, no data stored, human-edited content, free forever)
- **Featured articles** strip (3 cards from new long-form posts)
- **Featured tools** highlight (top 3 tools — visual link to detail)
- **Editorial standards** mini-section (links to Editorial Policy + Content Review)
- **Recent updates** changelog list (last 5 article/tool updates, dated)

---

### 7. Internal Linking Layer

- Footer: add Author, Founder, Editorial Team, Content Review links
- Blog articles: ensure 3–5 contextual internal links each (tools + other articles)
- Category pages cross-link to related categories
- Author page lists all that author's articles
- All legal pages link to Editorial Policy / Content Review for context

---

### 8. Sitemap + Robots

Update `public/sitemap.xml`: fix mixed domains (some entries use `ultraaihub` vs `ultramediaaihub` — standardize to `https://ultraaihub.lovable.app`), add all 7 new articles, author/founder/editorial/review/category routes. `robots.txt` already correct — leave as is.

---

### 9. AdSense Readiness Report

Generate `/mnt/documents/adsense-readiness-report-v2.md`:
- Per-page audit table (URL, word count, meta status, schema status, internal links, verdict)
- Compliance score (target 92/100+)
- Remaining policy risks (e.g. YouTube downloader page wording — recommend disclaimer tweaks, no code change unless approved)
- Content gaps (topics still missing)
- Recommended next actions (E.g. Phase 4 items)

Delivered as `<presentation-artifact>`.

---

### Out of Scope (Untouched)

- All `src/pages/*Tool*`, video/audio/image/PDF/thumbnail/YT pages — no logic, UI, or styling edits
- `supabase/functions/**` — no changes
- `src/integrations/supabase/**` — no changes
- Theme tokens, sidebar, design system — no changes
- Database / auth — none required

---

### File Map

**New:** `AuthorProfilePage.tsx`, `FounderPage.tsx`, `EditorialTeamPage.tsx`, `ContentReviewProcessPage.tsx`, `CategoryPage.tsx`, `ReadingProgressBar.tsx`, `Breadcrumbs.tsx`, `AuthorBioCard.tsx`, `RelatedArticles.tsx`, `SEO.tsx`, `src/lib/seo/jsonLd.ts`, `src/data/authors.ts`.

**Edited:** `blogArticles.ts` (+7 articles, extended type), `App.tsx` (routes), `main.tsx` (HelmetProvider), `Footer.tsx` (links), `HomePage.tsx` (trust sections), `BlogPage.tsx` (UX additions), `index.html` (Organization/WebSite JSON-LD + remove duplicate canonical), `public/sitemap.xml`.

**Dependency:** `react-helmet-async` (only addition).

---

### Deliverable

After implementation, you get: 7 new authority articles live in blog, 5 new trust pages, schema on every route, unique meta per page, rebuilt homepage trust layer, and a fresh AdSense readiness report — with zero changes to any working tool.
