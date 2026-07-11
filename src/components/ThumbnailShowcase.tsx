import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wand2, Sparkles, ArrowRight } from "lucide-react";
import demoVideo from "@/assets/thumb-magic.mp4.asset.json";

type Props = { compact?: boolean; showCTA?: boolean };

export function ThumbnailShowcase({ compact = false, showCTA = true }: Props) {
  return (
    <section className={`relative overflow-hidden ${compact ? "my-8" : "my-16"}`}>
      {/* Aurora bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-8 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)]"
      >
        <div className={`grid gap-6 items-center ${compact ? "md:grid-cols-2" : "md:grid-cols-5"}`}>
          <div className={compact ? "" : "md:col-span-2"}>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 mb-4 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> AI Thumbnail Studio
            </div>
            <h2 className={`font-display font-bold mb-3 leading-tight ${compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}>
              Turn any idea into a{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                viral thumbnail
              </span>
            </h2>
            <p className="text-muted-foreground mb-5 text-sm md:text-base">
              Reference images, YouTube links, bold headlines, any language — the AI composes a
              high-CTR YouTube thumbnail in seconds.
            </p>
            {showCTA && (
              <Link
                to="/thumbnail-generator"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 font-semibold text-slate-950 shadow-[0_0_30px_-6px_rgba(34,211,238,0.7)] transition hover:scale-[1.03]"
              >
                <Wand2 className="h-4 w-4" /> Try Thumbnail Studio <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className={compact ? "" : "md:col-span-3"}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl group"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400/40 via-sky-400/30 to-fuchsia-500/40 opacity-70 blur-md -z-10 group-hover:opacity-100 transition" />
              <video
                src={demoVideo.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-2 right-3 rounded bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] text-white/80 font-medium">
                Ultra Media AI · Live demo
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
