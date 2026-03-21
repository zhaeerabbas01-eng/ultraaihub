import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Shield className="h-5 w-5" />} title="Privacy Policy" description="Your privacy is important to us." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <h2 className="text-foreground font-display">1. Information We Collect</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub processes files entirely in your browser when possible. We do not store, share, or sell your uploaded files, personal data, or usage history. Files uploaded for processing are temporarily stored in memory and automatically deleted after processing is complete.</p>
        <h2 className="text-foreground font-display">2. How We Use Information</h2>
        <p className="text-muted-foreground">We may collect anonymous usage analytics (page views, feature usage) to improve our services. No personally identifiable information is collected or stored. We use cookies only for essential site functionality.</p>
        <h2 className="text-foreground font-display">3. Third-Party Services</h2>
        <p className="text-muted-foreground">We may display advertisements through Google AdSense. Google may use cookies to serve ads based on your prior visits. You can opt out of personalized advertising by visiting Google's Ads Settings.</p>
        <h2 className="text-foreground font-display">4. Data Security</h2>
        <p className="text-muted-foreground">We implement industry-standard security measures to protect any data processed through our services. All file processing occurs over secure HTTPS connections. Uploaded files are never stored permanently on our servers.</p>
        <h2 className="text-foreground font-display">5. Children's Privacy</h2>
        <p className="text-muted-foreground">Our services are not directed to children under 13. We do not knowingly collect personal information from children.</p>
        <h2 className="text-foreground font-display">6. Changes to This Policy</h2>
        <p className="text-muted-foreground">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
        <h2 className="text-foreground font-display">7. Contact Us</h2>
        <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us through our website.</p>
      </div>
    </div>
  );
}
