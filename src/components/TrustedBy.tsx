import { motion } from "framer-motion";

// SimpleIcons CDN — lightweight SVG logos, no library needed
const trustedLogos = [
  { name: "YouTube", slug: "youtube", color: "FF0000" },
  { name: "Google", slug: "google", color: "4285F4" },
  { name: "OpenAI", slug: "openai", color: "412991" },
  { name: "Meta", slug: "meta", color: "0467DF" },
  { name: "TikTok", slug: "tiktok", color: "000000" },
  { name: "X", slug: "x", color: "000000" },
  { name: "Instagram", slug: "instagram", color: "E4405F" },
];

const ecosystemLogos = [
  { name: "YouTube Studio", slug: "youtubestudio", color: "FF0000" },
  { name: "Canva", slug: "canva", color: "00C4CC" },
  { name: "ChatGPT", slug: "openai", color: "412991" },
  { name: "Adobe", slug: "adobe", color: "FF0000" },
  { name: "CapCut", slug: "capcut", color: "000000" },
  { name: "VidIQ", slug: "youtube", color: "FF0066" },
  { name: "TubeBuddy", slug: "youtube", color: "C4302B" },
  { name: "Figma", slug: "figma", color: "F24E1E" },
];

const logoUrl = (slug: string, color: string) =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

export function TrustedBy() {
  // Duplicate for seamless infinite scroll
  const marquee = [...trustedLogos, ...trustedLogos];

  return (
    <section aria-label="Trusted partners" className="my-12">
      {/* Section 1 - Auto scroll */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
          Trusted by Creators & Platforms
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Powering workflows for millions worldwide
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4 md:p-6 overflow-hidden relative trusted-marquee-wrap mb-12">
        <div className="trusted-marquee flex gap-10 md:gap-14 w-max">
          {marquee.map((l, i) => (
            <div
              key={`${l.slug}-${i}`}
              className="flex items-center justify-center h-10 md:h-12 shrink-0"
              title={l.name}
            >
              <img
                src={logoUrl(l.slug, "ffffff")}
                alt={`${l.name} logo`}
                className="h-7 md:h-9 w-auto opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 - Ecosystem grid */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
          Our Tools Work With
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Seamless integration across your favorite creator platforms
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {ecosystemLogos.map((l) => (
          <div
            key={l.name}
            className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-default"
          >
            <img
              src={logoUrl(l.slug, "ffffff")}
              alt={`${l.name} logo`}
              className="h-7 md:h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-[11px] md:text-xs text-muted-foreground font-medium">
              {l.name}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
