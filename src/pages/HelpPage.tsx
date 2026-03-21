import { PageHeader } from "@/components/PageHeader";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const faqs = [
  { q: "Is Ultra Media AI Hub really free?", a: "Yes! All our tools are completely free to use with no registration required. We support our platform through non-intrusive advertising." },
  { q: "Are my files safe and private?", a: "Absolutely. Most processing happens directly in your browser, meaning your files never leave your device. For AI features that require server processing, files are processed in memory and immediately deleted — nothing is ever stored." },
  { q: "Which video platforms are supported?", a: "Our video downloader supports YouTube, TikTok (without watermark), Facebook, and Instagram. We're constantly adding support for more platforms." },
  { q: "What audio formats can I convert?", a: "You can convert WAV, MP4, AAC, and M4A files to MP3. We support both 128kbps (standard quality) and 320kbps (high quality) bitrates." },
  { q: "How does the AI background remover work?", a: "Our AI background remover uses advanced neural network technology (remove.bg API) to detect subjects in images and remove backgrounds, producing transparent PNG files. It works best with clear subjects against distinct backgrounds." },
  { q: "Can I batch convert images?", a: "Yes! Our Image Tools module supports batch uploads via drag-and-drop. You can convert multiple images between PNG, JPG, and WEBP formats simultaneously." },
  { q: "How does AI image upscaling work?", a: "Our AI upscaler uses advanced algorithms to intelligently increase image resolution. It can upscale images to 2x (HD) or 4x (4K) while preserving and enhancing details." },
  { q: "Does the thumbnail generator use AI?", a: "Yes! Our thumbnail generator is powered by Google's Gemini AI. It can suggest compelling titles, enhance your text, and recommend design concepts that maximize click-through rates." },
  { q: "What's the maximum file size I can process?", a: "For browser-based tools, the limit depends on your device's memory. We recommend files under 50MB for optimal performance. Server-side AI tools can handle larger files." },
  { q: "How do I contact support?", a: "You can reach us at zhaeerabbas01@gmail.com or visit our Contact page. We typically respond within 24 hours." },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<HelpCircle className="h-5 w-5" />} title="Help Center" description="Find answers to common questions about Ultra Media AI Hub." />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
              <AccordionTrigger className="text-foreground text-sm font-medium hover:text-primary transition-colors">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 glass-panel rounded-xl p-6 text-center">
        <p className="text-muted-foreground text-sm">Still have questions?</p>
        <Link to="/contact" className="text-primary text-sm hover:underline mt-1 inline-block">Contact our support team →</Link>
      </motion.div>
    </div>
  );
}
