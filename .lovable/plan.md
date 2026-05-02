## Goal

Upgrade ONLY the AI Thumbnail Generator (`/thumbnail-generator`) — better output presentation, better download UX, and a stronger viral SaaS-style prompt. No other tools touched. No layout/branding changes elsewhere.

## What changes

### 1. Stronger prompt engineering (backend)
File: `supabase/functions/ai-thumbnail-generate/index.ts`

Replace the current `enhancePrompt()` with a viral SaaS / MrBeast-style template that bakes in the user's requested style requirements automatically — so users can type a short title and still get a high-CTR thumbnail.

The new system prompt will instruct Gemini to:
- Treat reference image as the main subject (preserve face, expression)
- Apply dark tech / neon gradient / futuristic SaaS dashboard background
- Add glowing UI elements (dashboards, graphs, payment icons)
- Bold 3D typography for the title text (max 3-5 words)
- High-contrast colors (yellow / red / neon green / blue glow)
- Arrows, circles, highlights for attention
- Optional small icons (cart, money, lock, rocket, lightning) when relevant
- Urgency cues (FREE, $0, NOW) when the title implies it
- Hyper-realistic + motion graphics hybrid, cinematic lighting, sharp focus

Also add an optional `titleText` field — if provided, it is rendered as the on-thumbnail headline; otherwise the AI extracts it from the prompt.

### 2. Better output UI (frontend)
File: `src/pages/ThumbnailGeneratorPage.tsx`

Improvements to the assistant message bubble showing the generated image:

- **Larger preview card** with proper aspect-ratio container so 16:9 / 9:16 / 1:1 all display correctly without distortion
- **Hover toolbar** over the image with: Download, Open full-size, Copy image, Regenerate, Edit prompt
- **Lightbox modal** — click image to view full resolution against a dark backdrop
- **Fallback badge** — clear "AI fallback (provider busy)" pill when `fallback: true`
- **Aspect ratio chip** shown on each result (e.g. "16:9 · 1280×720")
- **Subtle scale-in animation** when the image arrives

### 3. Better download UX
- One-click **Download** button that saves as `thumbnail-{title-slug}-{timestamp}.png`
- Convert data-URL to a Blob and use `URL.createObjectURL` so big images don't hang the browser
- Toast confirmation on download
- **Download all** button in the chat header to zip-free batch download every generated image in the current session (sequential `<a download>` clicks)

### 4. Composer polish (small)
- Add an optional **"Title text on thumbnail"** input next to the aspect ratio selector — passed to the edge function as `titleText`
- Keep existing chat-style composer, attachments, YouTube import, and unlimited reference images exactly as they are

## What does NOT change
- No other pages, no sidebar, no homepage, no blog, no AdSense, no other tools
- No auth, no DB schema, no new tables
- Existing edge function endpoint, request shape (only adds optional `titleText`), and YouTube reference-import flow stay backwards compatible

## Technical notes

```text
Edge function payload (additive):
{
  prompt: string,
  referenceImages?: string[],   // unchanged
  size?: "16:9"|"1:1"|...,      // unchanged
  titleText?: string            // NEW, optional
}
```

Download helper:
```ts
const a = document.createElement("a");
const blob = await (await fetch(dataUrl)).blob();
a.href = URL.createObjectURL(blob);
a.download = `thumbnail-${slug}-${Date.now()}.png`;
a.click();
URL.revokeObjectURL(a.href);
```

Lightbox: simple `<Dialog>` from `@/components/ui/dialog` with the image inside an `AspectRatio` wrapper.

## Files touched
- `supabase/functions/ai-thumbnail-generate/index.ts` — new prompt template + accept `titleText`
- `src/pages/ThumbnailGeneratorPage.tsx` — output card, lightbox, download helpers, optional title input

After deploy: edge function is auto-deployed; user can test at `/thumbnail-generator`.