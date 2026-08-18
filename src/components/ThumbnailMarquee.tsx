import t1 from "@/assets/ultra-thumbnail-16x9-1786973256061.png.asset.json";
import t2 from "@/assets/ultra-thumbnail-16x9-1786974589912.png.asset.json";
import t3 from "@/assets/ultra-thumbnail-16x9-1786974706636.png.asset.json";
import t4 from "@/assets/ultra-thumbnail-16x9-1787025302714.png.asset.json";
import t5 from "@/assets/ultra-thumbnail-16x9-1787025480721.png.asset.json";

const SAMPLES = [
  { url: t1.url, alt: "Money giveaway YouTube thumbnail made with Ultra Media AI Hub" },
  { url: t2.url, alt: "Gaming setup YouTube thumbnail made with AI" },
  { url: t3.url, alt: "Free Fire gaming AI thumbnail" },
  { url: t4.url, alt: "AI SaaS creator thumbnail" },
  { url: t5.url, alt: "Free AI thumbnails promo thumbnail" },
];

export function ThumbnailMarquee({ className = "" }: { className?: string }) {
  const items = [...SAMPLES, ...SAMPLES];
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-background to-transparent" />
      <div className="flex gap-3 w-max animate-thumb-marquee hover:[animation-play-state:paused]">
        {items.map((s, i) => (
          <img
            key={i}
            src={s.url}
            alt={s.alt}
            loading="lazy"
            className="h-20 sm:h-28 md:h-32 w-auto rounded-xl object-cover ring-1 ring-white/10 shadow-lg shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
