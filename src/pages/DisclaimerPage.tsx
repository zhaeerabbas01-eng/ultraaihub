import { PageHeader } from "@/components/PageHeader";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<AlertTriangle className="h-5 w-5" />} title="Disclaimer" description="Important information about using our services." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <h2 className="text-foreground font-display">General Disclaimer</h2>
        <p className="text-muted-foreground">The information and tools provided by Ultra Media AI Hub (operated by MUTECH BAAR) are for general informational and personal use purposes only. All information and tools on this website are provided in good faith, however we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or tool on the site.</p>
        <h2 className="text-foreground font-display">External Links Disclaimer</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
        <h2 className="text-foreground font-display">Fair Use Disclaimer</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub provides tools for downloading and processing media content. Users are solely responsible for ensuring that their use of these tools complies with all applicable copyright laws and the terms of service of content platforms. We do not encourage or condone the downloading of copyrighted content without proper authorization.</p>
        <h2 className="text-foreground font-display">AI-Generated Content</h2>
        <p className="text-muted-foreground">Some features on our platform use artificial intelligence models. AI-generated outputs may contain errors or inaccuracies. Users should verify and review all AI-generated content before use in any professional or commercial context.</p>
        <h2 className="text-foreground font-display">No Liability</h2>
        <p className="text-muted-foreground">Under no circumstance shall MUTECH BAAR or Muhammad Usman Zaheer have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>
        <h2 className="text-foreground font-display">Contact</h2>
        <p className="text-muted-foreground">For questions about this disclaimer, please contact us at <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
      </div>
    </div>
  );
}
