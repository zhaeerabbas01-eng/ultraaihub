import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Shield className="h-5 w-5" />} title="Privacy Policy" description="Your privacy is important to us at MUTECH BAAR." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <p className="text-muted-foreground">This Privacy Policy describes how MUTECH BAAR ("we", "us", or "our") collects, uses, and protects information when you use Ultra Media AI Hub (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.</p>
        
        <h2 className="text-foreground font-display">1. Information We Collect</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub processes files entirely in your browser when possible. We do not store, share, or sell your uploaded files, personal data, or usage history. Files uploaded for AI processing (background removal, thumbnail generation) are temporarily stored in server memory during processing and automatically deleted immediately after processing is complete. We do not retain any copies of your files.</p>
        
        <h2 className="text-foreground font-display">2. How We Use Information</h2>
        <p className="text-muted-foreground">We may collect anonymous usage analytics (page views, feature usage, browser type) to improve our services. No personally identifiable information is collected or stored through our analytics. We use cookies only for essential site functionality and advertising purposes as described in our Cookie Policy.</p>
        
        <h2 className="text-foreground font-display">3. Third-Party Services</h2>
        <p className="text-muted-foreground">We may display advertisements through Google AdSense. Google may use cookies to serve ads based on your prior visits. You can opt out of personalized advertising by visiting Google's Ads Settings. We also use remove.bg API for background removal and Google Gemini API for AI features — data sent to these services is subject to their respective privacy policies.</p>
        
        <h2 className="text-foreground font-display">4. Data Security</h2>
        <p className="text-muted-foreground">We implement industry-standard security measures to protect any data processed through our services. All file processing occurs over secure HTTPS connections. Our edge functions use encrypted connections and temporary memory storage. We regularly review our security practices to ensure the highest level of data protection.</p>
        
        <h2 className="text-foreground font-display">5. Children's Privacy</h2>
        <p className="text-muted-foreground">Our services are not directed to children under 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.</p>
        
        <h2 className="text-foreground font-display">6. International Data Transfers</h2>
        <p className="text-muted-foreground">Your data may be processed on servers located outside your country of residence. By using our Service, you consent to the transfer of information to countries outside your country of residence, which may have different data protection rules.</p>
        
        <h2 className="text-foreground font-display">7. Data Retention</h2>
        <p className="text-muted-foreground">We do not retain user files or personal data beyond the immediate processing period. Analytics data is aggregated and anonymized. Contact form submissions are retained only as long as necessary to respond to your inquiry.</p>
        
        <h2 className="text-foreground font-display">8. Your Rights</h2>
        <p className="text-muted-foreground">Depending on your jurisdiction, you may have rights regarding your personal data, including the right to access, correct, delete, or port your data. For GDPR-specific rights, please see our GDPR Compliance page.</p>
        
        <h2 className="text-foreground font-display">9. Changes to This Policy</h2>
        <p className="text-muted-foreground">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>
        
        <h2 className="text-foreground font-display">10. Contact Us</h2>
        <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us:</p>
        <ul className="text-muted-foreground">
          <li>Email: <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></li>
          <li>Company: MUTECH BAAR</li>
          <li>Contact Person: Muhammad Usman Zaheer</li>
        </ul>
      </div>
    </div>
  );
}
