import { PageHeader } from "@/components/PageHeader";
import { Sparkles } from "lucide-react";

export default function AiPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Sparkles className="h-5 w-5" />} title="AI Usage Policy" description="Transparency about how artificial intelligence is used across our tools and content." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> June 2, 2026</p>

        <h2 className="text-foreground font-display">Our Position on AI</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub is an AI-assisted platform — not an AI-only one. We use large language models and image-generation models where they make a tool faster or better, but every AI feature on this site is clearly labeled and supervised by human design and editorial review.</p>

        <h2 className="text-foreground font-display">Where We Use AI</h2>
        <ul className="text-muted-foreground">
          <li><strong>AI Thumbnail Generator</strong> — uses Google Gemini image models to generate visuals based on your prompt.</li>
          <li><strong>Background Remover</strong> — uses a segmentation model to detect subject vs. background.</li>
          <li><strong>Image Upscaler</strong> — uses neural upscaling for higher-resolution output.</li>
          <li><strong>YouTube Helpers</strong> — uses Gemini for niche detection and subtitle extraction.</li>
          <li><strong>Editorial workflow</strong> — AI assists with research, outlines, and proofreading; humans write and approve the final article.</li>
        </ul>

        <h2 className="text-foreground font-display">What AI Will Not Do Here</h2>
        <ul className="text-muted-foreground">
          <li>We do not auto-publish AI-generated articles without human editing.</li>
          <li>We do not use AI to fabricate testimonials, reviews, or user counts.</li>
          <li>We do not train third-party models on the files you upload.</li>
          <li>We do not generate content that violates copyright, depicts real individuals deceptively, or produces sexual content involving minors.</li>
        </ul>

        <h2 className="text-foreground font-display">Your Data and AI</h2>
        <p className="text-muted-foreground">Uploaded images and prompts are sent to the relevant model provider (e.g., Google Gemini) for processing and are not retained on our servers beyond the request. For full details see our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.</p>

        <h2 className="text-foreground font-display">Accuracy of AI Output</h2>
        <p className="text-muted-foreground">AI outputs can be wrong, biased, or inappropriate. Always review and verify generated content before using it in a professional or commercial setting. You are responsible for the final use of any AI-generated asset.</p>

        <h2 className="text-foreground font-display">Reporting AI Misuse</h2>
        <p className="text-muted-foreground">If you encounter problematic AI output produced by our tools, email <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a> with the prompt and output so we can improve our safety filters.</p>
      </div>
    </div>
  );
}
